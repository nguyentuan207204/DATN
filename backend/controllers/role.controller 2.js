import { createRole, getAllRoles } from "../services/role.service.js";

export const create = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Thiếu name",
      });
    }

    const result = await createRole({ name });

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
    const data = await getAllRoles();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

