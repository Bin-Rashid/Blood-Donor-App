import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import DashboardCharts from '../components/admin/DashboardCharts';
import ActivityTimeline from '../components/admin/ActivityTimeline';
import QuickActions from '../components/admin/QuickActions';
import SystemHealth from '../components/admin/SystemHealth';
import { RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonors: 0,
    eligibleDonors: 0,
    newRegistrations: 0,
    recentDonors: [],
    bloodGroupDistribution: {},
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch total donors
      const { count: totalDonors } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true });

      // Fetch all donors
      const { data: allDonors } = await supabase.from('donors').select('*');

      // Calculate eligible donors
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const eligibleDonors = allDonors?.filter(donor => {
        if (!donor.last_donation_date) return true;
        return new Date(donor.last_donation_date) <= threeMonthsAgo;
      }).length || 0;

      // Calculate new registrations
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newRegistrations } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Fetch recent donors
      const { data: recentDonors } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate blood group distribution
      const bloodGroupDistribution = {};
      allDonors?.forEach(donor => {
        const bloodType = donor.blood_type || 'Unknown';
        bloodGroupDistribution[bloodType] = (bloodGroupDistribution[bloodType] || 0) + 1;
      });

      setStats({
        totalDonors: totalDonors || 0,
        eligibleDonors,
        newRegistrations: newRegistrations || 0,
        recentDonors: recentDonors || [],
        bloodGroupDistribution,
      });

      setLastUpdated(new Date());
      
      // Set up auto-refresh every 30 seconds
      setTimeout(fetchDashboardData, 30000);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !lastUpdated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Real-time statistics and system monitoring
            {lastUpdated && (
              <span className="text-sm text-gray-500 ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString('en-BD')}
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Now
        </button>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      <DashboardCharts stats={stats} />

      {/* Activity and System Health - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityTimeline />
        <SystemHealth />
      </div>

      {/* Real-time Updates Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-blue-700">
            <span className="font-medium">Real-time updates enabled:</span> Dashboard refreshes automatically every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;