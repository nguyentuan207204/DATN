import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdEdit, 
  MdDelete, 
  MdCalendarToday,
  MdAccessTime,
  MdPhone,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import Pagination from '../../../components/Admin/Pagination/Pagination';
import '../../../styles/AdminPremium.css';
import './AppointmentAdminList.css';

const AppointmentAdminList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments/admin/all', {
        params: { page: currentPage, pageSize }
      });
      if (res.data.success) {
        setAppointments(res.data.data);
        setTotalCount(res.data.total || 0);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.put(`/appointments/admin/${id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Cập nhật trạng thái thành công');
        fetchAppointments(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, pageSize]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return <span className="badge badge-success"><MdCheckCircle /> Đã xác nhận</span>;
      case 'PENDING': return <span className="badge badge-warning">Đang chờ</span>;
      case 'CANCELLED': return <span className="badge badge-danger"><MdCancel /> Đã hủy</span>;
      case 'DONE': return <span className="badge badge-primary">Hoàn thành</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container appointment-admin-premium">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Quản lý Lịch hẹn</h1>
            <p>Theo dõi và điều phối lịch khám của bệnh nhân với bác sĩ.</p>
          </div>
        </div>
      </header>

      <div className="glass-card table-controls">
        <div className="search-box">
          <MdSearch />
          <input 
            type="text" 
            placeholder="Tìm theo tên bệnh nhân hoặc bác sĩ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-filter" onClick={fetchAppointments}><MdFilterList /> Làm mới</button>
      </div>

      <div className="glass-card main-list-card">
        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Bệnh nhân</th>
                <th>Bác sĩ & Dịch vụ</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Đang tải...</td></tr>
              ) : filteredAppointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <div className="apt-patient-cell">
                      <p className="p-name">{apt.patientName}</p>
                      <span className="p-phone"><MdPhone /> {apt.patientPhone || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="apt-service-cell">
                      <p className="dr-name">{apt.doctorName}</p>
                      <span className="service">{apt.serviceName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="apt-time-cell">
                      <p><MdCalendarToday /> {new Date(apt.date).toLocaleDateString('vi-VN')}</p>
                      <span><MdAccessTime /> {new Date(apt.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td>
                    <div className="status-update-cell">
                      {getStatusBadge(apt.status)}
                      <select 
                        className="status-select-sm"
                        value={apt.status}
                        onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                      >
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="CONFIRMED">Xác nhận</option>
                        <option value="DONE">Hoàn thành</option>
                        <option value="CANCELLED">Hủy bỏ</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button className="icon-btn-sm edit"><MdEdit /></button>
                      <button className="icon-btn-sm delete"><MdDelete /></button>
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

export default AppointmentAdminList;
