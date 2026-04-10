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
    SELECT sm.*, m.name
    FROM StockMovement sm
    JOIN Medicine m ON sm.medicineId = m.id
    WHERE sm.medicineId = ?
    ORDER BY sm.id DESC
    `,
    [medicineId]
  );

  return rows;
};


/* ==================================================
   5️⃣ DANH SÁCH THUỐC
================================================== */

export const getAllMedicines = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM Medicine ORDER BY id DESC`
  );

  return rows;
};
