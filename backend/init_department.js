import pool from "./config/db.js";

async function initDepartmentTable() {
    try {
        console.log("Creating Department table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Department (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if entries exist
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM Department");
        if (rows[0].total === 0) {
            console.log("Inserting default departments...");
            await pool.query(`
                INSERT INTO Department (name, description) VALUES 
                ('Khoa Nội', 'Chuyên điều trị các bệnh nội khoa'),
                ('Khoa Ngoại', 'Chuyên phẫu thuật và ngoại khoa'),
                ('Khoa Nhi', 'Chuyên nhi khoa'),
                ('Khoa Sản', 'Chuyên khoa sản'),
                ('Khoa Mắt', 'Chuyên khoa mắt'),
                ('Khoa Tai Mũi Họng', 'Chuyên khoa tai mũi họng'),
                ('Khoa Răng Hàm Mặt', 'Chuyên khoa răng hàm mặt'),
                ('Khoa Da Liễu', 'Chuyên khoa da liễu')
            `);
        }
        console.log("Department table initialized successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error initializing Department table:", error);
        process.exit(1);
    }
}

initDepartmentTable();
