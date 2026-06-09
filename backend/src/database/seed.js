import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function runSeed() {
    try {
        console.log('Starting seeder...');
        
        // Verifica se já existe um admin
        const [rows] = await pool.query('SELECT * FROM users WHERE role = ?', ['admin']);
        if (rows.length > 0) {
            console.log('Admin user already exists. Skipping seed.');
            return;
        }

        const adminPassword = 'admin'; // Senha padrão (deve ser alterada em produção)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['Administrador do Sistema', 'admin@gira.com', hashedPassword, 'admin']
        );

        console.log('Admin user seeded successfully. Email: admin@gira.com | Password: admin');
    } catch (error) {
        console.error('Error running seed:', error);
    } finally {
        pool.end();
    }
}

runSeed();
