import React, { useState, useEffect } from 'react';
import { MdClose, MdMonitorHeart, MdVaccines, MdLibraryBooks, MdAdd, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import './CreateRecordModal.css';

const CreateRecordModal = ({ appointment, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Vitals State
  const [vitals, setVitals] = useState({
    weight: '',
    height: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
  });

  // Diagnosis State
  const [diagnosis, setDiagnosis] = useState({
    text: '', // Changed from icd10Id to text
    advice: ''
  });

  // Prescription State
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicineId: '', quantity: 1, dosage: '' }
  ]);

  useEffect(() => {
    // Fetch available medicines
    const fetchMedicines = async () => {
      try {
        const res = await api.get('/pharmacy/medicines');
        if (res.data && res.data.success) {
          setMedicines(res.data.data);
        } else if (Array.isArray(res.data)) {
          setMedicines(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch medicines');
      }
    };
    fetchMedicines();
  }, []);

  const handleAddMedicine = () => {
    setPrescriptionItems([...prescriptionItems, { medicineId: '', quantity: 1, dosage: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    const list = [...prescriptionItems];
    list.splice(index, 1);
    setPrescriptionItems(list);
  };

  const handleChangeMedicine = (index, field, value) => {
    const list = [...prescriptionItems];
    list[index][field] = value;
    setPrescriptionItems(list);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 1. Create Medical Record
      const combinedAdvice = diagnosis.text 
        ? `[Chẩn đoán]: ${diagnosis.text}\n[Lời dặn]: ${diagnosis.advice}`
        : diagnosis.advice;

      const recordPayload = {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        ...vitals,
        advice: combinedAdvice
      };
      
      const recordRes = await api.post('/emr', recordPayload);
      if (!recordRes.data.success) throw new Error(recordRes.data.message || 'Lỗi tạo hồ sơ');
      const recordId = recordRes.data.recordId;

      // 2. Add Diagnosis (Bỏ qua vì nhập tay text, lưu gộp vào advice)

      // 3. Create Prescription if there are items with medicineId
      const validItems = prescriptionItems.filter(item => item.medicineId && item.quantity > 0);
      if (validItems.length > 0) {
        await api.post(`/emr/${recordId}/prescription`, { items: validItems });
      }

      // 4. Update Appointment Status to COMPLETED or DONE
      await api.put(`/appointments/admin/${appointment.id}/status`, { status: 'DONE' });

      toast.success('Đã hoàn tất khám và lưu hồ sơ thành công!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card emr-modal">
        <div className="modal-header">
          <div>
            <h2>Khám bệnh & Tạo Hồ sơ</h2>
            <p className="subtitle">
              Bệnh nhân: <strong>{appointment.patientName}</strong> - Bác sĩ: <strong>{appointment.doctorName}</strong>
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>

        <div className="emr-tabs">
          <button className={activeTab === 'vitals' ? 'active' : ''} onClick={() => setActiveTab('vitals')}>
            <MdMonitorHeart /> Chỉ số sinh tồn
          </button>
          <button className={activeTab === 'diagnosis' ? 'active' : ''} onClick={() => setActiveTab('diagnosis')}>
            <MdLibraryBooks /> Chẩn đoán & Tư vấn
          </button>
          <button className={activeTab === 'prescription' ? 'active' : ''} onClick={() => setActiveTab('prescription')}>
            <MdVaccines /> Kê đơn thuốc
          </button>
        </div>

        <div className="emr-content scrollable">
          {activeTab === 'vitals' && (
            <div className="grid-form">
              <div className="form-group">
                <label>Huyết áp (mmHg)</label>
                <input type="text" placeholder="VD: 120/80" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nhịp tim (bpm)</label>
                <input type="number" placeholder="VD: 80" value={vitals.heartRate} onChange={e => setVitals({...vitals, heartRate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nhiệt độ (°C)</label>
                <input type="number" step="0.1" placeholder="VD: 37" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Nhịp thở (lần/phút)</label>
                <input type="number" placeholder="VD: 18" value={vitals.respiratoryRate} onChange={e => setVitals({...vitals, respiratoryRate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Cân nặng (kg)</label>
                <input type="number" step="0.1" placeholder="VD: 65" value={vitals.weight} onChange={e => setVitals({...vitals, weight: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Chiều cao (cm)</label>
                <input type="number" placeholder="VD: 170" value={vitals.height} onChange={e => setVitals({...vitals, height: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'diagnosis' && (
            <div className="diagnosis-form">
              <div className="form-group">
                <label>Chẩn đoán bệnh</label>
                <input 
                  type="text" 
                  placeholder="VD: Viêm họng hạt, Cảm cúm..."
                  value={diagnosis.text} 
                  onChange={e => setDiagnosis({...diagnosis, text: e.target.value})}
                />
                <span className="help-text">Nhập text tự do thay vì chọn mã ICD-10</span>
              </div>
              <div className="form-group mt-4">
                <label>Lời dặn của Bác sĩ</label>
                <textarea 
                  rows="4" 
                  placeholder="VD: Ăn uống điều độ, tránh thức khuya..."
                  value={diagnosis.advice}
                  onChange={e => setDiagnosis({...diagnosis, advice: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'prescription' && (
            <div className="prescription-form">
              <div className="prescription-list">
                {prescriptionItems.map((item, index) => (
                  <div className="prescription-row" key={index}>
                    <div className="form-group select-med">
                      <label>Tên Thuốc</label>
                      <select 
                        value={item.medicineId} 
                        onChange={(e) => handleChangeMedicine(index, 'medicineId', Number(e.target.value))}
                      >
                        <option value="">-- Chọn thuốc kê đơn --</option>
                        {medicines.map(med => (
                          <option key={med.id} value={med.id}>{med.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group select-qty">
                      <label>SL</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => handleChangeMedicine(index, 'quantity', Number(e.target.value))} 
                      />
                    </div>
                    <div className="form-group select-dosage">
                      <label>Liều dùng / Cách dùng</label>
                      <input 
                        type="text" 
                        placeholder="VD: Ngày uống 2 lần, mỗi lần 1 viên" 
                        value={item.dosage} 
                        onChange={(e) => handleChangeMedicine(index, 'dosage', e.target.value)} 
                      />
                    </div>
                    {prescriptionItems.length > 1 && (
                      <button className="icon-btn-sm delete mt-auto mb-2" onClick={() => handleRemoveMedicine(index)}>
                        <MdDelete />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn-outline btn-add-med" onClick={handleAddMedicine}>
                <MdAdd /> Kê thêm thuốc
              </button>
            </div>
          )}
        </div>

        <div className="emr-footer">
          <button className="btn-outline" onClick={onClose} disabled={loading}>Hủy bỏ</button>
          <button className="btn-premium btn-premium-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Hoàn tất & Lưu Hồ Sơ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecordModal;
