import { createAppointment } from "../services/appointment.service.js";

export const registerAppointment = async (req, res, next) => {
    try {
        const { department, doctor, appointmentTime, ...otherDetails } = req.body;

        // Validate input
        if (!department || !doctor || !appointmentTime) {
            return res.status(400).json({
                message: "Vui lòng cung cấp đầy đủ thông tin: khoa, bác sĩ, giờ khám."
            });
        }

        // Call service to create appointment
        const result = await createAppointment({
            department,
            doctor,
            appointmentTime,
            ...otherDetails
        });

        res.status(201).json({
            message: "Đăng ký khám thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
