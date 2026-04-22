import pool from "../config/db.js";

/* ==================================================
   1️⃣ NHẬP THUỐC
================================================== */

export const importMedicine = async (medicineId, quantity) => {
  if (!medicineId || quantity <= 0) {
    throw new Error("Dữ liệu nhập kho không hợp lệ");
  }

  await pool.query(
    `INSERT INTO StockMovement (medicineId, type, quantity)
     VALUES (?, 'IMPORT', ?)`,
    [medicineId, quantity]
  );

  return { message: "Nhập kho thành công" };
};


/* ==================================================
   2️⃣ XUẤT THUỐC (ACID + CHỐNG ÂM TỒN)
================================================== */

export const exportMedicine = async (medicineId, quantity) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Tính tồn kho hiện tại và khóa hàng
    const [rows] = await conn.query(
      `
      SELECT 
        SUM(
          CASE 
            WHEN type = 'IMPORT' THEN quantity
            WHEN type = 'EXPORT' THEN -quantity
            WHEN type = 'ADJUST' THEN quantity
          END
        ) AS stock
      FROM StockMovement
      WHERE medicineId = ?
      FOR UPDATE
      `,
      [medicineId]
    );

    const stock = rows[0].stock || 0;

    if (stock < quantity) {
      throw new Error("Không đủ tồn kho");
    }

    // Ghi xuất kho
    await conn.query(
      `INSERT INTO StockMovement (medicineId, type, quantity)
       VALUES (?, 'EXPORT', ?)`,
      [medicineId, quantity]
    );

    await conn.commit();

    return { message: "Xuất kho thành công" };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};


/* ==================================================
   3️⃣ TÍNH TỒN KHO
================================================== */

export const getStockByMedicine = async (medicineId) => {
  const [rows] = await pool.query(
    `
    SELECT 
      SUM(
        CASE 
          WHEN type = 'IMPORT' THEN quantity
          WHEN type = 'EXPORT' THEN -quantity
          WHEN type = 'ADJUST' THEN quantity
        END
      ) AS totalStock
    FROM StockMovement
    WHERE medicineId = ?
    `,
    [medicineId]
  );

  return {
    totalStock: rows[0].totalStock || 0,
  };
};


/* ==================================================
   4️⃣ LỊCH SỬ NHẬP XUẤT
================================================== */

export const getStockHistory = async (medicineId) => {
  const [rows] = await pool.query(
    `
    SELECT sm.*, m.name, m.unit
    FROM StockMovement sm
    JOIN Medicine m ON sm.medicineId = m.id
    WHERE sm.medicineId = ?
    ORDER BY sm.id DESC
    `,
    [medicineId]
  );

  return rows;
};

/**
 * Lấy toàn bộ lịch sử nhập xuất của tất cả thuốc
 */
export const getAllStockHistory = async () => {
  const [rows] = await pool.query(
    `
    SELECT sm.*, m.name, m.unit
    FROM StockMovement sm
    JOIN Medicine m ON sm.medicineId = m.id
    ORDER BY sm.id DESC
    LIMIT 200
    `
  );

  return rows;
};


/* ==================================================
   5️⃣ DANH SÁCH THUỐC
================================================== */

export const getAllMedicines = async (includeDeleted = false, page = null, pageSize = null, status = 'all') => {
  let whereClause = includeDeleted ? "WHERE m.is_deleted = 1" : "WHERE m.is_deleted = 0";
  let limitClause = "";
  let params = [];

  if (page && pageSize) {
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    limitClause = "LIMIT ? OFFSET ?";
    params = [parseInt(pageSize), parseInt(offset)];
  }

  let statusFilter = "";
  if (status === 'critical') {
    statusFilter = "WHERE stock < minStock";
  } else if (status === 'available') {
    statusFilter = "WHERE stock >= minStock";
  }

  const query = `
    SELECT * FROM (
      SELECT m.*, 
        COALESCE((
          SELECT SUM(
            CASE 
              WHEN type = 'IMPORT' THEN quantity 
              WHEN type = 'EXPORT' THEN -quantity 
              WHEN type = 'ADJUST' THEN quantity
              ELSE 0 
            END
          ) 
          FROM StockMovement 
          WHERE medicineId = m.id
        ), 0) AS stock
      FROM Medicine m 
      ${whereClause}
    ) as sub
    ${statusFilter}
    ORDER BY id DESC
    ${limitClause}
  `;

  const [rows] = await pool.query(query, params);
  
  // Lấy tổng số lượng để phân trang (cũng cần lọc theo status nếu có)
  const countQuery = `
    SELECT COUNT(*) as total FROM (
      SELECT m.id, m.minStock,
        COALESCE((SELECT SUM(CASE WHEN type = 'IMPORT' THEN quantity WHEN type = 'EXPORT' THEN -quantity WHEN type = 'ADJUST' THEN quantity ELSE 0 END) FROM StockMovement WHERE medicineId = m.id), 0) as stock
      FROM Medicine m
      ${whereClause}
    ) as sub
    ${statusFilter}
  `;
  const [countRows] = await pool.query(countQuery);
  const total = countRows[0].total;

  return { data: rows, total };
};

