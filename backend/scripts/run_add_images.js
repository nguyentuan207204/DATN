import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    console.log('🚀 Running Migration: Add Appointment Images...');
    const sqlPath = path.join(__dirname, 'add_appointment_images.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon for multiple statements if any
    const statements = sql.split(';').filter(s => s.trim());
    for (let statement of statements) {
      await pool.query(statement);
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

run();
