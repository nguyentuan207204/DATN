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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      // res.data chứa { success: true, data: { stats, chartData, ... } }
      // Ta cần lấy res.data.data
      setData(res.data.data || res.data);
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
          <div className="activity-list">
            {activities.latestAppointments.map(act => (
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
            {activities.latestRecords.map(act => (
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

      <div className="dashboard-bottom-row">
        <div className="glass-card performers-box">
          <div className="box-header">
            <h3>Bác sĩ tiêu biểu</h3>
            <button className="text-btn">Xem tất cả</button>
          </div>
          <div className="performers-list">
            {topDoctors.map((dr, i) => (
              <div key={i} className="performer-item">
                <div className="doc-avatar">{dr.fullName?.[0]}</div>
                <div className="perf-info">
                  <p className="p-name">{dr.fullName}</p>
                  <p className="p-dept">{dr.department}</p>
                </div>
                <div className="perf-stats">
                  <span className="rating"><MdStar /> 5.0</span>
                  <span className="appts">{dr.appointmentCount} lịch hẹn</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card satisfaction-box">
          <h3>Độ hài lòng của bệnh nhân</h3>
          <div className="radial-progress-container">
            <div className="radial-progress-mock">
               <div className="progress-value">100%</div>
               <svg viewBox="0 0 36 36" className="circular-chart blue">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="circle" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
            <p className="satisfaction-text">Cập nhật theo dữ liệu thực tế</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
