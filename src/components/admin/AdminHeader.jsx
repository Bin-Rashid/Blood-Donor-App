// src/components/admin/AdminHeader.jsx
import React, { useState } from 'react';
import { 
  Home, 
  RefreshCw, 
  User, 
  LogOut, 
  Settings,
  Bell,
  HelpCircle,
  ExternalLink,
  Globe,
  Shield
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { adminUser, signOutAdmin, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleGoToSite = () => {
    // Open frontend in new tab
    window.open('/', '_blank');
  };

  const handleGoToFrontend = () => {
    // Navigate to frontend in current tab
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin?.();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
    setShowUserMenu(false);
  };

  const handleSettingsClick = () => {
    navigate('/admin/settings');
    setShowUserMenu(false);
  };

  const notifications = [
    { id: 1, text: 'New donor registration', time: '2 min ago', unread: true },
    { id: 2, text: 'Blood request from Hospital', time: '15 min ago', unread: true },
    { id: 3, text: 'System backup completed', time: '1 hour ago', unread: false },
    { id: 4, text: '5 new messages', time: '2 hours ago', unread: false },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900">LifeShare Admin</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  System Online • v2.1.4
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2 ml-8">
              <button
                onClick={handleGoToFrontend}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Frontend"
              >
                <Globe className="w-4 h-4" />
                View Site
              </button>
              <button
                onClick={() => navigate('/admin/help')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Get Help"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </button>
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => n.unread).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <span className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                          Mark all as read
                        </span>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <Link
                        to="/admin/notifications"
                        className="block text-center text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => navigate('/admin/settings')}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm">Refresh</span>
            </button>

            {/* Site Button */}
            <button
              onClick={handleGoToSite}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-sm"
              title="Visit Frontend Site"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Visit Site</span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {adminUser?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900">
                        {adminUser?.email || 'Administrator'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isAdmin ? 'Super Administrator' : 'Administrator'}
                      </p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={handleSettingsClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Settings
                      </button>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
        <div className="flex justify-around items-center h-14">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setShowNotifications(true)}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600 relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
            <span className="text-xs mt-1">Alerts</span>
          </button>
          <button
            onClick={handleGoToFrontend}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs mt-1">Site</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-xs mt-1">Refresh</span>
          </button>
          <button
            onClick={() => setShowUserMenu(true)}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Account</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;