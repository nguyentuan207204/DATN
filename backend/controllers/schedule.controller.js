import * as scheduleService from "../services/schedule.service.js";

export const getSchedules = async (req, res, next) => {
    try {
        const schedules = await scheduleService.getAllSchedules();
        res.json({ success: true, data: schedules });
    } catch (error) {
        next(error);
    }
};

export const createSchedule = async (req, res, next) => {
    try {
        const data = await scheduleService.createSchedule(req.body);
        res.status(201).json({ success: true, message: "Phân công thành công", data });
    } catch (error) {
        next(error);
    }
};

export const deleteSchedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await scheduleService.deleteSchedule(id);
        if (deleted) {
            res.json({ success: true, message: "Xóa thành công" });
        } else {
            res.status(404).json({ success: false, message: "Không tìm thấy lịch trực" });
        }
    } catch (error) {
        next(error);
    }
};
