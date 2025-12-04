import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Protect admin routes
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader />
      </div>
      
      <div className="flex pt-16"> {/* pt-16 for header height */}
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <AdminSidebar />
        </div>
        
        {/* Main Content Area with margin for sidebar */}
        <main className="flex-1 p-6 ml-0 md:ml-64 transition-all duration-300">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;