import pool from "../config/db.js";
const getSchema = async () => {
    const [rows] = await pool.query("DESCRIBE Medicine");
    console.log(rows);
    process.exit(0);
};
getSchema();
