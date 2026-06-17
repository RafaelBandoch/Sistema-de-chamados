import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import { logAudit } from '../../middlewares/auditMiddleware.js';

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
