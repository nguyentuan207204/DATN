import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdClose, 
  MdCheck, 
  MdCloudUpload, 
  MdStar, 
  MdStarBorder, 
  MdImage,
  MdArticle
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './NewsAdminList.css';
import Pagination from "../../../components/Admin/Pagination/Pagination";

const NewsAdminList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Thông báo',
    author: 'Ban Giám Đốc',
    date: new Date().toISOString().substring(0, 10),
    image: '',
    featured: false
  });

  const categories = ['Thông báo', 'Kiến thức', 'Dịch vụ', 'Tin tức', 'Khác'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/news');
      if (res.data.success) {
        setNews(res.data.data);
        setTotalCount(res.data.data.length);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'Thông báo',
      author: 'Ban Giám Đốc',
      date: new Date().toISOString().substring(0, 10),
      image: '',
      featured: false
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      summary: item.summary || '',
      content: item.content || '',
      category: item.category || 'Thông báo',
      author: item.author || 'Ban Giám Đốc',
      date: item.date ? item.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
      image: item.image || '',
      featured: item.featured === 1 || item.featured === true
    });
    setShowFormModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Vui lòng chọn ảnh nhỏ hơn 2MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        toast.success('Đã tải ảnh lên bộ nhớ tạm!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.warning('Vui lòng nhập tiêu đề');
    if (!formData.summary.trim()) return toast.warning('Vui lòng nhập tóm tắt');
    if (!formData.content.trim()) return toast.warning('Vui lòng nhập nội dung');

    try {
      const payload = {
        ...formData,
        featured: formData.featured ? 1 : 0
      };

      let res;
      if (editingNews) {
        res = await api.put(`/news/${editingNews.id}`, payload);
      } else {
        res = await api.post('/news', payload);
      }

      if (res.data.success) {
        toast.success(`${editingNews ? 'Cập nhật' : 'Đăng'} tin tức thành công!`);
        setShowFormModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tin tức');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin tức "${title}"?`)) {
      try {
        const res = await api.delete(`/news/${id}`);
        if (res.data.success) {
          toast.success('Xóa tin tức thành công');
          fetchData();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa tin tức');
      }
    }
  };

  // Lọc tin tức theo tìm kiếm và phân loại
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Phân trang
  const paginatedNews = filteredNews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-page-container news-management-premium">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Quản lý Tin tức</h1>
            <p>Đăng tải và quản trị các bài viết, kiến thức y khoa, thông báo của phòng khám.</p>
          </div>
          <button className="btn-premium btn-premium-primary" onClick={handleOpenAdd}>
            <MdAdd /> Viết bài mới
          </button>
        </div>
      </header>

      <div className="glass-card table-controls">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề hoặc nội dung..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-group">
          <select 
            className="premium-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card main-list-card">
        {loading ? (
          <div className="text-center py-5">Đang tải dữ liệu...</div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-5">Không tìm thấy tin tức nào</div>
        ) : (
          <>
            <div className="news-admin-grid">
              {paginatedNews.map(item => (
                <div key={item.id} className={`news-admin-card glass ${item.featured ? 'card-featured' : ''}`}>
                  <div className="card-image-wrapper">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="card-thumb" />
                    ) : (
                      <div className="card-thumb-placeholder">
                        <MdImage />
                      </div>
                    )}
                    <span className="card-badge-cat">{item.category}</span>
                    {item.featured === 1 && (
                      <span className="card-badge-featured" title="Tin nổi bật">
                        <MdStar /> Nổi bật
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title" title={item.title}>{item.title}</h3>
                    <p className="card-summary">{item.summary}</p>
                    <div className="card-meta">
                      <span>Tác giả: <strong>{item.author}</strong></span>
                      <span>Ngày: {new Date(item.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-action-edit" onClick={() => handleOpenEdit(item)}>
                      <MdEdit /> Sửa bài
                    </button>
                    <button className="btn-action-delete" onClick={() => handleDelete(item.id, item.title)}>
                      <MdDelete /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination 
              currentPage={currentPage}
              totalCount={filteredNews.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Editor Modal */}
      {showFormModal && (
        <div className="premium-modal-overlay">
          <div className="premium-modal glass-card modal-large animate-slide-up">
            <div className="modal-header">
              <h3>{editingNews ? 'Chỉnh sửa bài viết' : 'Viết bài tin tức mới'}</h3>
              <button className="close-btn" onClick={() => setShowFormModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <div className="modal-grid-2">
                  <div className="form-group">
                    <label>Tiêu đề bài viết <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="premium-input" 
                      placeholder="Nhập tiêu đề tin tức..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select 
                      className="premium-select"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="modal-grid-2 mt-3">
                  <div className="form-group">
                    <label>Tác giả</label>
                    <input 
                      type="text" 
                      className="premium-input" 
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày đăng bài</label>
                    <input 
                      type="date" 
                      className="premium-input" 
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group mt-3">
                  <label>Tóm tắt bài viết (Summary) <span className="text-danger">*</span></label>
                  <textarea 
                    className="premium-textarea" 
                    rows="2"
                    placeholder="Mô tả ngắn gọn nội dung bài viết..."
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group mt-3">
                  <label>Nội dung chi tiết bài viết <span className="text-danger">*</span></label>
                  <textarea 
                    className="premium-textarea" 
                    rows="6"
                    placeholder="Nhập nội dung đầy đủ của tin tức..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group mt-3">
                  <label>Ảnh đại diện tin tức (Image URL hoặc Tải lên từ máy)</label>
                  <div className="image-upload-wrapper">
                    <input 
                      type="text" 
                      className="premium-input flex-grow-1" 
                      placeholder="Dán URL ảnh hoặc chọn file upload..."
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    />
                    <label className="btn-upload-file">
                      <MdCloudUpload /> Chọn file
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  
                  {formData.image && (
                    <div className="image-preview-box mt-3">
                      <p>Xem trước ảnh:</p>
                      <img src={formData.image} alt="Xem trước" className="preview-img" />
                      <button 
                        type="button" 
                        className="btn-clear-img"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group mt-3 flex-row align-items-center">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    />
                    <span className="checkmark"></span>
                    <span style={{ marginLeft: '8px', fontWeight: '600' }}>Đánh dấu là Tin tức nổi bật (Featured)</span>
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-premium btn-premium-secondary" onClick={() => setShowFormModal(false)}>Hủy</button>
                <button type="submit" className="btn-premium btn-premium-primary">
                  <MdCheck /> {editingNews ? 'Lưu thay đổi' : 'Đăng bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAdminList;
