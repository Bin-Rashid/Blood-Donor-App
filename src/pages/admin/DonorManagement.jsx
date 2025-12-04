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
  Filter, 
  Search, 
  Plus,
  Mail,
  Trash2,
  RefreshCw
} from 'lucide-react';

const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    district: '',
    eligibility: '',
    dateRange: { start: '', end: '' }
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

  const fetchDonors = async () => {
    try {
      setLoading(true);
      
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
        // Implement eligibility filter based on last donation date
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
      
      // Apply pagination
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      
      query = query.range(from, to).order('created_at', { ascending: false });
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setDonors(data || []);
      setPagination(prev => ({ ...prev, total: count || 0 }));
      
    } catch (error) {
      console.error('Error fetching donors:', error);
      alert('Failed to load donors');
    } finally {
      setLoading(false);
    }
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedDonors.length} donor(s)?`)) {
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

  const handleSendBulkMessage = () => {
    if (!selectedDonors.length) {
      alert('Please select donors to message');
      return;
    }
    
    // Redirect to messages page with selected donors
    const donorIds = selectedDonors.join(',');
    window.location.href = `/admin/messages?donors=${donorIds}`;
  };

  const handleViewProfile = (donor) => {
    setSelectedDonor(donor);
    setShowProfileModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Donor Management</h2>
          <p className="text-gray-600">Manage and organize your donor database</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/donors?action=add'}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add Donor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Donors</p>
              <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {donors.filter(d => {
                  const today = new Date().toDateString();
                  const donorDate = new Date(d.created_at).toDateString();
                  return donorDate === today;
                }).length}
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selected</p>
              <p className="text-2xl font-bold text-gray-800">{selectedDonors.length}</p>
            </div>
            <Filter className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Eligible Now</p>
              <p className="text-2xl font-bold text-gray-800">
                {donors.filter(d => {
                  if (!d.last_donation_date) return true;
                  const lastDonation = new Date(d.last_donation_date);
                  const threeMonthsAgo = new Date();
                  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                  return lastDonation <= threeMonthsAgo;
                }).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search donors by name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {selectedDonors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedDonors.length} selected
              </span>
              
              <button
                onClick={handleSendBulkMessage}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Mail className="w-4 h-4" />
                Message
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <DonorFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({
          bloodType: '',
          district: '',
          eligibility: '',
          dateRange: { start: '', end: '' }
        })}
      />

      {/* Donor Table */}
      <DonorTable
        donors={donors}
        loading={loading}
        selectedDonors={selectedDonors}
        onSelectDonor={handleSelectDonor}
        onSelectAll={handleSelectAll}
        onViewProfile={handleViewProfile}
        onRefresh={fetchDonors}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

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
          onImportComplete={fetchDonors}
        />
      )}

      {showProfileModal && selectedDonor && (
        <DonorProfileModal
          donor={selectedDonor}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedDonor(null);
          }}
          onUpdate={fetchDonors}
        />
      )}
    </div>
  );
};

export default DonorManagement;