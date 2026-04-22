import { getStaffPerformance } from "../services/performance.service.js";

export const getStaffStats = async (req, res, next) => {
  try {
    const { from, to, departmentId } = req.query;

    const data = await getStaffPerformance({
      from,
      to,
      departmentId: departmentId ? Number(departmentId) : undefined,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

