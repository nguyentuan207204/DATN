import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdSearch, 
  MdEdit, 
  MdDelete, 
  MdCategory,
  MdMedicalServices,
  MdClose
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import Pagination from '../../../components/Admin/Pagination/Pagination';
import '../../../styles/AdminPremium.css';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modals State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  // Form State
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: 0,
    categoryId: '',
    departmentId: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resServices, resCategories, resDepts] = await Promise.all([
        api.get('/medical-services', { params: { page: currentPage, pageSize } }),
        api.get('/medical-services/categories'),
        api.get('/departments')
      ]);
      
      if (resServices.data.success) {
        setServices(resServices.data.data);
        setTotalCount(resServices.data.total || 0);
      }
      if (resCategories.data.success) setCategories(resCategories.data.data);
      if (resDepts.data.success) setDepartments(resDepts.data.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Service Handlers ---
  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setCurrentService(service);
      setServiceForm({
        name: service.name,
        price: service.price,
        categoryId: service.categoryId,
        departmentId: service.departmentId || ''
      });
    } else {
      setCurrentService(null);
      setServiceForm({
        name: '',
        price: 0,
        categoryId: categories[0]?.id || '',
        departmentId: ''
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentService) {
        await api.put(`/medical-services/${currentService.id}`, serviceForm);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        await api.post('/medical-services', serviceForm);
        toast.success('Thêm dịch vụ thành công');
      }
      setIsServiceModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi lưu dịch vụ');
    }
  };

  const handleServiceDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await api.delete(`/medical-services/${id}`);
        toast.success('Xóa dịch vụ thành công');
        fetchData();
      } catch (error) {
        toast.error('Lỗi khi xóa dịch vụ');
      }
    }
  };

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setCurrentCategory(cat);
      setCategoryForm({ name: cat.name, description: cat.description || '' });
    } else {
      setCurrentCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await api.put(`/medical-services/categories/${currentCategory.id}`, categoryForm);
        toast.success('Cập nhật nhóm thành công');
      } else {
        await api.post('/medical-services/categories', categoryForm);
        toast.success('Thêm nhóm thành công');
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Lỗi khi lưu nhóm dịch vụ');
    }
  };

  return (
    <div className="admin-page-container service-management">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Dịch vụ Y tế</h1>
            <p>Quản lý danh mục dịch vụ và các nhóm dịch vụ khám chữa bệnh.</p>
          </div>
          <div className="header-actions">
            <button className="btn-premium btn-premium-secondary" onClick={() => handleOpenCategoryModal()}>
              <MdCategory /> Quản lý nhóm
            </button>
            <button className="btn-premium btn-premium-primary" onClick={() => handleOpenServiceModal()}>
              <MdAdd /> Thêm dịch vụ
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-grid-2-1">
        <div className="glass-card main-list">
          <div className="list-controls">
            <div className="search-box">
              <MdSearch />
              <input 
                type="text" 
                placeholder="Tìm kiếm dịch vụ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Tên dịch vụ</th>
                  <th>Nhóm</th>
                  <th>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-4">Đang tải...</td></tr>
                ) : filteredServices.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">Không tìm thấy dịch vụ nào</td></tr>
                ) : filteredServices.map(service => (
                  <tr key={service.id}>
                    <td className="font-bold">{service.name}</td>
                    <td><span className="badge badge-primary">{categories.find(c => c.id === service.categoryId)?.name}</span></td>
                    <td className="color-primary">{Number(service.price).toLocaleString('vi-VN')} đ</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn-sm edit" onClick={() => handleOpenServiceModal(service)} title="Chỉnh sửa"><MdEdit /></button>
                      <button className="icon-btn-sm delete" onClick={() => handleServiceDelete(service.id)} title="Xóa"><MdDelete /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="glass-card category-summary">
          <h3>Thống kê nhóm dịch vụ</h3>
          <div className="category-list">
            {categories.map(cat => (
              <div key={cat.id} className="cat-stat-item" onClick={() => handleOpenCategoryModal(cat)} style={{ cursor: 'pointer' }}>
                <div className="cat-info">
                  <span className="cat-name">{cat.name} <MdEdit size={12} /></span>
                  <span className="cat-count">
                    {/* Chúng ta cần tổng số dịch vụ từ tất cả các trang, hoặc bỏ qua số lượng nếu không có API riêng */}
                    {cat.id ? "Dịch vụ trong danh mục" : "0 dịch vụ"}
                  </span>
                </div>
                <div className="cat-progress-bg">
                  <div 
                    className="cat-progress-fill" 
                    style={{ width: services.length > 0 ? `${(services.filter(s => s.categoryId === cat.id).length / services.length) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '500px' }}>
            <div className="modal-header">
              <h2>{currentService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
              <button className="close-btn" onClick={() => setIsServiceModalOpen(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleServiceSubmit} className="admin-form">
              <div className="form-group">
                <label>Tên dịch vụ</label>
                <input 
                  type="text" 
                  value={serviceForm.name} 
                  onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Đơn giá (VNĐ)</label>
                <input 
                  type="number" 
                  value={serviceForm.price} 
                  onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nhóm dịch vụ</label>
                <select 
                  value={serviceForm.categoryId} 
                  onChange={e => setServiceForm({...serviceForm, categoryId: e.target.value})}
                  required
                >
                  <option value="">Chọn nhóm</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Khoa thực hiện</label>
                <select 
                  value={serviceForm.departmentId} 
                  onChange={e => setServiceForm({...serviceForm, departmentId: e.target.value})}
                >
                  <option value="">Tất cả các khoa</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsServiceModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-premium btn-premium-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <h2>{currentCategory ? 'Chỉnh sửa nhóm' : 'Thêm nhóm dịch vụ'}</h2>
              <button className="close-btn" onClick={() => setIsCategoryModalOpen(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleCategorySubmit} className="admin-form">
              <div className="form-group">
                <label>Tên nhóm</label>
                <input 
                  type="text" 
                  value={categoryForm.name} 
                  onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea 
                  rows="3"
                  value={categoryForm.description} 
                  onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsCategoryModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-premium btn-premium-primary">Lưu nhóm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
