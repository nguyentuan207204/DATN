import * as dotenv from 'dotenv';
dotenv.config();
import pool from "../config/db.js";

async function seedData() {
  try {
    console.log('Bắt đầu giả lập dữ liệu...');

    // 1. Lấy dữ liệu cơ sở (Bệnh nhân, Nhân viên, Dịch vụ)
    const [patients] = await pool.query('SELECT id FROM Patient LIMIT 3');
    const [staffs] = await pool.query('SELECT id, fullName FROM Staff LIMIT 3');
    const [services] = await pool.query('SELECT id FROM Service LIMIT 2');

    if (patients.length === 0 || staffs.length === 0 || services.length === 0) {
      console.log('❌ Lỗi: Không đủ dữ liệu Patient, Staff hoặc Service trong DB để giả lập.');
      process.exit(1);
    }

    // 2. Tạo bảng StaffSchedule nếu chưa tồn tại
    await pool.query(`
      CREATE TABLE IF NOT EXISTS StaffSchedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staffId INT NOT NULL,
        shiftDate DATE NOT NULL,
        shiftType ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'FULL_DAY') NOT NULL,
        notes VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (staffId) REFERENCES Staff(id) ON DELETE CASCADE
      )
    `);

    // Lấy ngày hôm nay
    const today = new Date();
    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    };
    const todayStr = formatDate(today);
    
    // Khung giờ khám hôm nay
    const apptDateTime1 = `${todayStr} 08:30:00`;
    const apptDateTime2 = `${todayStr} 14:15:00`;
    const apptDateTime3 = `${todayStr} 16:45:00`;

    // 3. Chèn dữ liệu giả vào bảng Appointment (Lịch khám bệnh)
    await pool.query(`
        INSERT INTO Appointment (patientId, doctorId, serviceId, date, status, notes)
        VALUES 
        (?, ?, ?, ?, 'CONFIRMED', 'Đã xác nhận đến khám'),
        (?, ?, ?, ?, 'PENDING', 'Khám lại theo yêu cầu'),
        (?, ?, ?, ?, 'DONE', 'Hoàn thành khám bệnh')
    `, [
        patients[0].id, staffs[0].id, services[0].id, apptDateTime1,
        patients[1] ? patients[1].id : patients[0].id, staffs[1] ? staffs[1].id : staffs[0].id, services[1] ? services[1].id : services[0].id, apptDateTime2,
        patients[2] ? patients[2].id : patients[0].id, staffs[0].id, services[0].id, apptDateTime3
    ]);
    console.log('✅ Đã thêm dữ liệu Lịch hẹn (Appointment) vào ngày hôm nay.');

    // 4. Chèn dữ liệu giả vào bảng StaffSchedule (Lịch trực nhân viên)
    await pool.query(`
        INSERT INTO StaffSchedule (staffId, shiftDate, shiftType, notes)
        VALUES 
        (?, ?, 'MORNING', 'Trực phòng khám Cấp cứu'),
        (?, ?, 'AFTERNOON', 'Trực Khoa Nội'),
        (?, ?, 'FULL_DAY', 'Trực Trưởng ca')
    `, [
        staffs[0].id, todayStr,
        staffs[1] ? staffs[1].id : staffs[0].id, todayStr,
        staffs[2] ? staffs[2].id : staffs[0].id, todayStr
    ]);
    console.log('✅ Đã thêm dữ liệu Phân công trực (StaffSchedule) vào ngày hôm nay.');

    console.log('🎉 Hoàn tất quá trình giả lập!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Có lỗi xảy ra trong quá trình giả lập:', err);
    process.exit(1);
  }
}

seedData();
