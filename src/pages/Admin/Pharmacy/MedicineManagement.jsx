import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdSearch, 
  MdInventory, 
  MdWarning, 
  MdHistory,
  MdEdit,
  MdDelete,
  MdMedication
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import Pagination from "../../../components/Admin/Pagination/Pagination";

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pharmacy/medicines?page=${currentPage}&pageSize=${pageSize}`);
      if (res.data.success) {
        setMedicines(res.data.data.map(m => ({
          ...m,
          minStock: 20 // Có thể lưu minStock trong DB sau này
        })));
        setTotalCount(res.data.total || res.data.data.length);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [currentPage, pageSize]);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container medicine-management">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Dược & Vật tư Y tế</h1>
            <p>Quản lý danh mục thuốc, vật tư tiêu hao và theo dõi tồn kho.</p>
          </div>
          <div className="header-actions">
            <button className="btn-premium btn-premium-secondary">
              <MdHistory /> Lịch sử kho
            </button>
            <button className="btn-premium btn-premium-primary">
              <MdAdd /> Thêm thuốc mới
            </button>
          </div>
        </div>
      </header>

      <div className="stock-alerts-row">
        <div className="glass-card alert-card warning">
          <div className="alert-icon"><MdWarning /></div>
          <div className="alert-content">
            <h3>Cảnh báo hết hàng</h3>
            <p>Có <strong>5</strong> loại thuốc đang dưới mức tồn tối thiểu.</p>
          </div>
          <button className="text-btn">Xem ngay</button>
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
          <div className="list-filters">
            <select className="premium-select">
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
                <th width="40%">Tên Thuốc / Vật tư / Dược phẩm</th>
                <th>Đơn vị</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
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
                      <span className={`stock-number ${m.stock < m.minStock ? 'critical' : ''}`}>
                        {m.stock}
                      </span>
                      <div className="stock-bar">
                        <div 
                          className={`stock-progress ${m.stock < m.minStock ? 'low' : ''}`} 
                          style={{ width: `${Math.min((m.stock / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {m.stock < m.minStock ? (
                      <span className="status-badge status-danger">
                        <span className="pulse"></span> Cần nhập thêm
                      </span>
                    ) : (
                      <span className="status-badge status-success">Ổn định</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-group">
                      <button className="btn-icon-premium edit" title="Chỉnh sửa"><MdEdit /></button>
                      <button className="btn-icon-premium delete" title="Xóa"><MdDelete /></button>
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
    </div>
  );
};

export default MedicineManagement;
