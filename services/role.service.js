import pool from "../config/db.js";

export const createRole = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO Role (name)
     VALUES (?)`,
    [data.name]
  );
  return { id: result.insertId };
};

export const getAllRoles = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM Role ORDER BY name ASC`
  );
  return rows;
};

