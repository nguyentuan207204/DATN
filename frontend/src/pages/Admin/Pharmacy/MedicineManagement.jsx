import React, { useState, useEffect } from 'react';
import {
  MdAdd,
  MdSearch,
  MdInventory,
  MdWarning,
  MdHistory,
  MdEdit,
  MdDelete,
  MdMedication,
  MdClose,
  MdSave,
  MdRestore,
  MdCheckCircle
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './MedicineManagement.css';
import Pagination from "../../../components/Admin/Pagination/Pagination";

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [standardizedCount, setStandardizedCount] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    official_code: '',
    name: '',
    category: '',
    unit: 'Viên',
    price: '',
    stock: 0,
    minStock: 20,
    description: ''
  });

  const [showDeleted, setShowDeleted] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyTitle, setHistoryTitle] = useState('Lịch sử biến động Kho');

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ official_code: '', name: '', category: '', unit: 'Viên', price: '', stock: 0, minStock: 20, description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setIsEditing(true);
    setFormData({ ...medicine, minStock: medicine.minStock || 20 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleShowDeleted = () => {
    const newVal = !showDeleted;
    setShowDeleted(newVal);
    setCurrentPage(1); // Quay lại trang đầu khi chuyển đổi
  };
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên Dược phẩm');
      return;
    }

    try {
      if (isEditing) {
        const res = await api.put(`/pharmacy/medicines/${formData.id}`, formData);
        if (res.data.success) {
          toast.success('Cập nhật thành công!');
        }
      } else {
        const res = await api.post('/pharmacy/medicines', formData);
        if (res.data.success) {
          toast.success('Thêm Dược phẩm mới thành công!');
        }
      }
      closeModal();
      fetchMedicines(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Dược phẩm này không?\n\nLưu ý: Dữ liệu sẽ được chuyển vào danh sách tạm xóa và có thể khôi phục lại.")) {
      return;
    }
    try {
      const res = await api.delete(`/pharmacy/medicines/${id}`);
      if (res.data.success) {
        toast.success("Đã chuyển vào danh sách tạm xóa!");
        fetchMedicines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa Dược phẩm này');
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Bạn có muốn khôi phục Dược phẩm này về danh sách đang sử dụng?")) {
      return;
    }
    try {
      const res = await api.patch(`/pharmacy/medicines/${id}/restore`);
      if (res.data.success) {
        toast.success("Khôi phục Dược phẩm thành công!");
        fetchMedicines();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể khôi phục Dược phẩm này');
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pharmacy/medicines?page=${currentPage}&pageSize=${pageSize}&includeDeleted=${showDeleted}&status=${filterStatus}`);
      if (res.data.success) {
        setMedicines(res.data.data);
        setTotalCount(res.data.total || 0);
      }
      
      // Fetch critical count for banner
      const criticalRes = await api.get('/pharmacy/medicines/critical-count');
      if (criticalRes.data.success) {
        setCriticalCount(criticalRes.data.count);
      }

      // Calculate standardized count
      const stdCount = medicines.filter(m => m.official_code).length;
      setStandardizedCount(stdCount);
    } catch (error) {
      toast.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllHistory = async () => {
    try {
      const res = await api.get('/pharmacy/stock/all-history');
      if (res.data.success) {
        setHistoryData(res.data.data);
        setHistoryTitle('Lịch sử biến động Kho (Toàn bộ)');
        setIsHistoryOpen(true);
      }
    } catch (error) {
      toast.error('Không thể tải lịch sử kho');
    }
  };

  const handleViewMedicineHistory = async (medicine) => {
    try {
      const res = await api.get(`/pharmacy/stock/${medicine.id}/history`);
      if (res.data.success) {
        setHistoryData(res.data.data);
        setHistoryTitle(`Lịch sử: ${medicine.name}`);
        setIsHistoryOpen(true);
      }
    } catch (error) {
      toast.error('Không thể tải lịch sử của sản phẩm này');
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [currentPage, pageSize, showDeleted, filterStatus]);

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container medicine-management">
      <header className="admin-header glass-card" style={{ padding: '24px 32px', marginBottom: '24px', borderRadius: '24px' }}>
        <div className="header-main">
          <div>
            <h1 style={{ marginBottom: '8px' }}>Dược & Vật tư Y tế</h1>
            <p style={{ margin: 0 }}>Quản lý danh mục thuốc, vật tư tiêu hao và theo dõi số lượng.</p>
          </div>
          <div className="header-actions">
            <button className="btn-premium btn-premium-secondary" onClick={handleViewAllHistory}>
              <MdHistory /> Lịch sử nhập xuất
            </button>
            <button className="btn-premium btn-premium-primary" onClick={openAddModal}>
              <MdAdd /> Thêm Dược Phẩm
            </button>
          </div>
        </div>
      </header>

      <div className="stock-alerts-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card alert-card warning">
          <div className="alert-icon"><MdWarning /></div>
          <div className="alert-content">
            <h3>Cảnh báo sắp hết hàng</h3>
            <p>Có <strong>{criticalCount}</strong> loại thuốc đang dưới mức tồn tối thiểu.</p>
          </div>
          <button 
            className="text-btn" 
            onClick={() => {
              setFilterStatus('critical');
              setCurrentPage(1);
            }}
          >
            Xem ngay
          </button>
        </div>

        <div className="glass-card alert-card success">
          <div className="alert-icon" style={{ color: '#10b981' }}><MdCheckCircle /></div>
          <div className="alert-content">
            <h3>Chuẩn hóa Dữ liệu (BYT)</h3>
            <p>Đã chuẩn hóa <strong>{standardizedCount}/{medicines.length}</strong> loại thuốc trong trang này.</p>
            <div className="compliance-bar">
               <div className="compliance-progress" style={{ width: `${(standardizedCount / (medicines.length || 1)) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card main-list-card">
        <div className="list-header">
          <div className="search-box">
            <MdSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên thuốc hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-filters" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="pharmacy-view-tabs">
              <button 
                className={`view-tab ${!showDeleted ? 'active' : ''}`}
                onClick={() => { setShowDeleted(false); setCurrentPage(1); }}
              >
                <MdInventory /> <span>Đang dùng</span>
              </button>
              <button 
                className={`view-tab ${showDeleted ? 'active' : ''}`}
                onClick={() => { setShowDeleted(true); setCurrentPage(1); }}
              >
                <MdDelete /> <span>Đã xóa</span>
              </button>
            </div>
            <select 
              className="premium-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="critical">Sắp hết hàng</option>
            </select>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th width="12%">Mã thuốc</th>
                <th width="33%">Tên Thuốc / Vật tư / Dược phẩm</th>
                <th>Đơn vị</th>
                <th>Giá (VNĐ)</th>
                <th>Số lượng</th>
                <th style={{ textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Đang tải dữ liệu dược phẩm...</td></tr>
              ) : filteredMedicines.length === 0 ? (
                <tr><td colSpan="5" className="text-center">Không tìm thấy thuốc nào khớp với tìm kiếm.</td></tr>
              ) : filteredMedicines.map(m => (
                <tr key={m.id}>
                  <td>
                    <span className="code-tag">{m.official_code || 'Chưa mã'}</span>
                  </td>
                  <td>
                    <div className="medicine-info-cell">
                      <div className="med-icon">
                        <MdMedication />
                      </div>
                      <div className="med-details">
                        <p className="med-name">{m.name}</p>
                        <p className="med-desc">{m.description || 'Chưa có thông tin chi tiết về sản phẩm này'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="unit-tag">{m.unit}</span>
                  </td>
                  <td>
                    <div className="stock-indicator">
                      <span className="stock-number" style={{ fontWeight: '600', color: '#2b3643' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.price || 0)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="stock-indicator" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span className={`stock-number ${m.stock < m.minStock ? 'critical' : ''}`} style={{ fontWeight: '600', fontSize: '1.1rem', color: m.stock < m.minStock ? '#e74c3c' : '#2ecc71' }}>
                        {m.stock}
                      </span>
                      {m.stock < m.minStock && (
                         <span className="tooltip-mini" title="Sắp hết hàng!" style={{ marginLeft: '6px', color: '#e74c3c' }}>⚠️</span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-group">
                      <button className="btn-icon-premium history" title="Lịch sử" onClick={() => handleViewMedicineHistory(m)}>
                        <MdHistory />
                      </button>
                      {showDeleted ? (
                        <button className="btn-icon-premium restore" title="Khôi phục" onClick={() => handleRestore(m.id)}>
                          <MdRestore />
                        </button>
                      ) : (
                        <>
                          <button className="btn-icon-premium edit" title="Chỉnh sửa" onClick={() => openEditModal(m)}>
                            <MdEdit />
                          </button>
                          <button className="btn-icon-premium delete" title="Xóa" onClick={() => handleDelete(m.id)}>
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
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

      {/* Pro Max Modal */}
      {isModalOpen && (
        <div className="pro-modal-overlay">
          <div className="pro-modal-content">
            <div className="pro-modal-header">
              <div>
                <h2>{isEditing ? 'Chỉnh sửa thông tin Thuốc' : 'Thêm Dược phẩm mới'}</h2>
                <p>Điền đầy đủ các thông tin bên dưới để đưa sản phẩm vào danh sách lưu trữ</p>
              </div>
              <button className="pro-close-btn" onClick={closeModal}><MdClose /></button>
            </div>

            <div className="pro-modal-body">
              <div className="pro-form-grid">
                <div className="pro-form-group">
                  <label>Mã thuốc Bộ Y tế</label>
                  <input
                    type="text"
                    placeholder="VD: 01.123.01"
                    value={formData.official_code || ''}
                    onChange={(e) => setFormData({ ...formData, official_code: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label>Tên Thuốc / Dược phẩm <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="VD: Paracetamol 500mg"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label>Danh mục (Phân loại)</label>
                  <input
                    type="text"
                    placeholder="VD: Thuốc giảm đau"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="pro-form-group">
                  <label>Đơn vị đóng gói 📦</label>
                  <select
                    value={formData.unit || 'Viên'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="Viên">Viên</option>
                    <option value="Vỉ">Vỉ</option>
                    <option value="Hộp">Hộp</option>
                    <option value="Chai">Chai</option>
                    <option value="Tuýp">Tuýp</option>
                    <option value="Ống">Ống</option>
                  </select>
                </div>

                <div className="pro-form-group">
                  <label>Số lượng hiện tại</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.stock || 0}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, stock: value === '' ? 0 : parseInt(value) });
                    }}
                  />
                </div>

                <div className="pro-form-group">
                  <label>Mức số lượng cảnh báo <span className="tooltip-mini" title="Thông báo khi số lượng dưới mức này">ℹ</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="20"
                    value={formData.minStock || 0}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, minStock: value === '' ? 0 : parseInt(value) });
                    }}
                  />
                </div>

                <div className="pro-form-group span-2">
                  <label>Giá dự kiến (VNĐ) <span className="tooltip-mini" title="Giá tham khảo để bán/xuất">ℹ</span></label>
                  <input
                    type="number"
                    placeholder="VD: 15000"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="pro-form-group span-2">
                  <label>Ghi chú / Hướng dẫn sử dụng</label>
                  <textarea
                    rows="3"
                    placeholder="VD: Uống sau bữa ăn..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pro-modal-footer">
              <button className="btn-outline" onClick={closeModal}>Hủy bỏ</button>
              <button className="btn-premium btn-premium-primary" onClick={handleSubmit}>
                <MdSave /> {isEditing ? 'Cập nhật' : 'Xác nhận tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="pro-modal-overlay">
          <div className="pro-modal-content history-modal">
            <div className="pro-modal-header">
              <div>
                <h2>{historyTitle}</h2>
                <p>Theo dõi các giao dịch nhập, xuất và điều chỉnh kho theo thời gian</p>
              </div>
              <button className="pro-close-btn" onClick={() => setIsHistoryOpen(false)}><MdClose /></button>
            </div>

            <div className="pro-modal-body">
              <div className="history-table-container">
                <table className="premium-table history-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Tên Thuốc</th>
                      <th>Loại giao dịch</th>
                      <th>Số lượng</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length === 0 ? (
                      <tr><td colSpan="5" className="text-center">Chưa có lịch sử biến động nào.</td></tr>
                    ) : (
                      historyData.map((h) => (
                        <tr key={h.id}>
                          <td>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                          <td>
                            <div className="history-med-info">
                               <p className="med-name">{h.name}</p>
                               <p className="med-unit">ĐVT: {h.unit}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`movement-tag ${h.type.toLowerCase()}`}>
                              {h.type === 'IMPORT' ? 'Nhập kho' : h.type === 'EXPORT' ? 'Xuất kho' : 'Điều chỉnh'}
                            </span>
                          </td>
                          <td>
                            <span className={`movement-qty ${h.type.toLowerCase()}`}>
                              {h.type === 'EXPORT' ? '-' : h.type === 'IMPORT' ? '+' : h.quantity >= 0 ? '+' : ''}
                              {h.quantity}
                            </span>
                          </td>
                          <td>
                             <span className="history-note">{h.type === 'IMPORT' ? 'Nhập kho định kỳ' : h.type === 'EXPORT' ? 'Kê đơn / Xuất bán' : 'Điều chỉnh thủ công'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pro-modal-footer">
              <button className="btn-premium btn-premium-primary" onClick={() => setIsHistoryOpen(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
