import pool from "../config/db.js";

async function migrate() {
  try {
    console.log("Starting migration: Add role column to Staff table...");
    await pool.query("ALTER TABLE Staff ADD COLUMN role VARCHAR(50) DEFAULT 'BACSI' AFTER departmentId");
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column 'role' already exists. Skipping.");
      process.exit(0);
    }
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
