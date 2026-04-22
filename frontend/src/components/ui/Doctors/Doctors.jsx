import React from 'react';
import { Link } from 'react-router-dom';
import './Doctors.css';

const DOCTORS = [
    { id: 1, name: 'BS. Nguyễn Văn An', specialty: 'Tim mạch', experience: '15 năm kinh nghiệm', avatar: '👨‍⚕️' },
    { id: 2, name: 'BS. Trần Thị Bình', specialty: 'Nhi khoa', experience: '12 năm kinh nghiệm', avatar: '👩‍⚕️' },
    { id: 3, name: 'BS. Lê Minh Cường', specialty: 'Nội khoa', experience: '20 năm kinh nghiệm', avatar: '👨‍⚕️' },
    { id: 4, name: 'BS. Phạm Thị Dung', specialty: 'Da liễu', experience: '10 năm kinh nghiệm', avatar: '👩‍⚕️' },
];

const Doctors = () => {
    return (
        <section className="doctors-section" id="bac-si">
            <div className="doctors-container">
                <div className="section-header">
                    <div className="section-badge">Đội ngũ y bác sĩ</div>
                    <h2>Bác sĩ chuyên khoa</h2>
                    <p>Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với bệnh nhân</p>
                </div>
                <div className="doctors-grid">
                    {DOCTORS.map(doc => (
                        <div className="doctor-card" key={doc.id}>
                            <div className="doctor-avatar">{doc.avatar}</div>
                            <h3>{doc.name}</h3>
                            <span className="doctor-specialty">{doc.specialty}</span>
                            <p className="doctor-exp">{doc.experience}</p>
                        </div>
                    ))}
                </div>
                <div className="doctors-cta">
                    <Link to="/doctors" className="btn-see-all">Xem tất cả bác sĩ →</Link>
                </div>
            </div>
        </section>
    );
};

export default Doctors;
