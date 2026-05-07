import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    FaChevronRight, FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle,
    FaStethoscope, FaFlask, FaVial, FaMicroscope, FaArrowLeft, FaArrowRight,
    FaRegHospital, FaInfoCircle, FaPhoneAlt, FaSearch
} from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Booking.css';

const Booking = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doctorIdFromUrl = searchParams.get('doctorId');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data for Step 1
    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [filterDept, setFilterDept] = useState('All');

    // Data for Step 2
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Data for Step 3
    const [patientInfo, setPatientInfo] = useState({
        fullName: '',
        dob: '',
        gender: 'NAM',
        phone: '',
        email: '',
        insuranceCard: '',
        notes: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servRes, docRes, deptRes] = await Promise.all([
                    api.get('/medical-services'),
                    api.get('/staff/doctors'),
                    api.get('/departments')
                ]);
                setServices(servRes.data.data || []);
                setDoctors(docRes.data.data || []);
                setDepartments(deptRes.data.data || []);

                // Pre-select doctor if doctorId is in URL
                if (doctorIdFromUrl && docRes.data.data) {
                    const doc = docRes.data.data.find(d => d.id === parseInt(doctorIdFromUrl));
                    if (doc) {
                        setSelectedDoctor(doc);
                        // Find a default service that matches this doctor's department
                        if (servRes.data.data && servRes.data.data.length > 0) {
                            const matchingService = servRes.data.data.find(s => s.departmentId === doc.departmentId);
                            setSelectedService(matchingService || servRes.data.data[0]);
                        }
                    }
                }

                // Autofill patient info if logged in
                try {
                    const profileRes = await api.get('/auth/me');
                    if (profileRes.data.success && profileRes.data.data) {
                        const user = profileRes.data.data;
                        setPatientInfo(prev => ({
                            ...prev,
                            fullName: user.fullName || '',
                            dob: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                            gender: user.gender === 'Nữ' || user.gender === 'NU' ? 'NU' : 'NAM',
                            phone: user.phone || '',
                            email: user.email || '',
                            insuranceCard: user.insuranceCard || ''
                        }));
                    }
                } catch (err) {
                    console.log("User not logged in or profile not found, skipping autofill");
                }
            } catch (error) {
                console.error("Error fetching booking data:", error);
                toast.error("Không thể tải danh sách dịch vụ và bác sĩ");
            }
        };
        fetchData();
    }, []);

    const nextStep = () => {
        if (step === 1 && (!selectedService || !selectedDoctor)) {
            toast.warning("Vui lòng chọn dịch vụ và bác sĩ");
            return;
        }
        if (step === 2 && (!selectedDate || !selectedTime)) {
            toast.warning("Vui lòng chọn ngày và giờ khám");
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const bookingData = {
                serviceId: selectedService.id,
                doctorId: selectedDoctor.id,
                date: `${selectedDate}T${selectedTime}:00`,
                notes: patientInfo.notes,
                // These might be needed for new patient creation, but let's stick to appointment table for now
                ...patientInfo
            };
            const response = await api.post('/medical/appointments/register', bookingData);
            if (response.data.success) {
                toast.success("Đặt lịch khám thành công!");
                navigate('/profile/history');
            }
        } catch (error) {
            console.error("Booking error:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const filteredDoctors = doctors.filter(d => {
        const matchDept = filterDept === 'All' || d.departmentId === parseInt(filterDept);
        // If a service is selected, filter by its associated departmentId
        const matchService = !selectedService || d.departmentId === selectedService.departmentId;
        return matchDept && matchService;
    });

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        // If the current selected doctor doesn't match the new service's department, clear selection
        if (selectedDoctor && selectedDoctor.departmentId !== service.departmentId) {
            setSelectedDoctor(null);
        }
    };

    return (
        <div className="booking-page-wrapper">
            <div className="booking-page-container">
                <div className="booking-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <FaChevronRight size={10} />
                    <span>Đặt lịch khám</span>
                </div>

                <div className="booking-header">
                    <h1>Đặt lịch khám bệnh</h1>
                    <p>Hệ thống đặt lịch trực tuyến giúp bạn tiết kiệm thời gian và chủ động lựa chọn bác sĩ chuyên khoa phù hợp nhất.</p>
                </div>

                <div className="booking-tabs-nav">
                    <div className={`tab-item ${step >= 1 ? 'active' : ''}`}>
                        <FaStethoscope className="step-icon" />
                        <span>CHUYÊN KHOA & BÁC SĨ</span>
                    </div>
                    <div className={`tab-item ${step >= 2 ? 'active' : ''}`}>
                        <FaCalendarAlt className="step-icon" />
                        <span>NGÀY & GIỜ</span>
                    </div>
                    <div className={`tab-item ${step >= 3 ? 'active' : ''}`}>
                        <FaUserMd className="step-icon" />
                        <span>THÔNG TIN BỆNH NHÂN</span>
                    </div>
                    <div className={`tab-item ${step >= 4 ? 'active' : ''}`}>
                        <FaCheckCircle className="step-icon" />
                        <span>XÁC NHẬN</span>
                    </div>
                </div>

                <div className="booking-main-content">
                    <div className="booking-left-column">
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <div className="section-header">
                                    <div className="step-title-new">
                                        <div className="circle-num">1</div>
                                        <h2>Chọn dịch vụ khám</h2>
                                    </div>
                                </div>
                                <div className="services-grid-new">
                                    {services.map(s => (
                                        <div
                                            key={s.id}
                                            className={`service-card-new ${selectedService?.id === s.id ? 'selected' : ''}`}
                                            onClick={() => handleServiceSelect(s)}
                                        >
                                            <h3>{s.name}</h3>
                                            <span className="price">{formatPrice(s.price)}</span>
                                            {selectedService?.id === s.id && <FaCheckCircle className="check-icon-sv" />}
                                        </div>
                                    ))}
                                </div>

                                <div className="section-header" style={{ marginTop: '2.5rem' }}>
                                    <div className="step-title-new">
                                        <div className="circle-num">2</div>
                                        <h2>Chọn Bác sĩ</h2>
                                    </div>
                                </div>
                                <div className="filter-tabs-new">
                                    <button className={`filter-btn ${filterDept === 'All' ? 'active' : ''}`} onClick={() => setFilterDept('All')}>Tất cả</button>
                                    {departments.map(d => (
                                        <button
                                            key={d.id}
                                            className={`filter-btn ${filterDept === d.id.toString() ? 'active' : ''}`}
                                            onClick={() => setFilterDept(d.id.toString())}
                                        >
                                            {d.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="doctors-grid-new">
                                    {filteredDoctors.map(d => {
                                        const isSelected = selectedDoctor?.id === d.id;
                                        return (
                                            <div
                                                key={d.id}
                                                className={`doctor-card-new ${isSelected ? 'selected' : ''}`}
                                                onClick={() => setSelectedDoctor(d)}
                                            >
                                                {isSelected && <FaCheckCircle className="doc-check-icon" />}
                                                <div className="doc-top">
                                                    <div className="doc-avatar">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(d.fullName)}&background=random&color=fff&bold=true`} alt={d.fullName} />
                                                    </div>
                                                    <div className="doc-info">
                                                        <span className="doc-role-badge">BÁC SĨ CHUYÊN KHOA</span>
                                                        <h3 className="doc-name">{d.fullName}</h3>
                                                        <span className="doc-dept">Khoa {d.departmentName}</span>
                                                        <div className="doc-rating">
                                                            <span>⭐ 4.9 (120 đánh giá)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="doc-bottom">
                                                    <div className="doc-price-box">
                                                        <span className="doc-price-label">GIÁ KHÁM</span>
                                                        <span className="doc-price-val">{formatPrice(selectedService ? selectedService.price : 0)}</span>
                                                    </div>
                                                    <button className="btn-select-doc-new">
                                                        {isSelected ? 'Đã chọn' : 'Chọn bác sĩ'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in">
                                <div className="step-title-new" style={{ marginBottom: '1.5rem' }}>
                                    <div className="circle-num">3</div>
                                    <h2>Chọn ngày & giờ khám</h2>
                                </div>
                                <div className="calendar-section" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#495057' }}><FaCalendarAlt /> 1. Chọn ngày khám</div>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate || ''}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    />
                                </div>
                                <div className="time-section" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #dee2e6', marginTop: '1.5rem' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#495057' }}><FaClock /> 2. Chọn giờ khám</div>
                                    <div className="time-slots-group">
                                        <h4 style={{ fontSize: '0.8rem', color: '#adb5bd', marginBottom: '1rem', textTransform: 'uppercase' }}>BUỔI SÁNG (08:00 - 11:30)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                                            {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setSelectedTime(t)}
                                                    style={{ padding: '0.5rem', background: selectedTime === t ? '#0d6efd' : '#f8f9fa', color: selectedTime === t ? '#fff' : '#495057', border: `1px solid ${selectedTime === t ? '#0d6efd' : '#dee2e6'}`, borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                        <h4 style={{ fontSize: '0.8rem', color: '#adb5bd', margin: '1.5rem 0 1rem', textTransform: 'uppercase' }}>BUỔI CHIỀU (13:30 - 17:00)</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                                            {['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setSelectedTime(t)}
                                                    style={{ padding: '0.5rem', background: selectedTime === t ? '#0d6efd' : '#f8f9fa', color: selectedTime === t ? '#fff' : '#495057', border: `1px solid ${selectedTime === t ? '#0d6efd' : '#dee2e6'}`, borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="patient-form-new animate-fade-in">
                                <div className="step-title-new" style={{ marginBottom: '1.5rem' }}>
                                    <div className="circle-num">4</div>
                                    <h2>Thông tin bệnh nhân</h2>
                                </div>
                                <div className="form-group-new">
                                    <label>Họ và tên (Bắt buộc)</label>
                                    <input type="text" placeholder="VD: Nguyễn Văn A" value={patientInfo.fullName} onChange={(e) => setPatientInfo({ ...patientInfo, fullName: e.target.value })} />
                                </div>
                                <div className="form-row-new">
                                    <div className="form-group-new">
                                        <label>Ngày sinh (Bắt buộc)</label>
                                        <input type="date" value={patientInfo.dob} onChange={(e) => setPatientInfo({ ...patientInfo, dob: e.target.value })} />
                                    </div>
                                    <div className="form-group-new">
                                        <label>Giới tính</label>
                                        <div className="gender-options-new">
                                            <label><input type="radio" checked={patientInfo.gender === 'NAM'} onChange={() => setPatientInfo({ ...patientInfo, gender: 'NAM' })} /> Nam</label>
                                            <label><input type="radio" checked={patientInfo.gender === 'NU'} onChange={() => setPatientInfo({ ...patientInfo, gender: 'NU' })} /> Nữ</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row-new">
                                    <div className="form-group-new">
                                        <label>Số điện thoại (Bắt buộc)</label>
                                        <input type="text" placeholder="0xxx xxx xxx" value={patientInfo.phone} onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })} />
                                    </div>
                                    <div className="form-group-new">
                                        <label>Email (Nếu có)</label>
                                        <input type="email" placeholder="email@example.com" value={patientInfo.email} onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group-new">
                                    <label>Số thẻ BHYT (Nếu có)</label>
                                    <input type="text" placeholder="Nhập mã số thẻ bảo hiểm y tế" value={patientInfo.insuranceCard} onChange={(e) => setPatientInfo({ ...patientInfo, insuranceCard: e.target.value })} />
                                </div>
                                <div className="form-group-new">
                                    <label>Lý do khám / Triệu chứng bệnh</label>
                                    <textarea rows="4" placeholder="Mô tả tình trạng sức khỏe hiện tại của bạn..." value={patientInfo.notes} onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}></textarea>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="confirmation-card-new animate-fade-in">
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#212529', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaCheckCircle color="#10b981" /> Xác nhận thông tin đặt lịch
                                </h3>

                                <div className="info-group-new">
                                    <h4>THÔNG TIN KHÁM BỆNH</h4>
                                    <div className="summary-item-new">
                                        <span className="label">Dịch vụ:</span>
                                        <span className="value">{selectedService?.name}</span>
                                    </div>
                                    <div className="summary-item-new">
                                        <span className="label">Bác sĩ phụ trách:</span>
                                        <span className="value">{selectedDoctor?.fullName} - Khoa {selectedDoctor?.departmentName}</span>
                                    </div>
                                    <div className="summary-item-new">
                                        <span className="label">Thời gian hẹn:</span>
                                        <span className="value" style={{ color: '#0d6efd' }}>{selectedTime} - {selectedDate}</span>
                                    </div>
                                </div>

                                <div className="info-group-new">
                                    <h4>THÔNG TIN BỆNH NHÂN</h4>
                                    <div className="summary-item-new">
                                        <span className="label">Họ và tên:</span>
                                        <span className="value">{patientInfo.fullName}</span>
                                    </div>
                                    <div className="summary-item-new">
                                        <span className="label">Liên hệ:</span>
                                        <span className="value">{patientInfo.phone}</span>
                                    </div>
                                    <div className="summary-item-new">
                                        <span className="label">Lý do khám:</span>
                                        <span className="value">{patientInfo.notes || "Không có ghi chú"}</span>
                                    </div>
                                </div>

                                <div className="warning-notice-new">
                                    <FaInfoCircle /> 
                                    <p style={{ margin: 0 }}>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Sau khi đặt lịch thành công, hệ thống sẽ gửi thông báo xác nhận đến bạn.</p>
                                </div>
                            </div>
                        )}

                        <div className="actions-new">
                            {step > 1 ? (
                                <button className="btn-back-new" onClick={prevStep}>
                                    <FaArrowLeft /> Quay lại
                                </button>
                            ) : <div></div>}
                            
                            {step < 4 ? (
                                <button className="btn-next-new" onClick={nextStep}>
                                    Tiếp tục Bước {step + 1} <FaArrowRight />
                                </button>
                            ) : (
                                <button className="btn-next-new" onClick={handleSubmit} disabled={loading} style={{ background: '#10b981' }}>
                                    {loading ? 'Đang xử lý...' : 'Xác nhận & Đặt lịch'} <FaCheckCircle />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="booking-right-column">
                        <div className="sidebar-new">
                            <div className="sidebar-header">
                                <FaRegHospital color="#0d6efd" /> Tóm tắt đặt lịch
                            </div>

                            <div className="sidebar-item">
                                <div className="sidebar-icon">
                                    <FaStethoscope />
                                </div>
                                <div className="si-text">
                                    <span className="si-label">DỊCH VỤ</span>
                                    <span className={`si-value ${!selectedService ? 'placeholder' : ''}`}>
                                        {selectedService ? selectedService.name : 'Chưa chọn'}
                                    </span>
                                </div>
                            </div>

                            <div className="sidebar-item">
                                <div className="sidebar-icon green">
                                    <FaUserMd />
                                </div>
                                <div className="si-text">
                                    <span className="si-label">BÁC SĨ</span>
                                    <span className={`si-value ${!selectedDoctor ? 'placeholder' : ''}`}>
                                        {selectedDoctor ? selectedDoctor.fullName : 'Chưa chọn'}
                                    </span>
                                </div>
                            </div>

                            <div className="sidebar-item">
                                <div className="sidebar-icon gray">
                                    <FaClock />
                                </div>
                                <div className="si-text">
                                    <span className="si-label">THỜI GIAN</span>
                                    <span className={`si-value ${!selectedDate || !selectedTime ? 'placeholder' : ''}`}>
                                        {selectedDate && selectedTime ? `${selectedTime}, ${selectedDate}` : 'Chưa chọn'}
                                    </span>
                                </div>
                            </div>

                            <div className="sidebar-divider"></div>

                            <div className="cost-row">
                                <span>Phí khám bệnh:</span>
                                <span className="val">{selectedService ? formatPrice(selectedService.price) : '0đ'}</span>
                            </div>
                            <div className="cost-row">
                                <span>Phí dịch vụ:</span>
                                <span className="val free" style={{ color: '#212529' }}>Miễn phí</span>
                            </div>
                            
                            <div className="sidebar-divider" style={{ borderStyle: 'dotted', margin: '1rem 0' }}></div>

                            <div className="cost-row total">
                                <span>Tổng cộng:</span>
                                <span className="val">{selectedService ? formatPrice(selectedService.price) : '0Đ'}</span>
                            </div>

                            <div className="support-box-new">
                                <p>Hỗ trợ đặt lịch:</p>
                                <div className="phone"><FaPhoneAlt /> 1900 1234</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;
