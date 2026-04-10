import pool from "../config/db.js";

export const getAllServices = async () => {
    const [rows] = await pool.query("SELECT * FROM Service ORDER BY categoryId, name");
    return rows;
};

export const getServiceCategories = async () => {
    const [rows] = await pool.query("SELECT * FROM ServiceCategory ORDER BY name");
    return rows;
};
