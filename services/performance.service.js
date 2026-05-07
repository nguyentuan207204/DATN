import pool from "../config/db.js";

export const getStaffPerformance = async ({ from, to, departmentId }) => {
  const params = [];
  const dateFilterAppointment = [];
  const dateFilterRecord = [];
  const dateFilterSurgery = [];
  const dateFilterAdmission = [];

  if (from) {
    dateFilterAppointment.push("a.date >= ?");
    dateFilterRecord.push("mr.visitDate >= ?");
    dateFilterSurgery.push("s.date >= ?");
    dateFilterAdmission.push("ad.admittedAt >= ?");
    const fromDate = new Date(from);
    params.push(fromDate, fromDate, fromDate, fromDate);
  }

  if (to) {
    dateFilterAppointment.push("a.date <= ?");
    dateFilterRecord.push("mr.visitDate <= ?");
    dateFilterSurgery.push("s.date <= ?");
    dateFilterAdmission.push("ad.admittedAt <= ?");
    const toDate = new Date(to);
    params.push(toDate, toDate, toDate, toDate);
  }

  const deptFilter =
    departmentId !== undefined
      ? "WHERE s.departmentId = ?"
      : "";

  const deptParams = departmentId !== undefined ? [departmentId] : [];

  const [rows] = await pool.query(
    `
    SELECT
      s.id AS staffId,
      s.fullName,
      d.name AS departmentName,
      r.name AS roleName,
      COALESCE(app.appointmentCount, 0) AS appointmentCount,
      COALESCE(mrRec.recordCount, 0) AS recordCount,
      COALESCE(surg.surgeryCount, 0) AS surgeryCount,
      COALESCE(adm.admissionCount, 0) AS admissionCount
    FROM Staff s
    JOIN Department d ON s.departmentId = d.id
    LEFT JOIN User u ON s.userId = u.id
    LEFT JOIN Role r ON u.roleId = r.id
    LEFT JOIN (
      SELECT 
        a.doctorId,
        COUNT(*) AS appointmentCount
      FROM Appointment a
      ${dateFilterAppointment.length ? "WHERE " + dateFilterAppointment.join(" AND ") : ""}
      GROUP BY a.doctorId
    ) app ON app.doctorId = s.id
    LEFT JOIN (
      SELECT 
        mr.doctorId,
        COUNT(*) AS recordCount
      FROM MedicalRecord mr
      ${dateFilterRecord.length ? "WHERE " + dateFilterRecord.join(" AND ") : ""}
      GROUP BY mr.doctorId
    ) mrRec ON mrRec.doctorId = s.id
    LEFT JOIN (
      SELECT 
        srg.surgeonId,
        COUNT(*) AS surgeryCount
      FROM Surgery srg
      ${dateFilterSurgery.length ? "WHERE " + dateFilterSurgery.join(" AND ") : ""}
      GROUP BY srg.surgeonId
    ) surg ON surg.surgeonId = s.id
    LEFT JOIN (
      SELECT 
        mr.doctorId,
        COUNT(*) AS admissionCount
      FROM Admission ad
      JOIN MedicalRecord mr ON ad.patientId = mr.patientId
      ${dateFilterAdmission.length ? "WHERE " + dateFilterAdmission.join(" AND ") : ""}
      GROUP BY mr.doctorId
    ) adm ON adm.doctorId = s.id
    ${deptFilter}
    ORDER BY s.id ASC
    `,
    [...params, ...deptParams]
  );

  return rows;
};

