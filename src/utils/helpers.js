// src/utils/helpers.js
import { useState, useEffect } from 'react';

export const calculateEligibility = (lastDonationDate) => {
  const lastDonation = new Date(lastDonationDate)
  const today = new Date()
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(today.getMonth() - 3)

  if (lastDonation > threeMonthsAgo) {
    const nextEligibleDate = new Date(lastDonation)
    nextEligibleDate.setMonth(lastDonation.getMonth() + 3)
    const daysLeft = Math.ceil((nextEligibleDate - today) / (1000 * 60 * 60 * 24))
    return {
      eligible: false,
      message: `তিনি এখনো ${daysLeft} দিন অপেক্ষা করতে হবে`,
      daysLeft
    }
  }

  return {
    eligible: true,
    message: 'তিনি এখন রক্ত দিতে পারবেন',
    daysLeft: 0
  }
}

export const formatPhoneNumber = (phone) => {
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
}

export const districts = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 
  'Barisal', 'Rangpur', 'Mymensingh'
]

export const bloodTypes = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]

// Pagination helper function
export const paginate = (array, pageSize, pageNumber) => {
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = startIndex + pageSize
  return {
    items: array.slice(startIndex, endIndex),
    totalItems: array.length,
    totalPages: Math.ceil(array.length / pageSize),
    currentPage: pageNumber,
    hasNextPage: endIndex < array.length,
    hasPreviousPage: startIndex > 0
  }
}

// Alternative pagination function (simpler)
export const simplePaginate = (array, pageSize, pageNumber) => {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
}

// Custom hook for debouncing values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Validate phone number (Bangladeshi format)
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^01[3-9]\d{8}$/
  return phoneRegex.test(phone)
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Calculate age from birth date
export const calculateAge = (birthDate) => {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Filter donors with search functionality
export const filterDonors = (donors, filters) => {
  let filtered = [...donors]

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

  return filtered
}

// Sort donors
export const sortDonors = (donors, sortBy) => {
  const sorted = [...donors]
  
  sorted.sort((a, b) => {
    switch (sortBy) {
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
  
  return sorted
}