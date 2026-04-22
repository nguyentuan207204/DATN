import pool from "../config/db.js";

export const getDashboardStats = async () => {
  // 1. Basic Stats
  const [[{ totalPatients }]] = await pool.query("SELECT COUNT(*) as totalPatients FROM Patient");
  const [[{ todayAppointments }]] = await pool.query(
    "SELECT COUNT(*) as todayAppointments FROM Appointment WHERE DATE(date) = CURDATE()"
  );
  
  const [[{ monthlyRevenue }]] = await pool.query(`
    SELECT COALESCE(SUM(ii.price * ii.quantity), 0) as monthlyRevenue 
    FROM Invoice i 
    JOIN InvoiceItem ii ON i.id = ii.invoiceId 
    WHERE i.status = 'PAID' 
      AND MONTH(i.createdAt) = MONTH(CURDATE()) 
      AND YEAR(i.createdAt) = YEAR(CURDATE())
  `);
  
  const [[{ totalDoctors }]] = await pool.query(`
    SELECT COUNT(*) as totalDoctors 
    FROM Staff s 
    JOIN User u ON s.userId = u.id 
    JOIN Role r ON u.roleId = r.id 
    WHERE r.name = 'BACSI' OR r.id = 2
  `);

  // 2. Chart Data (Last 6 months)
  const [chartData] = await pool.query(`
    SELECT 
      DATE_FORMAT(createdAt, '%M') as month,
      SUM(total) as amount
    FROM (
      SELECT i.createdAt, SUM(ii.price * ii.quantity) as total
      FROM Invoice i
      JOIN InvoiceItem ii ON i.id = ii.invoiceId
      WHERE i.status = 'PAID'
        AND i.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY i.id, i.createdAt
    ) as sub
    GROUP BY MONTH(createdAt), DATE_FORMAT(createdAt, '%M')
    ORDER BY MIN(createdAt) ASC
  `);

  // 3. Activities
  const [latestAppointments] = await pool.query(`
    SELECT 
      a.id, 
      p.fullName as patientName, 
      p.phone as patientPhone,
      ms.name as serviceName,
      s.fullName as doctorName, 
      a.date,
      a.status,
      a.createdAt 
    FROM Appointment a
    JOIN Patient p ON a.patientId = p.id
    JOIN Staff s ON a.doctorId = s.id
    LEFT JOIN Service ms ON a.serviceId = ms.id
    ORDER BY a.id DESC
    LIMIT 10
  `);

  const [latestRecords] = await pool.query(`
    SELECT 
      mr.id, 
      p.fullName as patientName, 
      mr.visitDate as createdAt 
    FROM MedicalRecord mr
    JOIN Patient p ON mr.patientId = p.id
    ORDER BY mr.id DESC
    LIMIT 5
  `);

  // 4. Top Doctors
  const [topDoctors] = await pool.query(`
    SELECT 
      s.fullName, 
      d.name as department, 
      COUNT(a.id) as appointmentCount
    FROM Staff s
    JOIN Department d ON s.departmentId = d.id
    LEFT JOIN Appointment a ON s.id = a.doctorId
    GROUP BY s.id
    ORDER BY appointmentCount DESC
    LIMIT 3
  `);

  return {
    stats: {
      totalPatients,
      todayAppointments,
      monthlyRevenue: parseFloat(monthlyRevenue),
      totalDoctors
    },
    chartData,
    activities: {
      latestAppointments,
      latestRecords
    },
    topDoctors
  };
};
