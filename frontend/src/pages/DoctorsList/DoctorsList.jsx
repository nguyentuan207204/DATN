import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarCheck, FaSpinner } from 'react-icons/fa';
import api from '../../utils/api';
import './DoctorsList.css';

const SPECIALTIES = ['Tất cả', 'Bác sĩ', 'Y tá'];

// Avatar mặc định theo tên
const getAvatar = (name = '') => {
    const encoded = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encoded}&background=1a73e8&color=fff&size=120`;
};

const DoctorsList = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [selectedTab, setSelectedTab] = useState('Tất cả');
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [docRes, nurseRes] = await Promise.all([
                    api.get('/staff/doctors'),
                    api.get('/staff/nurses'),
                ]);
                setDoctors(docRes.data.data || []);
                setNurses(nurseRes.data.data || []);
            } catch (err) {
                setError('Không thể tải danh sách nhân viên y tế.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Gộp danh sách theo tab đang chọn
    const allStaff = [
        ...doctors.map(d => ({ ...d, type: 'Bác sĩ' })),
        ...nurses.map(n => ({ ...n, type: 'Y tá' })),
    ];

    const filtered = allStaff.filter(person => {
        const matchTab =
            selectedTab === 'Tất cả' ||
            person.type === selectedTab;
        const q = search.toLowerCase();
        const matchSearch =
            person.fullName?.toLowerCase().includes(q) ||
            person.departmentName?.toLowerCase().includes(q) ||
            person.type?.toLowerCase().includes(q);
        return matchTab && matchSearch;
    });

    const handleBooking = (doctorId) => {
        navigate(`/booking?doctorId=${doctorId}`);
    };

    return (
        <div className="dl-page">
            {/* Hero */}
            <div className="dl-hero">
                <h1>Đội ngũ Bác sĩ &amp; Y tá</h1>
                <p>
                    Hợp tác với các chuyên gia hàng đầu, tận tâm vì sức khỏe của bạn.
                    Đội ngũ y bác sĩ giàu kinh nghiệm, chuyên môn cao tại Bắc Ninh.
                </p>
            </div>

            <div className="dl-container">
                {/* Thanh tìm kiếm */}
                <div className="dl-search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc khoa..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="btn-search">Tìm kiếm</button>
                </div>

                {/* Bộ lọc tab */}
                <div className="dl-filters">
                    <span className="filter-label">Loại nhân viên:</span>
                    <div className="dl-filter-tabs">
                        {SPECIALTIES.map(spec => (
                            <button
                                key={spec}
                                className={`filter-tab ${selectedTab === spec ? 'active' : ''}`}
                                onClick={() => setSelectedTab(spec)}
                            >
                                {spec}
                                {spec === 'Bác sĩ' && !loading && (
                                    <span className="tab-count"> ({doctors.length})</span>
                                )}
                                {spec === 'Y tá' && !loading && (
                                    <span className="tab-count"> ({nurses.length})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trạng thái loading / lỗi */}
                {loading && (
                    <div className="dl-loading">
                        <FaSpinner className="spin" />
                        <span>Đang tải danh sách...</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="dl-error">{error}</div>
                )}

                {/* Danh sách nhân viên */}
                {!loading && !error && (
                    <>
                        <div className="dl-grid">
                            {filtered.map(person => (
                                <div className="dl-card" key={`${person.type}-${person.id}`}>
                                    <div className="dl-avatar-wrap">
                                        <img
                                            src={getAvatar(person.fullName)}
                                            alt={person.fullName}
                                            className="dl-avatar"
                                        />
                                        <span className={`dl-status ${person.type === 'Bác sĩ' ? 'available' : 'nurse'}`}></span>
                                    </div>
                                    <h3 className="dl-name" onClick={() => handleBooking(person.id)} style={{ cursor: 'pointer' }}>
                                        {person.fullName}
                                    </h3>
                                    <p className="dl-meta">
                                        <span className="dl-spec-tag">{person.type}</span>
                                        {person.departmentName && (
                                            <>
                                                <span className="dot">•</span>
                                                <span>{person.departmentName}</span>
                                            </>
                                        )}
                                    </p>

                                    <button className="dl-book-btn" onClick={() => handleBooking(person.id)}>
                                        <FaCalendarCheck /> Đặt lịch ngay
                                    </button>
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="dl-empty">
                                {allStaff.length === 0
                                    ? 'Chưa có dữ liệu nhân viên y tế trong hệ thống.'
                                    : 'Không tìm thấy nhân viên phù hợp.'}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorsList;
