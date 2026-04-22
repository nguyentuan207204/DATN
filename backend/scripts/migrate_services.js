import pool from "../config/db.js";

async function migrate() {
  console.log("Starting migration: Add unit to Service and description to ServiceCategory...");
  const connection = await pool.getConnection();
  try {
    // 1. Check and add 'unit' to 'Service' table
    const [serviceCols] = await connection.query("SHOW COLUMNS FROM Service LIKE 'unit'");
    if (serviceCols.length === 0) {
      await connection.query("ALTER TABLE Service ADD COLUMN unit VARCHAR(50) DEFAULT 'Lượt'");
      console.log("- Added 'unit' column to 'Service' table.");
    } else {
      console.log("- 'unit' column already exists in 'Service' table.");
    }

    // 2. Check and add 'description' to 'ServiceCategory' table
    const [categoryCols] = await connection.query("SHOW COLUMNS FROM ServiceCategory LIKE 'description'");
    if (categoryCols.length === 0) {
      await connection.query("ALTER TABLE ServiceCategory ADD COLUMN description TEXT");
      console.log("- Added 'description' column to 'ServiceCategory' table.");
    } else {
      console.log("- 'description' column already exists in 'ServiceCategory' table.");
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
