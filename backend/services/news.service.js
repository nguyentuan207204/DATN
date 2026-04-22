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
