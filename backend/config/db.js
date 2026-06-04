import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let dbUrl = process.env.DATABASE_URL;

// Giới hạn kết nối để tránh lỗi max_user_connections=5 trên serverless
if (dbUrl && !dbUrl.includes('connectionLimit')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connectionLimit=1&waitForConnections=true&queueLimit=0';
}

// Fix timezone: mysql2 mặc định dùng UTC, Việt Nam là UTC+7
// timezone='+07:00' đảm bảo MySQL server nhận/trả đúng giờ địa phương
// dateStrings=true: trả về chuỗi thay vì JS Date object để tránh conversion ngầm
const pool = mysql.createPool({
    uri: dbUrl,
    timezone: '+07:00',
    dateStrings: ['DATE', 'DATETIME'],
    connectionLimit: 1,
    maxIdle: 0, // Không giữ connection nhàn rỗi (tránh bị treo trên Serverless)
    idleTimeout: 1000, // Đóng connection sau 1s nếu nhàn rỗi (giải phóng cực nhanh)
    waitForConnections: true,
    queueLimit: 0,
});

export default pool;