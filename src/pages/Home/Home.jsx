import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHistory, FaPills, FaFlask, FaCommentMedical, FaTags, FaClipboardList, FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock, FaUserMd, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import './Home.css';

const DOCTORS_HOME = [
    { id: 1, name: 'ThS. BS. Nguyễn Văn A', specialty: 'Bác sĩ nội khoa', desc: 'Chuyên điều trị các bệnh nội khoa, nội tiết, trao đổi chất.', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face' },
    { id: 2, name: 'BSCKII. Trần Thị B', specialty: 'Bác sĩ sản phụ khoa', desc: 'Chuyên gia phẫu thuật nội soi phụ khoa và chăm sóc thai sản.', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=120&h=120&fit=crop&crop=face' },
    { id: 3, name: 'TS. BS. Lê Văn C', specialty: 'Bác sĩ nhi khoa', desc: 'Ứng dụng công nghệ trong tầm soát và điều trị bệnh nhi.', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face' },
    { id: 4, name: 'BSCKI. Phạm Thị D', specialty: 'Bác sĩ thần kinh', desc: 'Điều trị toàn diện các tổn thương thần kinh, thoái hoá khớp.', avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=120&h=120&fit=crop&crop=face' },
];

const LOGGED_IN_SERVICES = [
    { icon: <FaHistory />, title: 'Lịch sử khám', desc: 'Xem lại lịch sử khám và hồ sơ sức khỏe và phác đồ điều trị trước đó.' },
    { icon: <FaCommentMedical />, title: 'Hỏi đáp trực tuyến', desc: 'Tư vấn trực tuyến nhanh chóng và hiệu quả từ đội ngũ y bác sĩ chuyên khoa đầu ngành.' },
    { icon: <FaTags />, title: 'Đánh giá dịch vụ', desc: 'Chia sẻ ý kiến về dịch vụ khám bệnh và chất lượng dịch vụ chúng tôi mang lại cho bạn.' },
    { icon: <FaClipboardList />, title: 'Đăng ký dịch vụ', desc: 'Đăng ký các gói khám sức khỏe theo tiêu chuẩn quốc tế và đặt lịch với bác sĩ chuyên khoa.' },
];

const GUEST_SERVICES = [
    { icon: <MdMedicalServices />, title: 'Khám & điều trị', desc: 'Khám tổng quát và chuyên khoa với quy trình nhanh chóng, hiệu quả.' },
    { icon: <FaUserMd />, title: 'Đội ngũ bác sĩ', desc: 'Bác sĩ giàu kinh nghiệm, tận tâm trong từng ca khám và điều trị.' },
    { icon: <FaCommentMedical />, title: 'Tư vấn sức khỏe', desc: 'Hỗ trợ tư vấn trực tuyến, giải đáp mọi thắc mắc về sức khỏe.' },
    { icon: <FaStar />, title: 'Chất lượng dịch vụ', desc: 'Cam kết dịch vụ chuyên nghiệp, thân thiện và an toàn.' },
    { icon: <FaCalendarAlt />, title: 'Đặt lịch khám', desc: 'Đặt lịch nhanh chóng, chủ động thời gian và lựa chọn bác sĩ.' },
];

const Home = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (['ADMIN', 'BACSI', 'YTA', 'TIEPTAN'].includes(user.role)) {
                    navigate('/admin/dashboard');
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, [navigate]);

    const servicesToDisplay = isLoggedIn ? LOGGED_IN_SERVICES : GUEST_SERVICES;

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero-content">
                    <div className="home-hero-text">
                        <p className="hero-tagline">Tiêu chuẩn quốc tế</p>
                        <h1><span className="gradient-text">Cơ sở vật chất</span><br />trang thiết bị hiện đại</h1>
                        <p className="hero-desc">Chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe tốt nhất với đội ngũ bác sĩ đầu ngành và công nghệ y khoa hiện đại hàng đầu.</p>
                        <div className="hero-btns animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <Link to="/booking" className="btn-hero-primary"><FaClipboardList /> ĐẶT LỊCH KHÁM BỆNH</Link>
                            <a href="tel:19006789" className="btn-hero-outline"><FaPhone /> 1900 6789</a>
                        </div>
                    </div>
                </div>
                <div className="home-hero-bg">
                    <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&h=480&fit=crop" alt="Phòng khám" />
                </div>
            </section>

            {/* Services Section */}
            <section className="home-services">
                <div className="home-container">
                    <div className="home-section-header">
                        <h2>Dịch vụ nhanh chóng</h2>
                        <p>
                            {isLoggedIn
                                ? "Truy cập nhanh các tiện ích và quản lý lịch sử khám bệnh, các đơn thuốc, lịch hẹn từ nhiều thiết bị."
                                : "Khám phá các dịch vụ y tế chất lượng cao và đặt lịch hẹn dễ dàng với chúng tôi."
                            }
                        </p>
                    </div>
                    <div className="services-grid">
                        {servicesToDisplay.map((s, i) => (
                            <div className="service-card" key={i}>
                                <div className="service-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    {!isLoggedIn && (
                        <div className="services-footer">
                            <Link to="/booking" className="btn-booking-now">Đặt lịch ngay</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Doctors Section */}
            <section className="home-doctors">
                <div className="home-container">
                    <div className="home-section-header">
                        <h2>Đội ngũ bác sĩ chuyên gia</h2>
                        <p>Hợp tác với các chuyên gia hàng đầu, giàu kinh nghiệm từ các bệnh viện tốt nhất cả nước.</p>
                        <Link to="/doctors" className="link-see-all">Xem tất cả bác sĩ →</Link>
                    </div>
                    <div className="home-doctors-grid">
                        {DOCTORS_HOME.map(doc => (
                            <div className="home-doctor-card" key={doc.id}>
                                <img src={doc.avatar} alt={doc.name} className="hdc-avatar" />
                                <div className="hdc-info">
                                    <span className="hdc-spec">{doc.specialty}</span>
                                    <h3>{doc.name}</h3>
                                    <p>{doc.desc}</p>
                                    <button 
                                        className="hdc-btn" 
                                        onClick={() => navigate(`/booking?doctorId=${doc.id}`)}
                                    >
                                        Đặt lịch ngay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="home-contact">
                <div className="home-container home-contact-grid">
                    <div className="home-contact-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.893108600492!2d106.0621453749453!3d21.156660183533475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31350ef6e3984627%3A0xc3c604618e4c0d38!2zQuG7h25oIHZp4buZbiDEkGEga2hvYSB04buJbmggQuG6r2MgTmluaA!5e0!3m2!1svi!2s!4v1710940000000!5m2!1svi!2s"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bản đồ phòng khám"
                        ></iframe>
                        <div className="map-marker-card glass animate-fade-in">
                            <div className="marker-icon"><FaMapMarkerAlt /></div>
                            <div className="marker-text">
                                <strong>Phòng khám Đa khoa Tỉnh</strong>
                                <p>Số 123, Lý Thái Tổ, Bắc Ninh</p>
                                <a href="https://maps.app.goo.gl/Fv6fF6vGf6vGf6vG" target="_blank" rel="noreferrer">Chỉ đường →</a>
                            </div>
                        </div>
                    </div>
                    <div className="home-contact-info">
                        <h2>Liên hệ với chúng tôi</h2>
                        <div className="contact-item"><FaMapMarkerAlt /><span>Số 123, Đường Lý Thái Tổ, TP. Bắc Ninh, Tỉnh Bắc Ninh</span></div>
                        <div className="contact-item"><FaEnvelope /><span>contact@pkdkbacninh.vn</span></div>
                        <div className="contact-item"><FaClock /><span>Thứ 2 – Thứ 6: 07:00 – 20:00. Thứ 7: cả ngày</span></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
