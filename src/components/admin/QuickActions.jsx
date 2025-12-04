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
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      icon: UserPlus,
      title: 'Add New Donor',
      description: 'Manually register a donor',
      color: 'bg-green-100 text-green-700',
      iconColor: 'text-green-600',
      onClick: () => navigate('/admin/donors?action=add'),
      shortcut: 'N'
    },
    {
      id: 2,
      icon: Download,
      title: 'Export Data',
      description: 'Export donors to CSV/Excel',
      color: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-600',
      onClick: () => {
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
      },
      shortcut: 'E'
    },
    {
      id: 3,
      icon: Upload,
      title: 'Import Data',
      description: 'Bulk import from CSV',
      color: 'bg-purple-100 text-purple-700',
      iconColor: 'text-purple-600',
      onClick: () => {
        // TODO: Implement import functionality
        alert('Import functionality coming soon!');
      },
      shortcut: 'I'
    },
    {
      id: 4,
      icon: MessageSquare,
      title: 'Send Message',
      description: 'Email/SMS to donors',
      color: 'bg-orange-100 text-orange-700',
      iconColor: 'text-orange-600',
      onClick: () => navigate('/admin/messages'),
      shortcut: 'M'
    },
    {
      id: 5,
      icon: Users,
      title: 'View All Donors',
      description: 'Browse donor database',
      color: 'bg-red-100 text-red-700',
      iconColor: 'text-red-600',
      onClick: () => navigate('/admin/donors'),
      shortcut: 'D'
    },
    {
      id: 6,
      icon: BarChart3,
      title: 'Generate Report',
      description: 'Create analytics report',
      color: 'bg-indigo-100 text-indigo-700',
      iconColor: 'text-indigo-600',
      onClick: () => navigate('/admin/reports'),
      shortcut: 'R'
    },
    {
      id: 7,
      icon: Mail,
      title: 'Check Messages',
      description: 'View message history',
      color: 'bg-pink-100 text-pink-700',
      iconColor: 'text-pink-600',
      onClick: () => navigate('/admin/messages'),
      shortcut: 'C'
    },
    {
      id: 8,
      icon: Settings,
      title: 'System Settings',
      description: 'Configure platform',
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-600',
      onClick: () => navigate('/admin/settings'),
      shortcut: 'S'
    }
  ];

  const urgentActions = [
    {
      id: 'urgent-1',
      icon: Bell,
      title: 'Send Urgent Alert',
      description: 'Emergency blood requirement',
      color: 'bg-red-500 text-white',
      iconColor: 'text-white',
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
      color: 'bg-amber-500 text-white',
      iconColor: 'text-white',
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
      // Check for Ctrl/Cmd + key
      if (e.ctrlKey || e.metaKey) {
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
    <div className="space-y-6">
      {/* Urgent Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Urgent Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] text-left`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/30">
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <h4 className="font-semibold">{action.title}</h4>
                </div>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <span className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Key</kbd>
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-200 group text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.color} ${action.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {action.shortcut && (
                    <span className="text-xs font-mono px-2 py-1 bg-gray-100 text-gray-600 rounded group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                      Ctrl+{action.shortcut}
                    </span>
                  )}
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-red-600 font-medium group-hover:text-red-700 transition-colors">
                    Click to execute →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Actions Stats */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Action Statistics</h4>
            <p className="text-sm text-gray-600">
              Track your most used actions
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">{actions.length}</p>
            <p className="text-sm text-gray-600">Available Actions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold text-gray-800">8</p>
            <p className="text-xs text-gray-600">Quick Actions</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold text-green-600">2</p>
            <p className="text-xs text-gray-600">Urgent Actions</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold text-blue-600">4</p>
            <p className="text-xs text-gray-600">With Shortcuts</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <p className="text-lg font-bold text-purple-600">0</p>
            <p className="text-xs text-gray-600">Used Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;