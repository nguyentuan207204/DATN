import * as appointmentService from "../services/appointment.service.js";
import * as emrService from "../services/emr.service.js";
import { findUserById } from "../services/user.service.js";
import pool from "../config/db.js";

/**
 * Lấy patientId từ userId hiện tại
 */
const getPatientId = async (userId) => {
    const user = await findUserById(userId);
    if (!user || !user.patientId) {
        throw new Error("Không tìm thấy thông tin bệnh nhân liên kết với tài khoản này");
    }
    return user.patientId;
};

// 1. Lấy danh sách lịch hẹn của tôi
export const getMyAppointments = async (req, res, next) => {
    try {
        const patientId = await getPatientId(req.user.id);
        const appointments = await appointmentService.getAppointmentsByPatient(patientId);
        res.json({ success: true, data: appointments });
    } catch (error) {
        next(error);
    }
};

// 2. Đăng ký lịch hẹn (Client)
export const registerAppointment = async (req, res, next) => {
    try {
        const patientId = await getPatientId(req.user.id); // Lấy ID bệnh nhân từ tài khoản đang đăng nhập
        const result = await appointmentService.createAppointment({
            ...req.body,
            patientId
        });
        res.status(201).json({ success: true, message: "Đăng ký thành công", data: result });
    } catch (error) {
        next(error);
    }
};

// 3. Hủy lịch hẹn
export const cancelAppointment = async (req, res, next) => {
    try {
        const patientId = await getPatientId(req.user.id);
        const { id } = req.params;
        await appointmentService.cancelAppointment(id, patientId);
        res.json({ success: true, message: "Hủy lịch hẹn thành công" });
    } catch (error) {
        next(error);
    }
};

// 4. Lấy lịch sử khám bệnh của tôi
export const getMyHistory = async (req, res, next) => {
    try {
        const patientId = await getPatientId(req.user.id);
        const history = await emrService.getHistoryByPatient(patientId);
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

// 5. Lấy chi tiết hồ sơ bệnh án
export const getRecordDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await emrService.getMedicalRecordDetail(id);
        res.json({ success: true, ...result });
    } catch (error) {
        if (error.message === "Không tìm thấy hồ sơ bệnh án") {
            const notFoundError = new Error(error.message);
            notFoundError.status = 404;
            return next(notFoundError);
        }
        next(error);
    }
};

// 6. Thanh toán hóa đơn
export const payInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { method } = req.body;

        // Cập nhật trạng thái hóa đơn thành PAID
        const [result] = await pool.query(
            "UPDATE Invoice SET status = 'PAID', updatedAt = NOW() WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
        }

        res.json({ success: true, message: "Thanh toán thành công" });
    } catch (error) {
        next(error);
    }
};
