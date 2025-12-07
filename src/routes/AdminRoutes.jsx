// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import DonorManagement from '../pages/admin/DonorManagement'; // Make sure this path is correct

// Create other admin pages as needed
const AdminMessages = () => <div>Messages Management</div>;
const AdminAnalytics = () => <div>Analytics Dashboard</div>;
const AdminContent = () => <div>Content Management</div>;
const AdminUsers = () => <div>Admin Users Management</div>;
const AdminSettings = () => <div>System Settings</div>;
const AdminNotifications = () => <div>Notifications Management</div>;

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/donors" element={<DonorManagement />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/messages" element={<AdminMessages />} />
      <Route path="/reports" element={<AdminAnalytics />} />
      <Route path="/content" element={<AdminContent />} />
      <Route path="/users" element={<AdminUsers />} />
      <Route path="/settings" element={<AdminSettings />} />
      <Route path="/notifications" element={<AdminNotifications />} />
    </Routes>
  );
};

export default AdminRoutes;