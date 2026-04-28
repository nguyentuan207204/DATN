import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;

async function run() {
    const conn = await mysql.createConnection({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await conn.query("ALTER TABLE Medicine ADD COLUMN category VARCHAR(255), ADD COLUMN price INT DEFAULT 0, ADD COLUMN minStock INT DEFAULT 20");
        console.log("Added columns successfully!");
    } catch(err) {
        console.log("Error or already exists:", err.message);
    }
    
    // Check if StockMovement table missing something?
    await conn.end();
}
run();
