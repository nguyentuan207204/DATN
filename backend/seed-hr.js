import pool from './config/db.js';
import bcrypt from 'bcryptjs';

const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const middleNames = ['Văn', 'Thị', 'Thanh', 'Minh', 'Hồng', 'Ngọc', 'Xuân', 'Thu', 'Đức', 'Hải', 'Tuấn', 'Hữu', 'Công', 'Khánh'];
const lastNames = ['An', 'Anh', 'Bảo', 'Bình', 'Châu', 'Chung', 'Cường', 'Dũng', 'Đạt', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Huy', 'Hưng', 'Khang', 'Khoa', 'Kiên', 'Lâm', 'Linh', 'Long', 'Ly', 'Mai', 'Nam', 'Nga', 'Nhi', 'Phong', 'Phương', 'Quang', 'Quyên', 'Tâm', 'Thảo', 'Thi', 'Trang', 'Trí', 'Tú', 'Tuấn', 'Tùng', 'Uyên', 'Vân', 'Việt', 'Vy', 'Yến'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(prefix) {
  return `${prefix} ${randomItem(firstNames)} ${randomItem(middleNames)} ${randomItem(lastNames)}`;
}

async function seedHR() {
  console.log('Bắt đầu làm mới dữ liệu Tổ chức nhân sự...');

  try {
    // 1. Tắt khóa ngoại để xóa an toàn các Staff không bị ràng buộc quá khứ
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Xóa các User (Bác sĩ, Y tá) cũ không phải là admin và không phải là bệnh nhân
    // roleId = 2 (BACSI), roleId = 3 (YTA)
    console.log('Đang dọn dẹp dữ liệu nhân viên cũ (trừ những người đang có lịch hẹn)...');
    
    // Giữ lại Staff ID 1 (BS. Admin - đang dính tới các lịch hẹn đã tạo)
    await pool.query(`DELETE FROM Staff WHERE id != 1`);
    await pool.query(`DELETE FROM User WHERE roleId IN (2, 3) AND id NOT IN (SELECT userId FROM Staff WHERE id = 1 AND userId IS NOT NULL)`);
    
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Đã dọn dẹp dữ liệu HR cũ an toàn.');

    // 2. Thêm các Khoa phòng mới nếu chưa có
    const depts = [
      'Khoa Nội', 'Khoa Ngoại', 'Khoa Nhi', 'Khoa Sản', 
      'Khoa Tai Mũi Họng', 'Khoa Mắt', 'Khoa Răng Hàm Mặt', 
      'Khoa Da Liễu', 'Khoa Thần Kinh', 'Khoa Tim Mạch', 'Khoa Tiêu Hóa', 'Khoa Xương Khớp',
      'Phòng Điều Dưỡng'
    ];
    
    for (const d of depts) {
      await pool.query(`INSERT IGNORE INTO Department (name) VALUES (?)`, [d]);
    }
    const [departments] = await pool.query('SELECT id, name FROM Department');
    console.log('✅ Đã cập nhật 13 Khoa/Phòng ban');

    // 3. Thêm 30 Nhân viên mới (20 Bác sĩ, 10 Y tá/Điều dưỡng)
    console.log('Đang tạo 30 nhân viên y tế (Kèm tài khoản đăng nhập)...');
    
    // Băm mật khẩu chung "123456" cho tất cả để chạy nhanh
    const defaultPassword = await bcrypt.hash('123456', 10);
    
    let doctorCount = 1;
    let nurseCount = 1;

    for (let i = 0; i < 30; i++) {
      const isDoctor = i < 20;
      const roleId = isDoctor ? 2 : 3; // 2: BACSI, 3: YTA
      const prefix = isDoctor ? 'BS.' : 'Điều dưỡng';
      const fullName = generateName(prefix);
      const username = isDoctor ? `doctor_${Date.now()}_${doctorCount++}` : `nurse_${Date.now()}_${nurseCount++}`;
      
      // Chọn ngẫu nhiên khoa (Y tá thì hay ở Phòng Điều dưỡng)
      let deptId;
      if (isDoctor) {
        const docDepts = departments.filter(d => d.name !== 'Phòng Điều Dưỡng');
        deptId = randomItem(docDepts).id;
      } else {
        const nurseDept = departments.find(d => d.name === 'Phòng Điều Dưỡng');
        deptId = nurseDept ? nurseDept.id : departments[0].id;
      }

      // 3.1 Tạo User
      const [userRes] = await pool.query(
        `INSERT INTO User (username, passwordHash, roleId, createdAt) VALUES (?, ?, ?, NOW())`,
        [username, defaultPassword, roleId]
      );
      const userId = userRes.insertId;

      // 3.2 Tạo Staff
      await pool.query(
        `INSERT INTO Staff (fullName, departmentId, userId) VALUES (?, ?, ?)`,
        [fullName, deptId, userId]
      );
    }

    console.log(`✅ Đã thêm 30 nhân sự (20 Bác sĩ, 10 Y tá) cùng tài khoản truy cập.`);
    console.log('🎉 Hoàn tất sinh dữ liệu Tổ chức nhân sự!');
  } catch (error) {
    console.error('Lỗi khi seed HR:', error);
  } finally {
    process.exit(0);
  }
}

seedHR();
