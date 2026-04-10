import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import AdminHeader from '../Header/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
