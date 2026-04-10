import pool from "../config/db.js";

/* =====================================================
   PHẪU THUẬT / THỦ THUẬT
===================================================== */

export const createSurgery = async ({ recordId, surgeonId, name, date }) => {
  const [result] = await pool.query(
    `
    INSERT INTO Surgery (recordId, surgeonId, name, date)
    VALUES (?, ?, ?, ?)
    `,
    [recordId, surgeonId, name, date ? new Date(date) : new Date()]
  );

  return {
    surgeryId: result.insertId,
  };
};

export const getSurgeriesByRecord = async (recordId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      s.*,
      st.fullName AS surgeonName
    FROM Surgery s
    JOIN Staff st ON s.surgeonId = st.id
    WHERE s.recordId = ?
    ORDER BY s.date DESC
    `,
    [recordId]
  );

  return rows;
};

export const getAllSurgeries = async () => {
  const [rows] = await pool.query(
    `
    SELECT 
      s.*,
      mr.patientId,
      p.fullName AS patientName,
      st.fullName AS surgeonName
    FROM Surgery s
    JOIN MedicalRecord mr ON s.recordId = mr.id
    JOIN Patient p ON mr.patientId = p.id
    JOIN Staff st ON s.surgeonId = st.id
    ORDER BY s.date DESC
    `
  );

  return rows;
};


