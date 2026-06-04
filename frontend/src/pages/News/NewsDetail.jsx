import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaRegCalendarAlt,
  FaUserEdit,
  FaTag,
  FaArrowLeft,
  FaFacebookF,
  FaTwitter,
  FaLink,
  FaRegBookmark,
  FaBookmark,
  FaRegEye,
  FaChevronRight
} from 'react-icons/fa';
import api from '../../utils/api';
import './NewsDetail.css';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        const resOne = await api.get(`/news/${id}`);
        const resAll = await api.get('/news');
        if (resOne.data.success) {
          setArticle(resOne.data.data);
        }
        if (resAll.data.success) {
          const others = resAll.data.data
            .filter(n => String(n.id) !== String(id))
            .slice(0, 4);
          setRelatedNews(others);
        }
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || '');
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`
    };
    window.open(links[platform], '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Paragraphs from content text
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n').filter(p => p.trim()).map((para, i) => (
      <p key={i}>{para}</p>
    ));
  };

  if (loading) {
    return (
      <div className="nd-loading-screen">
        <div className="nd-spinner"></div>
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="nd-not-found">
        <div className="nd-not-found-inner">
          <span className="nd-404-icon">📰</span>
          <h2>Bài viết không tồn tại</h2>
          <p>Bài viết bạn tìm kiếm có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
          <Link to="/news" className="nd-back-btn">
            <FaArrowLeft /> Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="nd-page">
      {/* Hero Banner */}
      <div className="nd-hero">
        {article.image ? (
          <img src={article.image} alt={article.title} className="nd-hero-img" />
        ) : (
          <div className="nd-hero-placeholder" />
        )}
        <div className="nd-hero-overlay" />
        <div className="nd-hero-content">
          <Link to="/news" className="nd-breadcrumb">
            <FaArrowLeft /> Tin tức & Sự kiện
          </Link>
          <span className="nd-category-badge">{article.category}</span>
          <h1 className="nd-title">{article.title}</h1>
          <div className="nd-meta-row">
            <span className="nd-meta-item">
              <FaUserEdit /> {article.author || 'Phòng khám đa khoa tỉnh Bắc Ninh'}
            </span>
            <span className="nd-meta-sep">·</span>
            <span className="nd-meta-item">
              <FaRegCalendarAlt /> {formatDate(article.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="nd-layout">
        {/* Article Content */}
        <main className="nd-main">
          {/* Lead / Summary */}
          {article.summary && (
            <div className="nd-lead">
              <p>{article.summary}</p>
            </div>
          )}

          {/* Divider */}
          <div className="nd-divider">
            <span></span><span></span><span></span>
          </div>

          {/* Body */}
          <div className="nd-body">
            {renderContent(article.content)}
          </div>

          {/* Tags & Share */}
          <div className="nd-article-footer">
            <div className="nd-tags">
              <FaTag />
              <span className="nd-tag">{article.category}</span>
              <span className="nd-tag">Phòng khám Bắc Ninh</span>
              <span className="nd-tag">Sức khỏe</span>
            </div>
            <div className="nd-share-actions">
              <span className="nd-share-label">Chia sẻ:</span>
              <button className="nd-share-btn nd-fb" onClick={() => handleShare('facebook')} title="Chia sẻ Facebook">
                <FaFacebookF />
              </button>
              <button className="nd-share-btn nd-tw" onClick={() => handleShare('twitter')} title="Chia sẻ Twitter/X">
                <FaTwitter />
              </button>
              <button
                className={`nd-share-btn nd-copy ${copySuccess ? 'nd-copied' : ''}`}
                onClick={handleCopyLink}
                title="Sao chép liên kết"
              >
                <FaLink />
                {copySuccess && <span className="nd-copy-tooltip">Đã sao chép!</span>}
              </button>
              <button
                className={`nd-share-btn nd-bookmark ${bookmarked ? 'nd-bookmarked' : ''}`}
                onClick={() => setBookmarked(!bookmarked)}
                title={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
              >
                {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>
          </div>

          {/* Author Card */}
          <div className="nd-author-card">
            <div className="nd-author-avatar">
              {article.author ? article.author.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="nd-author-info">
              <p className="nd-author-label">Tác giả</p>
              <p className="nd-author-name">{article.author || 'Ban Giám Đốc'}</p>
              <p className="nd-author-desc">Phòng Khám Đa Khoa Bắc Ninh — Chăm sóc sức khỏe toàn diện cho cộng đồng.</p>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="nd-sidebar">
          {/* Disclaimer */}
          <div className="nd-sidebar-widget nd-info-box">
            <h4>💊 Lưu ý sức khỏe</h4>
            <p>Thông tin trong bài viết chỉ mang tính tham khảo. Vui lòng tham khảo ý kiến bác sĩ trước khi áp dụng.</p>
          </div>

          {/* CTA */}
          <div className="nd-sidebar-widget nd-cta-widget">
            <div className="nd-cta-icon">🏥</div>
            <h4>Đặt lịch khám ngay</h4>
            <p>Đội ngũ bác sĩ chuyên khoa đang sẵn sàng phục vụ bạn.</p>
            <Link to="/booking" className="nd-cta-btn">
              Đặt lịch khám <FaChevronRight />
            </Link>
          </div>

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div className="nd-sidebar-widget">
              <h4 className="nd-sidebar-title">Bài viết liên quan</h4>
              <div className="nd-related-list">
                {relatedNews.map(item => (
                  <Link to={`/news/${item.id}`} key={item.id} className="nd-related-item">
                    <div className="nd-related-thumb">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="nd-related-thumb-placeholder">
                          <FaRegEye />
                        </div>
                      )}
                    </div>
                    <div className="nd-related-info">
                      <span className="nd-related-cat">{item.category}</span>
                      <p className="nd-related-title">{item.title}</p>
                      <span className="nd-related-date">{formatDate(item.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom CTA */}
      <div className="nd-bottom-nav">
        <div className="nd-bottom-nav-inner">
          <button className="nd-back-link" onClick={() => navigate('/news')}>
            <FaArrowLeft /> Tất cả tin tức
          </button>
          <div className="nd-bottom-share">
            <span>Chia sẻ bài viết:</span>
            <button className="nd-share-btn nd-fb" onClick={() => handleShare('facebook')}><FaFacebookF /></button>
            <button className="nd-share-btn nd-tw" onClick={() => handleShare('twitter')}><FaTwitter /></button>
            <button className={`nd-share-btn nd-copy ${copySuccess ? 'nd-copied' : ''}`} onClick={handleCopyLink}><FaLink /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
