import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    FaPrint, FaShareAlt, FaInfoCircle, FaHeartbeat, FaCheckCircle, FaSpinner,
    FaArrowLeft, FaCalendarAlt, FaUserMd, FaHospital, FaNotesMedical,
    FaWeight, FaTemperatureLow, FaLungs, FaFileInvoiceDollar, FaChevronRight
} from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './MedicalRecordDetail.css';

const MedicalRecordDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('BANKING');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/medical/record/${id}`);
                if (response.data.success) {
                    setRecord(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching record detail:", error);
                toast.error("Không thể tải chi tiết hồ sơ");
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
                    <span>Đang trích xuất dữ liệu hồ sơ chuyên sâu...</span>
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
        <div className="medical-detail-page">
            <div className="breadcrumb">
                <Link to="/profile/history">
                    <FaArrowLeft /> Lịch sử khám
                </Link>
                <FaChevronRight size={10} style={{ opacity: 0.3 }} />
                <span>Chi tiết đợt khám #{record.id}</span>
            </div>

            <div className="page-header">
                <div className="header-title-section">
                    <h1>Hồ sơ khám bệnh chi tiết</h1>
                    <div className="header-subtitle">
                        Mã định danh: <strong>#{record.id}</strong> <span style={{ margin: '0 1rem', opacity: 0.2 }}>|</span> Ngày thực hiện: <strong>{formatDate(record.visitDate)}</strong>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-action btn-print">
                        <FaPrint /> Xuất PDF
                    </button>
                    <button className="btn-action btn-share">
                        <FaShareAlt /> Chia sẻ
                    </button>
                </div>
            </div>

            <section className="info-section">
                <div className="section-title">
                    <FaInfoCircle /> Tổng quan đợt điều trị
                </div>
                <div className="info-cards-grid">
                    <div className="info-card">
                        <span className="card-label">Loại hình khám</span>
                        <span className="card-value">{record.departmentName || "Khám bệnh tổng quát"}</span>
                    </div>
                    <div className="info-card">
                        <span className="card-label">Bác sĩ điều trị</span>
                        <span className="card-value">{record.doctorName || "N/A"}</span>
                    </div>
                    <div className="info-card">
                        <span className="card-label">Đơn vị công tác</span>
                        <span className="card-value">Khoa {record.departmentName || "Nội tổng hợp"}</span>
                    </div>
                    <div className="info-card">
                        <span className="card-label">Trạng thái hồ sơ</span>
                        <div className="status-badge">
                            <FaCheckCircle /> Hoàn tất lưu trữ
                        </div>
                    </div>
                </div>
            </section>

            <div className="detail-layout">
                <div className="sidebar-column">
                    <div className="detail-card">
                        <div className="vitals-header">
                            <div className="section-title" style={{ marginBottom: 0, color: 'hsl(var(--foreground))' }}>
                                <FaHeartbeat style={{ color: '#ef4444' }} /> Chỉ số sinh tồn
                            </div>
                            <span className="vitals-update">Thời gian đo: 08:30</span>
                        </div>
                        <div className="vitals-list">
                            <div className="vital-item">
                                <span className="vital-label">Huyết áp</span>
                                <span className="vital-value">120/80 <small>mmHg</small></span>
                            </div>
                            <div className="vital-item">
                                <span className="vital-label">Nhiệt độ</span>
                                <span className="vital-value">36.5 <small>°C</small></span>
                            </div>
                            <div className="vital-item">
                                <span className="vital-label">Nhịp tim</span>
                                <span className="vital-value">75 <small>bpm</small></span>
                            </div>
                            <div className="vital-item">
                                <span className="vital-label">Nhịp thở</span>
                                <span className="vital-value">18 <small>/phút</small></span>
                            </div>
                            <div className="vital-item">
                                <span className="vital-label">Cân nặng</span>
                                <span className="vital-value">68 <small>kg</small></span>
                            </div>
                            <div className="vital-item">
                                <span className="vital-label">BMI</span>
                                <span className="vital-value">22.2 <small>Bình thường</small></span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-card">
                        <div className="section-title">
                            <FaNotesMedical /> Kết luận chuyên môn
                        </div>
                        {record.diagnoses && record.diagnoses.length > 0 ? (
                            record.diagnoses.map((diag, index) => (
                                <div key={index} className="diagnosis-group">
                                    <span className="diagnosis-label">{index === 0 ? "Bệnh lý chính (ICD-10)" : "Bệnh lý kèm theo"}</span>
                                    <div className={`diagnosis-box ${index > 0 ? 'secondary' : ''}`}>
                                        {diag.name} <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>[{diag.code}]</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="diagnosis-box">Chưa có thông tin chẩn đoán ghi nhận</div>
                        )}
                        <div className="diagnosis-group" style={{ marginTop: '2rem' }}>
                            <span className="diagnosis-label">Lời dặn & Hướng dẫn điều trị</span>
                            <div className="doctor-note">
                                {record.advice || "Tiếp tục theo dõi sức khỏe, nghỉ ngơi hợp lý. Tái khám ngay khi có các dấu hiệu bất thường trở lại."}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content-column">
                    {record.invoice && (
                        <div className="detail-card invoice-card">
                            <div className="section-title">
                                <FaFileInvoiceDollar style={{ color: 'hsl(var(--primary))' }} /> Chi phí & Thanh toán
                            </div>
                            
                            <div className="invoice-status-banner">
                                <span className={`status-tag ${record.invoice.status.toLowerCase()}`}>
                                    {record.invoice.status === 'PAID' ? 'Đã quyết toán' : 'Chờ thanh toán'}
                                </span>
                                <span className="invoice-date">Số HĐ: #{record.invoice.id}</span>
                            </div>

                            <div className="invoice-items">
                                {record.invoice.items.map((item, idx) => (
                                    <div key={idx} className="invoice-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.serviceName}</span>
                                            <span className="item-qty">x{item.quantity}</span>
                                        </div>
                                        <div className="item-price">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="invoice-total">
                                <span>Tổng chi phí đợt khám:</span>
                                <span className="total-amount">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.invoice.totalAmount)}
                                </span>
                            </div>

                            {record.invoice.status === 'UNPAID' && (
                                <div className="payment-actions">
                                    <label>Chọn phương thức thanh toán:</label>
                                    <div className="payment-methods">
                                        <button 
                                            className={`method-btn ${paymentMethod === 'BANKING' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('BANKING')}
                                        >
                                            Chuyển khoản
                                        </button>
                                        <button 
                                            className={`method-btn ${paymentMethod === 'QR' ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod('QR')}
                                        >
                                            Quét mã QR
                                        </button>
                                    </div>
                                    <button 
                                        className="btn-pay-now" 
                                        onClick={handlePayment}
                                        disabled={paying}
                                    >
                                        {paying ? <FaSpinner className="spinner" /> : <FaCheckCircle />}
                                        {paying ? 'Đang xử lý...' : 'Xác nhận thanh toán trực tuyến'}
                                    </button>
                                    <p className="payment-note">* Sau khi thanh toán thành công, trạng thái sẽ được cập nhật ngay lập tức.</p>
                                </div>
                            )}

                            {record.invoice.status === 'PAID' && (
                                <div className="payment-success-info">
                                    <FaCheckCircle className="success-icon" />
                                    <div>
                                        <strong>Thanh toán hoàn tất</strong>
                                        <p>Hồ sơ đã được quyết toán và lưu kho lưu trữ điện tử.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <footer className="medical-footer">
                <p>&copy; 2024 Phòng khám Đa khoa Quốc tế. Chứng nhận bởi ISO 9001:2015</p>
                <div className="footer-links">
                    <a href="#">Bảo mật dữ liệu y tế</a>
                    <a href="#">Quyền lợi bệnh nhân</a>
                    <a href="#">Liên hệ khẩn cấp: 1900 6868</a>
                </div>
            </footer>
        </div>
    );
};

export default MedicalRecordDetail;
