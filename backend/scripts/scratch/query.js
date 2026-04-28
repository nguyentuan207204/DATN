import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;

async function run() {
    const conn = await mysql.createConnection({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    const [rows] = await conn.query("SHOW COLUMNS FROM Medicine");
    console.log(rows);
    await conn.end();
}
run();
