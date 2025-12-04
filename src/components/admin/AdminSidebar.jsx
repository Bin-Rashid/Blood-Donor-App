import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Droplets, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  FileText,
  UserCog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/donors', icon: Users, label: 'Donor Management' },
    { path: '/admin/requests', icon: Droplets, label: 'Blood Requests' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/admin/reports', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/content', icon: FileText, label: 'Content' },
    { path: '/admin/users', icon: UserCog, label: 'Admin Users' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className={`bg-gray-900 text-white h-[calc(100vh-73px)] transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ width: collapsed ? '80px' : '256px' }}
    >
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="font-bold text-lg whitespace-nowrap">LifeShare</h2>
              <p className="text-xs text-gray-400 whitespace-nowrap">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 mt-auto">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;