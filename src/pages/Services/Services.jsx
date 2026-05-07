import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaFlask, FaXRay, FaMicroscope, FaHeartbeat, FaSearch, FaArrowRight } from 'react-icons/fa';
import { MdMedicalServices } from 'react-icons/md';
import api from '../../utils/api';
import './Services.css';

const ICON_MAP = {
    'Khám bệnh': <FaStethoscope />,
    'Chẩn đoán hình ảnh': <FaXRay />,
    'Thủ thuật': <FaMicroscope />,
    'Tim mạch': <FaHeartbeat />,
    'default': <MdMedicalServices />
};

const Services = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(0); // 0 for All
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, categoriesRes] = await Promise.all([
                    api.get('/medical-services'),
                    api.get('/medical-services/categories')
                ]);
                setServices(servicesRes.data.data || []);
                setCategories(categoriesRes.data.data || []);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu dịch vụ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredServices = services.filter(s => {
        const matchesCategory = activeCategory === 0 || s.categoryId === activeCategory;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getIcon = (catName) => {
        return ICON_MAP[catName] || ICON_MAP['default'];
    };

    return (
        <div className="services-page">
            <div className="services-container">
                {/* Hero Section */}
                <section className="services-hero animate-slide-up">
                    <h1>Dịch vụ Y tế Chuyên sâu</h1>
                    <p>Khám phá các gói dịch vụ chất lượng cao được thiết kế để chăm sóc sức khỏe toàn diện cho bạn và gia đình.</p>
                </section>

                {/* Categories Filter */}
                <div className="categories-filter animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <button 
                        className={`category-btn ${activeCategory === 0 ? 'active' : ''}`}
                        onClick={() => setActiveCategory(0)}
                    >
                        Tất cả dịch vụ
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {getIcon(cat.name)}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="search-bar-container animate-slide-up" style={{ animationDelay: '0.2s', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
                    <div style={{ position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm dịch vụ..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '1rem 1rem 1rem 3rem', 
                                borderRadius: '16px', 
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    </div>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem', color: '#64748b' }}>Đang tải danh sách dịch vụ...</p>
                    </div>
                ) : (
                    <div className="services-grid">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((s, idx) => (
                                <div 
                                    className="service-card animate-slide-up" 
                                    key={s.id}
                                    style={{ animationDelay: `${0.1 * (idx % 4)}s` }}
                                >
                                    <div className="service-icon-box">
                                        {getIcon(categories.find(c => c.id === s.categoryId)?.name)}
                                    </div>
                                    <span className="service-cat">{categories.find(c => c.id === s.categoryId)?.name || 'Dịch vụ'}</span>
                                    <h3>{s.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                        Dịch vụ y tế chuyên môn cao, đảm bảo quy trình an toàn và kết quả chính xác cho bệnh nhân.
                                    </p>
                                    <div className="service-price-box">
                                        <div className="price-info">
                                            <span className="service-price">{Math.floor(Number(s.price)).toLocaleString('vi-VN')}</span>
                                            <span className="currency">VNĐ</span>
                                            <span className="unit">{s.unit}</span>
                                        </div>
                                        <Link to="/booking" className="btn-book-service">
                                            <span>Đặt lịch</span>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                                <MdMedicalServices style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                <h3 style={{ color: '#64748b' }}>Không tìm thấy dịch vụ nào phù hợp</h3>
                                <button 
                                    className="btn-hero-outline" 
                                    style={{ marginTop: '1rem', border: 'none', background: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: 600 }}
                                    onClick={() => { setActiveCategory(0); setSearchTerm(''); }}
                                >
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
