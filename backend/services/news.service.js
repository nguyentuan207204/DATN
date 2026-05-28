import pool from "../config/db.js";

export const getAllNews = async () => {
    const [rows] = await pool.query("SELECT * FROM News ORDER BY createdAt DESC");
    return rows;
};

export const getNewsById = async (id) => {
    const [rows] = await pool.query("SELECT * FROM News WHERE id = ?", [id]);
    return rows[0];
};

export const createNews = async (data) => {
    const [result] = await pool.query(
        "INSERT INTO News (title, summary, content, image, category, author, date, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [data.title, data.summary, data.content, data.image, data.category, data.author, data.date, data.featured || 0]
    );
    return { id: result.insertId };
};

export const updateNews = async (id, data) => {
    await pool.query(
        "UPDATE News SET title = ?, summary = ?, content = ?, image = ?, category = ?, author = ?, date = ?, featured = ? WHERE id = ?",
        [data.title, data.summary, data.content, data.image, data.category, data.author, data.date, data.featured || 0, id]
    );
    return { id };
};

export const deleteNews = async (id) => {
    await pool.query("DELETE FROM News WHERE id = ?", [id]);
    return { id };
};

