import pool from "./config/db.js";

async function testConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("✅ Connection successful:", rows[0].result);
        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed:", error);
        process.exit(1);
    }
}

testConnection();