/**
 * Lấy số lượng thuốc đang dưới mức tồn tối thiểu
 */
export const getCriticalMedicinesCount = async () => {
  const query = `
    SELECT COUNT(*) as count FROM (
      SELECT m.id, m.minStock,
        COALESCE((
          SELECT SUM(CASE WHEN type = 'IMPORT' THEN quantity WHEN type = 'EXPORT' THEN -quantity WHEN type = 'ADJUST' THEN quantity ELSE 0 END) 
          FROM StockMovement 
          WHERE medicineId = m.id
        ), 0) as stock
      FROM Medicine m
      WHERE m.is_deleted = 0
    ) as sub
    WHERE stock < minStock
  `;
  const [rows] = await pool.query(query);
  return rows[0].count;
};

/* ==================================================
   6️⃣ THÊM THUỐC MỚI (CREATE)
================================================== */
export const createMedicine = async (data) => {
  const { official_code, name, category, unit, price, minStock, description, stock } = data;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Chèn Dược phẩm vào bảng Medicine
    const [result] = await conn.query(
      `INSERT INTO Medicine (official_code, name, category, unit, price, minStock, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [official_code || null, name, category || null, unit || 'Viên', price || 0, minStock || 20, description || '']
    );

    const medicineId = result.insertId;

    // Nếu có tồn kho khởi tạo > 0, tự động ghi nhận nhập kho
    if (stock && stock > 0) {
      await conn.query(
        `INSERT INTO StockMovement (medicineId, type, quantity) VALUES (?, 'IMPORT', ?)`,
        [medicineId, stock]
      );
    }

    await conn.commit();
    return { id: medicineId, message: "Tạo dược phẩm thành công" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

/* ==================================================
   7️⃣ CẬP NHẬT THUỐC (UPDATE)
================================================== */
export const updateMedicine = async (id, data) => {
  const { official_code, name, category, unit, price, minStock, description, stock } = data;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Cập nhật thông tin cơ bản trong bảng Medicine
    const [result] = await conn.query(
      `UPDATE Medicine 
       SET official_code = ?, name = ?, category = ?, unit = ?, price = ?, minStock = ?, description = ?
       WHERE id = ?`,
      [official_code || null, name, category || null, unit, price || 0, minStock || 20, description || '', id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy Dược phẩm để cập nhật");
    }

    // 2. Điều chỉnh tồn kho nếu số lượng (stock) có thay đổi
    if (stock !== undefined) {
      // Tính tồn kho hiện tại (cần FOR UPDATE để tránh race condition)
      const [stockRows] = await conn.query(
        `SELECT 
          SUM(
            CASE 
              WHEN type = 'IMPORT' THEN quantity
              WHEN type = 'EXPORT' THEN -quantity
              WHEN type = 'ADJUST' THEN quantity
            END
          ) AS currentStock
        FROM StockMovement
        WHERE medicineId = ?
        FOR UPDATE`,
        [id]
      );

      const currentStock = stockRows[0].currentStock || 0;
      const diff = parseInt(stock) - parseInt(currentStock);

      if (diff !== 0) {
        // Ghi nhận bản ghi điều chỉnh
        await conn.query(
          `INSERT INTO StockMovement (medicineId, type, quantity) VALUES (?, 'ADJUST', ?)`,
          [id, diff]
        );
      }
    }

    await conn.commit();
    return { message: "Cập nhật dược phẩm và tồn kho thành công" };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

/* ==================================================
   8️⃣ XÓA THUỐC (DELETE)
================================================== */
export const deleteMedicine = async (id) => {
  const [result] = await pool.query(
    `UPDATE Medicine SET is_deleted = 1 WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy Dược phẩm để xóa");
  }

  return { message: "Xóa dược phẩm thành công (Soft Delete)" };
};

/* ==================================================
   9️⃣ KHÔI PHỤC THUỐC (RESTORE)
================================================== */
export const restoreMedicine = async (id) => {
  const [result] = await pool.query(
    `UPDATE Medicine SET is_deleted = 0 WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy Dược phẩm để khôi phục");
  }

  return { message: "Khôi phục dược phẩm thành công" };
};
