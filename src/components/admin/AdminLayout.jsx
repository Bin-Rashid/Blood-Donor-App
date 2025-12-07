// src/components/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';

// Import admin pages
import AdminDashboard from '../../pages/AdminDashboard';
import DonorManagement from '../../pages/admin/DonorManagement';

// Create simple placeholder components
const AdminRequests = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Blood Requests</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Blood request management coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminMessages = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Messages</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Message management coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminReports = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Analytics & Reports</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Analytics dashboard coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">System settings coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminNotifications = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Notification management coming soon...</p>
      </div>
    </div>
  </div>
);

const AdminLayout = () => {
  const { isAdmin, adminUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // If not admin, redirect to home
  if (!isAdmin || !adminUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSidebar onCollapseChange={setSidebarCollapsed} />
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto min-h-[calc(100vh-64px)] transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/donors" element={<DonorManagement />} />
            <Route path="/requests" element={<AdminRequests />} />
            <Route path="/messages" element={<AdminMessages />} />
            <Route path="/reports" element={<AdminReports />} />
            <Route path="/content" element={<AdminRequests />} />
            <Route path="/users" element={<AdminRequests />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/security" element={<AdminSettings />} />
            <Route path="/help" element={<AdminRequests />} />
            <Route path="/profile" element={<AdminRequests />} />
            <Route path="/schedule" element={<AdminRequests />} />
            <Route path="/database" element={<AdminRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;