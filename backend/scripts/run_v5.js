import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    console.log('🚀 Running Migration V5...');
    
    const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });

    try {
        const connection = await pool.getConnection();
        const sqlPath = path.join(__dirname, 'migration_v5.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await connection.query(sql);
        console.log('✅ Migration V5 applied successfully!');
        
        connection.release();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
