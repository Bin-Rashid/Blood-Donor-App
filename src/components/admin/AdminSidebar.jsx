// src/components/admin/AdminSidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Droplets, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  FileText,
  Bell,
  Calendar,
  Database,
  Shield,
  LogOut,
  UserCog,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ onCollapseChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { adminUser, signOutAdmin } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard', exact: true },
    { path: '/admin/donors', icon: Users, label: 'Donor Management' },
    { path: '/admin/requests', icon: Droplets, label: 'Blood Requests' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/reports', icon: BarChart3, label: 'Analytics & Reports' },
    { path: '/admin/content', icon: FileText, label: 'Content' },
    { path: '/admin/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/admin/database', icon: Database, label: 'Database' },
    { path: '/admin/users', icon: UserCog, label: 'Admin Users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/security', icon: Shield, label: 'Security' },
  ];

  const handleLogout = async () => {
    try {
      await signOutAdmin?.();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close mobile sidebar when clicking a link
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  // Collapse/Expand toggle
  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onCollapseChange?.(newState);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-gray-900 text-white 
          h-[calc(100vh-64px)]
          fixed md:fixed
          top-16 left-0
          z-40
          transition-all duration-300 ease-in-out
          flex flex-col
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-2xl
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <h2 className="font-bold text-lg whitespace-nowrap truncate">LifeShare Admin</h2>
                  <p className="text-xs text-gray-400 whitespace-nowrap truncate">
                    {adminUser?.email || 'Administrator'}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && window.innerWidth >= 768 && (
              <button
                onClick={toggleCollapse}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile Mini */}
        {!collapsed && adminUser && (
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{adminUser.email}</p>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={handleNavClick}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {item.label === 'Notifications' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    {!collapsed && (
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                    {!collapsed && item.label === 'Notifications' && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        3
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Quick Stats - Only show when expanded */}
          {!collapsed && (
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">System</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div className="h-1 rounded-full bg-green-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors group ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse Button - Desktop */}
          {window.innerWidth >= 768 && (
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Collapse indicator for collapsed state */}
        {collapsed && (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
            <div className="w-3 h-12 bg-gray-800 rounded-r-lg"></div>
          </div>
        )}
      </aside>

      {/* REMOVED the spacer div - now handled by main content margin */}
    </>
  );
};

export default AdminSidebar;