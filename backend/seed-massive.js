import pool from './config/db.js';

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const middleNames = ['Văn', 'Thị', 'Thanh', 'Minh', 'Hồng', 'Ngọc', 'Xuân', 'Thu', 'Đức', 'Hải', 'Tuấn', 'Hữu', 'Công', 'Khánh'];
const lastNames = ['An', 'Anh', 'Bảo', 'Bình', 'Châu', 'Chung', 'Cường', 'Dũng', 'Đạt', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Huy', 'Hưng', 'Khang', 'Khoa', 'Kiên', 'Lâm', 'Linh', 'Long', 'Ly', 'Mai', 'Nam', 'Nga', 'Nhi', 'Phong', 'Phương', 'Quang', 'Quyên', 'Tâm', 'Thảo', 'Thi', 'Trang', 'Trí', 'Tú', 'Tuấn', 'Tùng', 'Uyên', 'Vân', 'Việt', 'Vy', 'Yến'];

function generateName() {
  return `${randomItem(firstNames)} ${randomItem(middleNames)} ${randomItem(lastNames)}`;
}

async function seedMassive() {
  console.log('Bắt đầu sinh dữ liệu lớn (Massive Data)...');

  try {
    // Lấy một Doctor hợp lệ
    let [[doctor]] = await pool.query(`SELECT id FROM Staff LIMIT 1`);
    if (!doctor) {
      await pool.query(`INSERT INTO Staff (id, fullName, departmentId) VALUES (1, 'BS. Admin', 1)`);
      doctor = { id: 1 };
    }

    // 1. Thêm 50 Bệnh nhân
    console.log('Đang tạo 50 bệnh nhân...');
    const patientIds = [];
    for (let i = 0; i < 50; i++) {
      const name = generateName();
      const dob = formatDate(randomDate(new Date(1960, 0, 1), new Date(2010, 0, 1))).split(' ')[0];
      const gender = randomItem(['NAM', 'NU']);
      const phone = '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      
      const [res] = await pool.query(
        `INSERT INTO Patient (fullName, dateOfBirth, gender, phone, address) VALUES (?, ?, ?, ?, ?)`,
        [name, dob, gender, phone, 'Thành phố Bắc Ninh']
      );
      patientIds.push(res.insertId);
    }
    console.log(`✅ Đã thêm 50 bệnh nhân`);

    // 2. Thêm 150 Lịch hẹn (Từ 30 ngày trước đến 15 ngày tới)
    console.log('Đang tạo 150 lịch hẹn (Appointments)...');
    const appointmentIds = [];
    const now = new Date();
    const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const future15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 150; i++) {
      const pId = randomItem(patientIds);
      const appDateObj = randomDate(past30Days, future15Days);
      const appDate = formatDate(appDateObj);
      
      let status = 'PENDING';
      if (appDateObj < now) {
        status = Math.random() > 0.2 ? 'DONE' : 'CANCELLED';
      } else {
        status = Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING';
      }

      const [res] = await pool.query(
        `INSERT INTO Appointment (patientId, doctorId, date, status) VALUES (?, ?, ?, ?)`,
        [pId, doctor.id, appDate, status]
      );
      if (status === 'DONE') {
        appointmentIds.push({ id: res.insertId, patientId: pId, date: appDateObj });
      }
    }
    console.log(`✅ Đã thêm 150 lịch hẹn`);

    // Lấy ngẫu nhiên vài dịch vụ để tính hóa đơn
    const [services] = await pool.query(`SELECT id, price FROM Service`);
    
    // 3. Với các Lịch hẹn DONE, tạo MedicalRecord và Invoice để có dữ liệu Doanh thu
    console.log('Đang tạo Bệnh án và Hóa đơn cho các ca đã khám (DONE)...');
    for (const app of appointmentIds) {
      // Create Medical Record
      const [mr] = await pool.query(
        `INSERT INTO MedicalRecord (patientId, doctorId, visitDate) VALUES (?, ?, ?)`,
        [app.patientId, doctor.id, formatDate(app.date)]
      );
      const recordId = mr.insertId;

      // Create Invoice
      const [inv] = await pool.query(
        `INSERT INTO Invoice (patientId, recordId, status, createdAt) VALUES (?, ?, ?, ?)`,
        [app.patientId, recordId, 'PAID', formatDate(app.date)]
      );
      const invoiceId = inv.insertId;

      // Add 1-3 random services to invoice
      const numServices = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      for (let j = 0; j < numServices; j++) {
        const srv = randomItem(services);
        if (srv) {
          await pool.query(
            `INSERT INTO InvoiceItem (invoiceId, serviceId, quantity, price) VALUES (?, ?, ?, ?)`,
            [invoiceId, srv.id, 1, srv.price]
          );
          totalAmount += Number(srv.price);
        }
      }

      // Create Payment
      await pool.query(
        `INSERT INTO Payment (invoiceId, amount, method, paidAt) VALUES (?, ?, ?, ?)`,
        [invoiceId, totalAmount, 'CASH', formatDate(app.date)]
      );
    }
    console.log(`✅ Đã thêm dữ liệu Bệnh án và Hóa đơn (Doanh thu)`);

    console.log('🎉 Hoàn tất sinh dữ liệu lớn thành công!');
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
  } finally {
    process.exit(0);
  }
}

seedMassive();
