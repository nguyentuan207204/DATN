# Tài liệu Kỹ thuật: Giải thích Toàn bộ Logic Backend (DATN)

Tài liệu này cung cấp cái nhìn chi tiết và toàn diện về kiến trúc hệ thống, cấu trúc cơ sở dữ liệu, các luồng nghiệp vụ cốt lõi, cùng các cơ chế xử lý logic bên dưới của hệ thống Backend trong dự án Quản lý Phòng khám Đa khoa.

---

## 🧭 1. Kiến trúc Hệ thống Tổng quan (System Architecture)

Backend được phát triển bằng **Node.js + Express.js**, tuân thủ mô hình phân lớp rõ ràng nhằm tách biệt trách nhiệm (Separation of Concerns):

```
Client (Web/App)
       │ (HTTP Request)
       ▼
Routes (Định tuyến & Phân loại API)
       │
       ▼
Middlewares (Xác thực JWT, Kiểm tra Quyền role, Khử trùng dữ liệu)
       │
       ▼
Controllers (Nhận request body/params, validate sơ bộ, định dạng Response)
       │
       ▼
Services (Logic nghiệp vụ chính, tính toán dữ liệu, quản lý Database Transaction)
       │
       ▼
Config / DB (Kết nối MySQL Pool, cấu hình timezone +07:00, connectionLimit)
       │
       ▼
Database (Clever Cloud MySQL / Production DB)
```

### 🔌 Cơ chế Quản lý Kết nối Database (Connection Pool)
* Để đáp ứng hạ tầng serverless của Vercel và giới hạn ngặt nghèo **tối đa 5 kết nối đồng thời** của cơ sở dữ liệu MySQL miễn phí trên Clever Cloud, file cấu hình kết nối [db.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/config/db.js) áp dụng các ràng buộc:
  * `connectionLimit: 1`: Giới hạn mỗi instance Node.js chỉ được giữ tối đa 1 kết nối duy nhất đến database.
  * `maxIdle: 0`: Đóng ngay lập tức các kết nối nhàn rỗi (idle connection), không lưu lại trong pool để nhường tài nguyên cho các container serverless khác.
  * `idleTimeout: 1000`: Tự động giải phóng kết nối sau 1 giây nhàn rỗi để tối ưu hóa việc tái sử dụng.
  * `timezone: '+07:00'`: Đảm bảo thời gian nhận/trả khớp với múi giờ Việt Nam.

---

## 🗄️ 2. Cấu trúc Cơ sở Dữ liệu & Mối quan hệ (Database Schema)

Cơ sở dữ liệu được thiết kế theo chuẩn **3NF (Third Normal Form)**, tránh dư thừa dữ liệu và đảm bảo tính toàn vẹn thông qua các khóa ngoại (Foreign Keys). 

Dưới đây là sơ đồ mối quan hệ thực thể (ERD) dạng text thể hiện sự liên kết giữa các bảng chính:

```
┌──────────────┐      1:1      ┌──────────────┐
│     User     ├──────────────>│    Patient   │ (Bệnh nhân)
│ (Tài khoản)  │               └──────┬───────┘
└──────┬───────┘                      │ 1
       │ 1:1                          │
       ▼                              ▼ 1:N
┌──────────────┐               ┌──────────────┐
│    Staff     │               │  Appointment │ (Lịch hẹn khám)
│ (Bác sĩ/Ytá) │               └──────────────┘
└──────┬───────┘
       │ 1
       ▼ 1:N
┌──────────────┐ 1:1           ┌──────────────┐
│MedicalRecord├──────────────>│   Invoice    │ (Hóa đơn viện phí)
│ (Bệnh án)    │               └──────┬───────┘
└──────┬───────┘                      │ 1
       │ 1                            ▼ 1:N
       ▼ 1:N                   ┌──────────────┐
┌──────────────┐               │  InvoiceItem │ (Chi tiết viện phí)
│  Diagnosis   │               └──────┬───────┘
└──────┬───────┘                      │ N:1
       │ N:1                          ▼
┌──────────────┐               ┌──────────────┐
│    ICD10     │               │   Service    │ (Dịch vụ khám/xét nghiệm)
│ (Mã bệnh)    │               └──────────────┘
└──────────────┘
```

---

