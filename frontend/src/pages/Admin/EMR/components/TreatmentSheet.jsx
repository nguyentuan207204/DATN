import React from 'react';
import './EMRPrint.css';

const TreatmentSheet = ({ record, isPreview = false }) => {
    if (!record) return null;

    return (
        <div className={`emr-print-container treatment-sheet ${isPreview ? 'emr-preview-mode' : ''}`}>
            <div className="print-header">
                <div className="clinic-info">
                    <h3>SỞ Y TẾ TỈNH BẮC NINH</h3>
                    <h4>PHÒNG KHÁM ĐA KHOA QUỐC TẾ DATN</h4>
                </div>
                <div className="sheet-id">
                    <p>Mã HS: <strong>#{record.id}</strong></p>
                </div>
            </div>

            <div className="sheet-title">
                <h1>TỜ ĐIỀU TRỊ</h1>
                <p>Số: ........./TĐT</p>
            </div>

            <div className="patient-summary">
                <div className="row">
                    <span>Họ tên: <strong>{record.patientName?.toUpperCase()}</strong></span>
                    <span>Tuổi: {record.age || '...'}</span>
                    <span>Giới tính: {record.gender}</span>
                    <span>Số giường: .......</span>
                    <span>Buồng: .......</span>
                </div>
                <div className="row">
                    <span>Chẩn đoán: <strong>{record.diagnoses?.[0]?.name}</strong></span>
                </div>
            </div>

            <table className="treatment-table">
                <thead>
                    <tr>
                        <th width="15%">NGÀY GIỜ</th>
                        <th width="40%">DIỄN BIẾN BỆNH</th>
                        <th width="45%">Y LỆNH (Thuốc, Chế độ ăn, Chế độ chăm sóc)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="center">
                            {new Date(record.visitDate).toLocaleDateString('vi-VN')}<br/>
                            {new Date(record.visitDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                            <p>- Tiếp nhận bệnh nhân.</p>
                            <p>- Tỉnh táo, tiếp xúc tốt.</p>
                            <p>- Các chỉ số sinh tồn ổn định.</p>
                            <p>- {record.pathology || 'Không có diễn biến bất thường.'}</p>
                        </td>
                        <td>
                            <div className="order-block">
                                <strong>1. Thuốc:</strong>
                                {record.prescription && record.prescription.length > 0 ? (
                                    record.prescription.map((m, i) => (
                                        <p key={i}>+ {m.name}: {m.dosage} (SL: {m.quantity})</p>
                                    ))
                                ) : (
                                    <p>+ Không kê đơn.</p>
                                )}
                            </div>
                            <div className="order-block">
                                <strong>2. Chế độ ăn:</strong> {record.diet || 'Bình thường'}
                            </div>
                            <div className="order-block">
                                <strong>3. Chăm sóc:</strong> {record.nursing || 'Cấp III'}
                            </div>
                            <div className="doctor-sig">
                                <p>Bác sĩ y lệnh</p>
                                <br/><br/>
                                <p><strong>{record.doctorName}</strong></p>
                            </div>
                        </td>
                    </tr>
                    {/* Placeholder for more rows */}
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="empty-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TreatmentSheet;
