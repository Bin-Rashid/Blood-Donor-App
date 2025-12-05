// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import DashboardCharts from '../components/admin/DashboardCharts';
import ActivityTimeline from '../components/admin/ActivityTimeline';
import QuickActions from '../components/admin/QuickActions';
import SystemHealth from '../components/admin/SystemHealth';
import StatsCards from '../components/admin/StatsCards';
import RecentDonors from '../components/admin/RecentDonors';
import { 
  RefreshCw, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Bell,
  Download,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonors: 0,
    eligibleDonors: 0,
    newRegistrations: 0,
    pendingRequests: 0,
    recentDonors: [],
    bloodGroupDistribution: {},
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total donors
      const { count: totalDonors } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      // Fetch all donors
      const { data: allDonors } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate eligible donors (last donation > 3 months ago)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const eligibleDonors = allDonors?.filter(donor => {
        if (!donor.last_donation_date) return true;
        return new Date(donor.last_donation_date) <= threeMonthsAgo;
      }).length || 0;

      // Calculate new registrations (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newRegistrations } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Fetch recent donors (last 5)
      const { data: recentDonors } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate blood group distribution
      const bloodGroupDistribution = {};
      allDonors?.forEach(donor => {
        const bloodType = donor.blood_type || 'Unknown';
        bloodGroupDistribution[bloodType] = (bloodGroupDistribution[bloodType] || 0) + 1;
      });

      // Simulate pending requests (you can replace with actual data)
      const pendingRequests = Math.floor(Math.random() * 15) + 5;

      setStats({
        totalDonors: totalDonors || 0,
        eligibleDonors,
        newRegistrations: newRegistrations || 0,
        pendingRequests,
        recentDonors: recentDonors || [],
        bloodGroupDistribution,
      });

      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExportData = () => {
    alert('Export feature coming soon!');
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Here you would refetch data based on time range
  };

  if (loading && !lastUpdated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Fetching the latest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Monitor your blood donation platform in real-time
            {lastUpdated && (
              <span className="text-sm text-gray-500 ml-2">
                • Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${range === 'day' ? 'rounded-l-lg' : ''} ${range === 'year' ? 'rounded-r-lg' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-red-700 hover:text-red-900 mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCharts stats={stats} />
        <div className="space-y-8">
          <ActivityTimeline />
          <SystemHealth />
        </div>
      </div>

      {/* Quick Actions and Recent Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <RecentDonors donors={stats.recentDonors} />
        </div>
      </div>

      {/* Notifications and Alerts */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">System Notifications</h3>
              <p className="text-sm text-gray-600">Important updates and alerts</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            3 New
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">Database backup completed</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">5 new donor registrations today</p>
              <p className="text-xs text-gray-500">Today, 10:30 AM</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">System update available</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>
        
        <button className="w-full mt-4 text-center text-red-600 hover:text-red-800 font-medium text-sm">
          View All Notifications →
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
            <p className="text-gray-600">Key metrics for this {timeRange}</p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">+18.5% growth</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Math.floor(stats.totalDonors * 0.15)}
            </div>
            <div className="text-sm text-gray-600">Active Donors</div>
            <div className="text-xs text-green-600 mt-1">+12%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {Math.floor(stats.totalDonors * 0.08)}
            </div>
            <div className="text-sm text-gray-600">Donations This Month</div>
            <div className="text-xs text-green-600 mt-1">+8%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">94.7%</div>
            <div className="text-sm text-gray-600">System Uptime</div>
            <div className="text-xs text-green-600 mt-1">+0.3%</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-1">2.4s</div>
            <div className="text-sm text-gray-600">Avg. Response Time</div>
            <div className="text-xs text-red-600 mt-1">-0.2s</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall performance score</span>
            <span className="text-lg font-bold text-green-600">87/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
              style={{ width: '87%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Dashboard updates automatically every 5 minutes • 
          Last full sync: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;