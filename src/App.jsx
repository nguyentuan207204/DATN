import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import AppLayout from './components/layout/AppLayout/AppLayout';
import AdminLayout from './components/Admin/Layout/AdminLayout';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import DoctorsList from './pages/DoctorsList/DoctorsList';
import Profile from './pages/Profile/Profile';
import MedicalHistoryList from './pages/MedicalHistoryList/MedicalHistoryList';
import MedicalRecordDetail from './pages/MedicalRecordDetail/MedicalRecordDetail';
import Booking from './pages/Booking/Booking';
import AppointmentList from './pages/AppointmentList/AppointmentList';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ProtectedRoute from './components/Admin/ProtectedRoute/ProtectedRoute';

import AppointmentAdminList from './pages/Admin/Appointments/AppointmentAdminList';
import UserList from './pages/Admin/Users/UserList';
import StaffList from './pages/Admin/Staff/StaffList';
import ServiceManagement from './pages/Admin/Services/ServiceManagement';
import PatientAdminList from './pages/Admin/Patients/PatientAdminList';
import MedicineManagement from './pages/Admin/Pharmacy/MedicineManagement';
import InvoiceAdminList from './pages/Admin/Invoices/InvoiceAdminList';

import Services from './pages/Services/Services';
import News from './pages/News/News';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorsList />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/profile" element={<Profile />} />

          {/* Medical History routes */}
          <Route path="/profile/appointments" element={<AppointmentList />} />
          <Route path="/profile/history" element={<MedicalHistoryList />} />
          <Route path="/profile/history/:id" element={<MedicalRecordDetail />} />


          {/* Invoice routes */}
          
          <Route path="/booking" element={<Booking />} />
        </Route>

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BACSI', 'YTA', 'TIEPTAN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments" element={<AppointmentAdminList />} />
          <Route path="users" element={<UserList />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="patients" element={<PatientAdminList />} />
          <Route path="pharmacy" element={<MedicineManagement />} />
          <Route path="invoices" element={<InvoiceAdminList />} />
          {/* Add more admin routes here */}
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
