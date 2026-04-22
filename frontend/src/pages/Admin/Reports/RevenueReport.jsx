import React, { useState, useEffect } from 'react';
import { 
  MdDateRange, 
  MdFilterList, 
  MdTrendingUp, 
  MdAccountBalanceWallet,
  MdMoney
} from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../../utils/api';
import '../../../styles/AdminPremium.css';
import './RevenueReport.css';

const COLORS = ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f'];

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  
  // Mặc định lấy từ 1 tháng trước
  const defaultFrom = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing/reports/revenue', {
        params: { from: fromDate, to: toDate }
      });
      
      if (res.data.success) {
        setReportData(res.data.data || []);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Xử lý dữ liệu cho Biểu đồ Đường (Tổng doanh thu theo ngày)
  const lineChartDataMap = {};
  let totalRevenue = 0;
  let totalCash = 0;
  let totalBanking = 0;

  reportData.forEach(item => {
    const val = Number(item.total);
    totalRevenue += val;
    if (item.method === 'CASH') totalCash += val;
    else totalBanking += val;

    // Format ngày DD/MM
    const dateObj = new Date(item.date);
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

    if (!lineChartDataMap[dateStr]) {
      lineChartDataMap[dateStr] = { date: dateStr, revenue: 0 };
    }
    lineChartDataMap[dateStr].revenue += val;
  });

  const lineChartData = Object.values(lineChartDataMap);

  // Xử lý dữ liệu cho Biểu đồ Tròn (Phương thức thanh toán)
  const pieChartData = [
    { name: 'Tiền mặt (CASH)', value: totalCash },
    { name: 'Chuyển khoản (BANKING)', value: totalBanking }
  ];

  return (
    <div className="admin-page-container revenue-report-page">
      <header className="admin-header">
        <div className="header-main">
          <div>
            <h1>Báo cáo Viện phí & Doanh thu</h1>
            <p>Trực quan hóa chỉ số tài chính phòng khám qua các biểu đồ siêu nét.</p>
          </div>
          <div className="list-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="date-filter">
               <label className="filter-label">Từ:</label>
               <input type="date" className="premium-select" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="date-filter">
               <label className="filter-label">Đến:</label>
               <input type="date" className="premium-select" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="btn-filter" onClick={fetchReport}><MdFilterList /> Thống kê</button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="glass-card kpi-card total-kpi">
          <div className="kpi-icon"><MdTrendingUp /></div>
          <div className="kpi-info">
            <span className="kpi-title">Tổng Doanh Thu</span>
            <h2 className="kpi-value">{totalRevenue.toLocaleString('vi-VN')} ₫</h2>
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon" style={{color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)'}}><MdMoney /></div>
          <div className="kpi-info">
            <span className="kpi-title">Tổng Nhận Tiền Mặt</span>
            <h2 className="kpi-value">{totalCash.toLocaleString('vi-VN')} ₫</h2>
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon" style={{color: '#3498db', background: 'rgba(52, 152, 219, 0.1)'}}><MdAccountBalanceWallet /></div>
          <div className="kpi-info">
            <span className="kpi-title">Tổng Chuyển Khoản</span>
            <h2 className="kpi-value">{totalBanking.toLocaleString('vi-VN')} ₫</h2>
          </div>
        </div>
      </div>

      <div className="charts-container">
        {/* Biểu đồ diện tích tăng trưởng */}
        <div className="glass-card chart-card flex-2">
          <h3 className="chart-title">Tăng trưởng Doanh thu theo Ngày</h3>
          {loading ? (
             <div className="loader-container">Đang tải dữ liệu...</div>
          ) : lineChartData.length === 0 ? (
             <div className="loader-container">Không có dữ liệu trong khoảng thời gian này</div>
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={lineChartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#A3AED0' }} 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}Tr`}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString('vi-VN') + ' ₫', 'Doanh thu']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Biểu đồ Cơ cấu */}
        <div className="glass-card chart-card flex-1">
          <h3 className="chart-title">Cơ cấu Thanh toán</h3>
          {loading ? (
             <div className="loader-container">Đang tải dữ liệu...</div>
          ) : (totalCash === 0 && totalBanking === 0) ? (
             <div className="loader-container">Không có phương thức</div>
          ) : (
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' ₫'} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