## ⚙️ 3. Chi tiết Các Luồng Nghiệp vụ Cốt lõi (Core Business Flows)

### 🔑 3.1. Luồng Xác thực & Phân quyền (Authentication & Authorization)
* **Tài liệu/File liên quan**: [auth.routes.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/routes/auth.routes.js), [auth.middleware.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/middleware/auth.middleware.js), [user.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/user.service.js)
* **Logic Hoạt động**:
  1. **Đăng ký tài khoản (Register)**:
     * Nhận thông tin từ client $\rightarrow$ Mã hóa mật khẩu bằng `bcryptjs` tạo `passwordHash`.
     * Tạo tài khoản `User` với `roleId` mặc định là `PATIENT` (Bệnh nhân).
     * **Đồng bộ tự động**: Ngay sau khi tạo `User` thành công, hệ thống tự động chèn một bản ghi tương ứng vào bảng `Patient` với `userId` được liên kết. Điều này giúp bệnh nhân đăng ký xong sẽ có ngay hồ sơ bệnh án cá nhân rỗng.
  2. **Đăng nhập (Login)**:
     * Kiểm tra sự tồn tại của `username`. So khớp hash mật khẩu.
     * Tạo cặp token: **Access Token** (JWT ngắn hạn chứa `userId` và `roleName`) và **Refresh Token** (JWT dài hạn hơn).
     * Trả về token cho client. Client lưu Access Token trong bộ nhớ tạm và Refresh Token ở LocalStorage/Cookie để duy trì phiên đăng nhập.
  3. **Middleware bảo mật**:
     * `authenticate`: Giải mã Access Token từ header `Authorization: Bearer <token>`. Nếu hợp lệ, gán thông tin user vào `req.user` để các controller phía sau sử dụng.
     * `authorize(roles)`: Kiểm tra `req.user.role` xem có nằm trong danh sách các role được phép truy cập endpoint đó hay không (Ví dụ: Chỉ `DOCTOR` mới được tạo bệnh án, chỉ `ADMIN` mới được quản lý nhân sự).

---

### 📅 3.2. Luồng Lên lịch khám (Appointment Flow)
* **Tài liệu/File liên quan**: [appointment.routes.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/routes/appointment.routes.js), [appointment.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/appointment.service.js)
* **Logic Hoạt động**:
  1. **Đăng ký lịch hẹn**:
     * Bệnh nhân lựa chọn ngày khám, bác sĩ phụ trách và dịch vụ khám (Ví dụ: Khám tổng quát, Khám nội khoa...).
     * Hệ thống lưu lịch hẹn vào bảng `Appointment` với trạng thái ban đầu là `PENDING` (Chờ xử lý).
     * Backend gửi email xác nhận đặt lịch thành công qua dịch vụ Resend (`sendAppointmentConfirmationEmail`).
  2. **Quản lý trạng thái**:
     * Lịch hẹn đi qua các trạng thái: `PENDING` (Chờ duyệt) $\rightarrow$ `CONFIRMED` (Đã xác nhận) $\rightarrow$ `DONE` (Đã khám xong) hoặc `CANCELLED` (Đã hủy).
     * Bệnh nhân được phép tự hủy lịch hẹn nếu lịch đang ở trạng thái `PENDING` hoặc `CONFIRMED`. Nếu lịch đã hoàn tất (`DONE`), không được phép thay đổi.

---

