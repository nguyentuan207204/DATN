import React from 'react';
import { 
  MdClose, 
  MdPeople, 
  MdPhone, 
  MdCalendarToday, 
  MdInfo
} from 'react-icons/md';

const AppointmentDetailModal = ({ show, onClose, appointment }) => {
  if (!appointment) return null;

  const apptDate = new Date(appointment.date);
  const createdDate = appointment.createdAt ? new Date(appointment.createdAt) : null;

  const renderImages = (imageUrls) => {
    if (!imageUrls) return null;
    try {
      const images = typeof imageUrls === 'string' ? JSON.parse(imageUrls) : imageUrls;
      if (!Array.isArray(images) || images.length === 0) return null;
      
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      // Remove /api from end if present for image URLs
      const imageBase = apiBase.replace(/\/api$/, '');

      return (
        <div className="appt-detail-images">
          <p className="label-text">Ảnh đính kèm:</p>
          <div className="images-grid">
            {images.map((img, idx) => (
              <a 
                key={idx} 
                href={`${imageBase}${img}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="image-thumb"
              >
                <img src={`${imageBase}${img}`} alt={`Attach ${idx + 1}`} />
              </a>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  return (
    <div className={`admin-modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="glass-card admin-modal-content detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết lịch hẹn #{appointment.id}</h3>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <div className="section-title"><MdPeople /> Thông tin bệnh nhân</div>
            <div className="detail-row">
              <div className="d-item">
                <span className="label">Họ tên:</span>
                <span className="value">{appointment.patientName}</span>
              </div>
              <div className="d-item">
                <span className="label">Số điện thoại:</span>
                <span className="value"><MdPhone /> {appointment.patientPhone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-title"><MdCalendarToday /> Thông tin lịch khám</div>
            <div className="detail-row">
              <div className="d-item">
                <span className="label">Chuyên khoa/Dịch vụ:</span>
                <span className="value">{appointment.serviceName || 'N/A'}</span>
              </div>
              <div className="d-item">
                <span className="label">Bác sĩ:</span>
                <span className="value">{appointment.doctorName}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="d-item">
                <span className="label">Thời gian khám:</span>
                <span className="value highlighting">
                  {apptDate.toLocaleDateString('vi-VN')} {apptDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="d-item">
                <span className="label">Ngày đặt:</span>
                <span className="value">{createdDate ? createdDate.toLocaleString('vi-VN') : 'N/A'}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="d-item wide">
                <span className="label">Trạng thái:</span>
                <span className={`status-badge ${appointment.status?.toLowerCase() || 'pending'}`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-title"><MdInfo /> Lý do khám / Ghi chú</div>
            <div className="notes-box">
              {appointment.notes || 'Không có ghi chú.'}
            </div>
          </div>

          {renderImages(appointment.imageUrls)}
        </div>

        <div className="modal-footer">
          <button className="admin-btn secondary" onClick={onClose}>Đóng</button>
          <button className="admin-btn primary" onClick={onClose}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
