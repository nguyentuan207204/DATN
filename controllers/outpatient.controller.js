import {
  createOutpatientVisit,
  getOutpatientVisitsByPatient,
  getAllOutpatientVisits,
} from "../services/outpatient.service.js";
import { getMedicalRecordDetail } from "../services/emr.service.js";

export const createVisit = async (req, res, next) => {
  try {
    const { appointmentId, doctorId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu appointmentId",
      });
    }

    const result = await createOutpatientVisit({ appointmentId, doctorId });

    return res.status(201).json({
      success: true,
      message: "Tạo hồ sơ khám ngoại trú thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVisits = async (req, res, next) => {
  try {
    const data = await getAllOutpatientVisits();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitsByPatient = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const data = await getOutpatientVisitsByPatient(patientId);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitDetail = async (req, res, next) => {
  try {
    const recordId = Number(req.params.recordId);

    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: "recordId không hợp lệ",
      });
    }

    const result = await getMedicalRecordDetail(recordId);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

