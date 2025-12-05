// src/components/admin/AdminLayout.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';

// Import admin pages
import AdminDashboard from '../../pages/AdminDashboard';

// Create simple placeholder components
const AdminDonors = () => (
  <div className="p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Donor Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Donor management system coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminRequests = () => (
  <div className="p-6">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Requests</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Blood request management coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminLayout = () => {
  const { isAdmin, adminUser } = useAuth();
  
  // If not admin, redirect to home
  if (!isAdmin || !adminUser) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-0 md:ml-64">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/donors" element={<AdminDonors />} />
            <Route path="/requests" element={<AdminRequests />} />
            <Route path="/messages" element={<AdminRequests />} />
            <Route path="/reports" element={<AdminRequests />} />
            <Route path="/content" element={<AdminRequests />} />
            <Route path="/users" element={<AdminRequests />} />
            <Route path="/settings" element={<AdminRequests />} />
            <Route path="/notifications" element={<AdminRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;