import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-badge">🏥 Phòng Khám Đa Khoa</div>
                    <h1 className="hero-title">
                        Chăm sóc sức khỏe <br />
                        <span className="hero-highlight">toàn diện</span> cho gia đình
                    </h1>
                    <p className="hero-desc">
                        Đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm, trang thiết bị hiện đại,
                        dịch vụ khám chữa bệnh chuyên nghiệp tại Bắc Ninh.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary">Đặt lịch khám</Link>
                        <Link to="/doctors" className="btn-outline">Xem bác sĩ</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <strong>50+</strong>
                            <span>Bác sĩ chuyên khoa</span>
                        </div>
                        <div className="stat-item">
                            <strong>200+</strong>
                            <span>Bệnh nhân/ngày</span>
                        </div>
                        <div className="stat-item">
                            <strong>25+</strong>
                            <span>Năm kinh nghiệm</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card-main">
                        <div className="pulse-ring"></div>
                        <div className="hero-icon-wrap">🏥</div>
                        <h3>Phòng Khám Đa Khoa</h3>
                        <p>Tỉnh Bắc Ninh</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
