import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


import pharmacyRoutes from "./routes/pharmacy.routes.js";
import appointmentRoute from "./routes/appointment.routes.js";
import emrRoute from "./routes/emr.routes.js";
import outpatientRoutes from "./routes/outpatient.routes.js";
import inpatientRoutes from "./routes/inpatient.routes.js";
import surgeryRoutes from "./routes/surgery.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import roleRoutes from "./routes/role.routes.js";
import userRoutes from "./routes/user.routes.js";
import performanceRoutes from "./routes/performance.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import authRoutes from "./routes/auth.routes.js";
import medicalServiceRoutes from "./routes/medicalService.routes.js";
import newsRoutes from "./routes/news.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import medicalRoutes from "./routes/medical.routes.js";

// ==============================
// TẢI ENV
// ==============================
dotenv.config();

// Cấu hình Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, "./docs/openapi.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));

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

// Cấu hình phục vụ file tĩnh (ảnh upload)
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Bộ ghi nhật ký yêu cầu đơn giản
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ==============================
// ĐỊNH TUYẾN
// ==============================

// Giao diện Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
app.use("/api/news", newsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/medical", medicalRoutes);

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
