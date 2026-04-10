import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.warning('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        try {
            setIsLoading(true);
            const response = await api.post('/auth/login', { username, password });
            if (response.data.success) {
                handleLoginSuccess(response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (data) => {
        const user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Đăng nhập thành công!');
        
        // Redirect based on role
        if (['ADMIN', 'BACSI', 'YTA', 'TIEPTAN'].includes(user.role)) {
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card animate-fade-in">
                {/* Bên trái: Ảnh minh hoạ */}
                <div className="login-left">
                    <div className="login-left-image">
                        <img src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face" alt="Chăm sóc sức khoẻ" />
                    </div>
                    <h3>Chăm sóc sức khỏe toàn diện</h3>
                    <p>Chúng tôi tập trung vào trải nghiệm của bệnh nhân với tiêu chuẩn y tế quốc tế hàng đầu.</p>
                </div>

                {/* Bên phải: Form đăng nhập */}
                <div className="login-right">
                    <h2><span className="gradient-text">Chào mừng</span> trở lại</h2>
                    <p className="login-subtitle">
                        Vui lòng đăng nhập để tiếp tục quản lý hồ sơ sức khỏe của bạn
                    </p>

                    <form onSubmit={handleLogin}>
                        <div className="login-field">
                            <label><FaUser /> Tên đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Email hoặc Số điện thoại"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <div className="field-label-row">
                                <label><FaLock /> Mật khẩu</label>
                                <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
                            </div>
                            <div className="input-icon-right">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <span onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                        </div>

                        <label className="remember-me">
                            <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                            Duy trì đăng nhập
                        </label>

                        <button type="submit" className="btn-login" disabled={isLoading}>
                            {isLoading ? 'ĐANG ĐĂNG NHẬP...' : '→ ĐĂNG NHẬP'}
                        </button>
                    </form>

                    <p className="login-register-link">
                        Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
