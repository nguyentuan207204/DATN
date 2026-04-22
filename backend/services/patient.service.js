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

/* READ ALL WITH STATS */
export const getAllPatients = async ({ page = 1, pageSize = 10, search = '' }) => {
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${search}%`;

  const query = `
    SELECT 
      p.*,
      (SELECT MAX(date) FROM Appointment WHERE patientId = p.id AND status = 'DONE') as lastVisit,
      (SELECT COALESCE(SUM(ii.price * ii.quantity), 0) 
       FROM Invoice i 
       JOIN InvoiceItem ii ON i.id = ii.invoiceId 
       WHERE i.patientId = p.id AND i.status = 'PAID') as totalSpent
    FROM Patient p
    WHERE p.fullName LIKE ? OR p.phone LIKE ? OR p.id LIKE ?
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(query, [searchPattern, searchPattern, searchPattern, parseInt(pageSize), offset]);
  
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) as total FROM Patient WHERE fullName LIKE ? OR phone LIKE ? OR id LIKE ?", 
    [searchPattern, searchPattern, searchPattern]
  );

  return { data: rows, total };
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
