import pool from "../config/db.js";

export const createAppointment = async ({ department, doctor, appointmentTime, ...otherDetails }) => {
    try {
        const [result] = await pool.query(
            `INSERT INTO Appointment (department, doctor, appointmentTime, otherDetails, createdAt)
             VALUES (?, ?, ?, ?, NOW())`,
            [department, doctor, appointmentTime, JSON.stringify(otherDetails)]
        );

        return { id: result.insertId, department, doctor, appointmentTime, ...otherDetails };
    } catch (error) {
        throw new Error("Không thể tạo lịch hẹn: " + error.message);
    }
};
