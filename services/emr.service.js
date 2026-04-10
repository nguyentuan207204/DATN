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
      `INSERT INTO MedicalRecord (patientId, doctorId, visitDate)
       VALUES (?, ?, NOW())`,
      [data.patientId, data.doctorId]
    );

    await conn.commit();

    return {
      recordId: result.insertId,
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


/* =====================================================
   4️⃣ LẤY CHI TIẾT HỒ SƠ BỆNH ÁN
===================================================== */
export const getMedicalRecordDetail = async (recordId) => {

  // 1. Lấy thông tin hồ sơ chính
  const [record] = await pool.query(
    `
    SELECT 
      mr.id,
      mr.visitDate,
      p.fullName AS patientName,
      s.fullName AS doctorName
    FROM MedicalRecord mr
    JOIN Patient p ON mr.patientId = p.id
    JOIN Staff s ON mr.doctorId = s.id
    WHERE mr.id = ?
    `,
    [recordId]
  );

  if (record.length === 0) {
    throw new Error("Không tìm thấy hồ sơ bệnh án");
  }

  // 2. Lấy danh sách chẩn đoán
  const [diagnosis] = await pool.query(
    `
    SELECT i.code, i.name
    FROM Diagnosis d
    JOIN ICD10 i ON d.icd10Id = i.id
    WHERE d.recordId = ?
    `,
    [recordId]
  );

  // 3. Lấy danh sách thuốc
  const [prescription] = await pool.query(
    `
    SELECT m.name, pi.quantity, pi.dosage
    FROM PrescriptionItem pi
    JOIN Prescription p ON pi.prescriptionId = p.id
    JOIN Medicine m ON pi.medicineId = m.id
    WHERE p.recordId = ?
    `,
    [recordId]
  );

  return {
    record: record[0],
    diagnosis,
    prescription,
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
