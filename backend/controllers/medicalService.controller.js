import * as service from "../services/medicalService.service.js";

// ==========================================
// ĐIỀU KHIỂN DỊCH VỤ (SERVICES)
// ==========================================

/**
 * Lấy danh sách dịch vụ (có hỗ trợ phân trang)
 */
export const getServices = async (req, res, next) => {
    try {
        const { page, pageSize } = req.query;
        const result = await service.getAllServices(page, pageSize);
        res.json({ 
            success: true, 
            data: result.data, 
            total: result.total 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Thêm một dịch vụ mới
 */
export const createService = async (req, res, next) => {
    try {
        const { name, price, categoryId } = req.body;
        let { unit } = req.body;
        if (!unit) unit = 'Lần'; // Mặc định nếu không truyền

        // Validate required fields
        if (!name || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Tên và nhóm dịch vụ là bắt buộc",
            });
        }

        // Validate price > 0
        const parsedPrice = Number(price);
        if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "vui lòng nhập giá lớn hơn 0",
            });
        }

        const data = await service.createService(req.body);
        res.status(201).json({ 
            success: true, 
            message: "Thêm dịch vụ thành công", 
            data 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật dịch vụ
 */
export const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        // Validate price > 0 if provided
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (isNaN(parsedPrice) || parsedPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "vui lòng nhập giá lớn hơn 0",
                });
            }
        }

        const data = await service.updateService(id, req.body);
        res.json({ 
            success: true, 
            message: "Cập nhật dịch vụ thành công", 
            data 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa dịch vụ
 */
export const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        await service.deleteService(id);
        res.json({ 
            success: true, 
            message: "Xóa dịch vụ thành công" 
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// ĐIỀU KHIỂN NHÓM DỊCH VỤ (CATEGORIES)
// ==========================================

/**
 * Lấy danh sách nhóm dịch vụ
 */
export const getCategories = async (req, res, next) => {
    try {
        const data = await service.getServiceCategories();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Thêm nhóm dịch vụ mới
 */
export const createCategory = async (req, res, next) => {
    try {
        const data = await service.createCategory(req.body);
        res.status(201).json({ 
            success: true, 
            message: "Thêm nhóm dịch vụ thành công", 
            data 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cập nhật nhóm dịch vụ
 */
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await service.updateCategory(id, req.body);
        res.json({ 
            success: true, 
            message: "Cập nhật nhóm dịch vụ thành công", 
            data 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Xóa nhóm dịch vụ
 */
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await service.deleteCategory(id);
        res.json({ 
            success: true, 
            message: "Xóa nhóm dịch vụ thành công" 
        });
    } catch (error) {
        next(error);
    }
};
