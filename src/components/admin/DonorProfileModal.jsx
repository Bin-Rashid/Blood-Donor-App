// src/components/admin/DonorProfileModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Droplets, 
  User, 
  Edit,
  Save,
  Clock,
  Heart
} from 'lucide-react';

const DonorProfileModal = ({ donor, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDonor, setEditedDonor] = useState(donor);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, you would make an API call to update the donor
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Donor updated successfully!');
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      alert('Failed to update donor');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedDonor(prev => ({ ...prev, [field]: value }));
  };

  const calculateEligibility = (lastDonation) => {
    if (!lastDonation) return { eligible: true, nextDate: new Date() };
    
    const lastDonationDate = new Date(lastDonation);
    const nextDonationDate = new Date(lastDonationDate);
    nextDonationDate.setMonth(nextDonationDate.getMonth() + 3);
    
    return {
      eligible: nextDonationDate <= new Date(),
      nextDate: nextDonationDate
    };
  };

  const eligibility = calculateEligibility(donor.last_donation_date);
  const donorSince = new Date(donor.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {donor.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    className="border border-gray-300 rounded px-2 py-1"
                    value={editedDonor.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : donor.name || 'Unnamed Donor'}
              </h3>
              <p className="text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" />
                Donor ID: {donor.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        value={editedDonor.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{donor.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        value={editedDonor.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{donor.email || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        value={editedDonor.district || ''}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium mt-1">{donor.district || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Thana/Upazila</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        value={editedDonor.thana || ''}
                        onChange={(e) => handleInputChange('thana', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium mt-1">{donor.thana || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Address</label>
                    {isEditing ? (
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 mt-1 h-20"
                        value={editedDonor.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p className="font-medium mt-1">{donor.address || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Donation History */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Donation History
                </h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Last Donation</p>
                      <p className="text-sm text-gray-600">
                        {donor.last_donation_date 
                          ? new Date(donor.last_donation_date).toLocaleDateString()
                          : 'Never donated'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Next Eligible Date</p>
                      <p className={`text-sm ${eligibility.eligible ? 'text-green-600' : 'text-red-600'}`}>
                        {eligibility.nextDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">3</p>
                      <p className="text-sm text-gray-600">Total Donations</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-gray-600">Lives Saved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Blood Type Card */}
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Droplets className="w-8 h-8" />
                  <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Blood Type
                  </span>
                </div>
                
                {isEditing ? (
                  <select
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-50 rounded px-3 py-2 text-white"
                    value={editedDonor.blood_type || ''}
                    onChange={(e) => handleInputChange('blood_type', e.target.value)}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <>
                    <p className="text-4xl font-bold mb-2">{donor.blood_type || 'Unknown'}</p>
                    <p className="text-sm opacity-90">
                      {donor.blood_type?.includes('+') ? 'Rh Positive' : 'Rh Negative'}
                    </p>
                  </>
                )}
              </div>

              {/* Eligibility Status */}
              <div className={`rounded-lg p-6 ${eligibility.eligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${eligibility.eligible ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <Clock className={`w-5 h-5 ${eligibility.eligible ? 'text-green-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Donation Eligibility</h4>
                    <p className="text-sm text-gray-600">Based on last donation</p>
                  </div>
                </div>
                
                <p className={`text-lg font-bold ${eligibility.eligible ? 'text-green-700' : 'text-yellow-700'}`}>
                  {eligibility.eligible ? '✅ Eligible to Donate' : '⏳ Not Eligible Yet'}
                </p>
                
                {!eligibility.eligible && (
                  <p className="text-sm text-gray-600 mt-2">
                    Next donation: {eligibility.nextDate.toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Registration Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Registration Details</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{donorSince}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(donor.updated_at || donor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    <Phone className="w-4 h-4" />
                    Call Donor
                  </button>
                  
                  <button className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    <Mail className="w-4 h-4" />
                    Send Message
                  </button>
                  
                  <button className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                    <Calendar className="w-4 h-4" />
                    Schedule Donation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="border-t p-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedDonor(donor);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorProfileModal;