import * as newsService from "../services/news.service.js";

export const getAll = async (req, res, next) => {
    try {
        const data = await newsService.getAllNews();
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: "ID không hợp lệ" });
        }
        const data = await newsService.getNewsById(id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tin tức" });
        }
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export const create = async (req, res, next) => {
    try {
        const result = await newsService.createNews(req.body);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
