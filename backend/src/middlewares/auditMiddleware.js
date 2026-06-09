import pool from '../config/db.js';

export const logAudit = async (userId, action, details, ipAddress) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [userId, action, details, ipAddress]
        );
    } catch (error) {
        console.error('Falha ao registrar log de auditoria:', error);
    }
};
