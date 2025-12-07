// src/pages/admin/DonorManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import DonorTable from '../../components/admin/DonorTable';
import DonorFilters from '../../components/admin/DonorFilters';
import ExportImportModal from '../../components/admin/ExportImportModal';
import DonorProfileModal from '../../components/admin/DonorProfileModal';
import { 
  Users, 
  Download, 
  Upload, 
  Search, 
  Plus,
  Mail,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  ChevronRight,
  Phone,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Droplets,
  Bell
} from 'lucide-react';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    district: '',
    eligibility: '',
    dateRange: { start: '', end: '' },
    lastDonationFilter: '',
    ageMin: '',
    ageMax: '',
    gender: ''
  });
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    eligible: 0,
    recent: 0,
    activeToday: 0,
    growth: {
      week: 0,
      month: 0,
      today: 0
    }
  });
  
  // Dynamic data
  const [districts, setDistricts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [bloodTypes, setBloodTypes] = useState(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

  // Fetch districts from database
  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setDistricts(data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
      // Fallback to hardcoded districts if database fails
      setDistricts([
        'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal', 
        'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali'
      ]);
    }
  };

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch system settings from database
  const fetchSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) throw error;
      
      const settings = {};
      data?.forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      setSystemSettings(settings);
      
      // Update blood types from settings if available
      if (settings.blood_types) {
        setBloodTypes(settings.blood_types);
      }
    } catch (error) {
      console.error('Error fetching system settings:', error);
    }
  };

  // Calculate growth percentages
  const calculateGrowth = async () => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    try {
      // Count donors from different time periods
      const { count: totalToday } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(today.setHours(0, 0, 0, 0)).toISOString());
      
      const { count: totalWeek } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());
      
      const { count: totalMonth } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString());
      
      // Calculate growth percentages
      const growthWeek = totalWeek > 0 ? ((totalToday || 0) / totalWeek * 100 - 100).toFixed(1) : 0;
      const growthMonth = totalMonth > 0 ? ((totalMonth || 0) / 30) : 0; // Average per day
      
      setStats(prev => ({
        ...prev,
        growth: {
          week: parseFloat(growthWeek),
          month: parseFloat(growthMonth),
          today: totalToday || 0
        }
      }));
    } catch (error) {
      console.error('Error calculating growth:', error);
    }
  };

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('donors').select('*', { count: 'exact' });
      
      // Apply search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      // Apply filters
      if (filters.bloodType) {
        query = query.eq('blood_type', filters.bloodType);
      }
      
      if (filters.district) {
        query = query.eq('district', filters.district);
      }
      
      if (filters.eligibility) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        if (filters.eligibility === 'eligible') {
          query = query.or(`last_donation_date.is.null,last_donation_date.lte.${threeMonthsAgo.toISOString()}`);
        } else if (filters.eligibility === 'not-eligible') {
          query = query.gt('last_donation_date', threeMonthsAgo.toISOString());
        }
      }
      
      // Apply date range filter
      if (filters.dateRange.start) {
        query = query.gte('created_at', filters.dateRange.start);
      }
      
      if (filters.dateRange.end) {
        query = query.lte('created_at', filters.dateRange.end);
      }
      
      // Apply last donation filter
      if (filters.lastDonationFilter) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.lastDonationFilter) {
          case 'last-week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'last-month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'last-3-months':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'last-6-months':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'last-year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'never':
            query = query.is('last_donation_date', null);
            break;
        }
        
        if (filters.lastDonationFilter !== 'never') {
          query = query.gte('last_donation_date', startDate.toISOString());
        }
      }
      
      // Apply age filter
      if (filters.ageMin || filters.ageMax) {
        if (filters.ageMin) {
          query = query.gte('age', filters.ageMin);
        }
        if (filters.ageMax) {
          query = query.lte('age', filters.ageMax);
        }
      }
      
      // Apply gender filter
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      
      query = query.range(from, to).order('created_at', { ascending: false });
      
      const { data, error: queryError, count } = await query;
      
      if (queryError) throw queryError;
      
      setDonors(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
      
      // Calculate stats
      calculateStats(data || []);
      
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Failed to load donors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (donorData) => {
    const today = new Date().toDateString();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const total = donorData.length;
    const eligible = donorData.filter(d => {
      if (!d.last_donation_date) return true;
      return new Date(d.last_donation_date) <= threeMonthsAgo;
    }).length;
    
    const recent = donorData.filter(d => {
      const donorDate = new Date(d.created_at);
      return donorDate >= oneWeekAgo;
    }).length;
    
    const activeToday = donorData.filter(d => {
      const donorDate = new Date(d.created_at).toDateString();
      return donorDate === today;
    }).length;
    
    // Calculate blood type distribution
    const bloodTypeDistribution = {};
    donorData.forEach(d => {
      const bloodType = d.blood_type || 'Unknown';
      bloodTypeDistribution[bloodType] = (bloodTypeDistribution[bloodType] || 0) + 1;
    });
    
    setStats(prev => ({ 
      ...prev, 
      total, 
      eligible, 
      recent, 
      activeToday,
      bloodTypeDistribution 
    }));
    
    // Calculate growth percentages
    await calculateGrowth();
  };

  useEffect(() => {
    fetchDonors();
    fetchDistricts();
    fetchNotifications();
    fetchSystemSettings();
  }, [pagination.page, filters]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const timer = setTimeout(() => {
      fetchDonors();
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      bloodType: '',
      district: '',
      eligibility: '',
      dateRange: { start: '', end: '' },
      lastDonationFilter: '',
      ageMin: '',
      ageMax: '',
      gender: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectDonor = (donorId) => {
    setSelectedDonors(prev => 
      prev.includes(donorId) 
        ? prev.filter(id => id !== donorId)
        : [...prev, donorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonors.length === donors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(donors.map(donor => donor.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedDonors.length) {
      alert('Please select donors to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedDonors.length} donor(s)? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('donors')
          .delete()
          .in('id', selectedDonors);
          
        if (error) throw error;
        
        // Create notification for deletion
        await supabase.from('notifications').insert([{
          type: 'bulk_delete',
          message: `${selectedDonors.length} donors deleted by admin`,
          is_read: false
        }]);
        
        alert('Donors deleted successfully');
        setSelectedDonors([]);
        fetchDonors();
        fetchNotifications(); // Refresh notifications
      } catch (error) {
        console.error('Error deleting donors:', error);
        alert('Failed to delete donors');
      }
    }
  };

  const handleBulkMessage = () => {
    if (!selectedDonors.length) {
      alert('Please select donors to message');
      return;
    }
    
    // In a real app, you would navigate to a messaging page
    alert(`Messaging ${selectedDonors.length} donors...`);
  };

  const handleBulkExport = () => {
    if (!selectedDonors.length) {
      alert('No donors selected. All donors will be exported.');
    }
    setShowExportModal(true);
  };

  const handleViewProfile = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  const handleEditDonor = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  const handleDeleteDonor = async (donor) => {
    if (window.confirm(`Are you sure you want to delete ${donor.name || 'this donor'}? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('donors')
          .delete()
          .eq('id', donor.id);
          
        if (error) throw error;
        
        // Create notification
        await supabase.from('notifications').insert([{
          type: 'donor_deleted',
          message: `Donor ${donor.name || donor.id} deleted by admin`,
          is_read: false
        }]);
        
        alert('Donor deleted successfully');
        fetchDonors();
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting donor:', error);
        alert('Failed to delete donor');
      }
    }
  };

  const handleMessageDonor = (donor) => {
    alert(`Messaging ${donor.name || 'donor'}...`);
  };

  const handleCallDonor = (donor) => {
    if (donor.phone) {
      window.location.href = `tel:${donor.phone}`;
    } else {
      alert('No phone number available');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleAddDonor = () => {
    // Navigate to add donor page or show add modal
    window.location.href = '/admin/donors/add';
  };

  const handleRefresh = () => {
    fetchDonors();
    fetchNotifications();
  };

  const handleImportComplete = () => {
    fetchDonors();
    setShowImportModal(false);
  };

  const handleUpdateDonor = () => {
    fetchDonors();
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Donor Management', href: '/admin/donors', current: true }
  ];

  // Dynamic quick tips from system settings or default
  const quickTips = systemSettings.quick_tips || [
    { id: 1, tip: 'Click on column headers to sort donors' },
    { id: 2, tip: 'Select multiple donors for bulk actions' },
    { id: 3, tip: 'Use advanced filters to find specific donors' },
    { id: 4, tip: 'Export data in CSV, Excel, or JSON format' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="inline-flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                  )}
                  {crumb.current ? (
                    <span className="text-sm font-medium text-gray-700">
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Donor Management</h1>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              {pagination.total} Donors
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {systemSettings.donor_management_description || 'Manage and organize your donor database with advanced filtering and bulk actions'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          
          <button
            onClick={handleBulkExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={handleAddDonor}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Donor</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
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

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Donors */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg shadow-2xl hover:scale-[1.02] transition-all duration-500">
          {/* Smooth Red Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-red-500/0 via-red-500/50 to-pink-500/0 opacity-50 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl"></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Donors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">All time</span>
              </div>
              <div className={`text-xs font-medium px-3 py-1 rounded-full border flex items-center gap-1 ${
                stats.growth.week > 0 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {stats.growth.week > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(stats.growth.week)}%
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Eligible Now */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg shadow-2xl hover:scale-[1.02] transition-all duration-500">
          {/* Smooth Green Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-green-500/0 via-green-500/50 to-emerald-500/0 opacity-50 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl"></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Eligible Now</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.eligible}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Ready to donate</span>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-full border border-green-200">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recent (7 days) */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg shadow-2xl hover:scale-[1.02] transition-all duration-500">
          {/* Smooth Blue Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-cyan-500/0 opacity-50 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl"></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.recent}
                </p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg relative group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">New registrations</span>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-full border border-blue-200">
                +{stats.growth.today} today
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Active Today */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg shadow-2xl hover:scale-[1.02] transition-all duration-500">
          {/* Smooth Purple Border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-violet-500/0 opacity-50 group-hover:opacity-100 transition-all duration-500">
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl"></div>
          </div>
          
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {stats.activeToday}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Registered today</span>
              </div>
              <div className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 rounded-full border border-purple-200">
                Live
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Recent Notifications</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {notifications.filter(n => !n.is_read).length} New
              </span>
            </div>
            <button
              onClick={fetchNotifications}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-2">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${notification.is_read ? 'bg-white' : 'bg-blue-50'} border border-blue-100`}
              >
                <div className={`w-2 h-2 mt-2 rounded-full ${notification.is_read ? 'bg-blue-300' : 'bg-blue-500 animate-pulse'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkNotificationRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => window.location.href = '/admin/notifications'}
            className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All Notifications →
          </button>
        </div>
      )}

      {/* Search and Bulk Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={systemSettings.search_placeholder || "Search donors by name, phone, email, or location..."}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {selectedDonors.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg">
                <span className="font-medium">{selectedDonors.length}</span> selected
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkMessage}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters - Pass dynamic districts and blood types */}
      <DonorFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        districts={districts}
        bloodTypes={bloodTypes}
      />

      {/* Donor Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium text-gray-900">Donor List</h3>
              <span className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <FileText className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
        
        <DonorTable
          donors={donors}
          loading={loading}
          selectedDonors={selectedDonors}
          onSelectDonor={handleSelectDonor}
          onSelectAll={handleSelectAll}
          onViewProfile={handleViewProfile}
          onEditDonor={handleEditDonor}
          onDeleteDonor={handleDeleteDonor}
          onMessageDonor={handleMessageDonor}
          onCallDonor={handleCallDonor}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Dynamic Quick Tips */}
      {quickTips.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Tips</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickTips.slice(0, 4).map((tip, index) => (
                  <div key={tip.id || index} className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">{tip.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showExportModal && (
        <ExportImportModal
          mode="export"
          onClose={() => setShowExportModal(false)}
          selectedDonors={selectedDonors}
        />
      )}

      {showImportModal && (
        <ExportImportModal
          mode="import"
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
      )}

      {showProfileModal && selectedDonor && (
        <DonorProfileModal
          donor={selectedDonor}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedDonor(null);
          }}
          onUpdate={handleUpdateDonor}
        />
      )}

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Data updates in real-time. Last refreshed: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(systemSettings.help_url || '/admin/help/donor-management', '_blank')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Need Help?
          </button>
          <button
            onClick={handleRefresh}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorManagement;