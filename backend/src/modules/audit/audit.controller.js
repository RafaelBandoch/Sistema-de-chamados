import pool from '../../config/db.js';

export const getAuditLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(`
            SELECT a.*, u.name AS user_name, u.email AS user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);
        res.json(logs);
    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        res.status(500).json({ message: 'Erro interno.' });
    }
};
