import pool from '../config/db.js';
import bcrypt from 'bcrypt';

async function runSeed() {
    try {
        console.log('Starting seeder...');
        
        // O seed continuará e vai falhar com erro de DUPLICATE ENTRY se o email já existir, 
        // então podemos apenas capturar esse erro específico.

        const defaultPassword = '123'; 
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const users = [
            { name: 'Admin Supremo', email: 'admin@gira.com', role: 'admin' },
            { name: 'Técnico Especialista', email: 'tecnico@gira.com', role: 'tecnico' },
            { name: 'Solicitante Comum', email: 'solicitante@gira.com', role: 'solicitante' }
        ];

        for (const user of users) {
            try {
                await pool.query(
                    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, hashedPassword, user.role]
                );
                console.log(`User created: ${user.email} (Role: ${user.role}) | Password: ${defaultPassword}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`User already exists: ${user.email}`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Seeder executado com sucesso.');
    } catch (error) {
        console.error('Error running seed:', error);
    } finally {
        pool.end();
    }
}

runSeed();
