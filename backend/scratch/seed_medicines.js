import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const dbUrl = process.env.DATABASE_URL;

const medicines = [
  { name: 'Paracetamol 500mg', category: 'Thuốc giảm đau hạ sốt', unit: 'Viên', price: 2000, minStock: 50, description: 'Uống sau ăn 30 phút, cách nhau 4-6 tiếng.' },
  { name: 'Amoxicillin 500mg', category: 'Kháng sinh', unit: 'Viên', price: 5000, minStock: 30, description: 'Uống sau ăn, 2 viên/ngày.' },
  { name: 'Vitamin C 500mg', category: 'Bổ sung vitamin', unit: 'Viên', price: 3000, minStock: 100, description: 'Uống 1 viên vào buổi sáng.' },
  { name: 'Bông y tế Bạch Tuyết', category: 'Vật tư y tế', unit: 'Cuộn', price: 15000, minStock: 10, description: 'Bông hút nước sát trùng.' },
  { name: 'Nước muối sinh lý Nacl 0.9%', category: 'Vật tư y tế', unit: 'Chai', price: 8000, minStock: 20, description: 'Súc họng, rửa vết thương ngoài da.' },
  { name: 'Thuốc ho bổ phế Nam Hà', category: 'Thuốc ho', unit: 'Chai', price: 45000, minStock: 15, description: 'Uống 15ml/lần x 3 lần/ngày.' },
  { name: 'Băng cá nhân Urgo', category: 'Vật tư y tế', unit: 'Hộp', price: 50000, minStock: 5, description: 'Hộp 100 miếng dán cá nhân bảo vệ vết thương.' },
  { name: 'Khẩu trang y tế 4 lớp', category: 'Vật tư y tế', unit: 'Hộp', price: 35000, minStock: 20, description: 'Sử dụng 1 lần để phòng dịch bệnh.' },
  { name: 'Cồn sát trùng 70 độ', category: 'Sát trùng', unit: 'Chai', price: 12000, minStock: 10, description: 'Sát trùng vết thương hở bề ngoài da.' },
  { name: 'Omez 20mg (Omeprazole)', category: 'Thuốc dạ dày', unit: 'Viên', price: 4500, minStock: 40, description: 'Uống 1 viên trước bữa ăn sáng 30 phút.' }
];

async function run() {
    const conn = await mysql.createConnection({
        uri: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await conn.beginTransaction();

        for (const m of medicines) {
            const [res] = await conn.query(
                `INSERT INTO Medicine (name, category, unit, price, minStock, description) VALUES (?, ?, ?, ?, ?, ?)`,
                [m.name, m.category, m.unit, m.price, m.minStock, m.description]
            );
            const medicineId = res.insertId;
            
            // Generate some random stock movement specifically an IMPORT
            const initialStock = Math.floor(Math.random() * 100) + 10;
            await conn.query(
                `INSERT INTO StockMovement (medicineId, type, quantity) VALUES (?, 'IMPORT', ?)`,
                [medicineId, initialStock]
            );
        }

        await conn.commit();
        console.log("Seeding medicines and initial stock completed successfully!");
    } catch(err) {
        await conn.rollback();
        console.error("Error seeding:", err);
    } finally {
        await conn.end();
    }
}
run();
