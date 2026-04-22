import React from 'react';
import './EMRPrint.css';

const ExaminationPrint = ({ record, isPreview = false }) => {
    if (!record) return null;

    return (
        <div className={`emr-print-container examination-sheet ${isPreview ? 'emr-preview-mode' : ''}`}>
            <div className="print-header">
                <div className="clinic-info">
                    <h3>SỞ Y TẾ TỈNH BẮC NINH</h3>
                    <h4>PHÒNG KHÁM ĐA KHOA QUỐC TẾ DATN</h4>
                    <p>Địa chỉ: Số 123, Đường Lý Thái Tổ, TP. Bắc Ninh</p>
                    <p>Điện thoại: 0222.1234.567</p>
                </div>
                <div className="sheet-id">
                    <p>Mã HS: <strong>#{record.id}</strong></p>
                    <p>Mã BN: <strong>#{record.patientId || 'N/A'}</strong></p>
                </div>
            </div>

            <div className="sheet-title">
                <h1>PHIẾU KHÁM BỆNH</h1>
                <p>Ngày khám: {new Date(record.visitDate).toLocaleDateString('vi-VN')} {new Date(record.visitDate).toLocaleTimeString('vi-VN')}</p>
            </div>

            <div className="patient-section">
                <div className="row">
                    <div className="col">Họ tên: <strong>{record.patientName?.toUpperCase()}</strong></div>
                    <div className="col">Ngày sinh: {record.dob ? new Date(record.dob).toLocaleDateString('vi-VN') : '.../.../....'}</div>
                    <div className="col">Giới tính: {record.gender || '...'}</div>
                </div>
                <div className="row">
                    <div className="col">Địa chỉ: {record.address || '................................................................................'}</div>
                </div>
                <div className="row">
                    <div className="col">Đối tượng: BHYT/Dịch vụ</div>
                    <div className="col">Số thẻ BHYT (nếu có): ...............................</div>
                </div>
            </div>

            <div className="content-section">
                <div className="section-block">
                    <h4>1. LÝ DO KHÁM BỆNH:</h4>
                    <p>{record.reason || '................................................................................'}</p>
                </div>

                <div className="section-block">
                    <h4>2. HỎI BỆNH / QUÁ TRÌNH BỆNH LÝ:</h4>
                    <p>{record.pathology || '................................................................................'}</p>
                </div>

                <div className="section-block">
                    <h4>3. CÁC CHỈ SỐ SINH TỒN:</h4>
                    <div className="vitals-table">
                        <div className="v-item">Mạch: {record.heartRate || '...'} lần/phút</div>
                        <div className="v-item">Nhiệt độ: {record.temperature || '...'} °C</div>
                        <div className="v-item">Huyết áp: {record.bloodPressure || '.../...'} mmHg</div>
                        <div className="v-item">Nhịp thở: {record.respiratoryRate || '...'} lần/phút</div>
                        <div className="v-item">Cân nặng: {record.weight || '...'} kg</div>
                        <div className="v-item">Chiều cao: {record.height || '...'} cm</div>
                    </div>
                </div>

                <div className="section-block">
                    <h4>4. CHẨN ĐOÁN (ICD-10):</h4>
                    <div className="diagnosis-list">
                        {record.diagnoses && record.diagnoses.length > 0 ? (
                            record.diagnoses.map((d, i) => (
                                <p key={i}>- <strong>[{d.code}]</strong> {d.name}</p>
                            ))
                        ) : (
                            <p>................................................................................</p>
                        )}
                    </div>
                </div>

                <div className="section-block">
                    <h4>5. HƯỚNG XỬ TRÍ / LỜI DẶN:</h4>
                    <p className="advice-text">{record.advice || '................................................................................'}</p>
                </div>
            </div>

            <div className="print-footer">
                <div className="footer-col">
                    <p>BỆNH NHÂN / NGƯỜI NHÀ</p>
                    <p className="signature-space">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="footer-col">
                    <p>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                    <p>BÁC SĨ KHÁM BỆNH</p>
                    <p className="signature-space">(Ký và ghi rõ họ tên)</p>
                    <p className="doctor-name"><strong>{record.doctorName}</strong></p>
                </div>
            </div>
        </div>
    );
};

export default ExaminationPrint;
