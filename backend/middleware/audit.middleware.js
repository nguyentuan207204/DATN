import pool from "../config/db.js";

/**
 * Middleware ghi nhật ký hoạt động (Audit Log)
 * Tự động ghi lại các hành động thay đổi dữ liệu nhạy cảm
 */
export const auditLog = (action, tableName) => {
    return async (req, res, next) => {
        // Lưu lại thông tin gốc của res.json để bắt được recordId nếu cần
        const originalJson = res.json;
        
        res.json = function (data) {
            // Sau khi response thành công, ta mới ghi log
            if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
                const userId = req.user ? req.user.id : null;
                const recordId = data.data?.id || data.data?.recordId || req.params.id;
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                const userAgent = req.headers['user-agent'];

                // Ghi log vào database (không dùng await để tránh làm chậm response)
                pool.query(
                    `INSERT INTO AuditLog (userId, action, tableName, recordId, newValue, ipAddress, userAgent)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId, 
                        action, 
                        tableName, 
                        recordId || 0, 
                        JSON.stringify(req.body), 
                        ipAddress, 
                        userAgent
                    ]
                ).catch(err => console.error('Audit Log Error:', err));
            }
            
            return originalJson.call(this, data);
        };

        next();
    };
};
