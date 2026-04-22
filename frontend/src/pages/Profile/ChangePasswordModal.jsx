import React, { useState } from 'react';
import { FaLock, FaShieldAlt, FaTimes, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleShow = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            if (res.data.success) {
                toast.success('Đổi mật khẩu thành công!');
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container glass animate-scale-up" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
                    <FaTimes />
                </button>

                <div className="modal-header">
                    <div className="header-icon-wrap">
                        <FaShieldAlt className="header-icon" />
                    </div>
                    <h2>Đổi mật khẩu</h2>
                    <p>Đảm bảo tài khoản của bạn luôn được bảo vệ an toàn</p>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mật khẩu hiện tại</label>
                        <div className="input-wrap">
                            <FaLock className="input-icon" />
                            <input 
                                type={showPasswords.old ? "text" : "password"}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-pass" 
                                onClick={() => toggleShow('old')}
                                tabIndex="-1"
                            >
                                {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <div className="input-wrap">
                            <FaLock className="input-icon" />
                            <input 
                                type={showPasswords.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Ít nhất 6 ký tự"
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-pass" 
                                onClick={() => toggleShow('new')}
                                tabIndex="-1"
                            >
                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu mới</label>
                        <div className="input-wrap">
                            <FaLock className="input-icon" />
                            <input 
                                type={showPasswords.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button 
                                type="button" 
                                className="toggle-pass" 
                                onClick={() => toggleShow('confirm')}
                                tabIndex="-1"
                            >
                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-cancel-premium" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary-premium"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="spinner" /> : 'Xác nhận đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
