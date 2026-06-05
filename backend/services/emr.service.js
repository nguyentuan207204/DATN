import pool from "../config/db.js";

/* =====================================================
   1️⃣ TẠO HỒ SƠ BỆNH ÁN (Medical Record)
===================================================== */
export const createMedicalRecord = async (data) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Kiểm tra bệnh nhân tồn tại
    const [patient] = await conn.query(
      `SELECT id FROM Patient WHERE id = ?`,
      [data.patientId]
    );

    if (patient.length === 0) {
      throw new Error("Không tìm thấy bệnh nhân");
    }

    // 2. Kiểm tra bác sĩ tồn tại
    const [doctor] = await conn.query(
      `SELECT id FROM Staff WHERE id = ?`,
      [data.doctorId]
    );

    if (doctor.length === 0) {
      throw new Error("Không tìm thấy bác sĩ");
    }

    // 3. Tạo hồ sơ bệnh án
    const [result] = await conn.query(
      `INSERT INTO MedicalRecord (
        patientId, doctorId, visitDate, 
        weight, height, bloodPressure, heartRate, temperature, respiratoryRate, advice
      )
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.patientId, 
        data.doctorId,
        data.weight || null,
        data.height || null,
        data.bloodPressure || null,
        data.heartRate || null,
        data.temperature || null,
        data.respiratoryRate || null,
        data.advice || null
      ]
    );

    // 4. Find the patient's appointment to auto-create invoice & mark as DONE
    const recordId = result.insertId;

    // Priority 1: Appointment today with this doctor, not CANCELLED or DONE
    let [appointments] = await conn.query(
      `SELECT id, serviceId FROM Appointment 
       WHERE patientId = ? AND doctorId = ? AND status NOT IN ('CANCELLED', 'DONE') AND DATE(date) = CURDATE()
       ORDER BY createdAt DESC LIMIT 1`,
      [data.patientId, data.doctorId]
    );

    let appointment = appointments[0];

    if (!appointment) {
      // Priority 2: Any appointment today for this patient, not CANCELLED or DONE
      const [anyAppointments] = await conn.query(
        `SELECT id, serviceId FROM Appointment 
         WHERE patientId = ? AND status NOT IN ('CANCELLED', 'DONE') AND DATE(date) = CURDATE()
         ORDER BY createdAt DESC LIMIT 1`,
        [data.patientId]
      );
      appointment = anyAppointments[0];
    }

    if (!appointment) {
      // Priority 3: Any closest incomplete appointment
      const [anytimeAppointments] = await conn.query(
        `SELECT id, serviceId FROM Appointment 
         WHERE patientId = ? AND status NOT IN ('CANCELLED', 'DONE')
         ORDER BY ABS(DATEDIFF(date, NOW())) ASC LIMIT 1`,
        [data.patientId]
      );
      appointment = anytimeAppointments[0];
    }

    if (appointment) {
      const appointmentId = appointment.id;
      const serviceId = appointment.serviceId;

      // Update appointment status to DONE
      await conn.query(
        `UPDATE Appointment SET status = 'DONE' WHERE id = ?`,
        [appointmentId]
      );

      // Create invoice automatically if serviceId is available
      if (serviceId) {
        const [services] = await conn.query(
          `SELECT price FROM Service WHERE id = ?`,
          [serviceId]
        );

        if (services.length > 0) {
          const servicePrice = services[0].price;

          // Insert into Invoice
          const [invoiceResult] = await conn.query(
            `INSERT INTO Invoice (patientId, recordId, status, createdAt)
             VALUES (?, ?, 'UNPAID', NOW())`,
            [data.patientId, recordId]
          );

          const invoiceId = invoiceResult.insertId;

          // Insert into InvoiceItem
          await conn.query(
            `INSERT INTO InvoiceItem (invoiceId, serviceId, quantity, price)
             VALUES (?, ?, 1, ?)`,
            [invoiceId, serviceId, servicePrice]
          );
        }
      }
    }

    await conn.commit();

    return {
      recordId,
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


/* =====================================================
   2️⃣ THÊM CHẨN ĐOÁN (Diagnosis - ICD10)
===================================================== */
export const addDiagnosis = async (recordId, icd10Id) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Kiểm tra hồ sơ tồn tại
    const [record] = await conn.query(
      `SELECT id FROM MedicalRecord WHERE id = ?`,
      [recordId]
    );

    if (record.length === 0) {
      throw new Error("Không tìm thấy hồ sơ bệnh án");
    }

    // 2. Kiểm tra ICD10 tồn tại
    const [icd] = await conn.query(
      `SELECT id FROM ICD10 WHERE id = ?`,
      [icd10Id]
    );

    if (icd.length === 0) {
      throw new Error("Mã ICD10 không tồn tại");
    }

    // 3. Kiểm tra trùng chẩn đoán
    const [exists] = await conn.query(
      `SELECT id FROM Diagnosis 
       WHERE recordId = ? AND icd10Id = ?`,
      [recordId, icd10Id]
    );

    if (exists.length > 0) {
      throw new Error("Chẩn đoán đã tồn tại");
    }

    // 4. Thêm chẩn đoán
    await conn.query(
      `INSERT INTO Diagnosis (recordId, icd10Id)
       VALUES (?, ?)`,
      [recordId, icd10Id]
    );

    await conn.commit();

    return {
      message: "Thêm chẩn đoán thành công",
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


/* =====================================================
   3️⃣ TẠO ĐƠN THUỐC (Prescription)
===================================================== */
export const createPrescription = async (recordId, items) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Kiểm tra hồ sơ tồn tại
    const [record] = await conn.query(
      `SELECT id FROM MedicalRecord WHERE id = ?`,
      [recordId]
    );

    if (record.length === 0) {
      throw new Error("Không tìm thấy hồ sơ bệnh án");
    }

    // 2. Tạo Prescription
    const [pres] = await conn.query(
      `INSERT INTO Prescription (recordId)
       VALUES (?)`,
      [recordId]
    );

    const prescriptionId = pres.insertId;

    // 3. Thêm từng thuốc
    for (const item of items) {

      // Kiểm tra thuốc tồn tại
      const [medicine] = await conn.query(
        `SELECT id FROM Medicine WHERE id = ?`,
        [item.medicineId]
      );

      if (medicine.length === 0) {
        throw new Error(`Thuốc ID ${item.medicineId} không tồn tại`);
      }

      await conn.query(
        `INSERT INTO PrescriptionItem
         (prescriptionId, medicineId, quantity, dosage)
         VALUES (?, ?, ?, ?)`,
        [
          prescriptionId,
          item.medicineId,
          item.quantity,
          item.dosage,
        ]
      );
    }

    await conn.commit();

    return {
      prescriptionId,
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};


export const getHistoryByPatient = async (patientId) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        mr.id,
        mr.visitDate,
        s.fullName AS doctorName,
        (SELECT GROUP_CONCAT(i.name SEPARATOR ', ') 
         FROM Diagnosis d 
         JOIN ICD10 i ON d.icd10Id = i.id 
         WHERE d.recordId = mr.id) AS diagnoses,
        inv.id AS invoiceId,
        inv.status AS invoiceStatus,
        COALESCE((SELECT SUM(price * quantity) FROM InvoiceItem WHERE invoiceId = inv.id), 0) AS invoiceTotal
      FROM MedicalRecord mr
      JOIN Staff s ON mr.doctorId = s.id
      LEFT JOIN Invoice inv ON mr.id = inv.recordId
      WHERE mr.patientId = ?
      ORDER BY mr.visitDate DESC`,
      [patientId]
    );
    return rows;
  } catch (err) {
    throw new Error("Lỗi khi lấy lịch sử khám: " + err.message);
  }
};

