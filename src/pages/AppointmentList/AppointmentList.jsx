import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSearch, 
    FaFilter, FaPlus, FaStethoscope, FaUserMd, 
    FaChevronLeft, FaChevronRight, FaRegCalendarCheck,
    FaEllipsisV, FaUndo
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './AppointmentList.css';

const AppointmentList = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoading(true);
                const response = await api.get('/medical/appointments');
                if (response.data.success) {
                    setAppointments(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching appointments:", error);
                toast.error("Không thể tải danh sách lịch hẹn");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleCancelAppointment = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn khám này không?")) {
            try {
                const response = await api.put(`/medical/appointments/${id}/cancel`);
                if (response.data.success) {
                    toast.success("Hủy lịch hẹn thành công");
                    // Cập nhật lại state cục bộ thay vì fetch lại toàn bộ
                    setAppointments(appointments.map(apt => 
                        apt.id === id ? { ...apt, status: 'CANCELLED' } : apt
                    ));
                } else {
                    toast.error(response.data.message || "Không thể hủy lịch hẹn");
                }
            } catch (error) {
                console.error("Lỗi khi hủy lịch hẹn:", error);
                toast.error(error.response?.data?.message || "Lỗi máy chủ khi hủy lịch hẹn");
            }
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toUpperCase()) {
            case 'UPCOMING':
            case 'PENDING':
                return 'Sắp tới';
            case 'COMPLETED':
            case 'DONE':
                return 'Đã hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default: return status || 'Chưa xác định';
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'UPCOMING':
            case 'PENDING':
                return 'upcoming';
            case 'COMPLETED':
            case 'DONE':
                return 'completed';
            case 'CANCELLED':
                return 'cancelled';
            default: return '';
        }
    };

    const getServiceIcon = (serviceName) => {
        const name = serviceName?.toLowerCase() || '';
        if (name.includes('răng')) return <div className="service-icon dental"><FaCheckCircle /></div>;
        if (name.includes('x-quang') || name.includes('chụp')) return <div className="service-icon xray"><FaCalendarAlt /></div>;
        if (name.includes('dinh dưỡng')) return <div className="service-icon nutrition"><FaUserMd /></div>;
        return <FaStethoscope className="service-icon general" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && getStatusClass(apt.status) === filter;
    });

    const counts = {
        upcoming: appointments.filter(a => getStatusClass(a.status) === 'upcoming').length,
        completed: appointments.filter(a => getStatusClass(a.status) === 'completed').length,
        cancelled: appointments.filter(a => getStatusClass(a.status) === 'cancelled').length
    };

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <div className="appointment-list-page">
            <div className="appointment-container">
                <div className="page-header">
                    <h1 className="page-title">Danh sách lịch hẹn</h1>
                    <div className="header-actions">
                        <button className="icon-btn search-trigger"><FaSearch /></button>
                        <button className="icon-btn notification-trigger"><FaRegCalendarCheck /></button>
                        <button className="btn-add-appointment" onClick={() => navigate('/booking')}>
                            <FaPlus /> <span>Đặt lịch mới</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card upcoming">
                        <div className="card-icon"><FaCalendarAlt /></div>
                        <div className="card-info">
                            <span className="label">SẮP TỚI</span>
                            <span className="count">{String(counts.upcoming).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="summary-card completed">
                        <div className="card-icon"><FaCheckCircle /></div>
                        <div className="card-info">
                            <span className="label">HOÀN THÀNH</span>
                            <span className="count">{String(counts.completed).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="summary-card cancelled">
                        <div className="card-icon"><FaTimesCircle /></div>
                        <div className="card-info">
                            <span className="label">ĐÃ HỦY</span>
                            <span className="count">{String(counts.cancelled).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="filter-search-bar">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm bác sĩ hoặc dịch vụ..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >Tất cả</button>
                        <button 
                            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilter('upcoming')}
                        >Sắp tới</button>
                        <button 
                            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >Hoàn thành</button>
                        <button 
                            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >Đã hủy</button>
                    </div>
                    <button className="btn-advanced-filter">
                        <FaFilter /> <span>Bộ lọc</span>
                    </button>
                </div>

                {/* Appointment List */}
                <div className="appointments-list">
                    {loading ? (
                        <div className="loading-state">Đang tải danh sách lịch hẹn...</div>
                    ) : paginatedAppointments.length > 0 ? (
                        paginatedAppointments.map(apt => (
                            <div key={apt.id} className={`appointment-card status-${getStatusClass(apt.status)}`}>
                                <div className="apt-left">
                                    <div className="apt-icon-box">
                                        {getServiceIcon(apt.serviceName)}
                                    </div>
                                    <div className="apt-info">
                                        <h3 className="apt-service-name">{apt.serviceName}</h3>
                                        <div className="apt-doctor">
                                            <FaUserMd /> <span>{apt.doctorName}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="apt-middle">
                                    <span className="time-label">THỜI GIAN</span>
                                    <div className="apt-time">
                                        <FaCalendarAlt /> <span>{formatDate(apt.date)}</span>
                                        <span className="separator">•</span>
                                        <span>{formatTime(apt.date)}</span>
                                    </div>
                                </div>

                                <div className="apt-right">
                                    <div className={`status-badge ${getStatusClass(apt.status)}`}>
                                        {getStatusLabel(apt.status)}
                                    </div>
                                    <div className="apt-actions">
                                        {getStatusClass(apt.status) === 'upcoming' && (
                                            <>
                                                <button className="action-btn outline-blue">Sắp tới</button>
                                                <button className="action-icon-btn"><FaCalendarAlt /></button>
                                                <button className="action-icon-btn danger" onClick={() => handleCancelAppointment(apt.id)} title="Hủy lịch hẹn"><FaTimesCircle /></button>
                                            </>
                                        )}
                                        {getStatusClass(apt.status) === 'completed' && (
                                            <>
                                                <button className="action-btn success">Đã hoàn thành</button>
                                                <button className="action-btn text" onClick={() => navigate(`/profile/history/${apt.id}`)}>Xem kết quả</button>
                                            </>
                                        )}
                                        {getStatusClass(apt.status) === 'cancelled' && (
                                            <>
                                                <button className="action-btn gray">Đã hủy</button>
                                                <button className="action-btn blue-flat" onClick={() => navigate('/booking')}>Đặt lại lịch</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">Không tìm thấy lịch hẹn nào.</div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <span className="pagination-info">Hiển thị {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredAppointments.length)} trong số {filteredAppointments.length} lịch hẹn</span>
                        <div className="pagination-controls">
                            <button 
                                className="p-btn" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft />
                            </button>
                            {[...Array(totalPages)].map((_, idx) => (
                                <button 
                                    key={idx + 1}
                                    className={`p-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(idx + 1)}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button 
                                className="p-btn"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AppointmentList;
