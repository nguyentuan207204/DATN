import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const getAdmin = async () => {
    console.log("🚀 Đang tìm tài khoản Admin trong Database...");
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("❌ Không tìm thấy DATABASE_URL trong .env");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(connectionString);
        const [rows] = await connection.query(
            "SELECT u.username, u.passwordHash, r.name as roleName FROM User u JOIN Role r ON u.roleId = r.id WHERE r.name = 'ADMIN' LIMIT 5"
        );
        console.log("✅ Danh sách tài khoản Admin:");
        console.log(rows);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi khi đọc DB:", error);
        process.exit(1);
    }
};

getAdmin();
