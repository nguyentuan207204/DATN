import React, { useState, useEffect } from 'react';
import { 
  MdPeople, 
  MdEventAvailable, 
  MdAttachMoney, 
  MdTrendingUp,
  MdTrendingDown,
  MdStar,
  MdSchedule,
  MdInfo,
  MdCheckCircle,
  MdRefresh,
  MdGetApp
} from 'react-icons/md';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todaySchedules, setTodaySchedules] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setData(res.data.data || res.data);

      // Tải và lọc lịch trực hôm nay
      try {
        const scheduleRes = await api.get('/schedules');
        if (scheduleRes.data.success) {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          const todayStr = `${y}-${m}-${d}`;
          
          const filtered = scheduleRes.data.data.filter(s => 
            s.shiftDate && s.shiftDate.substring(0, 10) === todayStr
          );
          setTodaySchedules(filtered);
        }
      } catch (err) {
        console.error('Error fetching schedules on dashboard:', err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data || !data.stats) {
    return <div className="admin-page-container dashboard-premium">Đang tải dữ liệu...</div>;
  }

  const { stats, chartData = [], activities = { latestAppointments: [], latestRecords: [] }, topDoctors = [] } = data;

  const statsCards = [
    { 
      title: 'Tổng bệnh nhân', 
      value: (stats?.totalPatients || 0).toLocaleString(), 
      change: '+12%', 
      isUp: true,
      icon: <MdPeople />, 
      gradient: 'linear-gradient(135deg, #b2f5ea, #319795)'
    },
    { 
      title: 'Lịch hẹn hôm nay', 
      value: stats.todayAppointments.toLocaleString(), 
      change: 'Ổn định', 
      isUp: true,
      icon: <MdSchedule />, 
      gradient: 'linear-gradient(135deg, #ebf8ff, #3182ce)'
    },
    { 
      title: 'Doanh thu tháng', 
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthlyRevenue), 
      change: '+8.5%', 
      isUp: true,
      icon: <MdAttachMoney />, 
      gradient: 'linear-gradient(135deg, #fff5f5, #e53e3e)'
    },
    { 
      title: 'Số lượng bác sĩ', 
      value: stats.totalDoctors.toLocaleString(), 
      change: '+2', 
      isUp: true,
      icon: <MdEventAvailable />, 
      gradient: 'linear-gradient(135deg, #fefcbf, #d69e2e)'
    },
  ];

  return (
    <div className="admin-page-container dashboard-premium animate-fade-in">
      <header className="admin-header-main">
        <div className="header-content">
          <h1>Dashboard Tổng quan</h1>
          <p className="subtitle">Chào mừng trở lại! Dưới đây là thống kê tình hình bệnh viện hôm nay.</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchDashboardData}>
            <MdRefresh /> Làm mới
          </button>
          <button className="btn-export">
            <MdGetApp /> Xuất báo cáo
          </button>
        </div>
      </header>

      <div className="stats-cards-grid">
        {statsCards.map((stat, i) => (
          <div key={i} className="glass-card stat-premium-card">
            <div className="stat-main">
              <div className="stat-info">
                <span className="st-title">{stat.title}</span>
                <h2 className="st-value">{stat.value}</h2>
                <div className={`st-trend ${stat.isUp ? 'up' : 'down'}`}>
                  {stat.isUp ? <MdTrendingUp /> : <MdTrendingDown />}
                  {stat.change} <span>so với tháng trước</span>
                </div>
              </div>
              <div className="st-icon-box" style={{ background: stat.gradient }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-double-row">
        {/* Lịch Hẹn Hôm Nay */}
        <div className="glass-card today-appointments-box">
          <div className="box-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdSchedule /> Lịch Hẹn Hôm Nay ({activities.todayAppointmentList?.length || 0})
            </h3>
          </div>
          <div className="premium-table-container">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Dịch vụ</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {activities.todayAppointmentList?.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Không có lịch khám nào trong hôm nay.</td></tr>
                ) : activities.todayAppointmentList?.map(apt => (
                  <tr key={`today-${apt.id}`}>
                    <td>
                      <strong>{new Date(apt.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                    </td>
                    <td>
                      <p className="p-name" style={{ margin: 0, fontWeight: '600' }}>{apt.patientName}</p>
                      <span className="p-phone" style={{ fontSize: '12px', color: '#718096' }}>{apt.patientPhone || '-'}</span>
                    </td>
                    <td>{apt.doctorName}</td>
                    <td>{apt.serviceName}</td>
                    <td>
                      <span className={`badge badge-${apt.status === 'CONFIRMED' ? 'success' : apt.status === 'PENDING' ? 'warning' : apt.status === 'CANCELLED' ? 'danger' : 'primary'}`}>
                        {apt.status === 'CONFIRMED' ? 'Đã xác nhận' : apt.status === 'PENDING' ? 'Đang chờ' : apt.status === 'CANCELLED' ? 'Đã hủy' : 'Hoàn thành'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lịch Trực Hôm Nay */}
        <div className="glass-card today-schedules-box">
          <div className="box-header" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdEventAvailable /> Lịch Trực Hôm Nay ({todaySchedules.length})
            </h3>
          </div>
          <div className="schedule-card-list">
            {todaySchedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#718096' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Hôm nay không có lịch trực nào.</p>
                <span style={{ fontSize: '12px' }}>Vui lòng thêm ca trực mới ở trang Quản lý lịch trực.</span>
              </div>
            ) : todaySchedules.map(item => (
              <div key={item.id} className="schedule-card-item">
                <div className="schedule-staff-info">
                  <div className="schedule-staff-avatar">
                    {item.staffName?.[0] || 'NV'}
                  </div>
                  <div className="schedule-staff-details">
                    <p>{item.staffName || 'Nhân viên y tế'}</p>
                    <span>{item.staffRole === 'BACSI' ? 'Bác sĩ' : item.staffRole === 'YTA' ? 'Y tá' : 'Kỹ thuật viên'}</span>
                  </div>
                </div>
                <div>
                  <span className={`badge-shift ${item.shiftType === 'AFTERNOON' ? 'badge-shift-afternoon' : 'badge-shift-morning'}`}>
                    {item.shiftType === 'AFTERNOON' ? 'Ca Chiều' : 'Ca Sáng'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-charts-row">
        <div className="glass-card main-chart-box">
          <div className="box-header">
            <h3>Tổng quan Doanh thu</h3>
            <div className="chart-actions">
              <button className="active">6 tháng qua</button>
              <button>1 năm qua</button>
            </div>
          </div>
          <div className="responsive-chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182ce" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#3182ce', fontWeight: 'bold' }}
                  formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                />
                <Area type="monotone" dataKey="amount" stroke="#3182ce" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card activity-box">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {activities.latestAppointments.slice(0, 3).map(act => (
              <div key={`app-${act.id}`} className="activity-item">
                <div className="act-icon confirm">
                  <MdSchedule />
                </div>
                <div className="act-content">
                  <p><strong>{act.patientName}</strong> đặt lịch với <strong>{act.doctorName || 'Bác sĩ'}</strong></p>
                  <span className="act-time">
                    {new Date(act.date).toLocaleDateString('vi-VN')} {new Date(act.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`status-badge-sm ${act.status.toLowerCase()}`}>
                  {act.status}
                </div>
              </div>
            ))}
            {activities.latestRecords.slice(0, 2).map(act => (
              <div key={`rec-${act.id}`} className="activity-item">
                <div className="act-icon record">
                  <MdCheckCircle />
                </div>
                <div className="act-content">
                  <p>Hồ sơ khám <strong>{act.patientName}</strong> hoàn tất</p>
                  <span className="act-time">
                    {new Date(act.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
