import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaChevronDown, FaSignOutAlt, FaUser, FaHistory, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import logoUrl from '../../../assets/logo.png';
import './Header.css';

const Header = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch (e) { }
        }
    }, []);

    const roleMap = {
        'ADMIN': 'Quản trị viên',
        'BACSI': 'Bác sĩ',
        'YTA': 'Y tá',
        'TIEPTAN': 'Tiếp tân',
        'BENHNHAN': 'Bệnh nhân'
    };

    const isAdmin = user && ['ADMIN', 'BACSI', 'YTA', 'TIEPTAN'].includes(user.role);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setDropdownOpen(false);
        toast.info('Đã đăng xuất thành công');
        navigate('/');
    };

    return (
        <header className="header glass sticky-header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="logo-section">
                    <img src={logoUrl} alt="Logo Phòng Khám" className="logo-image" />
                    <div className="logo-text">
                        <h2>Phòng khám Đa khoa Tỉnh Bắc Ninh</h2>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="navigation">
                    <ul>
                        <li><Link to="/">Trang chủ</Link></li>
                        <li><Link to="/services">Dịch vụ</Link></li>
                        <li><Link to="/booking">Đặt lịch</Link></li>
                        <li><Link to="/doctors">Đội ngũ bác sĩ</Link></li>
                        <li><Link to="/news">Tin tức</Link></li>
                        {isAdmin && <li><Link to="/admin/dashboard" className="admin-nav-link">Quản trị</Link></li>}
                    </ul>
                </nav>

                {/* Actions & Auth */}
                <div className="header-right">
                    <div className="help-center-contact">
                        <div className="icon-wrapper">
                            <FaPhoneAlt />
                        </div>
                        <div className="contact-text">
                            <span className="contact-label">Hotline 24/7</span>
                            <span className="contact-number">1900 6789</span>
                        </div>
                    </div>

                    {user ? (
                        <div className="user-menu-wrap">
                            <button
                                className="user-menu-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1a73e8&color=fff&size=40`}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                                <div className="user-info">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-role">{roleMap[user.role] || 'Bệnh nhân'}</span>
                                </div>
                                <FaChevronDown className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="user-dropdown animate-fade-in shadow-xl">
                                    <div className="dropdown-header">
                                        <div className="dropdown-user-info">
                                            <span className="dropdown-username">{user.username}</span>
                                            <span className="dropdown-role-badge">{roleMap[user.role] || 'Bệnh nhân'}</span>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <div className="dropdown-links">
                                        {isAdmin && (
                                            <Link to="/admin/dashboard" className="dropdown-item admin-item" onClick={() => setDropdownOpen(false)}>
                                                <div className="item-icon"><FaChartLine /></div>
                                                <span>Trang quản trị</span>
                                            </Link>
                                        )}
                                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <div className="item-icon"><FaUser /></div>
                                            <span>Thông tin cá nhân</span>
                                        </Link>
                                        <Link to="/profile/appointments" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <div className="item-icon"><FaCalendarAlt /></div>
                                            <span>Lịch hẹn của tôi</span>
                                        </Link>
                                        <Link to="/profile/history" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <div className="item-icon"><FaHistory /></div>
                                            <span>Lịch sử khám bệnh</span>
                                        </Link>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item danger" onClick={handleLogout}>
                                        <div className="item-icon"><FaSignOutAlt /></div>
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-login-header">Đăng nhập</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
