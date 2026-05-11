import pool from "../config/db.js";

export const createAppointment = async (data) => {
    const { patientId, doctorId, serviceId, date, notes, imageUrls } = data;
    try {
        const [result] = await pool.query(
            `INSERT INTO Appointment (patientId, doctorId, serviceId, date, status, notes, imageUrls)
             VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
            [patientId, doctorId, serviceId, date, notes || null, imageUrls || null]
        );

        return { id: result.insertId, ...data, status: 'UPCOMING' };
    } catch (error) {
        throw new Error("Không thể tạo lịch hẹn: " + error.message);
    }
};

export const getAppointmentsByPatient = async (patientId) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                a.id,
                a.date,
                a.status,
                s.fullName as doctorName,
                ms.name as serviceName
             FROM Appointment a
             JOIN Staff s ON a.doctorId = s.id
             LEFT JOIN Service ms ON a.serviceId = ms.id
             WHERE a.patientId = ?
             ORDER BY a.date DESC`,
            [patientId]
        );
        return rows;
    } catch (error) {
        throw new Error("Lỗi khi lấy danh sách lịch hẹn: " + error.message);
    }
};

export const getAdminAppointments = async ({ page = 1, pageSize = 10 }) => {
    const offset = (page - 1) * pageSize;

    // Get total count
    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM Appointment");

    // Get paginated results with joins
    const [rows] = await pool.query(
        `SELECT 
            a.id,
            a.patientId,
            a.doctorId,
            a.date,
            a.status,
            a.notes,
            a.imageUrls,
            p.fullName as patientName,
            p.phone as patientPhone,
            s.fullName as doctorName,
            ms.name as serviceName
         FROM Appointment a
         JOIN Patient p ON a.patientId = p.id
         JOIN Staff s ON a.doctorId = s.id
         LEFT JOIN Service ms ON a.serviceId = ms.id
         ORDER BY a.date DESC
         LIMIT ? OFFSET ?`,
        [Number(pageSize), Number(offset)]
    );

    return { data: rows, total };
};

export const updateAppointmentStatus = async (id, status) => {
    await pool.query(
        "UPDATE Appointment SET status = ? WHERE id = ?",
        [status, id]
    );
    return true;
};

export const cancelAppointment = async (id, patientId) => {
    const [result] = await pool.query(
        "UPDATE Appointment SET status = 'CANCELLED' WHERE id = ? AND patientId = ? AND status IN ('PENDING', 'UPCOMING')",
        [id, patientId]
    );
    
    if (result.affectedRows === 0) {
        throw new Error("Không thể hủy lịch hẹn. Lịch hẹn không tồn tại hoặc không ở trạng thái có thể hủy.");
    }
    
    return true;
};
