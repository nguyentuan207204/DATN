import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu thêm dữ liệu mẫu...');

  // 1. Thêm Roles (Nếu chưa có)
  const roles = ['ADMIN', 'BACSI', 'YTA', 'BENHNHAN', 'KETOAN'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('✅ Đã thêm Roles');

  // Lấy role IDs
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const doctorRole = await prisma.role.findUnique({ where: { name: 'BACSI' } });
  const patientRole = await prisma.role.findUnique({ where: { name: 'BENHNHAN' } });

  // 2. Thêm Khoa phòng (Departments)
  const departments = [
    { name: 'Khoa Nội' },
    { name: 'Khoa Ngoại' },
    { name: 'Khoa Nhi' },
    { name: 'Khoa Sản' },
    { name: 'Khoa Tai Mũi Họng' },
    { name: 'Khoa Mắt' },
    { name: 'Khoa Răng Hàm Mặt' }
  ];
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  console.log('✅ Đã thêm Khoa phòng');

  // Lấy một số phòng ban
  const khoaNoi = await prisma.department.findUnique({ where: { name: 'Khoa Nội' } });
  const khoaNgoai = await prisma.department.findUnique({ where: { name: 'Khoa Ngoại' } });

  // 3. Thêm Nhóm dịch vụ (ServiceCategories)
  const categories = [
    { name: 'Khám Bệnh' },
    { name: 'Xét Nghiệm' },
    { name: 'Chẩn Đoán Hình Ảnh' },
    { name: 'Thủ Thuật - Phẫu Thuật' }
  ];
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Đã thêm Nhóm dịch vụ');

  const khamBenh = await prisma.serviceCategory.findUnique({ where: { name: 'Khám Bệnh' } });
  const xetNghiem = await prisma.serviceCategory.findUnique({ where: { name: 'Xét Nghiệm' } });
  const cdha = await prisma.serviceCategory.findUnique({ where: { name: 'Chẩn Đoán Hình Ảnh' } });

  // 4. Thêm Dịch vụ (Services)
  const services = [
    { name: 'Khám nội tổng quát', price: 150000, categoryId: khamBenh.id },
    { name: 'Khám chuyên khoa', price: 200000, categoryId: khamBenh.id },
    { name: 'Xét nghiệm máu cơ bản', price: 120000, categoryId: xetNghiem.id },
    { name: 'Xét nghiệm sinh hóa', price: 250000, categoryId: xetNghiem.id },
    { name: 'Siêu âm ổ bụng', price: 180000, categoryId: cdha.id },
    { name: 'Chụp X-Quang tim phổi', price: 150000, categoryId: cdha.id },
  ];
  
  for (const s of services) {
    // Không có thuộc tính unique trên Service.name nên kiểm tra trước khi thêm
    const exists = await prisma.service.findFirst({ where: { name: s.name } });
    if (!exists) {
      await prisma.service.create({ data: s });
    }
  }
  console.log('✅ Đã thêm Dịch vụ y tế');

  // 5. Thêm Bác sĩ mẫu
  const docUsername = 'bacsi01';
  let doctorUser = await prisma.user.findUnique({ where: { username: docUsername } });
  if (!doctorUser) {
    const passwordHash = await bcrypt.hash('123456', 10);
    doctorUser = await prisma.user.create({
      data: {
        username: docUsername,
        passwordHash,
        roleId: doctorRole.id,
      }
    });
    
    await prisma.staff.create({
      data: {
        fullName: 'BS. Nguyễn Văn A',
        departmentId: khoaNoi.id,
        userId: doctorUser.id
      }
    });
    console.log('✅ Đã thêm Bác sĩ mẫu');
  }

  // 6. Thêm Bệnh nhân mẫu
  const patUsername = 'benhnhan01';
  let patientUser = await prisma.user.findUnique({ where: { username: patUsername } });
  if (!patientUser) {
    const passwordHash = await bcrypt.hash('123456', 10);
    patientUser = await prisma.user.create({
      data: {
        username: patUsername,
        passwordHash,
        roleId: patientRole.id,
      }
    });
    
    await prisma.patient.create({
      data: {
        fullName: 'Trần Thị B',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'NU',
        phone: '0987654321',
        email: 'tranthib@example.com',
        address: 'Thành phố Bắc Ninh',
        userId: patientUser.id
      }
    });
    console.log('✅ Đã thêm Bệnh nhân mẫu');
  }
  
  // 7. Thêm Giường bệnh
  const beds = ['G01', 'G02', 'G03', 'G04', 'G05'];
  for (const bedCode of beds) {
    await prisma.bed.upsert({
      where: { bedCode },
      update: {},
      create: { bedCode },
    });
  }
  console.log('✅ Đã thêm Giường bệnh');
  
  // 8. Thêm Thuốc (Medicine)
  const medicines = [
    { name: 'Paracetamol 500mg', unit: 'Viên' },
    { name: 'Amoxicillin 250mg', unit: 'Viên' },
    { name: 'Vitamin C', unit: 'Ống' },
    { name: 'Oresol', unit: 'Gói' }
  ];
  for (const med of medicines) {
    const exists = await prisma.medicine.findFirst({ where: { name: med.name } });
    if (!exists) {
      await prisma.medicine.create({ data: med });
    }
  }
  console.log('✅ Đã thêm Danh mục Thuốc');
  
  // 9. Thêm ICD10
  const icd10s = [
    { code: 'J00', name: 'Viêm mũi họng cấp (Cảm lạnh)' },
    { code: 'I10', name: 'Tăng huyết áp vô căn (nguyên phát)' },
    { code: 'E11', name: 'Bệnh tiểu đường không phụ thuộc insulin' },
    { code: 'K29', name: 'Viêm dạ dày và tá tràng' }
  ];
  for (const icd of icd10s) {
    await prisma.iCD10.upsert({
      where: { code: icd.code },
      update: {},
      create: icd,
    });
  }
  console.log('✅ Đã thêm Mã bệnh ICD10');

  console.log('🎉 Hoàn tất quá trình thêm dữ liệu mẫu (Seed) thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
