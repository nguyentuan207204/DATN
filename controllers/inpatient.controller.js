import {
  admitPatient,
  dischargePatient,
  getActiveAdmissions,
  getAdmissionsByPatient,
} from "../services/inpatient.service.js";
import { getAllAdmissions } from "../services/inpatient.service.js";
import { getAdmissionProgress } from "../services/inpatient.service.js";

export const admit = async (req, res, next) => {
  try {
    const { patientId, bedId, admittedAt } = req.body;

    if (!patientId || !bedId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu patientId hoặc bedId",
      });
    }

    const result = await admitPatient({ patientId, bedId, admittedAt });

    return res.status(201).json({
      success: true,
      message: "Nhập viện thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const discharge = async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);
    const { dischargedAt } = req.body;

    if (!admissionId) {
      return res.status(400).json({
        success: false,
        message: "id không hợp lệ",
      });
    }

    const result = await dischargePatient({ admissionId, dischargedAt });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getActive = async (req, res, next) => {
  try {
    const data = await getActiveAdmissions();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getByPatient = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const data = await getAdmissionsByPatient(patientId);

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
    const data = await getAllAdmissions();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const admissionId = Number(req.params.id);

    if (!admissionId) {
      return res.status(400).json({
        success: false,
        message: "id không hợp lệ",
      });
    }

    const data = await getAdmissionProgress(admissionId);

    return res.json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};



