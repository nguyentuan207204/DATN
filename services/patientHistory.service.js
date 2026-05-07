import pool from "../config/db.js";

/* =====================================================
   LỊCH SỬ ĐIỀU TRỊ / TIMELINE BỆNH NHÂN
===================================================== */

export const getPatientTimeline = async (patientId, from, to) => {
  const [rows] = await pool.query(
    `
    SELECT 
      'APPOINTMENT' AS eventType,
      a.date        AS eventDate,
      a.id          AS referenceId,
      CONCAT('Lịch khám với bác sĩ ID ', a.doctorId) AS summary
    FROM Appointment a
    WHERE a.patientId = ?

    UNION ALL

    SELECT
      'OUTPATIENT_VISIT' AS eventType,
      mr.visitDate       AS eventDate,
      mr.id              AS referenceId,
      CONCAT('Khám ngoại trú, bác sĩ ID ', mr.doctorId) AS summary
    FROM MedicalRecord mr
    WHERE mr.patientId = ?

    UNION ALL

    SELECT
      'ADMISSION' AS eventType,
      ad.admittedAt AS eventDate,
      ad.id         AS referenceId,
      CONCAT('Nhập viện giường ', b.bedCode) AS summary
    FROM Admission ad
    JOIN Bed b ON ad.bedId = b.id
    WHERE ad.patientId = ?

    UNION ALL

    SELECT
      'DISCHARGE' AS eventType,
      ad.dischargedAt AS eventDate,
      ad.id           AS referenceId,
      CONCAT('Ra viện từ giường ', b.bedCode) AS summary
    FROM Admission ad
    JOIN Bed b ON ad.bedId = b.id
    WHERE ad.patientId = ? AND ad.dischargedAt IS NOT NULL

    UNION ALL

    SELECT
      'SURGERY' AS eventType,
      s.date    AS eventDate,
      s.id      AS referenceId,
      CONCAT('Phẫu thuật/thủ thuật: ', s.name) AS summary
    FROM Surgery s
    JOIN MedicalRecord mr ON s.recordId = mr.id
    WHERE mr.patientId = ?

    ORDER BY eventDate ASC
    `,
    [patientId, patientId, patientId, patientId, patientId]
  );

  let result = rows;

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      result = result.filter((item) => {
        if (!item.eventDate) return false;
        return new Date(item.eventDate) >= fromDate;
      });
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      result = result.filter((item) => {
        if (!item.eventDate) return false;
        return new Date(item.eventDate) <= toDate;
      });
    }
  }

  return result;
};

