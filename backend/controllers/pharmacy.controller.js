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

export const getAllStockHistory = async (req, res) => {
  try {
    const result = await pharmacyService.getAllStockHistory();

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
    const { page, pageSize, status } = req.query;
    const includeDeleted = req.query.includeDeleted === 'true';
    
    const result = await pharmacyService.getAllMedicines(includeDeleted, page, pageSize, status);

    return res.status(200).json({
      success: true,
      data: result.data,
      total: result.total
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCriticalCount = async (req, res) => {
  try {
    const count = await pharmacyService.getCriticalMedicinesCount();
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   CREATE MEDICINE
================================ */

export const createMedicine = async (req, res) => {
  try {
    const { name, unit, price } = req.body;
    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        message: "Tên thuốc và đơn vị là bắt buộc",
      });
    }

    // Validate price > 0
    const parsedPrice = Number(price);
    if (req.body.price === undefined || isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "vui lòng nhập giá lớn hơn 0",
      });
    }

    const result = await pharmacyService.createMedicine(req.body);

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
   UPDATE MEDICINE
================================ */

export const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID Dược phẩm",
      });
    }

    // Validate price > 0 if provided
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "vui lòng nhập giá lớn hơn 0",
        });
      }
    }

    const result = await pharmacyService.updateMedicine(id, req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    // Phân biệt lỗi Not found vs Internal error
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   DELETE MEDICINE
================================ */

export const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID Dược phẩm",
      });
    }

    const result = await pharmacyService.deleteMedicine(id);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   RESTORE MEDICINE
================================ */
export const restoreMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID Dược phẩm",
      });
    }

    const result = await pharmacyService.restoreMedicine(id);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
