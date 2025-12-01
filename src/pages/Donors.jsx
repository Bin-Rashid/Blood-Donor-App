import React, { useState, useEffect, useRef } from 'react'
import { Users, Filter, Download, RefreshCw, Search } from 'lucide-react'
import { supabase } from '../services/supabase' // ✅ এই line যোগ করুন
import { useAuth } from '../context/AuthContext'
import DonorCard from '../components/DonorCard'
import StatsCards from '../components/StatsCards'
import EditModal from '../components/EditModal'
import { districts, bloodTypes } from '../utils/helpers'

const Donors = () => {
  const { isAdmin, user, signOut } = useAuth()
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [stats, setStats] = useState({
    totalDonors: 0,
    eligibleDonors: 0,
    universalDonors: 0,
    recentDonors: 0
  })

  const hasFetched = useRef(false)

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    bloodType: '',
    district: '',
    city: '',
    status: '',
    sortBy: 'name-asc'
  })

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDonors()
    }
  }, [])

  useEffect(() => {
    filterAndSortDonors()
  }, [donors, filters])

  const fetchDonors = async () => {
    try {
      console.log('🔄 Fetching donors from database...')
      setLoading(true)
      
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching donors:', error)
        throw error
      }

      console.log('✅ Donors fetched successfully:', data?.length || 0)
      setDonors(data || [])
      calculateStats(data || [])
      
    } catch (error) {
      console.error('❌ Error in fetchDonors:', error)
      setDonors([])
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const calculateStats = (donorList) => {
    try {
      const totalDonors = donorList.length
      
      const eligibleDonors = donorList.filter(donor => {
        if (!donor.last_donation_date) return true
        const lastDonation = new Date(donor.last_donation_date)
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return lastDonation <= threeMonthsAgo
      }).length

      const universalDonors = donorList.filter(donor => donor.blood_type === 'O-').length
      
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recentDonors = donorList.filter(donor => 
        donor.created_at && new Date(donor.created_at) >= oneWeekAgo
      ).length

      setStats({
        totalDonors,
        eligibleDonors,
        universalDonors,
        recentDonors
      })
      
      console.log('📊 Stats calculated:', { totalDonors, eligibleDonors, universalDonors, recentDonors })
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

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
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', donor.id)

      if (error) {
        console.error('Delete error details:', error)
        throw error
      }

      // যদি user নিজের profile delete করে, তাহলে sign out করানো
      if (user?.id === donor.id) {
        console.log('User deleted own profile, signing out...')
        // Sign out from Supabase
        await signOut()
        // Force page reload to clear all cached state
        window.location.href = '/'
        return // Stop further execution
      }

      // Success - remove from local state (for admin deleting other profiles)
      setDonors(prev => prev.filter(d => d.id !== donor.id))
      
      alert('Profile deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting donor:', error)
      
      let errorMessage = 'Error deleting profile'
      if (error.message) {
        errorMessage += ': ' + error.message
      } else if (error.code) {
        errorMessage += ` (Error code: ${error.code})`
      }
      
      alert(errorMessage)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEditDonor = (donor) => {
    const canEdit = isAdmin || user?.id === donor.id;

    if (!canEdit) {
      alert('You can only edit your own profile');
      return;
    }
    setSelectedDonor(donor)
    setEditModalOpen(true)
  }

  const handleUpdateDonor = () => {
    fetchDonors()
  }

  const filterAndSortDonors = () => {
    try {
      let filtered = [...donors]

      // Apply filters
      if (filters.search) {
        filtered = filtered.filter(donor =>
          donor.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          donor.phone?.includes(filters.search)
        )
      }

      if (filters.bloodType) {
        filtered = filtered.filter(donor => donor.blood_type === filters.bloodType)
      }

      if (filters.district) {
        filtered = filtered.filter(donor => donor.district === filters.district)
      }

      if (filters.city) {
        filtered = filtered.filter(donor =>
          donor.city?.toLowerCase().includes(filters.city.toLowerCase())
        )
      }

      if (filters.status) {
        const today = new Date()
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(today.getMonth() - 3)

        if (filters.status === 'eligible') {
          filtered = filtered.filter(donor => {
            if (!donor.last_donation_date) return true
            return new Date(donor.last_donation_date) <= threeMonthsAgo
          })
        } else if (filters.status === 'not-eligible') {
          filtered = filtered.filter(donor => {
            if (!donor.last_donation_date) return false
            return new Date(donor.last_donation_date) > threeMonthsAgo
          })
        }
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name-asc':
            return (a.name || '').localeCompare(b.name || '')
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '')
          case 'age-asc':
            return (a.age || 0) - (b.age || 0)
          case 'age-desc':
            return (b.age || 0) - (a.age || 0)
          case 'date-asc':
            return new Date(a.created_at || 0) - new Date(b.created_at || 0)
          case 'date-desc':
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
          default:
            return 0
        }
      })

      setFilteredDonors(filtered)
      console.log('🔍 Filtered donors:', filtered.length)
    } catch (error) {
      console.error('Error in filterAndSortDonors:', error)
      setFilteredDonors(donors)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      bloodType: '',
      district: '',
      city: '',
      status: '',
      sortBy: 'name-asc'
    })
  }

  const exportData = () => {
    try {
      const csvContent = [
        ['Name', 'Phone', 'Age', 'Blood Type', 'District', 'City', 'Last Donation', 'Status'],
        ...filteredDonors.map(donor => [
          donor.name || '',
          donor.phone || '',
          donor.age || '',
          donor.blood_type || '',
          donor.district || '',
          donor.city || '',
          donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never',
          donor.last_donation_date ? 
            (new Date(donor.last_donation_date) <= new Date(new Date().setMonth(new Date().getMonth() - 3)) ? 'Eligible' : 'Not Eligible') 
            : 'Eligible'
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'blood-donors.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data: ' + error.message)
    }
  }

  console.log('🎯 Donors component - loading:', loading, 'donors count:', donors.length)

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Admin Panel */}
      {isAdmin && (
        <div className="card p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Panel
            </h3>
            <div className="flex gap-2">
              <button className="btn-outline py-2 text-sm">
                Edit Footer
              </button>
              <button className="btn-outline py-2 text-sm">
                Logout Admin
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            You are logged in as an administrator. You can now edit and delete donor records.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Find Blood Donors
      </h2>
      <p className="text-gray-600 mb-6">Connect with available donors in your area</p>

      {/* Statistics */}
      <StatsCards stats={stats} />

      {/* Admin Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={fetchDonors}
          className="btn-primary py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
        <button
          onClick={exportData}
          className="btn-outline py-2"
          disabled={filteredDonors.length === 0}
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Sort Controls */}
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
          <option value="date-asc">Registration Date (Oldest)</option>
          <option value="date-desc">Registration Date (Newest)</option>
        </select>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
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
            Showing {filteredDonors.length} of {donors.length} donors
          </p>
          <button
            onClick={clearFilters}
            className="btn-outline py-2 text-sm"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Donors Grid */}
      {filteredDonors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No donors found</h3>
          <p className="text-gray-500">
            {donors.length === 0 
              ? 'No donors have registered yet. Be the first to register!'
              : 'Try adjusting your filters to see more results.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map(donor => (
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

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        donor={selectedDonor}
        onUpdate={handleUpdateDonor}
      />
    </div>
  )
}

export default Donors