/* =====================================================
   4️⃣ LẤY CHI TIẾT HỒ SƠ BỆNH ÁN
===================================================== */
export const getMedicalRecordDetail = async (recordId) => {
  let actualRecordId = recordId;

  // Check if the recordId exists in MedicalRecord table
  const [checkRecord] = await pool.query(
    `SELECT id FROM MedicalRecord WHERE id = ?`,
    [recordId]
  );

  if (checkRecord.length === 0) {
    // If not found in MedicalRecord, it might be an Appointment ID sent from frontend
    const [appointments] = await pool.query(
      `SELECT patientId, date FROM Appointment WHERE id = ?`,
      [recordId]
    );

    if (appointments.length > 0) {
      const appt = appointments[0];
      // Find the closest medical record for this patient near the appointment date
      const [records] = await pool.query(
        `SELECT id FROM MedicalRecord 
         WHERE patientId = ?
         ORDER BY ABS(TIMESTAMPDIFF(MINUTE, visitDate, ?)) ASC, id DESC 
         LIMIT 1`,
        [appt.patientId, appt.date]
      );

      if (records.length > 0) {
        actualRecordId = records[0].id;
      }
    }
  }

  // 1. Lấy thông tin hồ sơ chính
  const [record] = await pool.query(
    `
    SELECT 
      mr.id,
      mr.visitDate,
      mr.advice,
      mr.weight,
      mr.height,
      mr.bloodPressure,
      mr.heartRate,
      mr.temperature,
      mr.respiratoryRate,
      p.fullName AS patientName,
      s.fullName AS doctorName,
      dept.name AS departmentName
    FROM MedicalRecord mr
    LEFT JOIN Patient p ON mr.patientId = p.id
    LEFT JOIN Staff s ON mr.doctorId = s.id
    LEFT JOIN Department dept ON s.departmentId = dept.id
    WHERE mr.id = ?
    `,
    [actualRecordId]
  );

  if (record.length === 0) {
    throw new Error("Không tìm thấy hồ sơ bệnh án");
  }

  // 2. Lấy danh sách chẩn đoán
  const [diagnoses] = await pool.query(
    `
    SELECT i.code, i.name
    FROM Diagnosis d
    JOIN ICD10 i ON d.icd10Id = i.id
    WHERE d.recordId = ?
    `,
    [actualRecordId]
  );

  // 3. Lấy danh sách thuốc (Prescription)
  const [prescriptionItems] = await pool.query(
    `
    SELECT m.name, pi.quantity, pi.dosage
    FROM PrescriptionItem pi
    JOIN Prescription p ON pi.prescriptionId = p.id
    JOIN Medicine m ON pi.medicineId = m.id
    WHERE p.recordId = ?
    `,
    [actualRecordId]
  );

  // 4. Lấy thông tin hóa đơn (Invoice)
  const [invoices] = await pool.query(
    `SELECT id, totalAmount, status, createdAt FROM Invoice WHERE recordId = ?`,
    [actualRecordId]
  );

  let invoice = null;
  if (invoices.length > 0) {
    invoice = invoices[0];
    const [invoiceItems] = await pool.query(
      `SELECT serviceName, quantity, price FROM InvoiceItem WHERE invoiceId = ?`,
      [invoice.id]
    );
    invoice.items = invoiceItems;
  }

  return {
    data: {
      ...record[0],
      diagnoses,
      prescription: prescriptionItems,
      invoice
    }
  };
};
export const completeOutpatient = async (recordId) => {
  await pool.query(
    `UPDATE Appointment 
       SET status = 'DONE'
       WHERE id = (
         SELECT id FROM Appointment
         WHERE patientId = (
           SELECT patientId FROM MedicalRecord WHERE id = ?
         )
         LIMIT 1
       )`,
    [recordId]
  );

  return { message: "Hoàn tất khám ngoại trú" };
};
