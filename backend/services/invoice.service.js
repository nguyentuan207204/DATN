import pool from "../config/db.js";

export const createInvoice = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [invoiceResult] = await conn.query(
      `INSERT INTO Invoice (patientId, recordId, status, createdAt)
       VALUES (?, ?, 'UNPAID', NOW())`,
      [data.patientId, data.recordId]
    );

    const invoiceId = invoiceResult.insertId;

    for (const item of data.items) {
      await conn.query(
        `INSERT INTO InvoiceItem (invoiceId, serviceId, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [invoiceId, item.serviceId, item.quantity, item.price]
      );
    }

    await conn.commit();
    return { invoiceId };

  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
