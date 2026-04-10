import { getPrescriptionsByDoctor } from "../services/prescription.service.js";

export const getByDoctor = async (req, res, next) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const { from, to } = req.query;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "doctorId không hợp lệ",
      });
    }

    const data = await getPrescriptionsByDoctor({
      doctorId,
      from,
      to,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

