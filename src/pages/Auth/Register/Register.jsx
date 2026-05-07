import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '', dob: '', phone: '', email: '',
        gender: 'nam', username: '', password: '', confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            toast.warning('Vui lòng nhập Tên đăng nhập và Mật khẩu'); return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu nhập lại không khớp'); return;
        }
        try {
            setIsLoading(true);
            let formattedDob = null;
            if (formData.dob) {
                if (/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
                    formattedDob = formData.dob;
                } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob)) {
                    const [d, m, y] = formData.dob.split('/');
                    formattedDob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
            }
            const response = await api.post('/auth/register', {
                username: formData.username,
                password: formData.password,
                roleId: 5,
                fullName: formData.fullName,
                dob: formattedDob,
                phone: formData.phone,
                email: formData.email,
                gender: formData.gender ? formData.gender.toUpperCase() : 'NAM'
            });
            if (response.data.success) {
                toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card animate-fade-in">
                {/* Bên trái: Form */}
                <div className="register-left">
                    <h2><span className="gradient-text">Đăng ký</span> tài khoản</h2>
                    <p className="register-subtitle">Tham gia cộng đồng chăm sóc sức khỏe của chúng tôi để nhận dịch vụ y tế tốt nhất ngay hôm nay.</p>

                    <form onSubmit={handleRegister}>
                        <div className="reg-row">
                            <div className="reg-field">
                                <label>Họ và tên</label>
                                <input type="text" name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} />
                            </div>
                            <div className="reg-field">
                                <label>Ngày sinh</label>
                                <div className="input-icon-right">
                                    <input type="text" name="dob" placeholder="dd/mm/yyyy" value={formData.dob} onChange={handleChange} />
                                    <span><FaCalendarAlt /></span>
                                </div>
                            </div>
                        </div>

                        <div className="reg-row">
                            <div className="reg-field">
                                <label>Số điện thoại</label>
                                <input type="text" name="phone" placeholder="0987 654 321" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="reg-field">
                                <label>Email</label>
                                <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="reg-field">
                            <label>Giới tính</label>
                            <div className="gender-row">
                                <label className={`gender-btn ${formData.gender === 'nam' ? 'active' : ''}`}>
                                    <input type="radio" name="gender" value="nam" checked={formData.gender === 'nam'} onChange={handleChange} />
                                    Nam
                                </label>
                                <label className={`gender-btn ${formData.gender === 'nu' ? 'active' : ''}`}>
                                    <input type="radio" name="gender" value="nu" checked={formData.gender === 'nu'} onChange={handleChange} />
                                    Nữ
                                </label>
                            </div>
                        </div>

                        <div className="reg-field">
                            <label>Tên đăng nhập</label>
                            <input type="text" name="username" placeholder="username123" value={formData.username} onChange={handleChange} required />
                        </div>

                        <div className="reg-row">
                            <div className="reg-field">
                                <label>Mật khẩu</label>
                                <div className="input-icon-right">
                                    <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                    <span onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                                </div>
                            </div>
                            <div className="reg-field">
                                <label>Nhập lại mật khẩu</label>
                                <div className="input-icon-right">
                                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-register" disabled={isLoading}>
                            {isLoading ? 'ĐANG ĐĂNG KÝ...' : 'Đăng ký ngay'}
                        </button>
                    </form>

                    <p className="register-login-link">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
                </div>

                {/* Bên phải: Infomation Panel */}
                <div className="register-right">
                    <div className="reg-icon-box">
                        <MdMedicalServices />
                    </div>
                    <h2>Chăm sóc sức khỏe toàn diện cho gia đình bạn</h2>
                    <p>Đặt lịch khám nhanh chóng, theo dõi hồ sơ bệnh án điện tử và nhận tư vấn từ đội ngũ y bác sĩ đầu ngành tại Bắc Ninh.</p>

                    <div className="reg-security-badge">
                        <FaShieldAlt />
                        <div>
                            <strong>Bảo mật thông tin</strong>
                            <span>Dữ liệu y tế của bạn được mã hóa an toàn</span>
                        </div>
                    </div>

                    <div className="reg-image-box">
                        <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=220&fit=crop&crop=face" alt="Bác sĩ" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
