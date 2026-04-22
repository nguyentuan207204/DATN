import pool from "../config/db.js";

async function seedData() {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        console.log("Starting seeding process...");

        const patientId = 5; // Nguyễn Quốc Tuấn (nguyentuan207)
        const doctorId = 1;  // BS. Nguyễn Văn An
        const serviceId_Kham = 1; // Khám lâm sàng nội (150k)
        const serviceId_Xquang = 3; // Chụp X-quang phổi (120k)

        const records = [
            {
                date: '2026-01-10 09:30:00',
                vitals: { weight: 65, height: 170, bp: '120/80', hr: 75, temp: 36.5, rr: 18 },
                diagnosis: 1, // J00 - Viêm mũi họng
                meds: [
                    { id: 1, qty: 10, dosage: 'Uống 2 viên/ngày sau ăn' },
                    { id: 3, qty: 5, dosage: 'Uống 1 viên/ngày sáng' }
                ],
                invoice: { total: 270000, status: 'PAID', items: [
                    { name: 'Khám lâm sàng nội', qty: 1, price: 150000 },
                    { name: 'Chụp X-quang phổi', qty: 1, price: 120000 }
                ]}
            },
            {
                date: '2026-02-15 14:20:00',
                vitals: { weight: 66, height: 170, bp: '140/90', hr: 82, temp: 37.0, rr: 20 },
                diagnosis: 2, // I10 - Tăng huyết áp
                meds: [
                    { id: 2, qty: 14, dosage: 'Uống 1 viên/ngày tối' },
                    { id: 1, qty: 10, dosage: 'Uống khi sốt/đau đầu' }
                ],
                invoice: { total: 150000, status: 'PAID', items: [
                    { name: 'Khám lâm sàng nội', qty: 1, price: 150000 }
                ]}
            },
            {
                date: '2026-04-12 08:45:00',
                vitals: { weight: 65, height: 170, bp: '130/85', hr: 78, temp: 36.6, rr: 18 },
                diagnosis: 1, // J00
                meds: [
                    { id: 3, qty: 10, dosage: 'Uống 1 viên/ngày' }
                ],
                invoice: { total: 150000, status: 'UNPAID', items: [
                    { name: 'Khám lâm sàng nội', qty: 1, price: 150000 }
                ]}
            }
        ];

        for (const r of records) {
            // 1. Medical Record
            const [mrResult] = await conn.query(
                `INSERT INTO MedicalRecord (patientId, doctorId, visitDate, weight, height, bloodPressure, heartRate, temperature, respiratoryRate, advice) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [patientId, doctorId, r.date, r.vitals.weight, r.vitals.height, r.vitals.bp, r.vitals.hr, r.vitals.temp, r.vitals.rr, "Ăn uống điều độ, tránh thức khuya."]
            );
            const recordId = mrResult.insertId;

            // 2. Diagnosis
            await conn.query(
                "INSERT INTO Diagnosis (recordId, icd10Id) VALUES (?, ?)",
                [recordId, r.diagnosis]
            );

            // 3. Prescription
            const [presResult] = await conn.query(
                "INSERT INTO Prescription (recordId) VALUES (?)",
                [recordId]
            );
            const presId = presResult.insertId;

            for (const m of r.meds) {
                await conn.query(
                    "INSERT INTO PrescriptionItem (prescriptionId, medicineId, quantity, dosage) VALUES (?, ?, ?, ?)",
                    [presId, m.id, m.qty, m.dosage]
                );
            }

            // 4. Invoice
            const [invResult] = await conn.query(
                "INSERT INTO Invoice (patientId, recordId, totalAmount, status, createdAt) VALUES (?, ?, ?, ?, ?)",
                [patientId, recordId, r.invoice.total, r.invoice.status, r.date]
            );
            const invId = invResult.insertId;

            for (const item of r.invoice.items) {
                await conn.query(
                    "INSERT INTO InvoiceItem (invoiceId, serviceId, serviceName, quantity, price) VALUES (?, ?, ?, ?, ?)",
                    [invId, 1, item.name, item.qty, item.price]
                );
            }
            
            console.log(`Created record ${recordId} for date ${r.date}`);
        }

        await conn.commit();
        console.log("Seeding completed successfully!");
    } catch (error) {
        await conn.rollback();
        console.error("Error during seeding:", error);
    } finally {
        conn.release();
        process.exit();
    }
}

seedData();
