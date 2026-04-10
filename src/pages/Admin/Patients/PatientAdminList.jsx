import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdPersonAdd, 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdDateRange,
  MdHistory,
  MdPerson
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './PatientAdminList.css';

import Pagination from "../../../components/Admin/Pagination/Pagination";

const PatientAdminList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients?page=${currentPage}&pageSize=${pageSize}`);
      if (res.data.success) {
        setPatients(res.data.data);
        setTotalCount(res.data.total || res.data.data.length);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [currentPage, pageSize]);

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredPatients = patients.filter(p => {
    const searchLow = searchTerm.toLowerCase();
    return (p.fullName && p.fullName.toLowerCase().includes(searchLow)) || 
           (p.phone && p.phone.includes(searchLow)) ||
           (p.id && p.id.toString().includes(searchLow));
  });

  const handleDeletePatient = async (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa bệnh nhân "${name}"? Thao tác này có thể ảnh hưởng đến lịch sử y tế.`)) {
      try {
        const res = await api.delete(`/patients/${id}`);
        if (res.data.success) {
          toast.success('Xóa bệnh nhân thành công');
          fetchPatients();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa bệnh nhân');
      }
    }
  };

  return (
    <div className="admin-page-container patient-management-premium patient-admin">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Quản lý Bệnh nhân</h1>
            <p>Theo dõi hồ sơ, lịch sử khám bệnh và thông tin chi tiết của bệnh nhân.</p>
          </div>
          <button className="btn-premium btn-premium-primary">
            <MdPersonAdd /> Thêm bệnh nhân mới
          </button>
        </div>
      </header>

      <div className="glass-card table-controls">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Tìm theo tên, SĐT hoặc mã BN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="stats-mini-group">
          <div className="stat-mini">
            <span className="label">Tổng bệnh nhân:</span>
            <span className="value">{patients.length}</span>
          </div>
        </div>
      </div>

      <div className="glass-card main-list-card">
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Mã BN</th>
                <th>Bệnh nhân</th>
                <th>Tuổi</th>
                <th>Giới tính</th>
                <th>Lần khám cuối</th>
                <th>Tổng chi tiêu</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4">Không tìm thấy bệnh nhân nào</td></tr>
              ) : filteredPatients.map(p => (
                <tr key={p.id}>
                  <td className="u-username">#BN{String(p.id).padStart(5, '0')}</td>
                  <td>
                    <div className="user-profile-cell">
                      <div className="user-avatar-initials">
                        {p.fullName?.charAt(0) || <MdPerson />}
                      </div>
                      <div className="user-names">
                        <p className="u-full">{p.fullName}</p>
                        <p className="u-email">{p.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td>{calculateAge(p.dateOfBirth)}</td>
                  <td>
                    <span className={`gender-tag ${p.gender?.toLowerCase()}`}>
                      {p.gender === 'NAM' ? 'Nam' : p.gender === 'NU' ? 'Nữ' : 'Khác'}
                    </span>
                  </td>
                  <td>
                    {p.lastVisit ? 
                      <span className="visit-date"><MdDateRange /> {new Date(p.lastVisit).toLocaleDateString('vi-VN')}</span> 
                      : <span className="text-muted">Chưa có</span>
                    }
                  </td>
                  <td className="spending-cell">{formatCurrency(p.totalSpent || 0)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button className="icon-btn-sm view" title="Xem hồ sơ">
                        <MdVisibility />
                      </button>
                      <button className="icon-btn-sm edit" title="Sửa thông tin">
                        <MdEdit />
                      </button>
                      <button 
                        className="icon-btn-sm delete" 
                        title="Xóa"
                        onClick={() => handleDeletePatient(p.id, p.fullName)}
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

export default PatientAdminList;
