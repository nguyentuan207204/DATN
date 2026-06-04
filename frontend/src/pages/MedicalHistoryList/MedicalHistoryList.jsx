import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, FaUserMd, FaChevronRight, FaSearch, 
    FaFilter, FaNotesMedical, FaStethoscope, FaSpinner,
    FaHistory, FaArrowRight, FaShieldAlt, FaPlus, FaCheck, FaFolderOpen, FaMicroscope
} from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import QRPaymentModal from '../../components/Admin/QRPaymentModal/QRPaymentModal';
import './MedicalHistoryList.css';

const MedicalHistoryList = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [qrModal, setQrModal] = useState({ open: false, invoiceId: null });

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/medical/history');
            if (response.data.success) {
                setHistory(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching medical history:", error);
            toast.error("Không thể tải lịch sử khám bệnh");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item => 
        item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.diagnoses?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate stats
    const totalVisits = history.length;
    const lastVisitDate = history.length > 0 ? formatDate(history[0].visitDate) : 'N/A';
    const lastVisitStr = lastVisitDate !== 'N/A' ? lastVisitDate.split(' ')[0] : 'N/A';
    const lastMonthStr = lastVisitDate !== 'N/A' ? lastVisitDate.split(' ').slice(1).join(' ') : '';
    const uniqueDoctors = new Set(history.map(h => h.doctorName)).size;

    return (
        <div className="list-page-container">
            {/* Redesigned Hero Header */}
            <header className="list-header animate-fade-in">
                <div className="header-left">
                    <div className="header-badge">
                        <FaMicroscope /> <span>Khai thác dữ liệu y tế</span>
                    </div>
                    <h2>
                        Hồ sơ <span>Lịch sử khám</span>
                    </h2>
                    <p>
                        Hệ thống lưu trữ bệnh án tập trung, giúp bạn dễ dàng theo dõi và quản lý dữ liệu sức khỏe cá nhân theo thời gian.
                    </p>
                </div>

                <div className="header-right">
                    <div className="stats-dashboard">
                        <div className="stat-item">
                            <span className="stat-label">Tổng đợt khám</span>
                            <span className="stat-value">{totalVisits}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Bác sĩ tư vấn</span>
                            <span className="stat-value">{uniqueDoctors}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Đợt khám Gần nhất</span>
                            <span className="stat-value">
                                {lastVisitStr} <small style={{ fontSize: '0.9rem', opacity: 0.5 }}>({lastMonthStr})</small>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Optimized Search Bar */}
            <div className="bar-container">
                <div className="search-filter-bar">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tra cứu nhanh theo tên bác sĩ, bệnh lý hoặc kết quả..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn">
                        <FaFilter /> <span>Lọc kết quả</span>
                    </button>
                </div>
            </div>

            {/* Content List */}
            <main className="history-list-wrapper">
                {loading ? (
                    <div className="loading-screen">
                        <FaSpinner className="spinner" />
                        <p>Đang đồng bộ dữ liệu y khoa từ trung tâm bảo mật...</p>
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <>
                        <div className="history-item-header">
                            <div>Ngày thăm khám</div>
                            <div>Bác sĩ phụ trách</div>
                            <div>Kết luận chẩn đoán</div>
                            <div style={{ textAlign: 'center' }}>Thanh toán viện phí</div>
                            <div style={{ textAlign: 'right' }}>Thao tác</div>
                        </div>

                        {filteredHistory.map((item, index) => (
                            <article 
                                key={item.id} 
                                className="history-item-row"
                                style={{ animationDelay: `${index * 0.08}s` }}
                                onClick={() => navigate(`/profile/history/${item.id}`)}
                            >
                                <div className="col-date">
                                    <FaCalendarAlt />
                                    <span>{formatDate(item.visitDate)}</span>
                                </div>
                                
                                <div className="col-doctor">
                                    <div className="doctor-avatar">
                                        <FaUserMd />
                                    </div>
                                    <div className="doctor-info">
                                        <span className="doctor-name">{item.doctorName}</span>
                                        <span className="doctor-dept">Chuyên khoa khám</span>
                                    </div>
                                </div>
                                
                                <div className="col-diagnosis" title={item.diagnoses}>
                                    {item.diagnoses || "Đang chờ cập nhật..."}
                                </div>
                                
                                <div className="col-status" onClick={(e) => e.stopPropagation()}>
                                    {item.invoiceId ? (
                                        item.invoiceStatus === 'PAID' ? (
                                            <span className="badge-payment paid" title="Đã thanh toán viện phí">
                                                Đã thanh toán ({Number(item.invoiceTotal).toLocaleString('vi-VN')} đ)
                                            </span>
                                        ) : item.invoiceStatus === 'UNPAID' ? (
                                            <span className="badge-payment unpaid" title="Chưa thanh toán viện phí">
                                                Chưa thanh toán ({Number(item.invoiceTotal).toLocaleString('vi-VN')} đ)
                                            </span>
                                        ) : (
                                            <span className="badge-payment cancelled">
                                                Đã hủy
                                            </span>
                                        )
                                    ) : (
                                        <span className="badge-payment no-invoice">
                                            Không có HĐ
                                        </span>
                                    )}
                                </div>
                                
                                <div className="col-action" onClick={(e) => e.stopPropagation()}>
                                    {item.invoiceId && item.invoiceStatus === 'UNPAID' ? (
                                        <button 
                                            className="btn-pay-qr-history"
                                            onClick={() => setQrModal({ open: true, invoiceId: item.invoiceId })}
                                        >
                                            Thanh toán QR
                                        </button>
                                    ) : (
                                        <div 
                                            className="btn-quick-view"
                                            onClick={() => navigate(`/profile/history/${item.id}`)}
                                        >
                                            <FaPlus />
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </>
                ) : (
                    <section className="empty-screen">
                        <FaFolderOpen size={48} style={{ opacity: 0.15, marginBottom: '1.5rem', color: 'hsl(var(--primary))' }} />
                        <h3>Chưa có hồ sơ khám bệnh</h3>
                        <p>Dữ liệu y tế của bạn sẽ tự động xuất hiện tại đây sau khi bạn thực hiện các đợt khám tại hệ thống.</p>
                        <button className="btn-primary-premium" onClick={() => navigate('/booking')}>
                            Đặt lịch hẹn ngay
                        </button>
                    </section>
                )}
            </main>

            {qrModal.open && (
                <QRPaymentModal 
                    invoiceId={qrModal.invoiceId}
                    patientName="Bệnh nhân"
                    onClose={() => setQrModal({ open: false, invoiceId: null })}
                    onSuccess={fetchHistory}
                />
            )}
        </div>
    );
};

export default MedicalHistoryList;
