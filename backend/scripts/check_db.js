import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import pool from "../config/db.js";

async function checkSchema() {
    try {
        console.log("Checking tables...");
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables in DB:", rows);
        
        const tables = rows.map(r => Object.values(r)[0]);
        for (const table of tables) {
            if (['Invoice', 'Appointment', 'Patient', 'Staff'].includes(table)) {
                console.log(`\nSchema for ${table}:`);
                const [columns] = await pool.query(`DESCRIBE \`${table}\``);
                console.table(columns);
            }
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        process.exit();
    }
}

checkSchema();
