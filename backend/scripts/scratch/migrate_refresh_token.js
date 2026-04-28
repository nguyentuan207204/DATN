import pool from "../config/db.js";

async function migrate() {
  try {
    console.log("Adding refreshToken column to User table...");
    await pool.query("ALTER TABLE User ADD COLUMN refreshToken TEXT NULL AFTER passwordHash");
    console.log("Migration successful!");
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column refreshToken already exists.");
      process.exit(0);
    }
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();

