import pool from "../config/db.js";
async function run() {
  try {
    await pool.query("ALTER TABLE MedicalRecord ADD COLUMN diagnosis VARCHAR(500) NULL AFTER visitDate");
    console.log("Added diagnosis column successfully!");
  } catch(e) {
    if(e.code === 'ER_DUP_FIELDNAME') console.log("Column already exists");
    else console.error(e);
  }
  process.exit();
}
run();
