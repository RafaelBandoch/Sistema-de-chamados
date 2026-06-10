import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config({ path: '../.env' });

export const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado. Faça o login.' });
    }

    try {
        // Verifica se o token está na blacklist (revogado via logout)
        const [blacklisted] = await pool.query('SELECT id FROM token_blacklist WHERE token = ?', [token]);
        if (blacklisted.length > 0) {
            return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
};
