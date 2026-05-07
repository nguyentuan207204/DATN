import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../services/department.service.js";

export const create = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu name",
      });
    }

    const result = await createDepartment({ name });

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
    const data = await getAllDepartments();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu name",
      });
    }

    const result = await updateDepartment(id, { name });

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

    const result = await deleteDepartment(id);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

