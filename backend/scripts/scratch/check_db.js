import pool from "../config/db.js";

async function checkDb() {
  try {
    console.log("Checking Roles...");
    const [roles] = await pool.query("SELECT * FROM Role");
    console.table(roles);

    console.log("\nChecking User table columns...");
    const [columns] = await pool.query("SHOW COLUMNS FROM User");
    console.table(columns);

    console.log("\nListing first 5 users...");
    const [users] = await pool.query("SELECT id, username FROM User LIMIT 5");
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error("Error checking DB:", error);
    process.exit(1);
  }
}

checkDb();
