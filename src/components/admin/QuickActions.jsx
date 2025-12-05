// src/components/admin/QuickActions.jsx
import React from 'react';
import { 
  UserPlus, 
  Download, 
  Upload, 
  MessageSquare, 
  Settings, 
  Users,
  BarChart3,
  Bell,
  Shield,
  Mail,
  Printer,
  Filter,
  Search,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      icon: UserPlus,
      title: 'Add New Donor',
      description: 'Register a new blood donor',
      color: 'from-green-500 to-emerald-600',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/donors?action=add'),
      shortcut: 'N',
      badge: 'New'
    },
    {
      id: 2,
      icon: Download,
      title: 'Export Data',
      description: 'Download donor database',
      color: 'from-blue-500 to-cyan-600',
      iconColor: 'text-white',
      onClick: () => alert('Export feature coming soon!'),
      shortcut: 'E'
    },
    {
      id: 3,
      icon: Upload,
      title: 'Import Data',
      description: 'Bulk import from CSV/Excel',
      color: 'from-purple-500 to-violet-600',
      iconColor: 'text-white',
      onClick: () => alert('Import feature coming soon!'),
      shortcut: 'I'
    },
    {
      id: 4,
      icon: MessageSquare,
      title: 'Send Message',
      description: 'Email/SMS to donors',
      color: 'from-orange-500 to-amber-600',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/messages'),
      shortcut: 'M'
    },
    {
      id: 5,
      icon: Users,
      title: 'View All Donors',
      description: 'Browse complete database',
      color: 'from-red-500 to-pink-600',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/donors'),
      shortcut: 'D'
    },
    {
      id: 6,
      icon: BarChart3,
      title: 'Generate Report',
      description: 'Create analytics report',
      color: 'from-indigo-500 to-blue-600',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/reports'),
      shortcut: 'R'
    },
    {
      id: 7,
      icon: Mail,
      title: 'Check Messages',
      description: 'View message history',
      color: 'from-pink-500 to-rose-600',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/messages'),
      shortcut: 'C'
    },
    {
      id: 8,
      icon: Settings,
      title: 'System Settings',
      description: 'Configure platform',
      color: 'from-gray-600 to-gray-700',
      iconColor: 'text-white',
      onClick: () => navigate('/admin/settings'),
      shortcut: 'S'
    }
  ];

  const urgentActions = [
    {
      id: 'urgent-1',
      icon: AlertCircle,
      title: 'Send Urgent Alert',
      description: 'Emergency blood requirement',
      color: 'bg-gradient-to-r from-red-600 to-red-700',
      textColor: 'text-white',
      onClick: () => {
        if (window.confirm('Send urgent alert to all eligible donors?')) {
          alert('Urgent alert sent to all eligible donors!');
        }
      }
    },
    {
      id: 'urgent-2',
      icon: Shield,
      title: 'System Backup',
      description: 'Create database backup',
      color: 'bg-gradient-to-r from-amber-600 to-orange-600',
      textColor: 'text-white',
      onClick: () => {
        if (window.confirm('Create system backup now?')) {
          alert('System backup initiated!');
        }
      }
    }
  ];

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const action = actions.find(a => 
          a.shortcut.toLowerCase() === e.key.toLowerCase()
        );
        if (action) {
          e.preventDefault();
          action.onClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <p className="text-gray-600">Frequently used actions and shortcuts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 hidden md:inline">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">Ctrl</kbd> + 
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">Shift</kbd> + 
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">Key</kbd>
          </span>
        </div>
      </div>

      {/* Urgent Actions */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-700 mb-4">Urgent Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] text-left group`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon className={`w-5 h-5 ${action.textColor}`} />
                  </div>
                  <h4 className={`font-semibold ${action.textColor}`}>{action.title}</h4>
                </div>
                <p className={`text-sm opacity-90 ${action.textColor}`}>{action.description}</p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <span className={`text-xs font-medium ${action.textColor} opacity-80 group-hover:opacity-100`}>
                    Click to execute →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 group text-left relative"
            >
              {action.badge && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full z-10">
                  {action.badge}
                </span>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                {action.shortcut && (
                  <span className="text-xs font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                    Ctrl+Shift+{action.shortcut}
                  </span>
                )}
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-red-700 transition-colors">
                {action.title}
              </h4>
              <p className="text-sm text-gray-600">{action.description}</p>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-red-600 font-medium group-hover:text-red-700 transition-colors flex items-center gap-1">
                  <span>Quick Access</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-4">Quick Search</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search donors, requests, or messages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;