import pool from "../config/db.js";

export const getPrescriptionsByDoctor = async ({
  doctorId,
  from,
  to,
}) => {
  const conditions = ["mr.doctorId = ?"];
  const params = [doctorId];

  if (from) {
    conditions.push("mr.visitDate >= ?");
    params.push(new Date(from));
  }

  if (to) {
    conditions.push("mr.visitDate <= ?");
    params.push(new Date(to));
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query(
    `
    SELECT
      pr.id AS prescriptionId,
      mr.id AS recordId,
      mr.visitDate,
      p.id AS patientId,
      p.fullName AS patientName,
      s.fullName AS doctorName,
      m.name AS medicineName,
      pi.quantity,
      pi.dosage AS dosageInstructions
    FROM Prescription pr
    JOIN MedicalRecord mr ON pr.recordId = mr.id
    JOIN Patient p ON mr.patientId = p.id
    JOIN Staff s ON mr.doctorId = s.id
    JOIN PrescriptionItem pi ON pi.prescriptionId = pr.id
    JOIN Medicine m ON pi.medicineId = m.id
    ${whereClause}
    ORDER BY mr.visitDate DESC, pr.id DESC
    `,
    params
  );

  return rows;
};

