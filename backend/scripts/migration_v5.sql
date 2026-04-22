-- Migration v5: Chuẩn hóa y tế và Audit Log (Bản vá lỗi trùng lặp)

-- 1. Bổ sung cột official_code vào bảng Medicine (Nếu chưa tồn tại)
-- Lưu ý: MySQL không hỗ trợ ADD COLUMN IF NOT EXISTS trực tiếp, 
-- ta sẽ dùng mẹo để tránh lỗi nếu cột đã tồn tại.
SET @dbname = DATABASE();
SET @tablename = "Medicine";
SET @columnname = "official_code";
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
     AND TABLE_NAME = @tablename
     AND COLUMN_NAME = @columnname) > 0,
  "SELECT 1",
  "ALTER TABLE Medicine ADD COLUMN official_code VARCHAR(50) AFTER id"
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Tạo bảng AuditLog (Đã có IF NOT EXISTS nên an toàn)
CREATE TABLE IF NOT EXISTS AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    tableName VARCHAR(50) NOT NULL,
    recordId INT NOT NULL,
    oldValue JSON,
    newValue JSON,
    ipAddress VARCHAR(45),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);

-- 3. Seed dữ liệu ICD-10 mẫu (Sử dụng INSERT IGNORE để tránh lỗi Duplicate entry)
INSERT IGNORE INTO ICD10 (code, name) VALUES 
('A00', 'Bệnh tả'),
('A01', 'Sốt thương hàn và phó thương hàn'),
('A09', 'Tiêu chảy và viêm dạ dày ruột có nguồn gốc nhiễm khuẩn'),
('A15', 'Lao phổi, được xác định bằng vi khuẩn học và mô bệnh học'),
('B01', 'Thủy đậu [Varicella]'),
('B05', 'Sởi'),
('B15', 'Viêm gan vi rút A cấp'),
('B16', 'Viêm gan vi rút B cấp'),
('B18', 'Viêm gan vi rút mạn tính'),
('E10', 'Bệnh đái tháo đường phụ thuộc insulin'),
('E11', 'Bệnh đái tháo đường không phụ thuộc insulin'),
('I10', 'Tăng huyết áp vô căn (nguyên phát)'),
('I20', 'Đau ngực biến thái [Angina pectoris]'),
('I21', 'Nhồi máu cơ tim cấp'),
('I63', 'Nhồi máu não'),
('J00', 'Viêm mũi họng cấp [cảm lạnh]'),
('J01', 'Viêm xoang cấp'),
('J02', 'Viêm họng cấp'),
('J03', 'Viêm amiđan cấp'),
('J11', 'Cúm, vi rút không xác định'),
('J18', 'Viêm phổi, tác nhân không xác định'),
('J45', 'Hen'),
('K25', 'Loét dạ dày'),
('K29', 'Viêm dạ dày và tá tràng'),
('N00', 'Hội chứng viêm thận cấp'),
('N39', 'Các rối loạn khác của hệ tiết niệu');
