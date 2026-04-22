-- Bổ sung cột imageUrls vào bảng Appointment
ALTER TABLE Appointment ADD COLUMN imageUrls TEXT AFTER notes;
