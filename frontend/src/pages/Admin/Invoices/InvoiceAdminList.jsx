import React, { useState, useEffect } from 'react';
import { 
  MdReceipt, 
  MdSearch, 
  MdFilterList, 
  MdTrendingUp, 
  MdPayments, 
  MdBarChart,
  MdVisibility,
  MdPrint
} from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../components/Admin/Pagination/Pagination';
import '../../../styles/AdminPremium.css';
import './InvoiceAdminList.css';

const InvoiceAdminList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ todayRevenue: 0, totalUnpaid: 0 });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [resList, resStats] = await Promise.all([
        api.get('/billing/invoices', { params: { page: currentPage, pageSize, from: fromDate, to: toDate } }),
        api.get('/billing/admin-stats')
      ]);

      if (resList.data.success) {
        setInvoices(resList.data.data);
        setTotalCount(resList.data.total || 0);
      }
      if (resStats.data.success) {
        setStats(resStats.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, pageSize]);

  const handleFilter = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchInvoices();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return <span className="badge badge-success">Đã thanh toán</span>;
      case 'UNPAID': return <span className="badge badge-warning">Chưa thanh toán</span>;
      case 'CANCELLED': return <span className="badge badge-danger">Đã hủy</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="admin-page-container invoice-admin">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Viện phí & Doanh thu</h1>
            <p>Quản lý toàn bộ hóa đơn hệ thống và thống kê doanh thu định kỳ.</p>
          </div>
          <div className="header-actions">
            <button className="btn-premium btn-premium-secondary" onClick={() => navigate('/admin/reports/revenue')}>
              <MdBarChart /> Báo cáo chi tiết
            </button>
          </div>
        </div>
      </header>

      <div className="invoice-stats-row">
        <div className="glass-card invoice-stat">
          <div className="stat-icon revenue"><MdTrendingUp /></div>
          <div className="stat-data">
            <span>Doanh thu hôm nay</span>
            <h3>{Number(stats.todayRevenue || 0).toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
        <div className="glass-card invoice-stat">
          <div className="stat-icon pending"><MdPayments /></div>
          <div className="stat-data">
            <span>Chưa thanh toán</span>
            <h3>{Number(stats.totalUnpaid || 0).toLocaleString('vi-VN')}đ</h3>
          </div>
        </div>
      </div>

      <div className="glass-card main-list-card">
        <div className="list-header">
          <div className="search-box">
            <MdSearch />
            <input 
              type="text" 
              placeholder="Tìm theo mã HĐ hoặc tên bệnh nhân..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="list-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="date-filter" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <label style={{ fontSize: '14px', color: '#687b92', fontWeight: '500' }}>Từ:</label>
               <input type="date" className="premium-select" style={{ padding: '8px 12px' }} value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="date-filter" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <label style={{ fontSize: '14px', color: '#687b92', fontWeight: '500' }}>Đến:</label>
               <input type="date" className="premium-select" style={{ padding: '8px 12px' }} value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="btn-filter" onClick={handleFilter}><MdFilterList /> Lọc</button>
          </div>
        </div>

        <div className="premium-table-container">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Mã Hóa đơn</th>
                <th>Bệnh nhân</th>
                <th>Ngày tạo</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Đang tải...</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="inv-id">HĐ-{inv.id}</td>
                  <td className="inv-patient">{inv.patientName}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="inv-amount">{Number(inv.totalAmount || 0).toLocaleString('vi-VN')} đ</td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group">
                      <button className="icon-btn-sm" title="Chi tiết"><MdVisibility /></button>
                      <button className="icon-btn-sm" title="In"><MdPrint /></button>
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

export default InvoiceAdminList;
