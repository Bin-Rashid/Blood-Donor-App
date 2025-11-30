// src/components/DonorCard.jsx
import React from 'react';
import { User, Phone, MapPin, Calendar, Droplets, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

const DonorCard = ({ donor, onEdit, onDelete, deleteLoading, isAdmin, currentUserId }) => {
  const canEdit = isAdmin || currentUserId === donor.id;
  const canDelete = isAdmin || currentUserId === donor.id;

  // Eligibility calculation
  const calculateEligibility = () => {
    if (!donor.last_donation_date) return { status: 'eligible', daysLeft: 0 };
    
    const lastDonation = new Date(donor.last_donation_date);
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const isEligible = lastDonation <= threeMonthsAgo;
    const timeDiff = today.getTime() - lastDonation.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const daysLeft = Math.max(0, 90 - daysDiff);
    
    return { 
      status: isEligible ? 'eligible' : 'not-eligible', 
      daysLeft 
    };
  };

  const eligibility = calculateEligibility();

  const handlePhoneClick = () => {
    if (donor.phone) {
      window.open(`tel:${donor.phone}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="donor-card relative overflow-hidden group">
      {/* Eligibility Status Badge - Top Right Corner */}
      <div className={`absolute top-2 right-4 z-10 ${
        eligibility.status === 'eligible' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      } px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg transform transition-all duration-300 group-hover:scale-105`}>
        {eligibility.status === 'eligible' ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>Eligible</span>
          </>
        ) : (
          <>
            <XCircle className="w-3.5 h-3.5 animate-pulse" />
            <span>Not Eligible</span>
          </>
        )}
      </div>

      {/* Eligibility Info Tooltip */}
      {eligibility.status === 'not-eligible' && (
        <div className="absolute top-12 right-4 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-lg">
          <div className="font-semibold">Next donation in:</div>
          <div>{eligibility.daysLeft} days</div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-start gap-4 mb-4 pt-3">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-200 flex items-center justify-center text-red-600 text-xl font-bold relative overflow-hidden">
          {donor.profile_picture ? (
            <img
              src={donor.profile_picture}
              alt={donor.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            donor.name.charAt(0).toUpperCase()
          )}
          
          {/* Online Status Indicator */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            eligibility.status === 'eligible' ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{donor.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Droplets className="w-4 h-4 text-red-500" />
            <span className="text-red-600 font-semibold text-sm bg-red-50 px-2 py-1 rounded-full">
              {donor.blood_type || 'Unknown'}
            </span>
            <span className="text-gray-500 text-sm">•</span>
            <span className="text-gray-600 text-sm">{donor.age} years</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={handlePhoneClick}
            className="text-gray-700 hover:text-red-600 transition-colors text-sm font-medium truncate flex-1 text-left"
            title="Click to call"
          >
            {donor.phone || 'Not provided'}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 text-sm truncate">
            {donor.city && donor.district 
              ? `${donor.city}, ${donor.district}`
              : donor.district || donor.city || 'Location not provided'
            }
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-600 text-sm">
            Last donation: {formatDate(donor.last_donation_date)}
          </span>
        </div>
      </div>

      {/* Eligibility Progress Bar (Only for Not Eligible) */}
      {eligibility.status === 'not-eligible' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Next donation in:</span>
            <span>{eligibility.daysLeft} days</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((90 - eligibility.daysLeft) / 90) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(canEdit || canDelete) && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          {canEdit && (
            <button
              onClick={() => onEdit(donor)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(donor)}
              disabled={deleteLoading}
              className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          )}
        </div>
      )}

      {/* Background Pattern based on Eligibility */}
      <div className={`absolute inset-0 opacity-5 pointer-events-none ${
        eligibility.status === 'eligible' 
          ? 'bg-gradient-to-br from-green-400 to-green-600' 
          : 'bg-gradient-to-br from-red-400 to-red-600'
      }`}></div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-xl border-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none ${
        eligibility.status === 'eligible' 
          ? 'border-green-200' 
          : 'border-red-200'
      }`}></div>
    </div>
  );
};

export default DonorCard;