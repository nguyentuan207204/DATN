import pool from "../config/db.js";

async function migrate() {
  try {
    console.log("--- Bắt đầu Migration: Thêm Soft Delete cho bảng Medicine ---");
    
    // 1. Kiểm tra xem cột is_deleted đã tồn tại chưa
    const [columns] = await pool.query("SHOW COLUMNS FROM Medicine LIKE 'is_deleted'");
    
    if (columns.length === 0) {
      console.log("Đang thêm cột is_deleted vào bảng Medicine...");
      await pool.query("ALTER TABLE Medicine ADD COLUMN is_deleted TINYINT(1) DEFAULT 0");
      console.log("Đã thêm cột is_deleted thành công.");
    } else {
      console.log("Cột is_deleted đã tồn tại. Bỏ qua bước này.");
    }

    console.log("--- Migration hoàn tất thành công! ---");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi Migration:", error);
    process.exit(1);
  }
}

migrate();
