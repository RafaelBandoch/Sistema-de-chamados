import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logAudit } from '../middlewares/auditMiddleware.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set HttpOnly Cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1 * 60 * 60 * 1000 // 1 hour
        });

        // Audit Log
        await logAudit(user.id, 'login', 'Usuário efetuou login no sistema.', req.ip);

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export const logout = async (req, res) => {
    // Audit Log
    await logAudit(req.user.id, 'logout', 'Usuário efetuou logout do sistema.', req.ip);
    
    // Invalida o token inserindo na blacklist
    const token = req.cookies.jwt;
    if (token) {
        try {
            await pool.query('INSERT IGNORE INTO token_blacklist (token) VALUES (?)', [token]);
        } catch (error) {
            console.error('Erro ao inserir na blacklist:', error);
        }
    }

    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: 'Logout efetuado com sucesso.' });
};

export const me = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json({ user: users[0] });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};
