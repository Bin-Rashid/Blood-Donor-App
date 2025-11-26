import React, { useState, useEffect } from 'react'
import { Users, Filter, Download, RefreshCw, Search } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import DonorCard from '../components/DonorCard'
import StatsCards from '../components/StatsCards'
import EditModal from '../components/EditModal'
import { districts, bloodTypes } from '../utils/helpers'

const Donors = () => {
  const { isAdmin, user } = useAuth()
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
    fetchDonors()
  }, [])

  useEffect(() => {
    filterAndSortDonors()
  }, [donors, filters])

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setDonors(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching donors:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (donorList) => {
    const totalDonors = donorList.length
    const eligibleDonors = donorList.filter(donor => {
      const lastDonation = new Date(donor.last_donation_date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return lastDonation <= threeMonthsAgo
    }).length

    const universalDonors = donorList.filter(donor => donor.blood_type === 'O-').length
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentDonors = donorList.filter(donor => 
      new Date(donor.created_at) >= oneWeekAgo
    ).length

    setStats({
      totalDonors,
      eligibleDonors,
      universalDonors,
      recentDonors
    })
  }

  // DELETE FUNCTION - Properly Implemented  
        const handleDeleteDonor = (donor) => {
        // Check if user has permission to delete
        const canDelete = isAdmin || user?.id === donor.id;
        
        if (!canDelete) {
            alert('You can only delete your own profile');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${donor.name}? This action cannot be undone.`)) {
            return;
        }

        setDeleteLoading(donor.id);

        // Actual delete implementation
        const deleteDonor = async () => {
            try {
            const { error } = await supabase
                .from('donors')
                .delete()
                .eq('id', donor.id)

            if (error) throw error

            // Remove from local state
            setDonors(prev => prev.filter(d => d.id !== donor.id))
            alert('Profile deleted successfully!')
            
            } catch (error) {
            console.error('Error deleting donor:', error)
            alert('Error deleting profile: ' + error.message)
            } finally {
            setDeleteLoading(null)
            }
        }

        deleteDonor();
        }

  // EDIT FUNCTION
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
    // Refresh the donors list after update
    fetchDonors()
  }

  const filterAndSortDonors = () => {
    let filtered = [...donors]

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        donor.phone.includes(filters.search)
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
        donor.city.toLowerCase().includes(filters.city.toLowerCase())
      )
    }

    if (filters.status) {
      const today = new Date()
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(today.getMonth() - 3)

      if (filters.status === 'eligible') {
        filtered = filtered.filter(donor =>
          new Date(donor.last_donation_date) <= threeMonthsAgo
        )
      } else if (filters.status === 'not-eligible') {
        filtered = filtered.filter(donor =>
          new Date(donor.last_donation_date) > threeMonthsAgo
        )
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'age-asc':
          return a.age - b.age
        case 'age-desc':
          return b.age - a.age
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at)
        default:
          return 0
      }
    })

    setFilteredDonors(filtered)
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
    const csvContent = [
      ['Name', 'Phone', 'Age', 'Blood Type', 'District', 'City', 'Last Donation', 'Status'],
      ...filteredDonors.map(donor => [
        donor.name,
        donor.phone,
        donor.age,
        donor.blood_type,
        donor.district,
        donor.city,
        new Date(donor.last_donation_date).toLocaleDateString(),
        new Date(donor.last_donation_date) <= new Date(new Date().setMonth(new Date().getMonth() - 3)) ? 'Eligible' : 'Not Eligible'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blood-donors.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

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
          onClick={exportData}
          className="btn-primary py-2"
          disabled={filteredDonors.length === 0}
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
        <button
          onClick={fetchDonors}
          className="btn-outline py-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
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
              onEdit={() => handleEditDonor(donor)} // এখানে change করুন
              onDelete={() => handleDeleteDonor(donor)} // এখানে change করুন
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