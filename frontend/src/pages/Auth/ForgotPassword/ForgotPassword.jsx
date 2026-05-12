import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaShieldAlt, FaArrowLeft, FaCheckCircle, FaSpinner, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Info request, 2: Success
    const [email, setEmail] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaText, setCaptchaText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef(null);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        drawCaptcha(text);
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise dots
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150}, 0.5)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw text
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        const angle = (Math.random() - 0.5) * 0.3;
        ctx.rotate(angle);
        ctx.fillText(text, 0, 0);
        ctx.restore();

        // Add noise lines
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150}, 0.5)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

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
        if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
            toast.error('Mã xác nhận không đúng. Vui lòng thử lại.');
            generateCaptcha();
            setCaptchaInput('');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/forgot-password', { email });
            if (response.data.success) {
                toast.success(response.data.message);
                setStep(2); // Show success view
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Yêu cầu thất bại. Vui lòng thử lại.');
            generateCaptcha();
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
                    <p>Nhập email đã đăng ký của bạn. Chúng tôi sẽ tạo mật khẩu mới và gửi đến email này.</p>
                </div>

                {step === 1 && (
                    <form onSubmit={handleRequestReset} className="auth-form">
                        <div className="form-group">
                            <label><FaEnvelope /> Địa chỉ Email</label>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="Nhập email của bạn..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label><FaShieldAlt /> Mã xác nhận (Captcha)</label>
                            <div className="captcha-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <canvas 
                                    ref={canvasRef} 
                                    width="120" 
                                    height="40" 
                                    style={{ borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    onClick={generateCaptcha}
                                    title="Nhấn để đổi mã khác"
                                />
                                <button type="button" onClick={generateCaptcha} className="btn-refresh-captcha" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>
                                    <FaSyncAlt />
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Nhập 5 ký tự trong hình trên"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    maxLength="5"
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
                        <FaCheckCircle className="success-icon" style={{ color: '#10b981', fontSize: '48px', marginBottom: '16px' }} />
                        <h2>Thành công!</h2>
                        <p>Hệ thống đã tạo mật khẩu mới và gửi đến địa chỉ <strong>{email}</strong>.</p>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>
                            Vui lòng kiểm tra Hộp thư đến (hoặc thư mục Spam). Khuyến nghị bạn nên đổi lại mật khẩu sau khi đăng nhập thành công.
                        </p>
                        <Link to="/login" className="btn-auth" style={{ marginTop: '24px' }}>ĐĂNG NHẬP NGAY</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
