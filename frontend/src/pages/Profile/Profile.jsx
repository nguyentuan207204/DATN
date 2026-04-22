import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    FaUser, FaCalendarAlt, FaHistory, FaPrescriptionBottle, FaFlask, 
    FaCog, FaSignOutAlt, FaCamera, FaEdit, FaKey, FaChevronDown, 
    FaBriefcaseMedical, FaIdCard, FaSpinner, FaCircle
} from 'react-icons/fa';
import { MdVerified, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ChangePasswordModal from './ChangePasswordModal';
import './Profile.css';


const NAV_ITEMS = [
    { path: '/profile', icon: <FaUser />, label: 'Thông tin cá nhân' },
    { path: '/profile/appointments', icon: <FaCalendarAlt />, label: 'Lịch hẹn của tôi' },
    { path: '/profile/history', icon: <FaHistory />, label: 'Lịch sử khám bệnh' },
];

// Chuyển yyyy-mm-dd -> dd/mm/yyyy cho hiển thị
const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
};

// Chuyển dd/mm/yyyy -> yyyy-mm-dd để gửi lên API
const formatDateForApi = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [d, m, y] = dateStr.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return null;
};

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', dob: '', gender: 'NAM', phone: '', email: '', insurance: '', address: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);


    // Lấy thông tin cá nhân từ API
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    const data = res.data.data;
                    setProfile(data);
                    setFormData({
                        fullName: data.fullName || '',
                        dob: formatDateForDisplay(data.dateOfBirth),
                        gender: data.gender || 'NAM',
                        phone: data.phone || '',
                        email: data.email || '',
                        insurance: data.insurance || '',
                        address: data.address || '',
                    });
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    toast.error('Không thể tải thông tin cá nhân');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await api.put('/auth/me', {
                fullName: formData.fullName,
                dateOfBirth: formatDateForApi(formData.dob),
                gender: formData.gender.toUpperCase(),
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
            });
            if (res.data.success) {
                toast.success('Cập nhật thông tin thành công!');
                const data = res.data.data;
                setProfile(data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Đã đăng xuất thành công');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="loading-state">
                    <FaSpinner className="spinner" />
                    <span>Đang tải thông tin cá nhân...</span>
                </div>
            </div>
        );
    }

    const username = profile?.username || '';
    const userId = profile?.userId || '';
    const joinYear = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2024';
    const patientCode = `BN${String(profile?.patientId || userId || '000000').padStart(6, '0')}`;

    const activeNav = NAV_ITEMS.find(item => location.pathname === item.path) || NAV_ITEMS[0];

    return (
        <div className="profile-page">
            <main className="profile-content">
                {/* Custom Navigation Dropdown */}
                <div className="profile-nav-dropdown">
                    <button
                        className="dropdown-toggle-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="toggle-content">
                            <span className="current-icon">{activeNav.icon}</span>
                            <span className="current-label">{activeNav.label}</span>
                        </div>
                        <FaChevronDown className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="dropdown-menu-list">
                            {NAV_ITEMS.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`dropdown-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <span className="item-icon">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                            <div className="dropdown-menu-divider" />
                            <Link
                                to="/profile/settings"
                                className="dropdown-menu-item"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <span className="item-icon"><FaCog /></span>
                                Cài đặt hệ thống
                            </Link>
                            <button className="dropdown-menu-item logout-item" onClick={handleLogout}>
                                <span className="item-icon"><FaSignOutAlt /></span>
                                Đăng xuất tài khoản
                            </button>
                        </div>
                    )}
                </div>

                <div className="profile-card">
                    <h2>Hồ sơ cá nhân</h2>
                    <p className="profile-card-sub">Quản lý thông tin định danh và cài đặt bảo mật của bạn.</p>

                    {/* Avatar + meta */}
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-wrap">
                            <div className="profile-avatar">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || username)}&background=1a73e8&color=fff&size=200`}
                                    alt="Avatar"
                                />
                            </div>
                            <button className="avatar-camera" title="Đổi ảnh đại diện">
                                <FaCamera />
                            </button>
                        </div>
                        <div className="profile-avatar-info">
                            <h3>{formData.fullName || username}</h3>
                            <div className="profile-meta">
                                <span className="meta-tag">
                                    <FaIdCard /> <strong>{patientCode}</strong>
                                </span>
                                <span className="meta-tag verified">
                                    <MdVerified /> Thành viên từ <strong>{joinYear}</strong>
                                </span>
                                <span className="meta-tag">
                                    <FaCircle style={{ fontSize: '8px', color: '#10b981' }} /> Trực tuyến
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleUpdate} className="profile-form">
                        <div className="form-row-2">
                            <div className="form-field">
                                <label>Họ và tên đầy đủ</label>
                                <input 
                                    type="text" 
                                    name="fullName" 
                                    value={formData.fullName} 
                                    onChange={handleChange} 
                                    placeholder="Ví dụ: Nguyễn Văn A" 
                                />
                            </div>
                            <div className="form-field">
                                <label>Ngày tháng năm sinh</label>
                                <div className="input-cal">
                                    <input 
                                        type="text" 
                                        name="dob" 
                                        value={formData.dob} 
                                        onChange={handleChange} 
                                        placeholder="DD/MM/YYYY" 
                                    />
                                    <span><FaCalendarAlt /></span>
                                </div>
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-field">
                                <label>Giới tính</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="NAM">Nam giới</option>
                                    <option value="NU">Nữ giới</option>
                                    <option value="KHAC">Khác</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Số điện thoại liên hệ</label>
                                <div className="input-cal">
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="09xx xxx xxx" 
                                    />
                                    <span><MdPhone /></span>
                                </div>
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-field">
                                <label>Địa chỉ Email</label>
                                <div className="input-cal">
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="email@example.com" 
                                    />
                                    <span><MdEmail /></span>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Số thẻ BHYT</label>
                                <div className="input-cal">
                                    <input 
                                        type="text" 
                                        name="insurance" 
                                        value={formData.insurance} 
                                        onChange={handleChange} 
                                        placeholder="GD401..." 
                                    />
                                    <span><FaBriefcaseMedical /></span>
                                </div>
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Địa chỉ thường trú</label>
                            <div className="input-cal">
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="Thành phố, Tỉnh, Quận/Huyện..." 
                                />
                                <span><MdLocationOn /></span>
                            </div>
                        </div>

                        <div className="profile-form-actions">
                            <button type="submit" className="btn-update" disabled={isUpdating}>
                                {isUpdating ? <FaSpinner className="spinner" /> : <FaEdit />}
                                {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-change-pass"
                                onClick={() => setShowPasswordModal(true)}
                            >
                                <FaKey style={{ opacity: 0.6 }} /> Đổi mật khẩu bảo mật
                            </button>
                        </div>

                    </form>
                </div>

                {/* Change Password Modal */}
                <ChangePasswordModal 
                    isOpen={showPasswordModal} 
                    onClose={() => setShowPasswordModal(false)} 
                />
            </main>
        </div>
    );
};


export default Profile;
