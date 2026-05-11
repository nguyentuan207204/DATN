import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Phòng Khám <no-reply@phongkhamdakhoabacninh.io.vn>";

/**
 * Core function: send any email via Resend
 * @param {object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] Critical: RESEND_API_KEY is not defined in environment variables.");
    return { success: false, error: "Missing API Key" };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });

    if (error) {
      console.error("[Email] Resend API error details:", JSON.stringify(error, null, 2));
      return { success: false, error: error.message || "Resend service error" };
    }

    console.log(`[Email] Success | Sent to ${to} | ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Exception during sendEmail:", err);
    return { success: false, error: err.message || "Unknown internal error during email sending" };
  }
};

// ============================================================
// EMAIL TEMPLATES
// ============================================================

/**
 * Template wrapper — applies clinic branding to all emails
 */
const withLayout = (title, content) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🏥 Phòng Khám</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Medical Clinic Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Email này được gửi tự động từ hệ thống Phòng Khám.<br>
                Vui lòng không trả lời email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ============================================================
// 1. OTP Verification Email
// ============================================================

/**
 * Send OTP verification email after registration
 * @param {string} email - recipient email
 * @param {string} otpCode - 6-digit OTP
 * @param {string} fullName - user's name
 */
export const sendOtpEmail = async (email, otpCode, fullName = "bạn") => {
  const subject = "🔑 Mã OTP Xác Thực Tài Khoản — Phòng Khám";
  const html = withLayout(
    "Xác thực OTP",
    `
    <h2 style="color:#1e293b;font-size:22px;margin:0 0 8px;">Xin chào, ${fullName}!</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Chào mừng bạn đến với Phòng Khám. Vui lòng sử dụng mã OTP bên dưới để kích hoạt tài khoản của bạn.
    </p>

    <!-- OTP Box -->
    <div style="background:#f0f9ff;border:2px dashed #0ea5e9;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Mã xác thực OTP của bạn</p>
      <p style="margin:0;color:#0284c7;font-size:42px;font-weight:700;letter-spacing:12px;">${otpCode}</p>
    </div>

    <!-- Warning -->
    <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#c2410c;font-size:14px;">
        ⏰ <strong>Mã OTP có hiệu lực trong 10 phút.</strong><br>
        Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên phòng khám.
      </p>
    </div>

    <p style="color:#94a3b8;font-size:13px;margin:0;">
      Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.
    </p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

// ============================================================
// 2. Appointment Confirmation Email
// ============================================================

/**
 * Send appointment booking confirmation email
 * @param {string} email - patient email
 * @param {object} appointment - { patientName, doctorName, serviceName, date, notes }
 */
export const sendAppointmentConfirmationEmail = async (email, appointment) => {
  const { patientName, doctorName, serviceName, date, notes } = appointment;
  const formattedDate = new Date(date).toLocaleString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = "✅ Xác Nhận Lịch Hẹn Khám Bệnh — Phòng Khám";
  const html = withLayout(
    "Xác nhận lịch hẹn",
    `
    <h2 style="color:#1e293b;font-size:22px;margin:0 0 8px;">Lịch hẹn đã được xác nhận! ✅</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Xin chào <strong>${patientName}</strong>, lịch hẹn của bạn đã được đặt thành công. Đây là thông tin chi tiết:
    </p>

    <!-- Appointment Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;margin:0 0 28px;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Bệnh nhân</span><br>
          <strong style="color:#1e293b;font-size:16px;">${patientName}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Bác sĩ</span><br>
          <strong style="color:#1e293b;font-size:16px;">Dr. ${doctorName}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Dịch vụ</span><br>
          <strong style="color:#1e293b;font-size:16px;">${serviceName || "Khám tổng quát"}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;${notes ? "border-bottom:1px solid #e2e8f0;" : ""}">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Thời gian</span><br>
          <strong style="color:#0284c7;font-size:16px;">📅 ${formattedDate}</strong>
        </td>
      </tr>
      ${
        notes
          ? `<tr>
        <td style="padding:16px 20px;">
          <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Ghi chú</span><br>
          <span style="color:#475569;font-size:14px;">${notes}</span>
        </td>
      </tr>`
          : ""
      }
    </table>

    <!-- Reminder -->
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 8px 8px 0;padding:16px;margin:0 0 24px;">
      <p style="margin:0;color:#15803d;font-size:14px;line-height:1.6;">
        📌 <strong>Lưu ý:</strong> Vui lòng đến trước <strong>15 phút</strong> để làm thủ tục.<br>
        Mang theo CMND/CCCD và các giấy tờ liên quan (nếu có).
      </p>
    </div>

    <p style="color:#94a3b8;font-size:13px;margin:0;">
      Nếu cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi ít nhất 24 giờ trước giờ hẹn.
    </p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

// ============================================================
// 3. Password Reset Email
// ============================================================

/**
 * Send password reset link email
 * @param {string} email - user email
 * @param {string} resetToken - secure token for password reset link
 * @param {string} fullName - user's name
 */
export const sendPasswordResetEmail = async (email, resetToken, fullName = "bạn") => {
  const BASE_URL = process.env.FRONTEND_URL || "https://datn-orcin.vercel.app";
  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
  const subject = "🔐 Đặt Lại Mật Khẩu — Phòng Khám";

  const html = withLayout(
    "Đặt lại mật khẩu",
    `
    <h2 style="color:#1e293b;font-size:22px;margin:0 0 8px;">Đặt lại mật khẩu</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Xin chào <strong>${fullName}</strong>, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
      Nhấn nút bên dưới để tiến hành:
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:0 0 28px;">
      <a href="${resetLink}"
         style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">
        🔐 Đặt lại mật khẩu
      </a>
    </div>

    <!-- Fallback Link -->
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0 0 24px;">
      Nếu nút không hoạt động, copy đường link sau:<br>
      <a href="${resetLink}" style="color:#0284c7;word-break:break-all;">${resetLink}</a>
    </p>

    <!-- Warning -->
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:16px;">
      <p style="margin:0;color:#b91c1c;font-size:14px;">
        ⚠️ <strong>Link chỉ có hiệu lực trong 30 phút.</strong><br>
        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.
      </p>
    </div>
    `
  );

  return sendEmail({ to: email, subject, html });
};

// ============================================================
// 4. Invoice / Payment Confirmation Email
// ============================================================

/**
 * Send invoice payment confirmation email
 * @param {string} email - patient email
 * @param {object} invoice - { patientName, invoiceId, totalAmount, paidAt, items }
 */
export const sendInvoiceEmail = async (email, invoice) => {
  const { patientName, invoiceId, totalAmount, paidAt, items = [] } = invoice;
  const formattedDate = new Date(paidAt || Date.now()).toLocaleString("vi-VN");
  const formattedAmount = Number(totalAmount).toLocaleString("vi-VN") + " VNĐ";

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:14px;">${item.serviceName}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:14px;text-align:right;">${Number(item.price).toLocaleString("vi-VN")} VNĐ</td>
    </tr>
  `
    )
    .join("");

  const subject = `💳 Xác Nhận Thanh Toán #${invoiceId} — Phòng Khám`;
  const html = withLayout(
    "Xác nhận thanh toán",
    `
    <h2 style="color:#1e293b;font-size:22px;margin:0 0 8px;">Thanh toán thành công! 💳</h2>
    <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">
      Xin chào <strong>${patientName}</strong>, hóa đơn <strong>#${invoiceId}</strong> của bạn đã được thanh toán thành công.
    </p>

    <!-- Invoice Items Table -->
    ${
      itemRows
        ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:12px 16px;text-align:left;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Dịch vụ</th>
          <th style="padding:12px 16px;text-align:center;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">SL</th>
          <th style="padding:12px 16px;text-align:right;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Thành tiền</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    `
        : ""
    }

    <!-- Total -->
    <div style="background:#f0f9ff;border-radius:8px;padding:20px;text-align:right;margin:0 0 24px;">
      <span style="color:#64748b;font-size:14px;">Tổng cộng: </span>
      <strong style="color:#0284c7;font-size:22px;margin-left:12px;">${formattedAmount}</strong>
    </div>

    <p style="color:#94a3b8;font-size:13px;margin:0;">
      📅 Thời gian thanh toán: ${formattedDate}<br>
      🆔 Mã hóa đơn: #${invoiceId}
    </p>
    `
  );

  return sendEmail({ to: email, subject, html });
};

export default sendEmail;
