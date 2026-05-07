import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkSchema() {
    const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const connection = await pool.getConnection();
        
        console.log('--- MEDICINE TABLE ---');
        const [medCols] = await connection.query('DESCRIBE Medicine');
        console.table(medCols);

        console.log('\n--- MEDICALRECORD TABLE ---');
        const [recCols] = await connection.query('DESCRIBE MedicalRecord');
        console.table(recCols);

        connection.release();
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkSchema();
