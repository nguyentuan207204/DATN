import pool from "../config/db.js";

async function seedSchedules() {
  try {
    console.log("=== BẮT ĐẦU SEED DỮ LIỆU CA TRỰC THỰC TẾ ===");

    // 1. Lấy toàn bộ nhân sự thực tế trong database
    const [staffs] = await pool.query("SELECT id, fullName FROM Staff");
    if (staffs.length === 0) {
      console.log("❌ Không tìm thấy nhân sự nào trong bảng Staff. Vui lòng thêm nhân sự trước!");
      process.exit(1);
    }
    console.log(`🔹 Tìm thấy ${staffs.length} nhân viên thực tế.`);

    // 2. Dọn dẹp dữ liệu lịch trực cũ trong tháng 5/2026 để tránh trùng lặp khi chạy lại script
    console.log("🔹 Đang xóa lịch trực tháng 5/2026 cũ...");
    await pool.query("DELETE FROM StaffSchedule WHERE shiftDate LIKE '2026-05-%'");

    // 3. Tạo dữ liệu lịch trực ngẫu nhiên cho tháng 5/2026
    const totalDays = 31;
    let insertCount = 0;

    for (const staff of staffs) {
      console.log(`👉 Đang lập lịch cho nhân viên: ${staff.fullName} (ID: ${staff.id})`);
      
      for (let day = 1; day <= totalDays; day++) {
        // Mỗi nhân sự trực khoảng 40% số ngày trong tháng
        if (Math.random() < 0.4) {
          const shiftType = Math.random() > 0.5 ? "AFTERNOON" : "MORNING";
          const dateStr = `2026-05-${day < 10 ? "0" + day : day}`;
          const notes = `Lịch trực hành chính ngày ${day}/05/2026`;

          await pool.query(
            "INSERT INTO StaffSchedule (staffId, shiftDate, shiftType, notes) VALUES (?, ?, ?, ?)",
            [staff.id, dateStr, shiftType, notes]
          );
          insertCount++;
        }
      }
    }

    console.log(`\n✅ THÀNH CÔNG: Đã thêm ${insertCount} ca trực thực tế vào database!`);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seed ca trực:", error);
  } finally {
    await pool.end();
    console.log("=== ĐÃ ĐÓNG KẾT NỐI DATABASE ===");
    process.exit(0);
  }
}

seedSchedules();
