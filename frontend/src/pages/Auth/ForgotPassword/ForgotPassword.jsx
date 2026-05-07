import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaKey, FaArrowLeft, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Info request, 2: Reset password
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!username) {
            toast.warning('Vui lòng nhập Username hoặc Email');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/forgot-password', { username });
            if (response.data.success) {
                toast.success(response.data.message);
                // In a real app, token is sent via email. 
                // For this demo/test, we might get it in response if backend returns it.
                if (response.data.resetToken) {
                    setToken(response.data.resetToken);
                }
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yêu cầu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!token || !newPassword || !confirmPassword) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/reset-password', { 
                username, 
                otp: token, 
                newPassword 
            });
            if (response.data.success) {
                toast.success('Mật khẩu của bạn đã được cập nhật thành công!');
                setStep(3); // Success step
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/login" className="back-link"><FaArrowLeft /> Quay lại đăng nhập</Link>
                    <h1>Quên mật khẩu?</h1>
                    <p>Hãy thực hiện các bước dưới đây để khôi phục quyền truy cập.</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestReset} className="auth-form">
                        <div className="form-group">
                            <label><FaUser /> Tên đăng nhập hoặc Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Nhập username của bạn"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : 'GỬI YÊU CẦU RESET'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="auth-form">
                        <div className="alert-info">
                            Mã xác thực đã được xử lý. Vui lòng nhập mật khẩu mới.
                        </div>
                        <div className="form-group">
                            <label><FaKey /> Mã xác thực (Reset Token)</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Dán mã reset vào đây"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label><FaLock /> Mật khẩu mới</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label><FaLock /> Xác nhận mật khẩu mới</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : 'ĐỔI MẬT KHẨU'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="success-view">
                        <FaCheckCircle className="success-icon" />
                        <h2>Thành công!</h2>
                        <p>Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.</p>
                        <Link to="/login" className="btn-auth">ĐĂNG NHẬP NGAY</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
