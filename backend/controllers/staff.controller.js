import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
  getDoctors as getDoctorsService,
  getNurses as getNursesService,
} from "../services/staff.service.js";
import { createUser, updateUserRole, deleteUserById } from "../services/user.service.js";
import { getAllRoles } from "../services/role.service.js";

export const create = async (req, res, next) => {
  try {
    const { fullName, departmentId, role, username, password } = req.body;

    if (!fullName || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu fullName hoặc departmentId",
      });
    }

    let userId = null;
    if (username && password && role) {
      const roles = await getAllRoles();
      const roleRecord = roles.find(r => r.name === role);
      if (!roleRecord) {
        return res.status(400).json({ success: false, message: "Role không hợp lệ" });
      }
      try {
        const userResult = await createUser({ username, password, roleId: roleRecord.id, fullName });
        userId = userResult.id;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại" });
        }
        throw err;
      }
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

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID không hợp lệ",
      });
    }

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
    const { fullName, departmentId, role } = req.body;

    if (!fullName || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu fullName hoặc departmentId",
      });
    }

    const staff = await getStaffById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhân viên" });
    }

    const result = await updateStaff(id, { fullName, departmentId, userId: staff.userId });

    if (role && staff.userId) {
      const roles = await getAllRoles();
      const roleRecord = roles.find(r => r.name === role);
      if (roleRecord && staff.roleName !== role) {
        await updateUserRole(staff.userId, roleRecord.id);
      }
    }

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
    const staff = await getStaffById(id);
    
    if (staff) {
      await deleteStaff(id);
      if (staff.userId) {
        await deleteUserById(staff.userId);
      }
    }

    return res.json({
      success: true,
      message: "Đã xóa nhân viên và tài khoản liên quan",
    });
  } catch (error) {
    next(error);
  }
};
export const getDoctors = async (req, res, next) => {
    try {
      const data = await getDoctorsService();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getNurses = async (req, res, next) => {
    try {
      const data = await getNursesService();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
