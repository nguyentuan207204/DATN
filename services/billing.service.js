import pool from "../config/db.js";
import { createInvoice as baseCreateInvoice } from "./invoice.service.js";

/* =====================================================
   BILLING – VIỆN PHÍ, THANH TOÁN, BÁO CÁO
===================================================== */

export const autoCreateInvoice = async ({ patientId, recordId, items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách dịch vụ rỗng");
  }

  // Lấy giá dịch vụ từ bảng Service
  const serviceIds = items.map((i) => i.serviceId);
  const [services] = await pool.query(
    `
    SELECT id, price
    FROM Service
    WHERE id IN ( ${serviceIds.map(() => "?").join(", ")} )
    `,
    serviceIds
  );

  const priceMap = new Map(services.map((s) => [s.id, s.price]));

  const invoiceItems = items.map((item) => {
    const price = priceMap.get(item.serviceId);
    if (!price) {
      throw new Error(`Không tìm thấy giá cho serviceId=${item.serviceId}`);
    }
    return {
      serviceId: item.serviceId,
      quantity: item.quantity || 1,
      price,
    };
  });

  return baseCreateInvoice({
    patientId,
    recordId,
    items: invoiceItems,
  });
};

export const getInvoiceDetail = async (invoiceId) => {
  // Header hóa đơn
  const [invoiceRows] = await pool.query(
    `
    SELECT 
      i.*,
      p.fullName AS patientName
    FROM Invoice i
    JOIN Patient p ON i.patientId = p.id
    WHERE i.id = ?
    `,
    [invoiceId]
  );

  if (invoiceRows.length === 0) {
    throw new Error("Không tìm thấy hóa đơn");
  }

  const invoice = invoiceRows[0];

  // Chi tiết dịch vụ
  const [itemRows] = await pool.query(
    `
    SELECT 
      ii.id,
      ii.serviceId,
      ii.quantity,
      ii.price,
      s.name AS serviceName
    FROM InvoiceItem ii
    JOIN Service s ON ii.serviceId = s.id
    WHERE ii.invoiceId = ?
    `,
    [invoiceId]
  );

  const totalAmount = itemRows.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Thanh toán
  const [payments] = await pool.query(
    `
    SELECT *
    FROM Payment
    WHERE invoiceId = ?
    ORDER BY paidAt ASC
    `,
    [invoiceId]
  );

  const paidAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return {
    invoice,
    items: itemRows,
    payments,
    totalAmount,
    paidAmount,
    remainingAmount: totalAmount - paidAmount,
  };
};

export const getInvoices = async ({ status, patientId, from, to }) => {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }

  if (patientId) {
    conditions.push("i.patientId = ?");
    params.push(patientId);
  }

  if (from) {
    conditions.push("i.createdAt >= ?");
    params.push(new Date(from));
  }

  if (to) {
    conditions.push("i.createdAt <= ?");
    params.push(new Date(to));
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT 
      i.*,
      p.fullName AS patientName
    FROM Invoice i
    JOIN Patient p ON i.patientId = p.id
    ${whereClause}
    ORDER BY i.createdAt DESC
    `,
    params
  );

  return rows;
};

export const addPayment = async ({ invoiceId, amount, method }) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Tính tổng tiền hóa đơn
    const [itemRows] = await conn.query(
      `
      SELECT quantity, price
      FROM InvoiceItem
      WHERE invoiceId = ?
      `,
      [invoiceId]
    );

    if (itemRows.length === 0) {
      throw new Error("Hóa đơn không có dịch vụ");
    }

    const totalAmount = itemRows.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    // Tổng tiền đã thanh toán
    const [paidRows] = await conn.query(
      `
      SELECT SUM(amount) AS paid
      FROM Payment
      WHERE invoiceId = ?
      `,
      [invoiceId]
    );

    const paidAmount = Number(paidRows[0].paid || 0);

    if (amount <= 0) {
      throw new Error("Số tiền thanh toán không hợp lệ");
    }

    if (paidAmount + amount > totalAmount) {
      throw new Error("Thanh toán vượt quá số tiền hóa đơn");
    }

    // Ghi nhận payment
    await conn.query(
      `
      INSERT INTO Payment (invoiceId, amount, method, paidAt)
      VALUES (?, ?, ?, NOW())
      `,
      [invoiceId, amount, method]
    );

    const newPaid = paidAmount + amount;
    let newStatus = "UNPAID";
    if (newPaid === totalAmount) {
      newStatus = "PAID";
    }

    await conn.query(
      `
      UPDATE Invoice
      SET status = ?
      WHERE id = ?
      `,
      [newStatus, invoiceId]
    );

    await conn.commit();

    return {
      totalAmount,
      paidAmount: newPaid,
      remainingAmount: totalAmount - newPaid,
      status: newStatus,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const calculateInsurance = async ({ invoiceId, coveragePercent }) => {
  if (coveragePercent < 0 || coveragePercent > 100) {
    throw new Error("Tỷ lệ BHYT không hợp lệ");
  }

  const detail = await getInvoiceDetail(invoiceId);
  const { totalAmount } = detail;

  const insuranceAmount = (totalAmount * coveragePercent) / 100;
  const patientAmount = totalAmount - insuranceAmount;

  return {
    totalAmount,
    insuranceAmount,
    patientAmount,
  };
};

export const applyInsurancePayment = async ({
  invoiceId,
  coveragePercent,
  insuranceMethod = "BANKING",
  patientMethod = "CASH",
}) => {
  const { totalAmount, insuranceAmount, patientAmount } =
    await calculateInsurance({ invoiceId, coveragePercent });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    if (insuranceAmount > 0) {
      await conn.query(
        `
        INSERT INTO Payment (invoiceId, amount, method, paidAt)
        VALUES (?, ?, ?, NOW())
        `,
        [invoiceId, insuranceAmount, insuranceMethod]
      );
    }

    if (patientAmount > 0) {
      await conn.query(
        `
        INSERT INTO Payment (invoiceId, amount, method, paidAt)
        VALUES (?, ?, ?, NOW())
        `,
        [invoiceId, patientAmount, patientMethod]
      );
    }

    // Sau khi thêm payment, cập nhật trạng thái
    await conn.query(
      `
      UPDATE Invoice
      SET status = 'PAID'
      WHERE id = ?
      `,
      [invoiceId]
    );

    await conn.commit();

    return {
      totalAmount,
      insuranceAmount,
      patientAmount,
      status: "PAID",
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const getRevenueReport = async ({ from, to }) => {
  const conditions = [];
  const params = [];

  if (from) {
    conditions.push("paidAt >= ?");
    params.push(new Date(from));
  }

  if (to) {
    conditions.push("paidAt <= ?");
    params.push(new Date(to));
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT 
      DATE(paidAt) AS date,
      method,
      SUM(amount) AS total
    FROM Payment
    ${whereClause}
    GROUP BY DATE(paidAt), method
    ORDER BY DATE(paidAt) ASC
    `,
    params
  );

  return rows;
};

