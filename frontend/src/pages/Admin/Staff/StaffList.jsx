import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdAdd, 
  MdFilterList, 
  MdMoreVert, 
  MdEmail, 
  MdPhone,
  MdLocationOn,
  MdWork,
  MdCircle,
  MdClose,
  MdEdit,
  MdDelete
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './StaffList.css';
import Pagination from "../../../components/Admin/Pagination/Pagination";
import defaultAvatar from '../../../assets/image.png';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    departmentId: '',
    role: 'BACSI',
    username: '',
    password: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStaff, resDeps] = await Promise.all([
        api.get(`/staff?page=${currentPage}&pageSize=${pageSize}`),
        api.get('/departments')
      ]);
      
      if (resStaff.data.success) {
        setStaff(resStaff.data.data);
        setTotalCount(resStaff.data.total || resStaff.data.data.length);
      }
      if (resDeps.data.success) {
        setDepartments(resDeps.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu nhân sự');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    return <span className="status-indicator online"><MdCircle /> Hoạt động</span>;
  };

  const filteredStaff = staff.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (member = null) => {
    if (member) {
      setCurrentStaff(member);
      setFormData({
        fullName: member.fullName,
        departmentId: member.departmentId,
        role: member.roleName || 'BACSI',
        username: member.username || '',
        password: ''
      });
    } else {
      setCurrentStaff(null);
      setFormData({
        fullName: '',
        departmentId: '',
        role: 'BACSI',
        username: '',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (member) => {
    setViewingStaff(member);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStaff) {
        await api.put(`/staff/${currentStaff.id}`, formData);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        const payload = { ...formData };
        if (!payload.password) payload.password = '123456';
        await api.post('/staff', payload);
        toast.success('Thêm nhân viên thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await api.delete(`/staff/${id}`);
        toast.success('Xóa nhân viên thành công');
        fetchData();
      } catch (error) {
        toast.error('Không thể xóa nhân viên');
      }
    }
  };

  return (
    <div className="admin-page-container staff-management">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Tổ chức Nhân sự</h1>
            <p>Quản lý đội ngũ y bác sĩ và nhân viên y tế tại phòng khám.</p>
          </div>
          <button className="btn-premium btn-premium-primary" onClick={() => handleOpenModal()}>
            <MdAdd /> Thêm nhân viên mới
          </button>
        </div>
      </header>

      <div className="glass-card table-controls">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc khoa phòng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn-filter" onClick={() => fetchData()}><MdFilterList /> Làm mới</button>
        </div>
      </div>

      <div className="staff-grid">
        {loading ? (
          <div className="loading-spinner">Đang tải dữ liệu...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="no-data">Không tìm thấy nhân sự nào.</div>
        ) : filteredStaff.map(member => (
          <div key={member.id} className="glass-card staff-card">
            <div className="card-top" style={{ justifyContent: 'flex-end' }}>
              <div className="card-actions-top">
                <button className="icon-btn" onClick={() => handleOpenModal(member)}><MdEdit /></button>
                <button className="icon-btn delete" onClick={() => handleDelete(member.id)}><MdDelete /></button>
              </div>
            </div>
            <div className="card-profile">
              <img src={defaultAvatar} alt={member.fullName} className="staff-avatar" />
              <h3>{member.fullName}</h3>
              <span className="staff-role-badge">{member.roleName || member.role}</span>
            </div>
            <div className="card-info">
              <div className="info-item">
                <MdWork /> <span>{member.departmentName || 'Chưa phân khoa'}</span>
              </div>
              <div className="info-item">
                <MdEmail /> <span>{member.username ? `${member.username}@clinic.com` : 'N/A'}</span>
              </div>
              <div className="info-item">
                <MdPhone /> <span>09xxxxxx</span>
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: 'auto' }}>
              <button 
                className="btn-outline" 
                onClick={() => handleOpenViewModal(member)}
              >
                Hồ sơ chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card view-modal" style={{ maxWidth: '440px', background: 'white' }}>
            <div className="modal-header border-b pb-2 mb-4">
              <h2>{currentStaff ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Khoa / Phòng</label>
                <select 
                  value={formData.departmentId}
                  onChange={e => setFormData({...formData, departmentId: e.target.value})}
                  required
                >
                  <option value="">Chọn khoa phòng</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="BACSI">Bác sĩ</option>
                  <option value="YTA">Y tá</option>
                  <option value="TIEPTAN">Tiếp tân</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              {!currentStaff && (
                <>
                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu (mặc định: 123456)</label>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="Để trống nếu dùng mặc định"
                    />
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-premium btn-premium-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && viewingStaff && (
        <div className="modal-overlay">
          <div className="glass-card view-modal" style={{ maxWidth: '440px', background: 'white' }}>
            <div className="modal-header">
              <h2>Hồ sơ chi tiết nhân sự</h2>
              <button className="close-btn" onClick={() => setIsViewModalOpen(false)}><MdClose /></button>
            </div>
            
            <div className="text-center mb-6">
              <img src={defaultAvatar} alt={viewingStaff.fullName} className="staff-avatar" style={{width: '120px', height: '120px', margin: '0 auto 16px auto', border: '5px solid white', boxShadow: '0 12px 32px rgba(13, 138, 188, 0.2)'}} />
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: '800' }}>{viewingStaff.fullName}</h3>
              <span className="staff-role-badge mt-2">{viewingStaff.roleName || viewingStaff.role}</span>
            </div>

            <div className="card-info" style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '8px' }}>
              <div className="info-item">
                <MdWork />
                <span><strong>Khoa / Phòng:</strong> {viewingStaff.departmentName || 'Chưa phân khoa'}</span>
              </div>
              <div className="info-item">
                <MdEmail />
                <span><strong>Tên đăng nhập:</strong> {viewingStaff.username ? `${viewingStaff.username}@clinic.com` : 'N/A'}</span>
              </div>
              <div className="info-item">
                <MdPhone />
                <span><strong>SĐT Nội bộ:</strong> 09xxxxxx</span>
              </div>
            </div>

            <div className="form-actions mt-6" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-premium btn-premium-primary" onClick={() => setIsViewModalOpen(false)}>Đóng hồ sơ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
