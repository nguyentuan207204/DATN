import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
} from "../services/staff.service.js";

export const create = async (req, res, next) => {
  try {
    const { fullName, departmentId, userId } = req.body;

    if (!fullName || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu fullName hoặc departmentId",
      });
    }

    const result = await createStaff({ fullName, departmentId, userId });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { departmentId } = req.query;

    let data;
    if (departmentId) {
      data = await getStaffByDepartment(Number(departmentId));
    } else {
      data = await getAllStaff();
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const staff = await getStaffById(id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    return res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { fullName, departmentId, userId } = req.body;

    if (!fullName || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu fullName hoặc departmentId",
      });
    }

    const result = await updateStaff(id, { fullName, departmentId, userId });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const result = await deleteStaff(id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

