import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    console.log('🚀 Starting Database Migration...');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL not found in .env');
        process.exit(1);
    }

    const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        multipleStatements: true // Quan trọng để chạy nhiều câu lệnh
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to Database.');

        // 1. Chạy Schema
        const schemaPath = path.join(__dirname, '../../schema.sql');
        if (fs.existsSync(schemaPath)) {
            console.log('📄 Running schema.sql...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await connection.query(schemaSql);
            console.log('✅ Schema imported successfully.');
        } else {
            console.warn('⚠️ Warning: schema.sql not found at', schemaPath);
        }

        // 2. Chạy Data
        const dataPath = path.join(__dirname, '../../data.sql');
        if (fs.existsSync(dataPath)) {
            console.log('📄 Running data.sql...');
            const dataSql = fs.readFileSync(dataPath, 'utf8');
            await connection.query(dataSql);
            console.log('✅ Data imported successfully.');
        } else {
            console.warn('⚠️ Warning: data.sql not found at', dataPath);
        }

        console.log('\n✨ Migration completed successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
