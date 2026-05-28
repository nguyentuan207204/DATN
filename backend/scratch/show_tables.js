import * as dotenv from 'dotenv';
dotenv.config();
import pool from "../config/db.js";

async function showTables() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.table(rows);
    
    // Nêu có bảng tên Schedule, Shift, Roster
    const tables = rows.map(r => Object.values(r)[0]);
    const shiftTable = tables.find(t => t.toLowerCase().includes('shift') || t.toLowerCase().includes('schedule') || t.toLowerCase().includes('roster'));
    if (shiftTable) {
        const [schema] = await pool.query(`DESCRIBE ${shiftTable}`);
        console.log(`Schema for ${shiftTable}:`);
        console.table(schema);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
showTables();
