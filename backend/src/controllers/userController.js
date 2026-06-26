import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { logAudit } from '../middlewares/auditMiddleware.js';

export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY name ASC');
        res.json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!['solicitante', 'tecnico', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Perfil inválido.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        await logAudit(req.user.id, 'create_user', `Criou o usuário ${email} com perfil ${role}.`, req.ip);

        res.status(201).json({ message: 'Usuário criado com sucesso.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'E-mail já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ message: 'Nome, e-mail e perfil são obrigatórios.' });
    }

    if (!['solicitante', 'tecnico', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Perfil inválido.' });
    }

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT id, password_hash, email FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        let query = 'UPDATE users SET name = ?, email = ?, role = ?';
        const params = [name, email, role];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);

        await logAudit(
            req.user.id,
            'update_user',
            `Atualizou o usuário ID ${id} (${email}) com perfil ${role}.`,
            req.ip
        );

        res.json({ message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'E-mail já está em uso.' });
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
        return res.status(400).json({ message: 'Você não pode excluir sua própria conta.' });
    }

    try {
        const [users] = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const user = users[0];

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        await logAudit(
            req.user.id,
            'delete_user',
            `Excluiu o usuário ID ${id} (${user.email}).`,
            req.ip
        );

        res.json({ message: 'Usuário excluído com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};
