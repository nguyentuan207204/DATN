import React, { useState, useEffect } from 'react';
import { MdClose, MdPerson, MdHistory, MdDateRange } from 'react-icons/md';
import api from '../../../utils/api';
import { toast } from 'react-toastify';

const PatientViewModal = ({ show, onClose, patient }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && patient) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/patients/${patient.id}/visits`);
          if (res.data.success) {
            setHistory(res.data.visits || []);
          }
        } catch (error) {
          toast.error("Không thể tải lịch sử khám");
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [show, patient]);

  if (!patient) return null;

  return (
    <div className={`admin-modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="glass-card admin-modal-content detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Hồ sơ bệnh nhân: {patient.fullName}</h3>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
          <div className="detail-section">
            <div className="section-title"><MdPerson /> Thông tin cá nhân</div>
            <div className="detail-row">
              <div className="d-item">
                <span className="label">Mã BN:</span>
                <span className="value">#BN{String(patient.id).padStart(5, '0')}</span>
              </div>
              <div className="d-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{patient.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="d-item">
                <span className="label">Ngày sinh:</span>
                <span className="value">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</span>
              </div>
              <div className="d-item">
                <span className="label">Giới tính:</span>
                <span className="value">{patient.gender === 'NAM' ? 'Nam' : patient.gender === 'NU' ? 'Nữ' : 'Khác'}</span>
              </div>
            </div>
            <div className="detail-row">
              <div className="d-item wide">
                <span className="label">Địa chỉ:</span>
                <span className="value">{patient.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section" style={{ marginTop: '20px' }}>
            <div className="section-title"><MdHistory /> Lịch sử khám bệnh</div>
            {loading ? (
              <p style={{ padding: '10px' }}>Đang tải lịch sử khám...</p>
            ) : history.length > 0 ? (
              <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                {history.map((visit, index) => (
                  <div key={index} className="history-item glass-card" style={{ padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#63b3ed' }}>
                        <MdDateRange /> {new Date(visit.visitDate).toLocaleString('vi-VN')}
                      </strong>
                      <span className="status-badge confirmed" style={{ fontSize: '0.8rem' }}>Bác sĩ: {visit.doctorName || visit.Doctor?.fullName || 'N/A'}</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#a0aec0' }}>Triệu chứng:</strong> <span style={{ color: '#e2e8f0' }}>{visit.symptoms || 'Không có ghi nhận'}</span>
                    </div>
                    {visit.Diagnosis && visit.Diagnosis.length > 0 && (
                      <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#a0aec0' }}>Chẩn đoán:</strong> <span style={{ color: '#e2e8f0' }}>{visit.Diagnosis.map(d => d.icd10Code || d.icd10Id).join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ padding: '10px', color: '#a0aec0', fontStyle: 'italic' }}>Bệnh nhân chưa có lịch sử khám bệnh.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientViewModal;
