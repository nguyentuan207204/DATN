import pool from "./config/db.js";

async function addLockColumn() {
  try {
    await pool.query("ALTER TABLE User ADD COLUMN isLocked TINYINT(1) DEFAULT 0");
    console.log("Added isLocked column successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

addLockColumn();
