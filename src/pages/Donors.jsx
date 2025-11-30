// src/pages/Donors.jsx
import React, { useState, useEffect } from 'react';
import { Users, Filter, Download, RefreshCw, Search, Info, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDonors } from '../context/DonorContext';
import DonorCard from '../components/DonorCard';
import StatsCards from '../components/StatsCards';
import EditModal from '../components/EditModal';
import GuidelinesTab from '../components/GuidelinesTab';
import { districts, bloodTypes, useDebounce } from '../utils/helpers';

const Donors = () => {
  const { isAdmin, user } = useAuth?.() || { isAdmin: false, user: null };
  const { donors, loading, fetchDonors } = useDonors();
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('guidelines');

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    bloodType: '',
    district: '',
    city: '',
    status: '',
    sortBy: 'name-asc',
  });

  const debouncedFilters = useDebounce(filters, 300);

  // Fetch donors when debounced filters change
  useEffect(() => {
    if (activeSubTab === 'find-donors') {
      fetchDonors(debouncedFilters, debouncedFilters.sortBy);
    }
  }, [debouncedFilters, fetchDonors, activeSubTab]);

  const handleDeleteDonor = async (donor) => {
    const canDelete = isAdmin || user?.id === donor.id;

    if (!canDelete) {
      alert('You can only delete your own profile');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${donor.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(donor.id);

    try {
      const { error } = await fetch(`/api/delete-donor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donor.id })
      }).then(r => r.json());

      if (error) throw error;

      await fetchDonors(filters, filters.sortBy);
      alert('Profile deleted successfully!');
    } catch (error) {
      console.error('Error deleting donor:', error);
      alert('Error deleting profile: ' + (error?.message || 'Unknown error'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditDonor = (donor) => {
    const canEdit = isAdmin || user?.id === donor.id;
    if (!canEdit) {
      alert('You can only edit your own profile');
      return;
    }
    setSelectedDonor(donor);
    setEditModalOpen(true);
  };

  const handleUpdateDonor = () => {
    fetchDonors(filters, filters.sortBy);
    setEditModalOpen(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      bloodType: '',
      district: '',
      city: '',
      status: '',
      sortBy: 'name-asc',
    });
  };

  const exportData = () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Age', 'Blood Type', 'District', 'City', 'Last Donation', 'Status', 'Registration Date'],
        ...donors.map(donor => {
          const last = donor.last_donation_date ? new Date(donor.last_donation_date) : null;
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          const status = last ? (last <= threeMonthsAgo ? 'Eligible' : 'Not Eligible') : 'Eligible';
          return [
            donor.name || 'N/A',
            donor.email || 'N/A',
            donor.phone || 'N/A',
            donor.age || 'N/A',
            donor.blood_type || 'Unknown',
            donor.district || 'N/A',
            donor.city || 'N/A',
            last ? last.toLocaleDateString() : 'Never',
            status,
            donor.created_at ? new Date(donor.created_at).toLocaleDateString() : 'N/A',
          ];
        })
      ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blood-donors-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data: ' + (error?.message || 'Unknown error'));
    }
  };

  if (loading && activeSubTab === 'find-donors') {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {isAdmin && (
        <div className="card p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Panel
            </h3>
            <div className="text-sm text-gray-600">
              You have full access to manage all donor records
            </div>
          </div>
          <p className="text-gray-600">
            You are logged in as an administrator. You can now edit and delete all donor records.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Find Donors
      </h2>
      <p className="text-gray-600 mb-6">Connect with available donors in your area</p>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveSubTab('guidelines')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
            activeSubTab === 'guidelines'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          গুরুত্বপূর্ণ দিকনির্দেশনা
        </button>
        <button
          onClick={() => setActiveSubTab('find-donors')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
            activeSubTab === 'find-donors'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Users className="w-4 h-4" />
          Find Blood Donors
        </button>
      </div>

      {/* Guidelines Tab Content */}
      {activeSubTab === 'guidelines' && <GuidelinesTab />}

      {/* Find Donors Tab Content */}
      {activeSubTab === 'find-donors' && (
        <>
          <StatsCards donors={donors} />

          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={exportData}
              className="btn-primary py-2 flex items-center gap-2"
              disabled={donors.length === 0}
            >
              <Download className="w-4 h-4" />
              Export Data ({donors.length})
            </button>
            <button
              onClick={() => fetchDonors(filters, filters.sortBy)}
              className="btn-outline py-2 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="form-input w-auto"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="age-asc">Age (Low to High)</option>
              <option value="age-desc">Age (High to Low)</option>
              <option value="created_at-asc">Registration Date (Oldest)</option>
              <option value="created_at-desc">Registration Date (Newest)</option>
            </select>
          </div>

          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10"
                />
              </div>

              <select
                value={filters.bloodType}
                onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                className="form-input"
              >
                <option value="">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="form-input"
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filter by city..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="form-input"
              />

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="">All Status</option>
                <option value="eligible">Eligible Now</option>
                <option value="not-eligible">Not Eligible</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {donors.length} donors
                {filters.search && ` for "${filters.search}"`}
              </p>
              <button
                onClick={clearFilters}
                className="btn-outline py-2 text-sm flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          {donors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No donors found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              <button onClick={clearFilters} className="btn-primary mt-4">Clear All Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donors.map(donor => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  onEdit={() => handleEditDonor(donor)}
                  onDelete={() => handleDeleteDonor(donor)}
                  deleteLoading={deleteLoading === donor.id}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        donor={selectedDonor}
        onUpdate={handleUpdateDonor}
      />
    </div>
  );
};

export default Donors;