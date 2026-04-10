import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegCalendarAlt, FaUserEdit, FaSearch, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';
import './News.css';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await api.get('/news');
                setNews(response.data.data || []);
            } catch (err) {
                console.error("Lỗi khi tải tin tức:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const categories = ['Tất cả', ...new Set(news.map(n => n.category))];

    const normalizeString = (str) => {
        return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };

    const filteredNews = news.filter(n => {
        const searchNorm = normalizeString(searchTerm);
        const titleNorm = normalizeString(n.title);
        const summaryNorm = normalizeString(n.summary);
        
        const matchesSearch = titleNorm.includes(searchNorm) || 
                             summaryNorm.includes(searchNorm);
        const matchesCategory = activeCategory === 'Tất cả' || n.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredArt = news.find(n => n.featured);

    if (loading) {
        return (
            <div className="news-page">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Đang tải tin tức...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="news-page">
            {/* Hero Section */}
            <section className="news-hero">
                <div className="hero-content">
                    <h1>Tin Tức & Sự Kiện</h1>
                    <p>Cập nhật những thông tin mới nhất về phòng khám và kiến thức bảo vệ sức khỏe gia đình bạn.</p>
                </div>
            </section>

            <div className="news-container">
                {/* Search & Filter */}
                <div className="news-controls glass">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm tin tức..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-filters">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Article */}
                {!searchTerm && activeCategory === 'Tất cả' && featuredArt && (
                    <div className="featured-news glass">
                        <div className="featured-image">
                            <img src={featuredArt.image} alt={featuredArt.title} />
                            <span className="cat-badge">{featuredArt.category}</span>
                        </div>
                        <div className="featured-info">
                            <div className="meta">
                                <span><FaRegCalendarAlt /> {featuredArt.date}</span>
                                <span><FaUserEdit /> {featuredArt.author}</span>
                            </div>
                            <h2>{featuredArt.title}</h2>
                            <p>{featuredArt.summary}</p>
                            <Link to={`/news/${featuredArt.id}`} className="read-more">
                                Đọc tiếp <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                )}

                {/* News Grid */}
                <div className="news-grid">
                    {filteredNews.filter(n => !n.featured || searchTerm || activeCategory !== 'Tất cả').map(n => (
                        <div key={n.id} className="news-card glass animate-slide-up">
                            <div className="card-image">
                                <img src={n.image} alt={n.title} />
                                <span className="cat-tag">{n.category}</span>
                            </div>
                            <div className="card-content">
                                <div className="card-meta">
                                    <FaRegCalendarAlt /> {n.date}
                                </div>
                                <h3>{n.title}</h3>
                                <p>{n.summary.substring(0, 100)}...</p>
                                <Link to={`/news/${n.id}`} className="card-link">
                                    Xem chi tiết <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredNews.length === 0 && (
                    <div className="no-news">
                        <p>Không tìm thấy tin tức nào phù hợp với tìm kiếm của bạn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
