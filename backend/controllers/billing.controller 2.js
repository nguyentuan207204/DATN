import {
  autoCreateInvoice,
  getInvoiceDetail,
  getInvoices,
  addPayment,
  calculateInsurance,
  applyInsurancePayment,
  getRevenueReport,
  getAdminStats,
} from "../services/billing.service.js";

export const createInvoiceAuto = async (req, res, next) => {
  try {
    const { patientId, recordId, items } = req.body;

    if (!patientId || !recordId || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu patientId, recordId hoặc items",
      });
    }

    const result = await autoCreateInvoice({ patientId, recordId, items });

    return res.status(201).json({
      success: true,
      message: "Tạo hóa đơn viện phí thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoice = async (req, res, next) => {
  try {
    const invoiceId = Number(req.params.id);

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "invoiceId không hợp lệ",
      });
    }

    const detail = await getInvoiceDetail(invoiceId);

    return res.json({
      success: true,
      ...detail,
    });
  } catch (error) {
    next(error);
  }
};

export const listInvoices = async (req, res, next) => {
  try {
    const { status, patientId, from, to, page, pageSize } = req.query;

    const { data, total } = await getInvoices({
      status,
      patientId: patientId ? Number(patientId) : undefined,
      from,
      to,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
    });

    return res.json({
      success: true,
      data,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getBillingAdminStats = async (req, res, next) => {
    try {
        const data = await getAdminStats();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const payInvoice = async (req, res, next) => {
  try {
    const invoiceId = Number(req.params.id);
    const { amount, method } = req.body;

    if (!invoiceId || !amount || !method) {
      return res.status(400).json({
        success: false,
        message: "Thiếu invoiceId, amount hoặc method",
      });
    }

    const result = await addPayment({ invoiceId, amount, method });

    return res.json({
      success: true,
      message: "Thanh toán hóa đơn thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const previewInsurance = async (req, res, next) => {
  try {
    const invoiceId = Number(req.params.id);
    const { coveragePercent } = req.body;

    if (!invoiceId || coveragePercent === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu invoiceId hoặc coveragePercent",
      });
    }

    const result = await calculateInsurance({ invoiceId, coveragePercent });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const payByInsurance = async (req, res, next) => {
  try {
    const invoiceId = Number(req.params.id);
    const {
      coveragePercent,
      insuranceMethod,
      patientMethod,
    } = req.body;

    if (!invoiceId || coveragePercent === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu invoiceId hoặc coveragePercent",
      });
    }

    const result = await applyInsurancePayment({
      invoiceId,
      coveragePercent,
      insuranceMethod,
      patientMethod,
    });

    return res.json({
      success: true,
      message: "Thanh toán BHYT + đồng chi trả thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const revenueReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const data = await getRevenueReport({ from, to });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

