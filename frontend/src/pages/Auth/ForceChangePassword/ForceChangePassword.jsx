import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaKey, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../ForgotPassword/ForgotPassword.css';

const ForceChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post('/auth/change-password', {
                oldPassword,
                newPassword
            });
            if (response.data.success) {
                toast.success('Đổi mật khẩu thành công!');
                
                // Cập nhật user trong localStorage
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.requirePasswordChange = false;
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect based on role
                if (['ADMIN', 'BACSI', 'YTA', 'TIEPTAN'].includes(user.role)) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container force-change-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Đổi mật khẩu bắt buộc</h1>
                    <p style={{marginTop: '10px', fontSize: '14px', color: '#64748b'}}>Vì lý do bảo mật sau khi thiết lập lại mật khẩu, bạn cần đổi sang mật khẩu mới ngay trong lần đăng nhập này.</p>
                </div>

                <form onSubmit={handleChangePassword} className="auth-form" style={{marginTop: '20px'}}>
                    <div className="form-group">
                        <label><FaKey /> Mật khẩu hiện tại (nhận qua email)</label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
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
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-auth" disabled={isLoading} style={{marginTop: '20px'}}>
                        {isLoading ? <FaSpinner className="spinner" /> : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceChangePassword;
