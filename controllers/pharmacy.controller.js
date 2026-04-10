import * as pharmacyService from "../services/pharmacy.service.js";

/* ===============================
   IMPORT MEDICINE
================================ */

export const importMedicine = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin nhập kho",
      });
    }

    const result = await pharmacyService.importMedicine(
      medicineId,
      quantity
    );

    return res.status(201).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   EXPORT MEDICINE
================================ */

export const exportMedicine = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin xuất kho",
      });
    }

    const result = await pharmacyService.exportMedicine(
      medicineId,
      quantity
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   GET STOCK
================================ */

export const getStock = async (req, res) => {
  try {
    const medicineId = Number(req.params.medicineId);

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "medicineId không hợp lệ",
      });
    }

    const result = await pharmacyService.getStockByMedicine(
      medicineId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   STOCK HISTORY
================================ */

export const getStockHistory = async (req, res) => {
  try {
    const medicineId = Number(req.params.medicineId);

    const result = await pharmacyService.getStockHistory(medicineId);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/* ===============================
   GET ALL MEDICINES
================================ */

export const getAllMedicines = async (req, res) => {
  try {
    const result = await pharmacyService.getAllMedicines();

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
