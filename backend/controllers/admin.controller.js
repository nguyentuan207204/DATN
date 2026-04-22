import * as adminService from "../services/admin.service.js";

export const getStats = async (req, res) => {
  try {
    const data = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Error in getStats controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
