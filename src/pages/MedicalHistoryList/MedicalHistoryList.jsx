import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaCalendarAlt, FaUserMd, FaHospital, FaChevronRight, FaArrowRight, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './MedicalHistoryList.css';

const MedicalHistoryList = () => {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.warn("Vui lòng đăng nhập để xem lịch sử");
                navigate('/login');
                return;
            }

            try {
                const response = await api.get('/medical/history');
                if (response.data.success) {
                    setHistoryData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
                if (error.response?.status === 401) {
                    toast.error("Phiên làm việc hết hạn, vui lòng đăng nhập lại");
                    // localStorage.removeItem('token'); // Optional: clear token
                    // navigate('/login');
                } else {
                    toast.error("Không thể tải lịch sử khám bệnh");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="list-page-container">
            <div className="list-header">
                <h2>Lịch sử khám bệnh</h2>
                <p>Danh sách các đợt khám bệnh của bạn tại phòng khám.</p>
            </div>

            <div className="records-grid">
                {loading ? (
                    <div className="loading-state">
                        <FaSpinner className="spinner" /> <span>Đang tải dữ liệu...</span>
                    </div>
                ) : historyData.length > 0 ? (
                    historyData.map((record) => (
                        <div key={record.id} className="record-card" onClick={() => navigate(`/profile/history/${record.id}`)}>
                            <div className="record-card-header">
                                <span className="record-date">
                                    <FaCalendarAlt /> {formatDate(record.visitDate)}
                                </span>
                                <span className="record-id">#{record.id}</span>
                            </div>
                            <h3 className="record-reason">
                                <FaHistory style={{ color: 'hsl(var(--primary))' }} /> 
                                {record.diagnoses || "Khám bệnh - Tư vấn"}
                            </h3>
                            <div className="record-details">
                                <div className="detail-item">
                                    <FaUserMd /> <span>Bác sĩ: {record.doctorName || "N/A"}</span>
                                </div>
                                <div className="detail-item">
                                    <FaHospital /> <span>Phòng khám đa khoa Bắc Ninh</span>
                                </div>
                            </div>
                            <div className="record-footer">
                                <span className="status-label">Hoàn thành</span>
                                <button className="btn-view-detail">
                                    Chi tiết <FaArrowRight />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">Không có dữ liệu lịch sử khám bệnh.</div>
                )}
            </div>
        </div>
    );
};

export default MedicalHistoryList;
