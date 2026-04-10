import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <div className="footer-logo">🏥 PKĐK Bắc Ninh</div>
                    <p>Hệ thống phòng khám đa khoa hiện đại, cung cấp dịch vụ y tế chất lượng cao cho cộng đồng.</p>
                    <div className="footer-socials">
                        <span>f</span><span>in</span><span>yt</span>
                    </div>
                </div>

                <div>
                    <h4>Dịch vụ chính</h4>
                    <ul>
                        <li>Khám sức khỏe tổng quát</li>
                        <li>Xét nghiệm &amp; Chẩn đoán</li>
                        <li>Chẩn đoán hình ảnh</li>
                        <li>Tiêm chủng vắc xin</li>
                        <li>Khám nội soi</li>
                    </ul>
                </div>

                <div>
                    <h4>Liên kết Dịch vụ</h4>
                    <ul>
                        <li>Hỏi đáp thường gặp</li>
                        <li>Chính sách bảo mật</li>
                        <li>Quy định sử dụng</li>
                        <li>Tuyển dụng</li>
                    </ul>
                </div>

                <div>
                    <h4>Liên hệ</h4>
                    <ul>
                        <li>📍 Số 123, Đường Lý Thái Tổ, TP. Bắc Ninh</li>
                        <li>📞 1900 6789</li>
                        <li>✉️ contact@pkdkbacninh.vn</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2024 Phòng khám Đa khoa Tỉnh Bắc Ninh. Bảo lưu mọi quyền.</p>
            </div>
        </footer>
    );
};

export default Footer;
