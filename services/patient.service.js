import pool from "../config/db.js";

/* CREATE */
export const createPatient = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO Patient (fullName, dateOfBirth, gender, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.fullName,
      data.dateOfBirth,
      data.gender,
      data.phone,
      data.address,
    ]
  );
  return { id: result.insertId };
};

/* READ ALL */
export const getAllPatients = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM Patient ORDER BY id DESC`
  );
  return rows;
};

/* READ ONE */
export const getPatientById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM Patient WHERE id = ?`,
    [id]
  );
  return rows[0];
};

/* UPDATE */
export const updatePatient = async (id, data) => {
  await pool.query(
    `UPDATE Patient 
     SET fullName=?, dateOfBirth=?, gender=?, phone=?, address=?
     WHERE id=?`,
    [
      data.fullName,
      data.dateOfBirth,
      data.gender,
      data.phone,
      data.address,
      id,
    ]
  );
  return { message: "Updated" };
};

/* DELETE */
export const deletePatient = async (id) => {
  await pool.query(`DELETE FROM Patient WHERE id=?`, [id]);
  return { message: "Deleted" };
};
