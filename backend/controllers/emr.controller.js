import * as emrService from "../services/emr.service.js";

/* =====================================================
   1️⃣ TẠO HỒ SƠ BỆNH ÁN
===================================================== */
export const createRecord = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu patientId hoặc doctorId",
      });
    }

    const result = await emrService.createMedicalRecord({
      ...req.body,
      patientId,
      doctorId,
    });

    res.status(201).json({
      success: true,
      message: "Tạo hồ sơ bệnh án thành công",
      ...result,
    });

  } catch (err) {
    next(err);
  }
};


/* =====================================================
   2️⃣ LẤY CHI TIẾT HỒ SƠ BỆNH ÁN
===================================================== */
export const getDetail = async (req, res, next) => {
  try {
    const { recordId } = req.params;

    const result = await emrService.getMedicalRecordDetail(recordId);

    res.json({
      success: true,
      ...result,
    });

  } catch (err) {
    next(err);
  }
};


/* =====================================================
   3️⃣ THÊM CHẨN ĐOÁN
===================================================== */
export const addDiagnosis = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { icd10Id } = req.body;

    if (!icd10Id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu icd10Id",
      });
    }

    const result = await emrService.addDiagnosis(recordId, icd10Id);

    res.json({
      success: true,
      ...result,
    });

  } catch (err) {
    next(err);
  }
};


/* =====================================================
   4️⃣ TẠO ĐƠN THUỐC
===================================================== */
export const createPrescription = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách thuốc không hợp lệ",
      });
    }

    const result = await emrService.createPrescription(recordId, items);

    res.json({
      success: true,
      message: "Tạo đơn thuốc thành công",
      ...result,
    });

  } catch (err) {
    next(err);
  }
};
