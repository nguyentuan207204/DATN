import React from 'react';
import { MdSearch, MdNotificationsNone, MdHelpOutline } from 'react-icons/md';
import './AdminHeader.css';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div className="header-left">
        <h2 className="clinic-name">Phòng khám Đa khoa Tỉnh Bắc Ninh</h2>
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input type="text" placeholder="Tìm kiếm bệnh nhân, lịch hẹn..." />
        </div>
        
        <div className="header-actions">
          <button className="icon-btn">
            <MdNotificationsNone />
          </button>
          <button className="icon-btn">
            <MdHelpOutline />
          </button>
          
          <div className="divider"></div>
          
          {/* Nút Thêm mới đã được xóa theo yêu cầu */}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
