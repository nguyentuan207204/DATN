import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdPersonAdd, 
  MdEdit, 
  MdDelete, 
  MdShield,
  MdLock,
  MdLockOpen,
  MdClose,
  MdCheck
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './UserList.css';
import Pagination from "../../../components/Admin/Pagination/Pagination";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUsers, resRoles] = await Promise.all([
        api.get(`/users?page=${currentPage}&pageSize=${pageSize}`), 
        api.get('/roles')
      ]);
      if (resUsers.data.success) {
        setUsers(resUsers.data.data);
        setTotalCount(resUsers.data.total || resUsers.data.data.length);
      }
      if (resRoles.data.success) setRoles(resRoles.data.data);
    } catch (error) {
      toast.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="badge badge-danger"><MdShield /> ADMIN</span>;
      case 'BACSI': return <span className="badge badge-primary">Bác sĩ</span>;
      case 'YTA': return <span className="badge badge-success">Y tá</span>;
      case 'TIEPTAN': return <span className="badge badge-warning">Tiếp tân</span>;
      default: return <span className="badge">Bệnh nhân</span>;
    }
  };

  const handleUpdateRole = async () => {
    if (!newRole) return toast.warning('Vui lòng chọn vai trò');
    try {
      const res = await api.put(`/users/${selectedUser.id}/role`, { roleId: newRole });
      if (res.data.success) {
        toast.success('Cập nhật vai trò thành công');
        setShowRoleModal(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  const handleToggleLock = async (user) => {
    const action = user.isLocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.username}"?`)) return;

    try {
      const res = await api.put(`/users/${user.id}/lock`, { isLocked: !user.isLocked });
      if (res.data.success) {
        toast.success(`${user.isLocked ? 'Mở khóa' : 'Khóa'} tài khoản thành công`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Lỗi khi ${action} tài khoản`);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) {
      try {
        const res = await api.delete(`/users/${id}`);
        if (res.data.success) {
          toast.success('Xóa tài khoản thành công');
          fetchData();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = u.username.toLowerCase().includes(searchLow) || 
                         (u.fullName && u.fullName.toLowerCase().includes(searchLow));
    const matchesRole = roleFilter === 'ALL' || u.roleName === roleFilter;
    return matchesSearch && matchesRole;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-page-container user-management-premium">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Hệ thống & Tài khoản</h1>
            <p>Quản lý quyền truy cập và bảo mật tài khoản người dùng.</p>
          </div>
          <button className="btn-premium btn-premium-primary">
            <MdPersonAdd /> Tạo tài khoản mới
          </button>
        </div>
      </header>

      <div className="glass-card table-controls">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc username..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            className="premium-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả vai trò</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card main-list-card">
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Username</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4">Không tìm thấy tài khoản nào</td></tr>
              ) : paginatedUsers.map(u => (
                <tr key={u.id} className={u.isLocked ? 'row-locked' : ''}>
                  <td>
                    <div className="user-profile-cell">
                      <div className={`user-avatar-initials ${u.isLocked ? 'avatar-locked' : ''}`}>
                        {u.fullName?.charAt(0) || u.username.charAt(0)}
                      </div>
                      <div className="user-names">
                        <div className="name-with-status">
                          <p className="u-full">{u.fullName || 'N/A'}</p>
                          {u.isLocked === 1 && <span className="locked-tag">Đã khóa</span>}
                        </div>
                        <p className="u-email">{u.phone || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="u-username">{u.username}</td>
                  <td>{getRoleBadge(u.roleName)}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button 
                        className={`icon-btn-sm ${u.isLocked ? 'unlock' : 'lock'}`} 
                        title={u.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        onClick={() => handleToggleLock(u)}
                      >
                        {u.isLocked ? <MdLockOpen /> : <MdLock />}
                      </button>
                      <button 
                        className="icon-btn-sm edit" 
                        title="Sửa vai trò"
                        onClick={() => {
                          setSelectedUser(u);
                          setNewRole(u.roleId);
                          setShowRoleModal(true);
                        }}
                      >
                        <MdEdit />
                      </button>
                      <button 
                        className="icon-btn-sm delete" 
                        title="Xóa tài khoản"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalCount={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Role Management Modal */}
      {showRoleModal && (
        <div className="premium-modal-overlay">
          <div className="premium-modal glass-card animate-slide-up">
            <div className="modal-header">
              <h3>Cập nhật vai trò</h3>
              <button className="close-btn" onClick={() => setShowRoleModal(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <p>Thay đổi vai trò cho tài khoản: <strong>{selectedUser?.username}</strong></p>
              <div className="form-group mt-3">
                <label>Chọn vai trò mới</label>
                <select 
                  className="premium-select w-100" 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-premium btn-premium-secondary" onClick={() => setShowRoleModal(false)}>Hủy</button>
              <button className="btn-premium btn-premium-primary" onClick={handleUpdateRole}><MdCheck /> Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
