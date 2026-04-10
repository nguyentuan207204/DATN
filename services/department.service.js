import pool from "../config/db.js";

export const createDepartment = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO Department (name)
     VALUES (?)`,
    [data.name]
  );
  return { id: result.insertId };
};

export const getAllDepartments = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM Department ORDER BY name ASC`
  );
  return rows;
};

export const updateDepartment = async (id, data) => {
  await pool.query(
    `UPDATE Department SET name = ? WHERE id = ?`,
    [data.name, id]
  );
  return { message: "Updated" };
};

export const deleteDepartment = async (id) => {
  await pool.query(`DELETE FROM Department WHERE id = ?`, [id]);
  return { message: "Deleted" };
};

