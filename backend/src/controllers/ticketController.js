import pool from '../config/db.js';
import { logAudit } from '../middlewares/auditMiddleware.js';

export const createTicket = async (req, res) => {
    const { title, description, category } = req.body;
    const requesterId = req.user.id;

    if (!title || !description || !category) {
        return res.status(400).json({ message: 'Título, descrição e categoria são obrigatórios.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (title, description, category, requester_id) VALUES (?, ?, ?, ?)',
            [title, description, category, requesterId]
        );

        const ticketId = result.insertId;

        await pool.query(
            'INSERT INTO ticket_history (ticket_id, user_id, action, comment) VALUES (?, ?, ?, ?)',
            [ticketId, requesterId, 'criacao', 'Chamado aberto pelo solicitante.']
        );

        res.status(201).json({ message: 'Chamado criado com sucesso.', ticketId });
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const getTickets = async (req, res) => {
    try {
        let query = `
            SELECT t.id, t.title, t.category, t.status, t.created_at, 
                   u.name AS requester_name, 
                   a.name AS assigned_name
            FROM tickets t
            JOIN users u ON t.requester_id = u.id
            LEFT JOIN users a ON t.assigned_to = a.id
        `;
        let params = [];

        if (req.user.role === 'solicitante') {
            query += ' WHERE t.requester_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'tecnico') {
            query += ' WHERE t.assigned_to = ?';
            params.push(req.user.id);
        }
        // admin sees all

        query += ' ORDER BY t.created_at DESC';

        const [tickets] = await pool.query(query, params);
        res.json(tickets);
    } catch (error) {
        console.error('Erro ao listar chamados:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const getTicketById = async (req, res) => {
    const ticketId = req.params.id;

    try {
        const [tickets] = await pool.query(`
            SELECT t.*, 
                   u.name AS requester_name, 
                   a.name AS assigned_name
            FROM tickets t
            JOIN users u ON t.requester_id = u.id
            LEFT JOIN users a ON t.assigned_to = a.id
            WHERE t.id = ?
        `, [ticketId]);

        if (tickets.length === 0) {
            return res.status(404).json({ message: 'Chamado não encontrado.' });
        }

        const ticket = tickets[0];

        // Verificar visibilidade
        if (req.user.role === 'solicitante' && ticket.requester_id !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar seus próprios chamados.' });
        }
        if (req.user.role === 'tecnico' && ticket.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Você só pode visualizar chamados atribuídos a você.' });
        }

        const [history] = await pool.query(`
            SELECT h.*, u.name AS user_name
            FROM ticket_history h
            JOIN users u ON h.user_id = u.id
            WHERE h.ticket_id = ?
            ORDER BY h.created_at ASC
        `, [ticketId]);

        res.json({ ...ticket, history });
    } catch (error) {
        console.error('Erro ao buscar chamado:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const updateTicket = async (req, res) => {
    const ticketId = req.params.id;
    const { status, assigned_to } = req.body;

    try {
        const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (tickets.length === 0) return res.status(404).json({ message: 'Chamado não encontrado.' });

        const ticket = tickets[0];

        // Permissões
        if (req.user.role === 'solicitante') {
            return res.status(403).json({ message: 'Acesso negado. Solicitantes não podem alterar chamados por este endpoint (use /cancel).' });
        }
        if (req.user.role === 'tecnico' && ticket.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Chamado não atribuído a você.' });
        }

        let updateFields = [];
        let params = [];

        if (status && status !== ticket.status) {
            updateFields.push('status = ?');
            params.push(status);

            await pool.query(
                'INSERT INTO ticket_history (ticket_id, user_id, action, comment) VALUES (?, ?, ?, ?)',
                [ticketId, req.user.id, 'alteracao_status', `Status alterado de ${ticket.status} para ${status}`]
            );

            await logAudit(req.user.id, 'change_status', `Alterou o status do chamado ${ticketId} para ${status}.`, req.ip);
        }

        if (req.user.role === 'admin' && assigned_to !== undefined && assigned_to !== ticket.assigned_to) {
            updateFields.push('assigned_to = ?');
            params.push(assigned_to);

            await pool.query(
                'INSERT INTO ticket_history (ticket_id, user_id, action, comment) VALUES (?, ?, ?, ?)',
                [ticketId, req.user.id, 'atribuicao', `Chamado atribuído ao técnico ID ${assigned_to}`]
            );
        }

        if (updateFields.length > 0) {
            params.push(ticketId);
            await pool.query(`UPDATE tickets SET ${updateFields.join(', ')} WHERE id = ?`, params);
        }

        res.json({ message: 'Chamado atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar chamado:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const cancelTicket = async (req, res) => {
    const ticketId = req.params.id;

    try {
        const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (tickets.length === 0) return res.status(404).json({ message: 'Chamado não encontrado.' });

        const ticket = tickets[0];

        if (ticket.requester_id !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Você só pode cancelar seus próprios chamados.' });
        }

        if (ticket.status === 'resolvido' || ticket.status === 'cancelado') {
            return res.status(400).json({ message: 'O chamado não pode mais ser cancelado.' });
        }

        await pool.query('UPDATE tickets SET status = ? WHERE id = ?', ['cancelado', ticketId]);

        await pool.query(
            'INSERT INTO ticket_history (ticket_id, user_id, action, comment) VALUES (?, ?, ?, ?)',
            [ticketId, req.user.id, 'cancelamento', 'O chamado foi cancelado pelo solicitante.']
        );

        await logAudit(req.user.id, 'delete_ticket', `Cancelou o chamado ${ticketId}.`, req.ip);

        res.json({ message: 'Chamado cancelado com sucesso.' });
    } catch (error) {
        console.error('Erro ao cancelar chamado:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const addObservation = async (req, res) => {
    const ticketId = req.params.id;
    const { comment } = req.body;

    if (!comment) return res.status(400).json({ message: 'O comentário é obrigatório.' });

    try {
        // Verificar visibilidade
        const [tickets] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (tickets.length === 0) return res.status(404).json({ message: 'Chamado não encontrado.' });
        const ticket = tickets[0];

        if (req.user.role === 'solicitante' && ticket.requester_id !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }
        if (req.user.role === 'tecnico' && ticket.assigned_to !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        await pool.query(
            'INSERT INTO ticket_history (ticket_id, user_id, action, comment) VALUES (?, ?, ?, ?)',
            [ticketId, req.user.id, 'observacao', comment]
        );

        res.status(201).json({ message: 'Observação adicionada com sucesso.' });
    } catch (error) {
        console.error('Erro ao adicionar observação:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};
