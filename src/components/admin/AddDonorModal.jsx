// src/components/admin/AddDonorModal.jsx
import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Droplets, Calendar, Save } from 'lucide-react';
import { supabase } from '../../services/supabase';

const AddDonorModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    blood_type: '',
    district: '',
    thana: '',
    address: '',
    gender: '',
    age: '',
    last_donation_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const districts = [
    'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal', 
    'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.blood_type) {
      newErrors.blood_type = 'Blood type is required';
    }
    
    if (!formData.district) {
      newErrors.district = 'District is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('donors')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      alert('Donor added successfully!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        blood_type: '',
        district: '',
        thana: '',
        address: '',
        gender: '',
        age: '',
        last_donation_date: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error adding donor:', error);
      alert('Failed to add donor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add New Donor</h3>
              <p className="text-sm text-gray-600">Fill in the donor details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+880XXXXXXXXX"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="18-65"
                    min="18"
                    max="65"
                  />
                </div>
              </div>
            </div>

            {/* Medical & Location Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type *
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.blood_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.blood_type}
                    onChange={(e) => handleChange('blood_type', e.target.value)}
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {errors.blood_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Donation Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.last_donation_date}
                    onChange={(e) => handleChange('last_donation_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.district ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thana/Upazila
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.thana}
                    onChange={(e) => handleChange('thana', e.target.value)}
                    placeholder="Area name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any medical conditions, special notes, etc."
            />
          </div>
        </form>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Donor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDonorModal;