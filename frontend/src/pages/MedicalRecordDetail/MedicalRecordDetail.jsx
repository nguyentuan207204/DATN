import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    FaPrint, FaShareAlt, FaInfoCircle, FaHeartbeat, FaCheckCircle, FaSpinner,
    FaArrowLeft, FaCalendarAlt, FaUserMd, FaHospital, FaNotesMedical,
    FaWeight, FaTemperatureLow, FaLungs, FaFileInvoiceDollar, FaChevronRight,
    FaPrescriptionBottleAlt, FaInfo
} from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ExaminationPrint from '../Admin/EMR/components/ExaminationPrint';
import TreatmentSheet from '../Admin/EMR/components/TreatmentSheet';
import './MedicalRecordDetail.css';

const MedicalRecordDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('BANKING');
    const [activePrintSheet, setActivePrintSheet] = useState(null); // 'EXAM' or 'TREAT'
    const [showPreview, setShowPreview] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/medical/record/${id}`);
                if (response.data.success) {
                    setRecord(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching record detail:", error);
                const status = error.response?.status;
                if (status === 404) {
                    toast.error("Hồ sơ bệnh án không tồn tại hoặc đã bị xóa");
                } else if (status === 500) {
                    toast.error("Lỗi hệ thống máy chủ, vui lòng thử lại sau");
                } else {
                    toast.error("Không thể tải chi tiết hồ sơ. Vui lòng kiểm tra kết nối");
                }
                setRecord(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handlePayment = async () => {
        if (!record.invoice) return;
        setPaying(true);
        try {
            const res = await api.post(`/medical/invoices/${record.invoice.id}/pay`, { method: paymentMethod });
            if (res.data.success) {
                toast.success("Thanh toán thành công!");
                // Refresh data
                const response = await api.get(`/medical/record/${id}`);
                if (response.data.success) {
                    setRecord(response.data.data);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Thanh toán thất bại");
        } finally {
            setPaying(false);
        }
    };

    const handlePrintRequest = (type) => {
        setActivePrintSheet(type);
        setShowPreview(true);
    };

    const executePrint = () => {
        window.print();
        setShowPreview(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="medical-detail-page">
                <div className="loading-state">
                    <FaSpinner className="spinner" />
                    <span>Đang kết nối trung tâm dữ liệu y khoa...</span>
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="medical-detail-page">
                <div className="empty-state">
                    <h3>Không tìm thấy hồ sơ</h3>
                    <button className="btn-primary" onClick={() => navigate('/profile/history')}> Quay lại danh sách </button>
                </div>
            </div>
        );
    }

    return (
        <div className="medical-detail-page" ref={printRef}>
            <div className="no-print breadcrumb">
                <Link to="/profile/history">
                    <FaArrowLeft /> Lịch sử khám
                </Link>
                <FaChevronRight size={10} style={{ opacity: 0.3, margin: '0 0.5rem' }} />
                <span>Chi tiết đợt khám #{record.id}</span>
            </div>

            <div className="page-header">
                <div className="header-title-section">
                    <h1>Hồ sơ bệnh án điện tử</h1>
                    <div className="header-subtitle">
                        Mã định danh: <strong>#{record.id}</strong> 
                        <span className="separator">|</span> 
                        Ngày thực hiện: <strong>{formatDate(record.visitDate)}</strong>
                    </div>
                </div>
                <div className="header-actions no-print">
                    <button className="btn-action btn-print btn-secondary" onClick={() => handlePrintRequest('TREAT')}>
                        <FaNotesMedical /> Tờ điều trị
                    </button>
                    <button className="btn-action btn-print" onClick={() => handlePrintRequest('EXAM')}>
                        <FaPrint /> Phiếu khám
                    </button>
                </div>
            </div>

            <div className="detail-grid">
                {/* Cột trái: Thông tin tổng quan và vitals */}
                <div className="side-column">
                    <section className="detail-section">
                        <div className="section-title">
                            <FaInfoCircle /> Thông tin chung
                        </div>
                        <div className="info-list">
                            <div className="info-item">
                                <span className="label">Khoa điều trị</span>
                                <span className="value">{record.departmentName || "Nội tổng quát"}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Bác sĩ phụ trách</span>
                                <span className="value doctor-highlight">{record.doctorName}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Bệnh viện</span>
                                <span className="value">Đa khoa Quốc tế Bắc Ninh</span>
                            </div>
                        </div>
                    </section>

                    <section className="detail-section vitals-section">
                        <div className="section-title">
                            <FaHeartbeat /> Chỉ số 
                        </div>
                        <div className="vitals-grid">
                            <div className="vital-card">
                                <FaHeartbeat className="vital-icon heart" />
                                <div className="vital-info">
                                    <span className="vital-label">Huyết áp</span>
                                    <span className="vital-value">{record.bloodPressure || "--/--"} <small>mmHg</small></span>
                                </div>
                            </div>
                            <div className="vital-card">
                                <FaHeartbeat className="vital-icon rate" />
                                <div className="vital-info">
                                    <span className="vital-label">Nhịp tim</span>
                                    <span className="vital-value">{record.heartRate || "--"} <small>bpm</small></span>
                                </div>
                            </div>
                            <div className="vital-card">
                                <FaTemperatureLow className="vital-icon temp" />
                                <div className="vital-info">
                                    <span className="vital-label">Nhiệt độ</span>
                                    <span className="vital-value">{record.temperature || "--"} <small>°C</small></span>
                                </div>
                            </div>
                            <div className="vital-card">
                                <FaWeight className="vital-icon weight" />
                                <div className="vital-info">
                                    <span className="vital-label">Cân nặng</span>
                                    <span className="vital-value">{record.weight || "--"} <small>kg</small></span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Cột phải: Chẩn đoán, đơn thuốc, hóa đơn */}
                <div className="main-column">
                    <section className="detail-section clinical-section">
                        <div className="section-title">
                            <FaNotesMedical /> Kết luận chuyên môn
                        </div>
                        <div className="diagnosis-container">
                            {record.diagnoses && record.diagnoses.length > 0 ? (
                                record.diagnoses.map((diag, idx) => (
                                    <div key={idx} className={`diagnosis-item ${idx === 0 ? 'primary' : ''}`}>
                                        <div className="diag-header">
                                            <span className="diag-badge">{idx === 0 ? 'Chẩn đoán chính' : 'Chẩn đoán kèm theo'}</span>
                                            <span className="diag-code">Mã ICD: {diag.code}</span>
                                        </div>
                                        <div className="diag-name">{diag.name}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-notice">Không có thông tin chẩn đoán ICD-10</div>
                            )}
                        </div>

                        <div className="advice-box">
                            <div className="advice-header">
                                <FaInfo /> Lời dặn của bác sĩ
                            </div>
                            <p className="advice-content">
                                {record.advice || "Tiếp tục theo dõi sức khỏe tại nhà. Tái khám ngay khi có triệu chứng bất thường."}
                            </p>
                        </div>
                    </section>

                    {record.prescription && record.prescription.length > 0 && (
                        <section className="detail-section prescription-section">
                            <div className="section-title">
                                <FaPrescriptionBottleAlt /> Đơn thuốc chỉ định
                            </div>
                            <div className="prescription-list">
                                {record.prescription.map((med, idx) => (
                                    <div key={idx} className="med-item">
                                        <div className="med-count">{idx + 1}</div>
                                        <div className="med-details">
                                            <div className="med-name">{med.name}</div>
                                            <div className="med-dosage">Sử dụng: {med.dosage}</div>
                                        </div>
                                        <div className="med-qty">SL: {med.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {record.invoice && (
                        <section className="detail-section invoice-section">
                            <div className="section-title">
                                <FaFileInvoiceDollar /> Quyết toán đợt khám
                            </div>
                            <div className={`invoice-card-premium ${record.invoice.status.toLowerCase()}`}>
                                <div className="invoice-header">
                                    <div className="inv-info">
                                        <span className="inv-label">Hóa đơn số</span>
                                        <span className="inv-value">#{record.invoice.id}</span>
                                    </div>
                                    <div className={`inv-status-badge ${record.invoice.status.toLowerCase()}`}>
                                        {record.invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </div>
                                </div>

                                <div className="invoice-body">
                                    {record.invoice.items.map((item, idx) => (
                                        <div key={idx} className="inv-row">
                                            <span>{item.serviceName}</span>
                                            <span className="price-tag">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="invoice-footer">
                                    <div className="total-row">
                                        <span>Tổng cộng</span>
                                        <span className="total-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.invoice.totalAmount)}</span>
                                    </div>
                                    
                                    {record.invoice.status === 'UNPAID' && (
                                        <div className="no-print payment-controls">
                                            <select 
                                                className="payment-select"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            >
                                                <option value="BANKING">Chuyển khoản ngân hàng</option>
                                                <option value="QR">Quét mã QR (VNPay/Momo)</option>
                                            </select>
                                            <button className="btn-pay-premium" onClick={handlePayment} disabled={paying}>
                                                {paying ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                                                {paying ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <footer className="detail-footer no-print">
                <p>&copy; 2024 Phòng khám Đa khoa DATN. Hồ sơ này được ký số bảo mật bởi Hệ thống Y tế DATN.</p>
            </footer>

            {/* Hidden components for printing */}
            {activePrintSheet === 'EXAM' && <ExaminationPrint record={record} />}
            {activePrintSheet === 'TREAT' && <TreatmentSheet record={record} />}

            {/* Print Preview Modal */}
            {showPreview && (
                <div className="preview-modal-overlay no-print">
                    <div className="preview-modal-content">
                        <div className="preview-header">
                            <h2>Xem trước bản in</h2>
                            <div className="preview-actions">
                                <button className="btn-secondary" onClick={() => setShowPreview(false)}>Đóng</button>
                                <button className="btn-primary" onClick={executePrint}>
                                    <FaPrint /> Xác nhận In
                                </button>
                            </div>
                        </div>
                        <div className="preview-body">
                            <div className="preview-paper">
                                {activePrintSheet === 'EXAM' ? <ExaminationPrint record={record} isPreview /> : <TreatmentSheet record={record} isPreview />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordDetail;
