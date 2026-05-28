import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const PatientEditModal = ({ show, onClose, patient, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'KHAC',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient && show) {
      setFormData({
        fullName: patient.fullName || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
        gender: patient.gender || 'KHAC',
        address: patient.address || ''
      });
    }
  }, [patient, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put(`/patients/${patient.id}`, formData);
      if (res.data.success) {
        toast.success("Cập nhật thông tin thành công!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <div className={`admin-modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="glass-card admin-modal-content form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cập nhật thông tin bệnh nhân</h3>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Họ và tên <span style={{ color: '#fc8181' }}>*</span></label>
            <input 
              type="text" 
              name="fullName"
              className="admin-input" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Số điện thoại</label>
            <input 
              type="text" 
              name="phone"
              className="admin-input" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input 
                type="date" 
                name="dateOfBirth"
                className="admin-input" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Giới tính</label>
              <select 
                name="gender" 
                className="admin-input" 
                value={formData.gender} 
                onChange={handleChange}
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
                <option value="KHAC">Khác</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Địa chỉ</label>
            <textarea 
              name="address"
              className="admin-input" 
              rows="3"
              value={formData.address} 
              onChange={handleChange} 
            ></textarea>
          </div>

          <div className="modal-footer" style={{ marginTop: '25px' }}>
            <button type="button" className="admin-btn secondary" onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="admin-btn primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientEditModal;
