# Hệ thống Theo dõi Lỗi (Error Tracking)

## [2026-05-17 19:26] - MySQL Connection Limit Exceeded

- **Type**: Integration
- **Severity**: High
- **File**: `backend/config/db.js`
- **Agent**: @backend-developer
- **Root Cause**: Cơ sở dữ liệu MySQL (gói Free) có giới hạn `max_user_connections = 5`. Khi hệ thống backend được deploy lên Vercel Serverless, số lượng kết nối mặc định được tạo vượt quá ngưỡng cho phép, dẫn đến việc API báo lỗi 500 khi người dùng đăng nhập hoặc lấy danh sách bác sĩ.
- **Error Message**: 
  ```
  ER_USER_LIMIT_REACHED: User 'uy3vr2lutdyavxsd' has exceeded the 'max_user_connections' resource (current value: 5)
  ```
- **Fix Applied**: Sửa đổi cấu hình `mysql.createPool` trong `backend/config/db.js`. Bổ sung tham số `connectionLimit=2&waitForConnections=true&queueLimit=0` vào chuỗi `DATABASE_URL` để ép các Vercel serverless function chỉ mở tối đa 2 kết nối cho mỗi instance, tránh việc mở tràn lan gây lỗi database.
- **Prevention**: Cần theo dõi thêm lưu lượng trên Production. Về lâu dài có thể cần chuyển sang dịch vụ MySQL trả phí hoặc sử dụng Prisma/Connection Pooling middleware chuyên biệt (như PGBouncer cho Postgres hoặc ProxySQL cho MySQL) nếu lượng truy cập tăng vọt.
- **Status**: Fixed

---

## [2026-05-26 05:46] - Lỗi vượt quá kết nối MySQL (max_user_connections) trên Vercel

- **Type**: Runtime
- **Severity**: High
- **File**: `backend/config/db.js`
- **Agent**: Antigravity Orchestrator
- **Root Cause**: Database trên server có giới hạn max 5 connections. Khi deploy lên serverless Vercel, các function khởi tạo connection pool và nhanh chóng vượt quá giới hạn này, dẫn đến lỗi 500 (`ER_USER_LIMIT_REACHED`).
- **Error Message**: 
  ```
  ERROR: Error: User 'uy3vr2lutdyavxsd' has exceeded the 'max_user_connections' resource (current value: 5)
  ```
- **Fix Applied**: Bổ sung `connectionLimit=1` một cách tường minh vào cấu hình `mysql.createPool` trong `db.js`.
- **Prevention**: Luôn set giới hạn kết nối cực thấp (1-2) khi kết nối Database truyền thống từ môi trường Serverless (Vercel, AWS Lambda) hoặc cấu hình Connection Pooling (PgBouncer, Prisma Accelerate) ở cấp middleware.
- **Status**: Fixed

## [2026-05-28 15:05] - Vercel Deploy 500 Error due to missing openapi.json

- **Type**: Integration
- **Severity**: High
- **File**: `backend/app.js:41`
- **Agent**: Antigravity
- **Root Cause**: The `.gitignore` file had `docs/` which ignored the `backend/docs/` directory, preventing `openapi.json` from being pushed to GitHub. When Vercel ran `app.js`, it threw `ENOENT` on `readFileSync`.
- **Error Message**: 
  ```
  Error: ENOENT: no such file or directory, open '/var/task/backend/docs/openapi.json'
  ```
- **Fix Applied**: Updated `.gitignore` from `docs/` to `/docs/` and added `backend/docs/openapi.json` to Git. Pushed the fix.
- **Prevention**: Be mindful of broad `.gitignore` rules (like `docs/` without a leading slash) that can accidentally exclude important nested directories.
- **Status**: Fixed

---

## [2026-06-04 21:30] - MySQL Connection Limit Exceeded due to Frontend Parallel Requests

- **Type**: Integration
- **Severity**: High
- **File**: `backend/config/db.js` & Các trang frontend có `Promise.all` (`Booking.jsx`, `DoctorsList.jsx`, `ServiceManagement.jsx`...)
- **Agent**: Antigravity
- **Root Cause**: Mặc dù backend đã giới hạn `connectionLimit: 1` và `maxIdle: 0`, khi frontend sử dụng `Promise.all` để tải đồng thời nhiều API cùng một lúc (ví dụ: Booking gọi song song 3 API), Vercel đã spawn nhiều container NodeJS Serverless song song để xử lý các request này. Mỗi container mở 1 connection riêng và kết quả là vượt quá giới hạn 5 connection của gói MySQL Clever Cloud miễn phí.
- **Fix Applied**: 
  1. Giảm `idleTimeout` trong `db.js` xuống `1000` (1 giây) để giải phóng các kết nối rảnh nhanh hơn.
  2. Thay thế `Promise.all` bằng gọi API tuần tự (`await`) tại tất cả các trang frontend có tải nhiều API đồng thời nhằm đảm bảo Vercel xử lý tuần tự và không spawn nhiều container tạo kết nối database cùng một lúc.
- **Prevention**: Tránh sử dụng `Promise.all` để fetch dữ liệu từ các API kết nối database trực tiếp trên môi trường Serverless có cấu hình kết nối DB giới hạn rất thấp. Nên gọi tuần tự hoặc thiết kế gộp API (API composition) ở backend.
- **Status**: Fixed
