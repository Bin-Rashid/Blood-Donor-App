import React from 'react'
import { MapPin, Phone, Calendar, Edit, Trash2, RefreshCw } from 'lucide-react'
import { calculateEligibility, formatPhoneNumber } from '../utils/helpers'

const DonorCard = ({ 
  donor, 
  onEdit, 
  onDelete, 
  isAdmin = false, 
  currentUserId,
  deleteLoading = false 
}) => {
  const eligibility = calculateEligibility(donor.last_donation_date)
  const isOwnProfile = currentUserId === donor.id

  return (
    <div className="donor-card group">
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold border-4 border-red-100">
          {donor.profile_picture ? (
            <img
              src={donor.profile_picture}
              alt={donor.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            donor.name.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
          {donor.blood_type || 'Unknown'}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {donor.name}
        </h3>
        
        <p className="text-gray-600 mb-2">{donor.age} years</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{formatPhoneNumber(donor.phone)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{donor.city}, {donor.district}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last donation: {new Date(donor.last_donation_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className={`mb-4 text-center ${
        eligibility.eligible ? 'status-eligible' : 'status-not-eligible'
      }`}>
        {eligibility.message}
      </div>

      {(isOwnProfile || isAdmin) && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(donor)}
            className="flex-1 btn-outline py-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(donor)}
            disabled={deleteLoading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {deleteLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DonorCard