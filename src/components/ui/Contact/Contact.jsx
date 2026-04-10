import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <section className="contact-section" id="lien-he">
            <div className="contact-container">
                <div className="section-header">
                    <div className="section-badge">Liên hệ</div>
                    <h2>Đặt lịch khám ngay</h2>
                    <p>Gọi cho chúng tôi hoặc điền form để được tư vấn miễn phí</p>
                </div>
                <div className="contact-grid">
                    <div className="contact-info">
                        <div className="info-item">
                            <span className="info-icon">📍</span>
                            <div>
                                <strong>Địa chỉ</strong>
                                <p>Đường Lê Thái Tổ, TP. Bắc Ninh</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">📞</span>
                            <div>
                                <strong>Điện thoại</strong>
                                <p>0222 3827 075</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">⏰</span>
                            <div>
                                <strong>Giờ làm việc</strong>
                                <p>Thứ 2 - Thứ 6: 7:00 - 17:00</p>
                            </div>
                        </div>
                    </div>
                    <div className="contact-card">
                        <h3>Gọi đặt lịch ngay</h3>
                        <p>Đội ngũ tư vấn sẵn sàng hỗ trợ bạn 24/7</p>
                        <a href="tel:02223827075" className="btn-call">📞 0222 3827 075</a>
                    </div>
                </div>

                <div className="map-wrapper animate-fade-in">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.893108600492!2d106.0621453749453!3d21.156660183533475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31350ef6e3984627%3A0xc3c604618e4c0d38!2zQuG7h25oIHZp4buZbiDEkGEga2hvYSB04buJbmggQuG6r2MgTmluaA!5e0!3m2!1svi!2s!4v1710940000000!5m2!1svi!2s" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Bản đồ phòng khám"
                        className="google-map-iframe"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default Contact;
