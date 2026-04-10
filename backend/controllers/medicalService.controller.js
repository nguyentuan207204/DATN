import * as service from "../services/medicalService.service.js";

export const getServices = async (req, res, next) => {
    try {
        const data = await service.getAllServices();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const data = await service.getServiceCategories();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
