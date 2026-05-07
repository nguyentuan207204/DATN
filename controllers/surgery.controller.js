import {
  createSurgery,
  getSurgeriesByRecord,
  getAllSurgeries,
} from "../services/surgery.service.js";

export const create = async (req, res, next) => {
  try {
    const { recordId, surgeonId, name, date } = req.body;

    if (!recordId || !surgeonId || !name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu recordId, surgeonId hoặc name",
      });
    }

    const result = await createSurgery({ recordId, surgeonId, name, date });

    return res.status(201).json({
      success: true,
      message: "Tạo phẫu thuật/thủ thuật thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getByRecord = async (req, res, next) => {
  try {
    const recordId = Number(req.params.recordId);

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "recordId không hợp lệ",
      });
    }

    const data = await getSurgeriesByRecord(recordId);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const data = await getAllSurgeries();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};


