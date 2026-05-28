import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaShieldAlt, FaArrowLeft, FaCheckCircle, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './ForgotPassword.css';

const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 5; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
};

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email & Captcha, 2: Success
    const [email, setEmail] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaString, setCaptchaString] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCaptchaString(generateCaptcha());
    }, []);

    const handleRefreshCaptcha = () => {
        setCaptchaString(generateCaptcha());
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning('Vui lòng nhập Email của bạn');
            return;
        }

        if (!captchaInput) {
            toast.warning('Vui lòng nhập mã xác nhận (Captcha)');
            return;
        }

        if (captchaInput.toLowerCase() !== captchaString.toLowerCase()) {
            toast.error('Mã xác nhận không đúng, vui lòng thử lại');
            handleRefreshCaptcha();
            setCaptchaInput('');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success(response.data.message || 'Mật khẩu mới đã được gửi đến email của bạn.');
                setStep(2);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yêu cầu thất bại');
            handleRefreshCaptcha();
            setCaptchaInput('');
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
                    <p>Nhập email của bạn để nhận mật khẩu mới.</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestReset} className="auth-form">
                        <div className="form-group">
                            <label><FaEnvelope /> Email đã đăng ký</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group captcha-group">
                            <label><FaShieldAlt /> Mã xác nhận</label>
                            <div className="captcha-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <div 
                                    className="captcha-display" 
                                    style={{
                                        background: '#f1f5f9',
                                        padding: '10px 20px',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        letterSpacing: '5px',
                                        color: '#0f172a',
                                        borderRadius: '8px',
                                        userSelect: 'none',
                                        fontFamily: 'monospace',
                                        textDecoration: 'line-through',
                                        flex: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    {captchaString}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleRefreshCaptcha} 
                                    className="btn-refresh-captcha"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #cbd5e1',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    title="Tải lại mã"
                                >
                                    <FaSyncAlt />
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Nhập mã xác nhận ở trên"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth" disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : 'GỬI MẬT KHẨU MỚI'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div className="success-view">
                        <FaCheckCircle className="success-icon" />
                        <h2>Thành công!</h2>
                        <p>Mật khẩu mới đã được gửi đến email <strong style={{color: '#0284c7'}}>{email}</strong>.</p>
                        <p style={{marginTop: '10px', fontSize: '14px', color: '#64748b'}}>Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) và đăng nhập lại bằng mật khẩu mới, sau đó tiến hành đổi mật khẩu để đảm bảo an toàn.</p>
                        <Link to="/login" className="btn-auth" style={{ marginTop: '20px' }}>ĐĂNG NHẬP NGAY</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
