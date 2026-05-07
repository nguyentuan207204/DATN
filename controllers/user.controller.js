import {
  createUser,
  getAllUsers,
  updateUserRole,
} from "../services/user.service.js";

export const create = async (req, res, next) => {
  try {
    const { username, password, roleId } = req.body;

    if (!username || !password || !roleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu username, password hoặc roleId",
      });
    }

    const result = await createUser({ username, password, roleId });

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
    const data = await getAllUsers();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu roleId",
      });
    }

    const result = await updateUserRole(userId, roleId);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

