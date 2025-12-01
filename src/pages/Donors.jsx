// src/pages/Donors.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Users, Filter, Download, RefreshCw, Search, BookOpen, ChevronDown } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import DonorCard from '../components/DonorCard'
import StatsCards from '../components/StatsCards'
import EditModal from '../components/EditModal'
import PhoneRequestModal from '../components/PhoneRequestModal'
import GuidelinesTab from '../components/GuidelinesTab'
import { districts, bloodTypes } from '../utils/helpers'

const Donors = () => {
  const { isAdmin, user, signOut } = useAuth()
  const [donors, setDonors] = useState([])
  const [filteredDonors, setFilteredDonors] = useState([])
  const [displayedDonors, setDisplayedDonors] = useState([]) // New state for pagination
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false) // New loading state for load more
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [phoneRequestModalOpen, setPhoneRequestModalOpen] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [phoneRequestDonor, setPhoneRequestDonor] = useState(null)
  const [stats, setStats] = useState({
    totalDonors: 0,
    eligibleDonors: 0,
    universalDonors: 0,
    recentDonors: 0
  })

  // Pagination settings
  const [pageSize, setPageSize] = useState(20) // Items per page
  const [currentPage, setCurrentPage] = useState(1) // Current page number
  const [totalPages, setTotalPages] = useState(1) // Total pages

  // Track which donors' phone numbers are visible
  const [visiblePhones, setVisiblePhones] = useState(() => {
    const saved = localStorage.getItem('visiblePhoneDonors')
    return saved ? JSON.parse(saved) : {}
  })

  const [activeSubTab, setActiveSubTab] = useState(() => {
    const savedTab = localStorage.getItem('activeDonorsTab')
    return savedTab || 'guidelines'
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

  // active tab localStorage এ save করা
  useEffect(() => {
    localStorage.setItem('activeDonorsTab', activeSubTab)
  }, [activeSubTab])

  // Save visible phones to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('visiblePhoneDonors', JSON.stringify(visiblePhones))
  }, [visiblePhones])

  // Update displayed donors when filtered donors or page changes
  useEffect(() => {
    if (activeSubTab === 'find-donors') {
      updateDisplayedDonors()
    }
  }, [filteredDonors, currentPage, activeSubTab])

  useEffect(() => {
    if (!hasFetched.current && activeSubTab === 'find-donors') {
      hasFetched.current = true
      fetchDonors()
    }
  }, [activeSubTab])

  useEffect(() => {
    if (activeSubTab === 'find-donors') {
      filterAndSortDonors()
    }
  }, [donors, filters, activeSubTab])

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
      
      // Also remove from visible phones
      setVisiblePhones(prev => {
        const newVisible = { ...prev }
        delete newVisible[donor.id]
        return newVisible
      })
      
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
    if (activeSubTab === 'find-donors') {
      fetchDonors()
    }
  }

  // Phone number request handler
  const handleRequestPhone = (donor) => {
    setPhoneRequestDonor(donor)
    setPhoneRequestModalOpen(true)
  }

  // Handle phone request submission
  const handlePhoneRequestSubmit = async (requesterInfo) => {
    if (!phoneRequestDonor) return;

    // Send to WhatsApp
    const whatsappMessage = encodeURIComponent(
      `📞 *New Phone Number Request*\n\n` +
      `*Donor Info:*\n` +
      `Name: ${phoneRequestDonor.name}\n` +
      `Blood Type: ${phoneRequestDonor.blood_type || 'Unknown'}\n` +
      `Location: ${phoneRequestDonor.district || ''}${phoneRequestDonor.city ? ', ' + phoneRequestDonor.city : ''}\n\n` +
      `*Requester Info:*\n` +
      `Name: ${requesterInfo.name}\n` +
      `Phone: ${requesterInfo.phone}\n` +
      `Address: ${requesterInfo.address}\n` +
      `Patient Problem: ${requesterInfo.patientProblem}\n\n` +
      `*Donor Phone:* ${phoneRequestDonor.phone}\n` +
      `---\n` +
      `Requested at: ${new Date().toLocaleString()}`
    );
    
    // Use your WhatsApp number here
    const whatsappNumber = "+8801994984210"; // Replace with your actual WhatsApp number
    
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
    
    // Mark this donor's phone as visible
    setVisiblePhones(prev => ({
      ...prev,
      [phoneRequestDonor.id]: {
        phone: phoneRequestDonor.phone,
        revealedAt: new Date().toISOString()
      }
    }));
    
    setPhoneRequestModalOpen(false)
    setPhoneRequestDonor(null)
  }

  // Clear visible phones (admin function)
  const clearVisiblePhones = () => {
    if (window.confirm('Are you sure you want to clear all revealed phone numbers? This will hide all previously revealed phone numbers.')) {
      setVisiblePhones({})
      alert('All phone numbers have been hidden again.')
    }
  }

  const filterAndSortDonors = () => {
    try {
      let filtered = [...donors]

      // Apply filters
      if (filters.search) {
        filtered = filtered.filter(donor =>
          donor.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          donor.phone?.includes(filters.search) ||
          donor.email?.toLowerCase().includes(filters.search.toLowerCase())
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
          case 'created_at-asc':
            return new Date(a.created_at || 0) - new Date(b.created_at || 0)
          case 'created_at-desc':
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
          default:
            return 0
        }
      })

      setFilteredDonors(filtered)
      
      // Reset to first page when filters change
      setCurrentPage(1)
      
      console.log('🔍 Filtered donors:', filtered.length)
    } catch (error) {
      console.error('Error in filterAndSortDonors:', error)
      setFilteredDonors(donors)
    }
  }

  // Update displayed donors based on current page
  const updateDisplayedDonors = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const donorsToDisplay = filteredDonors.slice(0, endIndex)
    
    setDisplayedDonors(donorsToDisplay)
    
    // Calculate total pages
    const calculatedTotalPages = Math.ceil(filteredDonors.length / pageSize)
    setTotalPages(calculatedTotalPages)
  }

  // Load more donors
  const loadMoreDonors = () => {
    if (currentPage < totalPages) {
      setLoadingMore(true)
      
      // Simulate loading delay
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setLoadingMore(false)
      }, 500)
    }
  }

  // Load all donors at once
  const loadAllDonors = () => {
    setLoadingMore(true)
    
    // Simulate loading delay
    setTimeout(() => {
      const allPages = Math.ceil(filteredDonors.length / pageSize)
      setCurrentPage(allPages)
      setLoadingMore(false)
    }, 800)
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
      const dataToExport = filteredDonors.length > 0 ? filteredDonors : donors
      
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Age', 'Blood Type', 'District', 'City', 'Last Donation', 'Status', 'Registration Date'],
        ...dataToExport.map(donor => {
          const lastDonation = donor.last_donation_date ? new Date(donor.last_donation_date) : null
          const threeMonthsAgo = new Date()
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
          const status = lastDonation ? (lastDonation <= threeMonthsAgo ? 'Eligible' : 'Not Eligible') : 'Eligible'
          
          return [
            donor.name || '',
            donor.email || '',
            donor.phone || '',
            donor.age || '',
            donor.blood_type || '',
            donor.district || '',
            donor.city || '',
            lastDonation ? lastDonation.toLocaleDateString() : 'Never',
            status,
            donor.created_at ? new Date(donor.created_at).toLocaleDateString() : ''
          ]
        })
      ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blood-donors-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data: ' + error.message)
    }
  }

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveSubTab(tab)
    if (tab === 'find-donors' && !hasFetched.current) {
      hasFetched.current = true
      fetchDonors()
    }
  }

  console.log('🎯 Donors component - active tab:', activeSubTab, 'loading:', loading, 'donors count:', donors.length)

  const renderFindDonorsContent = () => {
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

    const hasMoreDonors = displayedDonors.length < filteredDonors.length
    const remainingDonors = filteredDonors.length - displayedDonors.length

    return (
      <>
        {/* Statistics */}
        <StatsCards stats={stats} />

        {/* Admin Controls */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={fetchDonors}
            className="btn-primary py-2 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <button
            onClick={exportData}
            className="btn-outline py-2 flex items-center gap-2"
            disabled={donors.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Data ({donors.length})
          </button>
          {isAdmin && (
            <button
              onClick={clearVisiblePhones}
              className="btn-outline py-2 flex items-center gap-2 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
            >
              🔒 Hide All Phones
            </button>
          )}
        </div>

        {/* Stats about revealed phones */}
        {Object.keys(visiblePhones).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-700">
                <span className="font-semibold">📱 {Object.keys(visiblePhones).length} phone numbers are visible</span>
                <p className="text-xs mt-1">Phone numbers you've requested will remain visible</p>
              </div>
              <button
                onClick={() => setVisiblePhones({})}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Hide all
              </button>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
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
          
          <div className="text-sm text-gray-600">
            Showing {displayedDonors.length} of {filteredDonors.length} donors
            {hasMoreDonors && (
              <span className="text-red-600 font-medium ml-2">
                ({remainingDonors} more available)
              </span>
            )}
          </div>
        </div>

        {/* Search and Filters */}
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
              {filters.search && `Search results for "${filters.search}"`}
              {filters.bloodType && ` with blood type "${filters.bloodType}"`}
              {filters.district && ` in district "${filters.district}"`}
              {filters.status && ` with status "${filters.status}"`}
              {!filters.search && !filters.bloodType && !filters.district && !filters.status && 'All donors'}
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

        {/* Donors Grid */}
        {displayedDonors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No donors found</h3>
            <p className="text-gray-500">
              {donors.length === 0 
                ? 'No donors have registered yet. Be the first to register!'
                : 'Try adjusting your filters to see more results.'
              }
            </p>
            {donors.length > 0 && (
              <button onClick={clearFilters} className="btn-primary mt-4">
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDonors.map(donor => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  onEdit={() => handleEditDonor(donor)}
                  onDelete={() => handleDeleteDonor(donor)}
                  onRequestPhone={() => handleRequestPhone(donor)}
                  deleteLoading={deleteLoading === donor.id}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  isPhoneVisible={!!visiblePhones[donor.id]}
                />
              ))}
            </div>

            {/* Load More Section */}
            {hasMoreDonors && (
              <div className="mt-10 text-center space-y-4">
                <div className="text-gray-600 text-sm">
                  Showing {displayedDonors.length} of {filteredDonors.length} donors
                  <span className="text-red-600 font-medium ml-2">
                    ({remainingDonors} more to load)
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={loadMoreDonors}
                    disabled={loadingMore}
                    className="btn-primary flex items-center justify-center gap-2 min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More ({Math.min(pageSize, remainingDonors)} more)
                      </>
                    )}
                  </button>
                  
                  {remainingDonors > pageSize && (
                    <button
                      onClick={loadAllDonors}
                      disabled={loadingMore}
                      className="btn-outline flex items-center justify-center gap-2 min-w-[200px]"
                    >
                      Load All {remainingDonors} Donors
                    </button>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Currently showing page {currentPage} of {totalPages}
                </div>
              </div>
            )}

            {/* Show message when all donors are loaded */}
            {!hasMoreDonors && filteredDonors.length > 0 && (
              <div className="mt-10 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                  <p className="text-green-700 font-medium">
                    🎉 All {filteredDonors.length} donors are displayed
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    You've reached the end of the list
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </>
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
          onClick={() => handleTabChange('guidelines')}
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
          onClick={() => handleTabChange('find-donors')}
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
      {activeSubTab === 'find-donors' && renderFindDonorsContent()}

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        donor={selectedDonor}
        onUpdate={handleUpdateDonor}
      />

      {/* Phone Request Modal */}
      <PhoneRequestModal
        isOpen={phoneRequestModalOpen}
        onClose={() => {
          setPhoneRequestModalOpen(false)
          setPhoneRequestDonor(null)
        }}
        onSubmit={handlePhoneRequestSubmit}
        donorName={phoneRequestDonor?.name || ''}
        donorBloodType={phoneRequestDonor?.blood_type || ''}
        donorLocation={`${phoneRequestDonor?.district || ''}${phoneRequestDonor?.city ? ', ' + phoneRequestDonor.city : ''}`}
        donorPhone={phoneRequestDonor?.phone || ''}
      />
    </div>
  )
}

export default Donors