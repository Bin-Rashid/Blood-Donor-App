import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Droplets,
  Heart, 
  Edit,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const DonorProfileModal = ({ donor, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: donor.name || '',
    phone: donor.phone || '',
    email: donor.email || '',
    blood_type: donor.blood_type || '',
    district: donor.district || '',
    city: donor.city || '',
    age: donor.age || '',
    last_donation_date: donor.last_donation_date || ''
  });

  const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { status: 'eligible', daysLeft: 0 };
    
    const lastDonation = new Date(lastDonationDate);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('donors')
        .update(formData)
        .eq('id', donor.id);

      if (error) throw error;

      alert('Donor information updated successfully!');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating donor:', error);
      alert('Failed to update donor information');
    }
  };

  const eligibility = calculateEligibility(donor.last_donation_date);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Donor Profile</h2>
              <p className="text-sm text-gray-500">ID: {donor.id.substring(0, 8)}...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center text-3xl font-bold text-red-600">
                    {donor.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="text-2xl font-bold border border-gray-300 rounded-lg px-3 py-2 w-full"
                      />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-800">{donor.name}</h3>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        eligibility.status === 'eligible'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {eligibility.status === 'eligible' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Eligible to Donate
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Next eligible in {eligibility.daysLeft} days
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-48">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <Droplets className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-700">{donor.blood_type}</div>
                  <div className="text-sm text-gray-600">Blood Type</div>
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium">{donor.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium">{donor.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium">{donor.district || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">City/Area</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium">{donor.city || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Age</label>
                    {isEditing ? (
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                        min="18"
                        max="65"
                      />
                    ) : (
                      <p className="font-medium">{donor.age || 'Not provided'} years</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Donation History */}
              <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Donation History
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Last Donation Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="last_donation_date"
                        value={formData.last_donation_date ? formData.last_donation_date.split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                      />
                    ) : (
                      <p className="font-medium">{formatDate(donor.last_donation_date)}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Registration Date</label>
                    <p className="font-medium">{formatDate(donor.created_at)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Last Updated</label>
                    <p className="font-medium">{formatDate(donor.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-700 mb-4">Activity Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-sm text-gray-600">Total Donations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {eligibility.status === 'eligible' ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600">Currently Eligible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Requests Fulfilled</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Profile Complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <div className="text-sm text-gray-500">
            Donor since {new Date(donor.created_at).getFullYear()}
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: donor.name || '',
                      phone: donor.phone || '',
                      email: donor.email || '',
                      blood_type: donor.blood_type || '',
                      district: donor.district || '',
                      city: donor.city || '',
                      age: donor.age || '',
                      last_donation_date: donor.last_donation_date || ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = `/admin/donors?action=edit&id=${donor.id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit Full Profile
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Quick Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfileModal;