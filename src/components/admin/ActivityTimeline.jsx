import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  UserPlus, 
  UserMinus, 
  Edit, 
  Shield, 
  MessageSquare, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock activities until we implement activity logging
  const mockActivities = [
    {
      id: 1,
      admin_name: 'System Admin',
      action: 'added_new_donor',
      details: { donor_name: 'John Doe', blood_type: 'A+' },
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      timestamp: '2024-01-10T10:30:00Z'
    },
    {
      id: 2,
      admin_name: 'Moderator',
      action: 'updated_settings',
      details: { setting: 'WhatsApp Number' },
      icon: Edit,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      timestamp: '2024-01-10T09:15:00Z'
    },
    {
      id: 3,
      admin_name: 'System Admin',
      action: 'sent_bulk_message',
      details: { recipients: 45, type: 'SMS' },
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      timestamp: '2024-01-09T16:45:00Z'
    },
    {
      id: 4,
      admin_name: 'Admin',
      action: 'exported_data',
      details: { format: 'CSV', records: 128 },
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      timestamp: '2024-01-09T14:20:00Z'
    },
    {
      id: 5,
      admin_name: 'System Admin',
      action: 'verified_donor',
      details: { donor_name: 'Sarah Smith' },
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      timestamp: '2024-01-09T11:10:00Z'
    }
  ];

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // TODO: Implement real activity logging
        // For now, use mock data
        setActivities(mockActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities(mockActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    
    // Real-time subscription for new activities
    const channel = supabase
      .channel('admin-activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admin_activity_logs' },
        (payload) => {
          console.log('New activity detected:', payload);
          // Add new activity to the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActionText = (activity) => {
    const actions = {
      'added_new_donor': 'added a new donor',
      'updated_settings': 'updated system settings',
      'sent_bulk_message': 'sent bulk messages',
      'exported_data': 'exported donor data',
      'verified_donor': 'verified a donor',
      'deleted_donor': 'deleted a donor profile',
      'edited_donor': 'edited donor information',
      'approved_request': 'approved blood request',
      'rejected_request': 'rejected blood request'
    };
    
    return actions[activity.action] || 'performed an action';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getDetailsText = (activity) => {
    const details = activity.details || {};
    
    switch (activity.action) {
      case 'added_new_donor':
        return `Donor: ${details.donor_name || 'Unknown'} (${details.blood_type || 'Unknown'})`;
      case 'updated_settings':
        return `Setting: ${details.setting || 'System settings'}`;
      case 'sent_bulk_message':
        return `${details.recipients || 0} recipients via ${details.type || 'email'}`;
      case 'exported_data':
        return `${details.records || 0} records as ${details.format || 'CSV'}`;
      case 'verified_donor':
        return `Donor: ${details.donor_name || 'Unknown'}`;
      default:
        return Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last 24 hours</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activity.icon || Shield;
            
            return (
              <div key={activity.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${activity.bgColor} ${activity.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        <span className="font-semibold">{activity.admin_name}</span>{' '}
                        {getActionText(activity)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {getDetailsText(activity)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activities</p>
            <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
          </div>
        )}
      </div>

      {/* Activity Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
            <p className="text-sm text-gray-600">Total Activities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.action.includes('added') || a.action.includes('verified')).length}
            </p>
            <p className="text-sm text-gray-600">Positive Actions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {activities.filter(a => a.admin_name === 'System Admin').length}
            </p>
            <p className="text-sm text-gray-600">By System Admin</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(activities.map(a => a.admin_name)).size}
            </p>
            <p className="text-sm text-gray-600">Active Admins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;