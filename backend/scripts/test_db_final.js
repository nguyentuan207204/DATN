import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const dbUrl = process.env.DATABASE_URL;
console.log("Testing connection to:", dbUrl.replace(/:.*@/, ":****@"));

try {
    const conn = await mysql.createConnection({
        uri: dbUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });
    console.log("Connection successful!");
    await conn.end();
} catch (err) {
    console.error("Connection failed:", err);
}
