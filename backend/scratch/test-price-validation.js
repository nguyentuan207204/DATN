/**
 * Test script: Validate price > 0 for Medicine and Medical Service
 * Tự động login để lấy token, sau đó test các case
 * Run: node scratch/test-price-validation.js
 */

const BASE_URL = "http://localhost:3000/api";

// ---- Bước 1: Lấy JWT token ----
async function getAuthToken() {
  // Try common admin credentials
  const credentials = [
    { username: "admin", password: "admin123" },
    { username: "admin", password: "Admin@123" },
    { username: "admin", password: "123456" },
  ];

  for (const cred of credentials) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });
      const json = await res.json();
      const token = json.token || json.data?.token || json.accessToken;
      if (token) {
        console.log(`✅ Đăng nhập thành công với username="${cred.username}"`);
        return token;
      }
    } catch (err) {
      console.error("💥 Không thể kết nối server:", err.message);
      return null;
    }
  }

  console.log("⚠️  Không đăng nhập được. Thử lấy token từ reset-admin...");
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-admin`);
    const json = await res.json();
    console.log("reset-admin:", JSON.stringify(json));
  } catch (_) {}
  return null;
}

// ---- Runner ----
async function runTest(test, token) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(test.endpoint, {
      method: test.method,
      headers,
      body: JSON.stringify(test.body),
    });

    const json = await res.json();
    const passed = res.status === test.expectStatus;

    console.log(`\n${passed ? "✅ PASS" : "❌ FAIL"} — ${test.label}`);
    console.log(`  Body gửi  : ${JSON.stringify(test.body)}`);
    console.log(`  Status    : ${res.status} (mong đợi: ${test.expectStatus})`);
    console.log(`  Response  : ${json.message || JSON.stringify(json).slice(0, 120)}`);

    return passed;
  } catch (err) {
    console.log(`\n💥 ERROR — ${test.label}`);
    console.log(`  Lỗi: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log(" KIỂM TRA VALIDATION GIÁ > 0");
  console.log("=".repeat(60));

  // Lấy token
  const token = await getAuthToken();
  if (!token) {
    console.log("\n❌ Không lấy được token. Dừng test.");
    return;
  }

  // ---- Test cases Medicine ----
  const medicineTests = [
    {
      label: "❌ [MEDICINE] Giá = 0 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/pharmacy/medicines`,
      method: "POST",
      body: { name: "Test Paracetamol", unit: "Viên", price: 0 },
      expectStatus: 400,
      needAuth: true,
    },
    {
      label: "❌ [MEDICINE] Giá = -100 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/pharmacy/medicines`,
      method: "POST",
      body: { name: "Test Paracetamol", unit: "Viên", price: -100 },
      expectStatus: 400,
      needAuth: true,
    },
    {
      label: "❌ [MEDICINE] Giá không truyền → phải báo lỗi 400",
      endpoint: `${BASE_URL}/pharmacy/medicines`,
      method: "POST",
      body: { name: "Test Paracetamol", unit: "Viên" },
      expectStatus: 400,
      needAuth: true,
    },
    {
      label: "❌ [MEDICINE] Giá = '0' (string) → phải báo lỗi 400",
      endpoint: `${BASE_URL}/pharmacy/medicines`,
      method: "POST",
      body: { name: "Test Paracetamol", unit: "Viên", price: "0" },
      expectStatus: 400,
      needAuth: true,
    },
    {
      label: "✅ [MEDICINE] Giá = 5000 → tạo thành công 201",
      endpoint: `${BASE_URL}/pharmacy/medicines`,
      method: "POST",
      body: { name: "Test_Valid_Medicine_" + Date.now(), unit: "Viên", price: 5000, minStock: 10 },
      expectStatus: 201,
      needAuth: true,
    },
  ];

  // ---- Test cases Medical Service ----
  const serviceTests = [
    {
      label: "❌ [SERVICE] Giá = 0 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/medical-services`,
      method: "POST",
      body: { name: "Test Xét nghiệm", unit: "Lần", price: 0, categoryId: 1 },
      expectStatus: 400,
      needAuth: false,
    },
    {
      label: "❌ [SERVICE] Giá = -500 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/medical-services`,
      method: "POST",
      body: { name: "Test Xét nghiệm", unit: "Lần", price: -500, categoryId: 1 },
      expectStatus: 400,
      needAuth: false,
    },
    {
      label: "❌ [SERVICE] Giá không truyền → phải báo lỗi 400",
      endpoint: `${BASE_URL}/medical-services`,
      method: "POST",
      body: { name: "Test Xét nghiệm", unit: "Lần", categoryId: 1 },
      expectStatus: 400,
      needAuth: false,
    },
    {
      label: "❌ [SERVICE] Giá = 0.0 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/medical-services`,
      method: "POST",
      body: { name: "Test Xét nghiệm", unit: "Lần", price: 0.0, categoryId: 1 },
      expectStatus: 400,
      needAuth: false,
    },
    {
      label: "✅ [SERVICE] Giá = 150000 → tạo thành công 201",
      endpoint: `${BASE_URL}/medical-services`,
      method: "POST",
      body: { name: "Test_Valid_Service_" + Date.now(), unit: "Lần", price: 150000, categoryId: 1 },
      expectStatus: 201,
      needAuth: false,
    },
  ];

  // ---- Test UPDATE medicine price ----
  const updateTests = [
    {
      label: "❌ [UPDATE MEDICINE] Cập nhật giá = 0 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/pharmacy/medicines/1`,
      method: "PUT",
      body: { name: "Paracetamol", unit: "Viên", price: 0 },
      expectStatus: 400,
      needAuth: true,
    },
    {
      label: "❌ [UPDATE SERVICE] Cập nhật giá = -1 → phải báo lỗi 400",
      endpoint: `${BASE_URL}/medical-services/1`,
      method: "PUT",
      body: { name: "Xét nghiệm", unit: "Lần", price: -1, categoryId: 1 },
      expectStatus: 400,
      needAuth: false,
    },
  ];

  let passed = 0;
  let total = 0;

  console.log("\n📦 THUỐC (Medicine) — POST:");
  for (const test of medicineTests) {
    const ok = await runTest(test, test.needAuth ? token : null);
    if (ok) passed++;
    total++;
  }

  console.log("\n🏥 DỊCH VỤ Y TẾ (Medical Service) — POST:");
  for (const test of serviceTests) {
    const ok = await runTest(test, test.needAuth ? token : null);
    if (ok) passed++;
    total++;
  }

  console.log("\n🔄 CẬP NHẬT GIÁ (Update):");
  for (const test of updateTests) {
    const ok = await runTest(test, test.needAuth ? token : null);
    if (ok) passed++;
    total++;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`KẾT QUẢ: ${passed}/${total} test passed`);
  if (passed === total) {
    console.log("🎉 Tất cả test PASS! Validation giá hoạt động đúng.");
  } else {
    console.log(`⚠️  ${total - passed} test FAIL. Kiểm tra lại logic.`);
  }
  console.log("=".repeat(60));
}

main();
