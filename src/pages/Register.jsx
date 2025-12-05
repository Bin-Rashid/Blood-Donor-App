// src/pages/Register.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { User, Phone, Cake, Droplets, MapPin, Home, Calendar, Camera, Loader } from 'lucide-react';
import { districts, bloodTypes } from '../utils/helpers';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useDonors } from '../context/DonorContext'; // ✅ DonorContext ইম্পোর্ট যোগ করুন

const Register = () => {
  const { signUp } = useAuth();
  const { addDonor } = useDonors(); // ✅ addDonor ফাংশন ইম্পোর্ট করুন
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    blood_type: '',
    district: '',
    city: '',
    last_donation_date: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setProfilePicture(file);
  };

  // safely create object URL for preview and revoke when changed/unmount
  const previewUrl = useMemo(() => {
    try {
      return profilePicture ? URL.createObjectURL(profilePicture) : null;
    } catch (err) {
      console.warn('Failed to create preview URL', err);
      return null;
    }
  }, [profilePicture]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (err) {
          // ignore revoke errors
        }
      }
    };
  }, [previewUrl]);

  const validateForm = () => {
    // Check all required fields
    const requiredFields = ['name', 'email', 'password', 'phone', 'age', 'district', 'city', 'last_donation_date'];
    const missingFields = requiredFields.filter(field => !(formData[field] || '').toString().trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate password length
    if ((formData.password || '').length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    // Validate phone (Bangladeshi format)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX)');
      return false;
    }

    // Validate age
    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 18 || age > 65) {
      setError('Age must be between 18 and 65 years');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    let profilePictureUrl = null;

    // Upload profile picture if selected
    if (profilePicture) {
      try {
        const fileExt = (profilePicture.name || '').split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt || 'jpg'}`;
        
        const uploadResult = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, profilePicture);

        const uploadError = uploadResult?.error ?? (uploadResult?.data?.error ?? null);
        if (uploadError) throw uploadError;

        const publicUrlResult = await supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName);

        profilePictureUrl = publicUrlResult?.data?.publicUrl ?? publicUrlResult?.publicUrl ?? null;
      } catch (uploadError) {
        console.warn('Profile picture upload failed:', uploadError);
        // Continue without profile picture
      }
    }

    // Prepare donor data
    const donorData = {
      name: (formData.name || '').trim(),
      email: (formData.email || '').trim(),
      phone: (formData.phone || '').trim(),
      age: parseInt(formData.age, 10),
      blood_type: formData.blood_type || null,
      district: formData.district || null,
      city: (formData.city || '').trim(),
      last_donation_date: formData.last_donation_date || null,
      profile_picture: profilePictureUrl,
      created_at: new Date().toISOString(),
    };

    console.log('Starting registration process...');

    // Create user account and donor profile
    const signupResult = await signUp(formData.email, formData.password, donorData);
    
    // ✅ FIXED: Check for errors properly
    if (signupResult && signupResult.error) {
      throw new Error(signupResult.error);
    }

    if (!signupResult || !signupResult.success) {
      throw new Error('Registration failed without specific error');
    }

    console.log('✅ Registration successful!', signupResult);

    // ✅ Set flag for new registration
    sessionStorage.setItem('newDonorRegistered', 'true');
    
    // ✅ Also set in localStorage for cross-tab communication
    localStorage.setItem('lastRegisteredDonor', JSON.stringify({
      name: formData.name,
      time: new Date().toISOString()
    }));

    setSuccess('Registration successful! You are now logged in.');

    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      blood_type: '',
      district: '',
      city: '',
      last_donation_date: '',
    });
    setProfilePicture(null);

    // Auto-redirect to donors page after 3 seconds
    setTimeout(() => {
      window.location.href = '/donors';
    }, 3000);

  } catch (err) {
    console.error('Registration error:', err);
    setError(`Registration failed: ${err?.message || String(err) || 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <User className="w-6 h-6" />
        Become a Blood Donor
      </h2>
      <p className="text-gray-600 mb-6">
        * Required fields: Name, Email, Password, Phone, Age, District, City/Area and Last Donation Date
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 font-medium">{success}</p>
              <p className="text-green-600 text-sm mt-1">
                You will be redirected to the donors page shortly...
              </p>
              <div className="mt-2">
                <a 
                  href="/donors" 
                  className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-medium text-sm"
                >
                  Go to Find Donors Now →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-red-100 flex items-center justify-center text-gray-500 text-2xl font-bold overflow-hidden">
              {profilePicture ? (
                <img
                  src={previewUrl || ''}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                disabled={loading}
              />
              <span className="btn-outline py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Camera className="w-4 h-4" />
                Add Profile Picture (Optional)
              </span>
            </label>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>

          {/* Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
          </div>

          {/* Phone and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </label>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="017XXXXXXXX"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Format: 017XXXXXXXX</p>
            </div>
            <div>
              <label htmlFor="register-age" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Cake className="w-4 h-4" />
                Age *
              </label>
              <input
                id="register-age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Your age (18-65)"
                min="18"
                max="65"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Blood Type and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-blood-type" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Blood Type (Optional)
              </label>
              <select
                id="register-blood-type"
                name="blood_type"
                value={formData.blood_type}
                onChange={handleInputChange}
                className="form-input"
                disabled={loading}
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="register-district" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                District *
              </label>
              <select
                id="register-district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select District</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          {/* City */}
          <div>
            <label htmlFor="register-city" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              City/Area *
            </label>
            <input
              id="register-city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Your city or area"
              required
              disabled={loading}
            />
          </div>

          {/* Last Donation Date */}
          <div>
            <label htmlFor="register-last-donation" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Donation Date *
            </label>
            <input
              id="register-last-donation"
              type="date"
              name="last_donation_date"
              value={formData.last_donation_date}
              onChange={handleInputChange}
              className="form-input"
              required
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              If you've never donated before, please select today's date or a future date
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1"
              disabled={loading}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the terms and conditions and confirm that I meet the eligibility criteria for blood donation.
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Register as Donor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;