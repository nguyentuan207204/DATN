import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import pharmacyRoutes from "./routers/pharmacy.routes.js";
import appointmentRoute from "./routers/appointment.route.js";
import emrRoute from "./routers/emr.routes.js";
import outpatientRoutes from "./routers/outpatient.routes.js";
import inpatientRoutes from "./routers/inpatient.routes.js";
import surgeryRoutes from "./routers/surgery.routes.js";
import patientRoutes from "./routers/patient.routes.js";
import billingRoutes from "./routers/billing.routes.js";
import staffRoutes from "./routers/staff.routes.js";
import departmentRoutes from "./routers/department.routes.js";
import roleRoutes from "./routers/role.routes.js";
import userRoutes from "./routers/user.routes.js";
import performanceRoutes from "./routers/performance.routes.js";
import prescriptionRoutes from "./routers/prescription.routes.js";
import authRoutes from "./routers/auth.routes.js";
import medicalServiceRoutes from "./routers/medicalService.routes.js";

// ==============================
// TẢI ENV
// ==============================
dotenv.config();

// ==============================
// KHỞI TẠO APP
// ==============================
const app = express();

// ==============================
// MIDDLEWARE TOÀN CỤC
// ==============================

// Bật CORS
app.use(cors());

// Phân tích JSON body
app.use(express.json());

// Bộ ghi nhật ký yêu cầu đơn giản
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==============================
// ĐỊNH TUYẾN
// ==============================

app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/appointments", appointmentRoute);
app.use("/api/emr", emrRoute);
app.use("/api/outpatient", outpatientRoutes);
app.use("/api/inpatient", inpatientRoutes);
app.use("/api/surgeries", surgeryRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medical-services", medicalServiceRoutes);

// ==============================
// XỬ LÝ 404
// ==============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API not found",
  });
});

// ==============================
// XỬ LÝ LỖI TOÀN CỤC
// ==============================

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
