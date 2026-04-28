import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const dbUrl = process.env.DATABASE_URL;

async function listUsers() {
    try {
        const conn = await mysql.createConnection({
            uri: dbUrl,
            ssl: { rejectUnauthorized: false }
        });
        
        const [rows] = await conn.query("SELECT id, username, roleId FROM User");
        console.log("Existing Users:");
        console.table(rows);
        
        await conn.end();
    } catch (err) {
        console.error("Failed to query users:", err);
    }
}

listUsers();
