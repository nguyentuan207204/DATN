import { createAppointment, getAdminAppointments, updateAppointmentStatus } from "../services/appointment.service.js";
import { findUserById } from "../services/user.service.js";
import { sendAppointmentConfirmationEmail } from "../services/email.service.js";
import pool from "../config/db.js";

// Helper để lấy patientId từ userId
const getPatientId = async (userId) => {
    const user = await findUserById(userId);
    if (!user || !user.patientId) {
        const error = new Error("Tài khoản của bạn không liên kết với hồ sơ Bệnh nhân. Vui lòng đăng nhập bằng tài khoản Bệnh nhân để thực hiện đặt lịch khám.");
        error.status = 400;
        throw error;
    }
    return user.patientId;
};

export const listAllAppointments = async (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const result = await getAdminAppointments({ 
            page: page ? Number(page) : 1, 
            pageSize: pageSize ? Number(pageSize) : 10 
        });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await updateAppointmentStatus(id, status);
        res.json({ success: true, message: "Cập nhật trạng thái thành công" });
    } catch (error) {
        next(error);
    }
};

export const registerAppointment = async (req, res, next) => {
    try {
        const { serviceId, doctorId, date, ...otherDetails } = req.body;
        
        // Lấy ID bệnh nhân từ token (đã qua middleware authenticate)
        const patientId = await getPatientId(req.user.id);

        // Trích xuất ảnh (nếu có)
        let imageUrlsStr = null;
        if (req.files && req.files.length > 0) {
            const paths = req.files.map(file => `/uploads/appointments/${file.filename}`);
            imageUrlsStr = JSON.stringify(paths);
        }

        // Validate input
        if (!serviceId || !doctorId || !date) {
            return res.status(400).json({
                message: "Vui lòng cung cấp đầy đủ thông tin: dịch vụ, bác sĩ, giờ khám."
            });
        }

        // Call service to create appointment
        const result = await createAppointment({
            patientId,
            serviceId,
            doctorId,
            date,
            imageUrls: imageUrlsStr,
            ...otherDetails
        });

        // Gửi email xác nhận (bất đồng bộ — không block response)
        setImmediate(async () => {
            try {
                // Lấy thông tin đầy đủ để gửi email
                const user = await findUserById(req.user.id);
                const [[doctor]] = await pool.query(
                    "SELECT fullName FROM Staff WHERE id = ?", [doctorId]
                );
                const [[service]] = await pool.query(
                    "SELECT name FROM Service WHERE id = ?", [serviceId]
                );

                if (user?.email) {
                    await sendAppointmentConfirmationEmail(user.email, {
                        patientName: user.fullName || user.username,
                        doctorName: doctor?.fullName || "Bác sĩ",
                        serviceName: service?.name || "Khám tổng quát",
                        date,
                        notes: otherDetails.notes || null,
                    });
                }
            } catch (emailErr) {
                console.error("[Appointment] Gửi email xác nhận thất bại:", emailErr.message);
            }
        });

        res.status(201).json({
            success: true,
            message: "Dăng ký khám thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
