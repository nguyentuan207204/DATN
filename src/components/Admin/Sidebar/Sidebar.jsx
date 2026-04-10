import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdCalendarMonth, 
  MdPersonSearch, 
  MdMedicalServices, 
  MdOutlinePostAdd, 
  MdBarChart, 
  MdSettings,
  MdLogout,
  MdPeople,
  MdMedication,
  MdAdminPanelSettings
} from 'react-icons/md';
import { toast } from 'react-toastify';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const menuItems = [
    { path: '/admin/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/admin/users', icon: <MdAdminPanelSettings />, label: 'Hệ thống & Tài khoản' },
    { path: '/admin/staff', icon: <MdMedicalServices />, label: 'Tổ chức Nhân sự' },
    { path: '/admin/services', icon: <MdOutlinePostAdd />, label: 'Dịch vụ Y tế' },
    { path: '/admin/patients', icon: <MdPeople />, label: 'Quản lý Bệnh nhân' },
    { path: '/admin/appointments', icon: <MdCalendarMonth />, label: 'Lịch hẹn' },
    { path: '/admin/pharmacy', icon: <MdMedication />, label: 'Dược & Vật tư' },
    { path: '/admin/invoices', icon: <MdBarChart />, label: 'Viện phí & Doanh thu' },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Đã đăng xuất thành công');
      navigate('/login');
    }
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <MdMedicalServices />
        </div>
        <div className="logo-text">
          <h3>Bắc Ninh Clinic</h3>
          <span>Hệ thống Quản trị</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <span className="icon"><MdSettings /></span>
          <span className="label">Cài đặt</span>
        </NavLink>
        
        <button className="nav-item btn-logout" onClick={handleLogout}>
          <span className="icon"><MdLogout /></span>
          <span className="label">Đăng xuất</span>
        </button>

        <div className="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" className="avatar" />
          <div className="user-info">
            <p className="name">{user?.fullName || user?.username || 'Quản trị viên'}</p>
            <p className="role">{user?.role || 'Admin'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
