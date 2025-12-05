// src/components/admin/ActivityTimeline.jsx
import React, { useState, useEffect } from 'react';
import { Clock, UserPlus, Droplets, Bell, CheckCircle, AlertCircle, Calendar, MessageSquare, Download } from 'lucide-react';
import { supabase } from '../../services/supabase';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      // Fetch recent donors
      const { data: recentDonors } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Format activities
      const donorActivities = recentDonors?.map(donor => ({
        id: donor.id,
        type: 'registration',
        title: 'New Donor Registered',
        description: `${donor.name || 'Anonymous'} joined as a blood donor`,
        icon: UserPlus,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        time: new Date(donor.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(donor.created_at).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })
      })) || [];

      // Mock activities for demo
      const mockActivities = [
        {
          id: 'mock-1',
          type: 'blood_request',
          title: 'Emergency Blood Request',
          description: 'Urgent need for O+ blood in Dhaka Medical',
          icon: Droplets,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          time: '14:30',
          date: 'Today',
          urgent: true
        },
        {
          id: 'mock-2',
          type: 'notification',
          title: 'Bulk Notification Sent',
          description: 'Alert sent to 25 eligible donors',
          icon: Bell,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          time: '11:45',
          date: 'Today'
        },
        {
          id: 'mock-3',
          type: 'export',
          title: 'Data Export Completed',
          description: 'Donor database exported to CSV',
          icon: Download,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          time: '10:15',
          date: 'Today'
        },
        {
          id: 'mock-4',
          type: 'system',
          title: 'System Backup',
          description: 'Daily database backup completed successfully',
          icon: CheckCircle,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          time: '03:00',
          date: 'Today'
        },
        {
          id: 'mock-5',
          type: 'message',
          title: 'Welcome Message Sent',
          description: 'Welcome email sent to new donors',
          icon: MessageSquare,
          color: 'text-pink-600',
          bgColor: 'bg-pink-100',
          time: '09:30',
          date: 'Today'
        }
      ];

      setActivities([...mockActivities, ...donorActivities]);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activity) => {
    const Icon = activity.icon;
    return (
      <div className={`p-2 rounded-lg ${activity.bgColor} ${activity.color}`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchActivities}
            className="text-sm text-red-600 hover:text-red-800"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            {activities.length} activities
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activities...</p>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No recent activities</p>
          <p className="text-sm text-gray-400 mt-1">Activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < activities.length - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="relative z-10">
                  {getActivityIcon(activity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {activity.title}
                        {activity.urgent && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Urgent
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {activity.time}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {activity.date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800 font-medium text-sm">
          <Calendar className="w-4 h-4" />
          View Activity Log
          <span className="ml-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default ActivityTimeline;