### 🩺 3.3. Luồng Khám bệnh & Hồ sơ Bệnh án điện tử (EMR Flow)
* **Tài liệu/File liên quan**: [emr.routes.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/routes/emr.routes.js), [emr.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/emr.service.js)
* **Logic Hoạt động**:
  1. **Tạo Bệnh án (MedicalRecord)**:
     * Bác sĩ tiến hành đo các chỉ số sinh tồn của bệnh nhân (Huyết áp `bloodPressure`, nhịp tim `heartRate`, nhiệt độ `temperature`, cân nặng `weight`, chiều cao `height`, nhịp thở `respiratoryRate`) và ghi kết luận lời dặn (`advice`).
     * Khi bác sĩ bấm lưu kết luận, hệ thống thực thi transaction:
       * **Bước 1**: Chèn thông tin vào bảng `MedicalRecord` lấy ra `recordId` vừa tạo.
       * **Bước 2 (Hoàn tất lịch khám tự động)**: Hệ thống tìm kiếm cuộc hẹn `Appointment` gần nhất trong ngày hôm nay của bệnh nhân này mà chưa hoàn thành. Cập nhật trạng thái cuộc hẹn đó sang `DONE`.
       * **Bước 3 (Tự động tạo hóa đơn nháp)**: Lấy `serviceId` của cuộc hẹn $\rightarrow$ truy vấn bảng `Service` để lấy đơn giá thực tế $\rightarrow$ tự động tạo một hóa đơn `Invoice` với trạng thái `UNPAID` liên kết với bệnh án vừa tạo, đồng thời tạo chi tiết hóa đơn `InvoiceItem` với đơn giá dịch vụ đó.
  2. **Thêm Chẩn đoán ICD-10 (Diagnosis)**:
     * Bác sĩ chọn mã bệnh chuẩn theo phân loại ICD-10 của Bộ Y Tế.
     * Hệ thống lưu bản ghi liên kết vào bảng `Diagnosis` với `recordId` tương ứng. Một bệnh án có thể có 1 chẩn đoán chính và nhiều chẩn đoán phụ đi kèm.
  3. **Kê Đơn Thuốc (Prescription)**:
     * Hệ thống tạo bản ghi `Prescription` gắn với bệnh án.
     * Chèn các loại thuốc được chỉ định vào bảng `PrescriptionItem` kèm số lượng và liều lượng sử dụng.

---

### 💳 3.4. Luồng Hóa đơn & Thanh toán Viện phí (Billing & QR Payment Flow)
* **Tài liệu/File liên quan**: [billing.routes.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/routes/billing.routes.js), [billing.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/billing.service.js), [invoice.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/invoice.service.js)
* **Logic Hoạt động**:
  1. **Quản lý hóa đơn**:
     * Hóa đơn viện phí được liên kết trực tiếp $1:1$ với hồ sơ bệnh án thông qua trường `recordId`.
     * Khi lấy chi tiết hóa đơn, backend không dựa vào cột `totalAmount` của bảng `Invoice` (mặc định bằng `0.00` để tối ưu hóa dữ liệu tĩnh), mà tính toán tổng tiền động bằng cách tính tổng thành tiền `price * quantity` của tất cả các `InvoiceItem` thuộc hóa đơn đó.
  2. **Xem lịch sử & trạng thái thanh toán**:
     * API `getMyHistory` trả về danh sách đợt khám của bệnh nhân cùng trạng thái hóa đơn (`UNPAID` / `PAID` / `CANCELLED`) và tổng tiền tương ứng.
     * Nếu hóa đơn chưa thanh toán (`UNPAID`), giao diện bệnh nhân sẽ xuất hiện nút **"Thanh toán QR"**.
  3. **Cơ chế tạo mã VietQR tự động**:
     * Khi bệnh nhân nhấn thanh toán, backend lấy thông tin cấu hình tài khoản ngân hàng của phòng khám trong các biến môi trường:
       * `BANK_BIN`: Mã BIN ngân hàng (Ví dụ: `970422` cho MBBank).
       * `BANK_ACCOUNT_NUMBER`: Số tài khoản nhận tiền.
       * `BANK_ACCOUNT_NAME`: Tên chủ tài khoản ngân hàng.
     * Hệ thống tự động tạo đường dẫn VietQR tĩnh dạng:
       `https://img.vietqr.io/image/<BANK_BIN>-<BANK_ACCOUNT_NUMBER>-compact2.png?amount=<REMAINING_AMOUNT>&addInfo=Thanh toan HD-<INVOICE_ID>&accountName=<ACCOUNT_NAME>`
     * Mã QR này chứa sẵn số tiền cần thanh toán của hóa đơn và nội dung chuyển khoản định dạng chuẩn `Thanh toan HD-<invoiceId>`.
  4. **Xác nhận thanh toán**:
     * Khi người dùng nhấn nút xác nhận chuyển khoản thành công trên màn hình (giả lập thanh toán trực tuyến hoặc do thu ngân click xác nhận), hệ thống thực thi transaction:
       * Ghi nhận một bản ghi thanh toán mới trong bảng `Payment` với số tiền `amount` và hình thức thanh toán `method = 'QR'` hoặc `'BANKING'`.
       * Tính toán tổng tiền đã thanh toán, nếu bằng với tổng số tiền của hóa đơn, cập nhật trạng thái hóa đơn `Invoice` thành `PAID` (Đã thanh toán).

