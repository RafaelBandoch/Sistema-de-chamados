import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
    try {
        console.log('Starting migrations...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by ';' to run multiple statements if needed, 
        // but mysql2 pool.query can run multiple statements if configured.
        // We will just split and run them individually.
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

        for (const statement of statements) {
            await pool.query(statement);
            console.log('Executed statement successfully.');
        }

        console.log('Migrations completed successfully.');
    } catch (error) {
        console.error('Error running migrations:', error);
    } finally {
        pool.end();
    }
}

runMigrations();
