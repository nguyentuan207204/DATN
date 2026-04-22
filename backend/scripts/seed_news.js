import pool from "../config/db.js";

const seedNews = async () => {
    console.log("🚀 Đang khởi tạo bảng News và dữ liệu mẫu...");

    try {
        // 1. Tạo bảng News nếu chưa tồn tại
        await pool.query(`
            CREATE TABLE IF NOT EXISTS News (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                summary TEXT,
                content TEXT,
                category VARCHAR(100),
                author VARCHAR(100),
                date DATE,
                image VARCHAR(255),
                featured BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Bảng News đã sẵn sàng.");

        // 2. Dữ liệu mẫu
        const newsData = [
            {
                title: "Khai trương Trung tâm Tiêm chủng chất lượng cao",
                summary: "Phòng khám chính thức đi vào hoạt động trung tâm tiêm chủng với đầy đủ các loại vắc xin cho mọi lứa tuổi.",
                content: "Với mong muốn bảo vệ sức khỏe cộng đồng, chúng tôi cung cấp dịch vụ tiêm chủng an toàn, quy trình khép kín và đội ngũ y bác sĩ giàu kinh nghiệm...",
                category: "Thông báo",
                author: "Ban Giám Đốc",
                date: "2024-03-25",
                image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
                featured: true
            },
            {
                title: "Hướng dẫn thực hiện 5K trong mùa dịch",
                summary: "Cập nhật các biện pháp phòng chống dịch bệnh mới nhất từ Bộ Y tế để bảo vệ bản thân và gia đình.",
                content: "Thực hiện nghiêm túc thông điệp 5K: Khẩu trang - Khử khuẩn - Khoảng cách - Không tập trung - Khai báo y tế...",
                category: "Kiến thức",
                author: "BS. Nguyễn Văn An",
                date: "2024-03-28",
                image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=800",
                featured: false
            },
            {
                title: "Dịch vụ khám sức khỏe tổng quát định kỳ",
                summary: "Tại sao bạn nên đi khám sức khỏe 6 tháng một lần? Hãy cùng lắng nghe tư vấn từ các chuyên gia.",
                content: "Khám sức khỏe định kỳ giúp phát hiện sớm các mầm bệnh và điều trị kịp thời, giảm thiểu rủi ro biến chứng...",
                category: "Dịch vụ",
                author: "Khoa Nội",
                date: "2024-03-30",
                image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
                featured: true
            },
            {
                title: "Ưu đãi 20% gói tầm soát ung thư",
                summary: "Chương trình ưu đãi đặc biệt trong tháng 4 dành cho khách hàng đăng ký trực tuyến tài trang web.",
                content: "Phòng khám triển khai chương trình tri ân khách hàng với gói tầm soát ung thư toàn diện giảm giá 20%...",
                category: "Tin tức",
                author: "Phòng Marketing",
                date: "2024-04-01",
                image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
                featured: false
            }
        ];

        for (const item of newsData) {
            const [exist] = await pool.query("SELECT id FROM News WHERE title = ?", [item.title]);
            if (exist.length === 0) {
                await pool.query(
                    "INSERT INTO News (title, summary, content, category, author, date, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [item.title, item.summary, item.content, item.category, item.author, item.date, item.image, item.featured]
                );
            }
        }

        console.log("✅ Seeding News hoàn tất!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Lỗi Seeding News:", error);
        process.exit(1);
    }
};

seedNews();
