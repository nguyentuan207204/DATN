import db from './config/db.js';
import dotenv from 'dotenv';
import path from 'path';

// Nạp biến môi trường từ thư mục gốc
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
// Đề phòng chạy trực tiếp trong thư mục backend
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceCategories = [
    { name: 'Khám Bệnh' },
    { name: 'Xét nghiệm Sinh hóa - Huyết học' },
    { name: 'Chẩn đoán hình ảnh' },
    { name: 'Thăm dò chức năng' },
    { name: 'Thủ thuật - Phẫu thuật' },
    { name: 'Gói khám Sức khỏe' }
];

const services = [
    // Khám Bệnh
    { name: 'Khám nội khoa chung', price: 150000, categoryIndex: 0 },
    { name: 'Khám ngoại khoa', price: 150000, categoryIndex: 0 },
    { name: 'Khám chuyên khoa Nhi', price: 200000, categoryIndex: 0 },
    { name: 'Khám chuyên khoa Phụ sản', price: 200000, categoryIndex: 0 },
    { name: 'Khám chuyên khoa Mắt', price: 150000, categoryIndex: 0 },
    { name: 'Khám chuyên khoa Tai Mũi Họng', price: 150000, categoryIndex: 0 },
    { name: 'Khám chuyên khoa Răng Hàm Mặt', price: 150000, categoryIndex: 0 },
    { name: 'Khám cấp cứu', price: 300000, categoryIndex: 0 },

    // Xét nghiệm Sinh hóa - Huyết học
    { name: 'Tổng phân tích tế bào máu ngoại vi', price: 120000, categoryIndex: 1 },
    { name: 'Xét nghiệm đường huyết (Glucose)', price: 50000, categoryIndex: 1 },
    { name: 'Xét nghiệm mỡ máu (Cholesterol, Triglyceride)', price: 150000, categoryIndex: 1 },
    { name: 'Xét nghiệm chức năng gan (AST/ALT)', price: 100000, categoryIndex: 1 },
    { name: 'Xét nghiệm chức năng thận (Ure/Creatinin)', price: 100000, categoryIndex: 1 },
    { name: 'Xét nghiệm Acid Uric (Gout)', price: 60000, categoryIndex: 1 },
    { name: 'Định lượng men gan GGT', price: 80000, categoryIndex: 1 },
    { name: 'Xét nghiệm nước tiểu 10 thông số', price: 50000, categoryIndex: 1 },

    // Chẩn đoán hình ảnh
    { name: 'Siêu âm bụng tổng quát', price: 200000, categoryIndex: 2 },
    { name: 'Siêu âm thai 4D', price: 400000, categoryIndex: 2 },
    { name: 'Siêu âm tuyến giáp', price: 180000, categoryIndex: 2 },
    { name: 'X-Quang ngực thẳng', price: 150000, categoryIndex: 2 },
    { name: 'X-Quang xương khớp các loại', price: 180000, categoryIndex: 2 },
    { name: 'Chụp cắt lớp vi tính (CT) sọ não', price: 1200000, categoryIndex: 2 },
    { name: 'Chụp cộng hưởng từ (MRI) cột sống', price: 2500000, categoryIndex: 2 },

    // Thăm dò chức năng
    { name: 'Nội soi dạ dày - tá tràng không gây mê', price: 800000, categoryIndex: 3 },
    { name: 'Nội soi dạ dày có gây mê', price: 1500000, categoryIndex: 3 },
    { name: 'Nội soi đại trực tràng', price: 1200000, categoryIndex: 3 },
    { name: 'Điện tâm đồ (ECG)', price: 100000, categoryIndex: 3 },
    { name: 'Điện não đồ (EEG)', price: 250000, categoryIndex: 3 },

    // Thủ thuật - Phẫu thuật
    { name: 'Khâu vết thương phần mềm (dưới 5cm)', price: 300000, categoryIndex: 4 },
    { name: 'Thay băng, cắt chỉ vết thương', price: 80000, categoryIndex: 4 },
    { name: 'Bó bột gãy xương kín', price: 500000, categoryIndex: 4 },
    { name: 'Nhổ răng khôn mọc lệch', price: 1500000, categoryIndex: 4 },
    { name: 'Phẫu thuật cắt ruột thừa nội soi', price: 8000000, categoryIndex: 4 },
    { name: 'Cắt trĩ bằng phương pháp Longo', price: 10000000, categoryIndex: 4 },

    // Gói khám Sức khỏe
    { name: 'Gói khám sức khỏe tổng quát cơ bản', price: 1500000, categoryIndex: 5 },
    { name: 'Gói khám sức khỏe tổng quát nâng cao', price: 3500000, categoryIndex: 5 },
    { name: 'Gói tầm soát ung thư toàn diện', price: 8000000, categoryIndex: 5 },
    { name: 'Gói khám tiền hôn nhân', price: 2500000, categoryIndex: 5 }
];

async function seedMedicalServices() {
    console.log("🚀 Bắt đầu xóa và tạo lại dữ liệu Dịch vụ y tế...");
    try {
        // Vô hiệu hóa khóa ngoại để xóa an toàn
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log("Xóa dữ liệu cũ...");
        await db.query('DELETE FROM InvoiceItem'); // InvoiceItem chứa khóa ngoại tới Service
        await db.query('DELETE FROM Service');
        await db.query('DELETE FROM ServiceCategory');
        
        await db.query('ALTER TABLE Service AUTO_INCREMENT = 1');
        await db.query('ALTER TABLE ServiceCategory AUTO_INCREMENT = 1');

        console.log("Đang tạo danh mục dịch vụ...");
        const categoryIds = [];
        for (const cat of serviceCategories) {
            const [result] = await db.query('INSERT INTO ServiceCategory (name) VALUES (?)', [cat.name]);
            categoryIds.push(result.insertId);
        }
        console.log(`✅ Đã tạo ${categoryIds.length} danh mục.`);

        console.log("Đang tạo danh sách dịch vụ...");
        let serviceCount = 0;
        for (const srv of services) {
            const catId = categoryIds[srv.categoryIndex];
            await db.query('INSERT INTO Service (name, price, categoryId) VALUES (?, ?, ?)', [srv.name, srv.price, catId]);
            serviceCount++;
        }
        
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log(`✅ Đã tạo thành công ${serviceCount} dịch vụ y tế.`);
        console.log("🎉 Hoàn tất quá trình seed dữ liệu!");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi trong quá trình tạo dữ liệu:", error);
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        process.exit(1);
    }
}

seedMedicalServices();
