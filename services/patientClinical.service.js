import pool from "../config/db.js";

export const getVisitHistoryByPatient = async (patientId) => {
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

export const getPrescriptionHistoryByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      pr.id AS prescriptionId,
      mr.id AS recordId,
      mr.visitDate,
      s.fullName AS doctorName,
      m.name AS medicineName,
      pi.quantity,
      pi.dosage
    FROM Prescription pr
    JOIN MedicalRecord mr ON pr.recordId = mr.id
    JOIN Staff s ON mr.doctorId = s.id
    JOIN PrescriptionItem pi ON pi.prescriptionId = pr.id
    JOIN Medicine m ON pi.medicineId = m.id
    WHERE mr.patientId = ?
    ORDER BY mr.visitDate DESC, pr.id DESC
    `,
    [patientId]
  );

  return rows;
};

export const getTreatmentSummaryByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT
      mr.id AS recordId,
      mr.visitDate,
      s.fullName AS doctorName,
      GROUP_CONCAT(DISTINCT CONCAT(i.code, ' - ', i.name) SEPARATOR '; ') AS diagnoses,
      COUNT(DISTINCT surg.id) AS surgeryCount
    FROM MedicalRecord mr
    JOIN Staff s ON mr.doctorId = s.id
    LEFT JOIN Diagnosis d ON d.recordId = mr.id
    LEFT JOIN ICD10 i ON d.icd10Id = i.id
    LEFT JOIN Surgery surg ON surg.recordId = mr.id
    WHERE mr.patientId = ?
    GROUP BY mr.id, mr.visitDate, s.fullName
    ORDER BY mr.visitDate DESC
    `,
    [patientId]
  );

  return rows;
};

export const getFollowUpAppointmentsByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      a.id,
      a.date,
      a.status,
      s.fullName AS doctorName
    FROM Appointment a
    JOIN Staff s ON a.doctorId = s.id
    WHERE a.patientId = ?
      AND a.date >= NOW()
      AND a.status IN ('PENDING', 'CONFIRMED')
    ORDER BY a.date ASC
    `,
    [patientId]
  );

  return rows;
};

export const getMedicationScheduleByPatient = async (patientId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      mr.id AS recordId,
      mr.visitDate,
      m.name AS medicineName,
      pi.quantity,
      pi.dosage AS instructions
    FROM Prescription pr
    JOIN MedicalRecord mr ON pr.recordId = mr.id
    JOIN PrescriptionItem pi ON pi.prescriptionId = pr.id
    JOIN Medicine m ON pi.medicineId = m.id
    WHERE mr.patientId = ?
    ORDER BY mr.visitDate DESC, pr.id DESC
    `,
    [patientId]
  );

  return rows;
};


