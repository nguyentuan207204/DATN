import pool from "../config/db.js";

async function checkSchema() {
  try {
    const [rows] = await pool.query('DESCRIBE Appointment');
    console.log('--- Appointment Table Schema ---');
    console.table(rows);
    
    // Check if createdAt exists
    const hasCreatedAt = rows.some(row => row.Field === 'createdAt');
    console.log('Has createdAt column:', hasCreatedAt);
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking schema:', err);
    process.exit(1);
  }
}

checkSchema();
