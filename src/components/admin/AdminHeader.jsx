import React, { useState, useEffect } from 'react';
import { Home, RefreshCw, Bell, User, LogOut, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      
      setNotificationCount(count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          donors (name, phone),
          blood_requests (patient_name, blood_type, hospital)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setRecentNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (showNotificationDropdown) {
      fetchRecentNotifications();
    }
  }, [showNotificationDropdown]);

  const handleGoToSite = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark as read
      await supabase
        .from('notifications')
        .update({ status: 'sent' })
        .eq('id', notificationId);
      
      // Refresh counts
      fetchNotificationCount();
      fetchRecentNotifications();
      
      // Navigate to notifications page
      navigate('/admin/notifications');
      setShowNotificationDropdown(false);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/admin/notifications');
    setShowNotificationDropdown(false);
  };

  const handleSendAllNotifications = async () => {
    try {
      // You can call your notification scheduler here
      const response = await fetch('/api/send-notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        }
      });
      
      if (response.ok) {
        alert('Notifications sent successfully!');
        fetchNotificationCount();
      } else {
        alert('Failed to send notifications');
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Error sending notifications');
    }
  };

  const getAdminInfo = () => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession);
        return {
          name: sessionData.name || 'Administrator',
          email: sessionData.email || 'admin@lifeshare.com'
        };
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    return { name: 'Administrator', email: 'admin@lifeshare.com' };
  };

  const adminInfo = getAdminInfo();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">LS</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">LifeShare Admin Panel</h1>
            <p className="text-sm text-gray-500">Administration Dashboard</p>
          </div>
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
            Admin Mode
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>
          
          {/* 🔔 Notification Bell with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 text-gray-500 hover:text-gray-700 relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
            
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {notificationCount > 0 && (
                        <button
                          onClick={handleSendAllNotifications}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Send All
                        </button>
                      )}
                      <button
                        onClick={handleViewAllNotifications}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {notificationCount} pending notifications
                  </p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentNotifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              notification.status === 'pending' ? 'bg-yellow-500' :
                              notification.status === 'sent' ? 'bg-green-500' :
                              'bg-red-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 mb-1">
                                {notification.message?.substring(0, 80)}...
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                  {notification.donors?.name || 'Donor'} • {notification.blood_requests?.patient_name || 'Patient'}
                                </span>
                                <span>
                                  {new Date(notification.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Go to Notifications Management
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleGoToSite}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden md:inline">Go to Site</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-red-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{adminInfo.name}</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;