import * as dotenv from 'dotenv';
dotenv.config();
import pool from "../config/db.js";

async function addColumnAndUpdate() {
    try {
        console.log('Đang kiểm tra và thêm cột email cho Staff...');
        
        // Bỏ qua lỗi nếu cột đã tồn tại
        try {
            await pool.query('ALTER TABLE Staff ADD COLUMN email VARCHAR(255) NULL;');
            console.log('✅ Đã thêm cột email vào bảng Staff.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') {
                throw e;
            }
        }

        console.log('Đang tiến hành cập nhật email...');

        // 1. Cập nhật bảng Patient
        const [patientResult] = await pool.query(`
            UPDATE Patient 
            SET email = CONCAT('benhnhan', id, '@gmail.com') 
            WHERE email IS NULL OR email = ''
        `);
        console.log(`✅ Đã thêm email giả lập cho ${patientResult.affectedRows} Bệnh nhân.`);

        // 2. Cập nhật bảng Staff
        const [staffResult] = await pool.query(`
            UPDATE Staff 
            SET email = CONCAT('nhanvien', id, '@gmail.com') 
            WHERE email IS NULL OR email = ''
        `);
        console.log(`✅ Đã thêm email giả lập cho ${staffResult.affectedRows} Bác sĩ / Y tá / Nhân viên.`);

        // 3. Cập nhật bảng User (tài khoản đăng nhập)
        try {
            const [userResult] = await pool.query(`
                UPDATE User 
                SET email = CONCAT('user', id, '@gmail.com') 
                WHERE email IS NULL OR email = ''
            `);
            console.log(`✅ Đã thêm email giả lập cho ${userResult.affectedRows} Tài khoản người dùng (User).`);
        } catch (e) {
            console.log('⚠️ Bảng User không có cột email hoặc không áp dụng được.');
        }

        console.log('🎉 Hoàn tất cập nhật!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Có lỗi xảy ra:', err);
        process.exit(1);
    }
}

addColumnAndUpdate();
