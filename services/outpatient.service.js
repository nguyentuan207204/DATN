import pool from "../config/db.js";

/* =====================================================
   KHÁM NGOẠI TRÚ
===================================================== */

export const createOutpatientVisit = async ({ appointmentId, doctorId }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Khóa bản ghi lịch khám để tránh race condition
    const [appointments] = await conn.query(
      `
      SELECT id, patientId, doctorId, status, date
      FROM Appointment
      WHERE id = ?
      FOR UPDATE
      `,
      [appointmentId]
    );

    if (appointments.length === 0) {
      throw new Error("Không tìm thấy lịch khám");
    }

    const appointment = appointments[0];

    if (appointment.status === "DONE" || appointment.status === "CANCELLED") {
      throw new Error("Lịch khám đã hoàn tất hoặc đã hủy");
    }

    const finalDoctorId = doctorId || appointment.doctorId;

    // Tạo hồ sơ bệnh án cho lần khám này
    const [recordResult] = await conn.query(
      `
      INSERT INTO MedicalRecord (patientId, doctorId, visitDate)
      VALUES (?, ?, NOW())
      `,
      [appointment.patientId, finalDoctorId]
    );

    // Cập nhật trạng thái lịch khám
    await conn.query(
      `
      UPDATE Appointment
      SET status = 'DONE'
      WHERE id = ?
      `,
      [appointment.id]
    );

    await conn.commit();

    return {
      recordId: recordResult.insertId,
      appointmentId: appointment.id,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const getOutpatientVisitsByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      mr.id,
      mr.visitDate,
      s.fullName AS doctorName
    FROM MedicalRecord mr
    JOIN Staff s ON mr.doctorId = s.id
    WHERE mr.patientId = ?
    ORDER BY mr.visitDate DESC
    `,
    [patientId]
  );

  return rows;
};

export const getAllOutpatientVisits = async () => {
  const [rows] = await pool.query(
    `
    SELECT 
      mr.id,
      mr.visitDate,
      p.fullName AS patientName,
      s.fullName AS doctorName
    FROM MedicalRecord mr
    JOIN Patient p ON mr.patientId = p.id
    JOIN Staff s ON mr.doctorId = s.id
    ORDER BY mr.visitDate DESC
    `
  );

  return rows;
};

