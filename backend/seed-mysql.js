import pool from './config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Bắt đầu thêm dữ liệu mẫu vào MySQL...');

  try {
    // 1. Thêm Roles
    await pool.query(`INSERT IGNORE INTO Role (id, name) VALUES (1, 'ADMIN'), (2, 'BACSI'), (3, 'YTA'), (4, 'BENHNHAN')`);
    console.log('✅ Đã thêm Roles');

    // 2. Thêm Departments (Khoa phòng)
    await pool.query(`INSERT IGNORE INTO Department (id, name) VALUES 
      (1, 'Khoa Nội'), (2, 'Khoa Ngoại'), (3, 'Khoa Nhi'), (4, 'Khoa Tai Mũi Họng')`);
    console.log('✅ Đã thêm Khoa phòng');

    // 3. Thêm Nhóm dịch vụ
    await pool.query(`INSERT IGNORE INTO ServiceCategory (id, name) VALUES 
      (1, 'Khám Bệnh'), (2, 'Xét Nghiệm'), (3, 'Chẩn Đoán Hình Ảnh')`);
    console.log('✅ Đã thêm Nhóm dịch vụ');

    // 4. Thêm Dịch vụ
    // Dùng INSERT IGNORE để tránh lỗi trùng lặp nếu chạy nhiều lần
    const services = [
      "INSERT IGNORE INTO Service (id, name, price, categoryId) VALUES (1, 'Khám nội tổng quát', 150000, 1)",
      "INSERT IGNORE INTO Service (id, name, price, categoryId) VALUES (2, 'Khám chuyên khoa', 200000, 1)",
      "INSERT IGNORE INTO Service (id, name, price, categoryId) VALUES (3, 'Xét nghiệm máu cơ bản', 120000, 2)",
      "INSERT IGNORE INTO Service (id, name, price, categoryId) VALUES (4, 'Siêu âm ổ bụng', 180000, 3)"
    ];
    for (const sql of services) {
      await pool.query(sql);
    }
    console.log('✅ Đã thêm Dịch vụ y tế');

    // 5. Thêm Bệnh nhân mẫu
    await pool.query(`INSERT IGNORE INTO Patient (id, fullName, dateOfBirth, gender, phone, address) VALUES 
      (1001, 'Nguyễn Văn Nam', '1990-01-15', 'NAM', '0912345678', 'Bắc Ninh'),
      (1002, 'Trần Thị Mỹ', '1995-05-20', 'NU', '0987654321', 'Bắc Giang'),
      (1003, 'Lê Văn Luyện', '1985-12-10', 'NAM', '0901234567', 'Hà Nội')`);
    console.log('✅ Đã thêm Bệnh nhân mẫu');

    // 6. Thêm Lịch hẹn mẫu
    await pool.query(`INSERT IGNORE INTO Appointment (id, patientId, doctorId, date, status) VALUES 
      (1, 1001, 1, '2026-06-01 08:30:00', 'PENDING'),
      (2, 1002, 1, '2026-06-02 09:00:00', 'CONFIRMED'),
      (3, 1003, 1, '2026-05-30 10:00:00', 'DONE')`);
    console.log('✅ Đã thêm Lịch hẹn mẫu');

    console.log('🎉 Seed dữ liệu thành công!');
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

seed();
