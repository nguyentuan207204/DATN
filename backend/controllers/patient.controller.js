import { getPatientById, getAllPatients as getAllPatientsService } from "../services/patient.service.js";
import { getPatientTimeline } from "../services/patientHistory.service.js";
import {
  getVisitHistoryByPatient,
  getPrescriptionHistoryByPatient,
  getTreatmentSummaryByPatient,
  getFollowUpAppointmentsByPatient,
  getMedicationScheduleByPatient,
} from "../services/patientClinical.service.js";

export const getAllPatients = async (req, res) => {
  try {
    const { page, pageSize, search } = req.query;
    const result = await getAllPatientsService({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 10,
      search: search || ""
    });
    
    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total
    });
  } catch (error) {
    console.error("Error in patient.getAllPatients controller:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);
    const { from, to } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const timeline = await getPatientTimeline(patientId, from, to);

    return res.json({
      success: true,
      patient,
      timeline,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitHistory = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const visits = await getVisitHistoryByPatient(patientId);

    return res.json({
      success: true,
      patient,
      visits,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionHistory = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const prescriptions = await getPrescriptionHistoryByPatient(patientId);

    return res.json({
      success: true,
      patient,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getTreatmentSummary = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const treatments = await getTreatmentSummaryByPatient(patientId);

    return res.json({
      success: true,
      patient,
      treatments,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const followUps = await getFollowUpAppointmentsByPatient(patientId);

    return res.json({
      success: true,
      patient,
      followUps,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicationSchedule = async (req, res, next) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId không hợp lệ",
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bệnh nhân",
      });
    }

    const schedule = await getMedicationScheduleByPatient(patientId);

    return res.json({
      success: true,
      patient,
      schedule,
    });
  } catch (error) {
    next(error);
  }
};


