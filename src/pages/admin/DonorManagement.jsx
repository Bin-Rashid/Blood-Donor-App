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
  Phone
} from 'lucide-react';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
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

const handleAddSuccess = () => {
  fetchDonors();
};

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
    activeToday: 0
  });

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
        // Assuming you have an 'age' field in your donors table
        // If not, you might need to calculate age from birth_date
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

  const calculateStats = (donorData) => {
    const today = new Date().toDateString();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const total = donorData.length;
    const eligible = donorData.filter(d => {
      if (!d.last_donation_date) return true;
      return new Date(d.last_donation_date) <= threeMonthsAgo;
    }).length;
    
    const recent = donorData.filter(d => {
      const donorDate = new Date(d.created_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return donorDate >= oneWeekAgo;
    }).length;
    
    const activeToday = donorData.filter(d => {
      const donorDate = new Date(d.created_at).toDateString();
      return donorDate === today;
    }).length;
    
    setStats({ total, eligible, recent, activeToday });
  };

  useEffect(() => {
    fetchDonors();
  }, [pagination.page, filters]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Debounce search
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
        
        alert('Donors deleted successfully');
        setSelectedDonors([]);
        fetchDonors();
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
    // or open a messaging modal
    alert(`Messaging ${selectedDonors.length} donors...`);
  };

  const handleBulkExport = () => {
    if (!selectedDonors.length) {
      // Export all if none selected
      alert('No donors selected. All donors will be exported.');
    }
    setShowExportModal(true);
  };

  const handleViewProfile = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  const handleEditDonor = (donor) => {
    // Navigate to edit page or show edit modal
    // For now, we'll just view the profile
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
        
        alert('Donor deleted successfully');
        fetchDonors();
      } catch (error) {
        console.error('Error deleting donor:', error);
        alert('Failed to delete donor');
      }
    }
  };

  const handleMessageDonor = (donor) => {
    // In a real app, you would open a messaging modal
    // or navigate to messages page
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
  };

  const handleImportComplete = () => {
    fetchDonors();
    setShowImportModal(false);
  };

  const handleUpdateDonor = () => {
    fetchDonors();
  };

  // Breadcrumb navigation
  const breadcrumbs = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Donor Management', href: '/admin/donors', current: true }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
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
            Manage and organize your donor database with advanced filtering and bulk actions
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Donors</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 opacity-90" />
          </div>
          <div className="mt-3 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              All time
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Eligible Now</p>
              <p className="text-3xl font-bold mt-1">{stats.eligible}</p>
            </div>
            <Users className="w-10 h-10 opacity-90" />
          </div>
          <div className="mt-3 text-sm opacity-90">
            Can donate now
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Recent (7 days)</p>
              <p className="text-3xl font-bold mt-1">{stats.recent}</p>
            </div>
            <RefreshCw className="w-10 h-10 opacity-90" />
          </div>
          <div className="mt-3 text-sm opacity-90">
            New registrations
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Active Today</p>
              <p className="text-3xl font-bold mt-1">{stats.activeToday}</p>
            </div>
            <Users className="w-10 h-10 opacity-90" />
          </div>
          <div className="mt-3 text-sm opacity-90">
            Registered today
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search donors by name, phone, email, or location..."
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

      {/* Filters Section */}
      <DonorFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
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

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Filter className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Quick Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Click on column headers</span> to sort donors
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Select multiple donors</span> for bulk actions
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Use advanced filters</span> to find specific donors
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Export data</span> in CSV, Excel, or JSON format
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExportModal && (
        <ExportImportModal
          mode="export"
          onClose={() => setShowExportModal(false)}
          selectedDonors={selectedDonors}
        />
      )}

      {showAddModal && (
  <AddDonorModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onSuccess={handleAddSuccess}
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
            onClick={() => window.open('/admin/help/donor-management', '_blank')}
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