---

### 💊 3.5. Luồng Quản lý Dược & Kho thuốc (Pharmacy & Stock Flow)
* **Tài liệu/File liên quan**: [pharmacy.routes.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/routes/pharmacy.routes.js), [pharmacy.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/pharmacy.service.js)
* **Logic Hoạt động**:
  1. **Quản lý Thuốc (Medicine)**: Danh mục các loại thuốc hiện có tại phòng khám (tên thuốc, đơn vị tính).
  2. **Biến động Kho (Stock Movement)**:
     * Mỗi khi nhập thêm thuốc mới, xuất thuốc cho đơn thuốc của bệnh nhân hoặc điều chỉnh thuốc bị hỏng, hệ thống tạo bản ghi trong bảng `StockMovement` với phân loại `StockType`:
       * `IMPORT`: Nhập kho (cộng số lượng).
       * `EXPORT`: Xuất kho bán cho bệnh nhân (trừ số lượng).
       * `ADJUST`: Điều chỉnh kho (cập nhật chênh lệch).
     * Số lượng tồn kho thực tế của một loại thuốc tại bất kỳ thời điểm nào được tính động bằng tổng lượng `IMPORT` trừ đi tổng lượng `EXPORT` cộng/trừ lượng `ADJUST`.

---

### 📊 3.6. Luồng Báo cáo & Thống kê (Reports & Analytics)
* **Tài liệu/File liên quan**: [admin.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/admin.service.js), [billing.service.js](file:///Users/chichi/Desktop/yte/web/DATN/backend/services/billing.service.js)
* **Logic Hoạt động**:
  1. **Doanh thu phòng khám**:
     * Truy vấn bảng `Payment` theo khoảng thời gian (`from`, `to`), nhóm theo ngày và hình thức thanh toán (`CASH`, `BANKING`, `QR`, v.v.) để vẽ biểu đồ doanh thu ở Dashboard Admin.
  2. **Thống kê tổng quan (Dashboard Stats)**:
     * Đếm tổng số bệnh nhân đăng ký mới, số lịch hẹn trong ngày hôm nay.
     * Tính toán tổng số doanh thu hôm nay thực nhận (`SUM(amount)` trong bảng `Payment` tại ngày hiện tại).
     * Tính toán số nợ chưa thu (tổng tiền của toàn bộ hóa đơn có trạng thái `UNPAID`).

---

## 🛡️ 4. Cơ chế Xử lý Lỗi & An toàn Giao dịch (Transaction & Error Handling)

* **Database Transaction (ACID)**:
  * Tất cả các luồng nghiệp vụ phức tạp liên quan đến nhiều bảng (Ví dụ: tạo bệnh án đồng thời đổi trạng thái lịch hẹn và tạo hóa đơn nháp) đều sử dụng giao dịch cơ sở dữ liệu `conn.beginTransaction()`.
  * Nếu bất kỳ câu lệnh SQL nào trong chuỗi bị lỗi, hệ thống ngay lập tức gọi `conn.rollback()` để hoàn trả dữ liệu về trạng thái ban đầu, tránh tuyệt đối tình trạng bất nhất thông tin (Ví dụ: Tạo bệnh án thành công nhưng lịch hẹn vẫn ở trạng thái cũ hoặc không có hóa đơn).
  * Giải phóng kết nối `conn.release()` luôn được đặt trong khối `finally` để đảm bảo kết nối được trả lại cho pool bất kể transaction thành công hay thất bại.
* **Xử lý lỗi toàn cục (Global Error Handling Middleware)**:
  * Khi các service ném ra lỗi (`throw new Error(...)`), controller bắt lại bằng khối `try...catch` và chuyển tiếp qua `next(error)`.
  * Middleware xử lý lỗi cuối cùng ở file `app.js` sẽ bắt lại toàn bộ các lỗi này, ghi nhận log lỗi chi tiết ra console và định dạng response trả về cho client có cấu trúc thống nhất: `{ success: false, message: <Nội dung lỗi chi tiết> }` kèm mã trạng thái HTTP phù hợp (400, 401, 403, 404, 500).
