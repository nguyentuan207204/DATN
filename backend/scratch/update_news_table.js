import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateTable = async () => {
    console.log("🚀 Đang cập nhật kiểu dữ liệu cột image của bảng News thành LONGTEXT...");
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ Không tìm thấy DATABASE_URL trong .env");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(connectionString);
        
        // Thay đổi cột image thành LONGTEXT để lưu được chuỗi Base64
        await connection.query("ALTER TABLE News MODIFY COLUMN image LONGTEXT;");
        console.log("✅ Cập nhật cột image thành LONGTEXT thành công!");
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật bảng News:", error);
        process.exit(1);
    }
};

updateTable();
