import pool from "../config/db.js";

export const getAllSchedules = async () => {
    const [rows] = await pool.query(`
        SELECT 
            sc.id,
            sc.staffId,
            sc.shiftDate,
            sc.shiftType,
            sc.notes,
            s.fullName as staffName,
            s.role as staffRole
        FROM StaffSchedule sc
        JOIN Staff s ON sc.staffId = s.id
        ORDER BY sc.shiftDate DESC
    `);
    return rows;
};

export const createSchedule = async (data) => {
    const { staffId, shiftDate, shiftType, notes } = data;
    const [result] = await pool.query(
        `INSERT INTO StaffSchedule (staffId, shiftDate, shiftType, notes)
         VALUES (?, ?, ?, ?)`,
        [staffId, shiftDate, shiftType, notes || null]
    );
    return { id: result.insertId, ...data };
};

export const deleteSchedule = async (id) => {
    const [result] = await pool.query(
        "DELETE FROM StaffSchedule WHERE id = ?",
        [id]
    );
    return result.affectedRows > 0;
};
