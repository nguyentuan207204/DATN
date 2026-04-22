import pool from "../config/db.js";

/**
 * Lấy danh sách dịch vụ y tế (có phân trang)
 */
export const getAllServices = async (page = null, pageSize = null) => {
    if (page && pageSize) {
        const offset = (parseInt(page) - 1) * parseInt(pageSize);
        const [rows] = await pool.query(
            "SELECT * FROM Service ORDER BY categoryId, name LIMIT ? OFFSET ?",
            [parseInt(pageSize), parseInt(offset)]
        );
        const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM Service");
        return { data: rows, total };
    }
    
    const [rows] = await pool.query("SELECT * FROM Service ORDER BY categoryId, name");
    return { data: rows, total: rows.length };
};

/**
 * Thêm một dịch vụ mới
 */
export const createService = async (serviceData) => {
    const { name, unit, price, categoryId, departmentId } = serviceData;
    const [result] = await pool.query(
        "INSERT INTO Service (name, unit, price, categoryId, departmentId) VALUES (?, ?, ?, ?, ?)",
        [name, unit, Number(price), categoryId, departmentId || null]
    );
    return { id: result.insertId, ...serviceData };
};

/**
 * Cập nhật thông tin dịch vụ
 */
export const updateService = async (id, serviceData) => {
    const { name, unit, price, categoryId, departmentId } = serviceData;
    await pool.query(
        "UPDATE Service SET name = ?, unit = ?, price = ?, categoryId = ?, departmentId = ? WHERE id = ?",
        [name, unit, Number(price), categoryId, departmentId || null, id]
    );
    return { id, ...serviceData };
};

/**
 * Xóa một dịch vụ
 */
export const deleteService = async (id) => {
    await pool.query("DELETE FROM Service WHERE id = ?", [id]);
    return { id };
};

// ==========================================
// CÁC HÀM CHO NHÓM DỊCH VỤ (CATEGORIES)
// ==========================================

/**
 * Lấy danh sách nhóm dịch vụ
 */
export const getServiceCategories = async () => {
    const [rows] = await pool.query("SELECT * FROM ServiceCategory ORDER BY name");
    return rows;
};

/**
 * Thêm nhóm dịch vụ mới
 */
export const createCategory = async (catData) => {
    const { name, description } = catData;
    const [result] = await pool.query(
        "INSERT INTO ServiceCategory (name, description) VALUES (?, ?)",
        [name, description || null]
    );
    return { id: result.insertId, ...catData };
};

/**
 * Cập nhật nhóm dịch vụ
 */
export const updateCategory = async (id, catData) => {
    const { name, description } = catData;
    await pool.query(
        "UPDATE ServiceCategory SET name = ?, description = ? WHERE id = ?",
        [name, description || null, id]
    );
    return { id, ...catData };
};

/**
 * Xóa nhóm dịch vụ (có kiểm tra ràng buộc)
 */
export const deleteCategory = async (id) => {
    // Kiểm tra xem có dịch vụ nào thuộc nhóm này không
    const [services] = await pool.query("SELECT id FROM Service WHERE categoryId = ? LIMIT 1", [id]);
    if (services.length > 0) {
        throw new Error("Không thể xóa nhóm dịch vụ vì vẫn còn các dịch vụ thuộc nhóm này.");
    }
    
    await pool.query("DELETE FROM ServiceCategory WHERE id = ?", [id]);
    return { id };
};
