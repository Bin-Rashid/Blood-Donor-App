import React, { useState } from 'react';
import { User, Phone, Cake, Droplets, MapPin, Home, Calendar, Camera } from 'lucide-react';
import { districts, bloodTypes } from '../utils/helpers';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useDonors } from '../context/DonorContext';

const Register = () => {
  const { signUp } = useAuth();
  const { refetchDonors } = useDonors();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password || !formData.phone || 
          !formData.age || !formData.district || !formData.city || !formData.last_donation_date) {
        throw new Error('Please fill all required fields');
      }

      let profilePictureUrl = null;

      // Upload profile picture if selected
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, profilePicture);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName);

        profilePictureUrl = publicUrl;
      }

      // Create user account and donor profile
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        blood_type: formData.blood_type,
        district: formData.district,
        city: formData.city,
        last_donation_date: formData.last_donation_date,
        profile_picture: profilePictureUrl,
        created_at: new Date().toISOString(),
      });

      alert('Registration successful! You can now sign in.');
      refetchDonors();
      
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

    } catch (error) {
      console.error('Registration error:', error);
      alert(`Registration failed: ${error.message}`);
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

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-red-100 flex items-center justify-center text-gray-500 text-2xl font-bold">
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Preview"
                  className="w-full h-full rounded-full object-cover"
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
              />
              <span className="btn-outline py-2 px-4 text-sm">
                <Camera className="w-4 h-4" />
                Add Profile Picture
              </span>
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Create a password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Phone and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="01XXX-XXXXXX"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Cake className="w-4 h-4" />
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Your age"
                min="18"
                max="65"
                required
              />
            </div>
          </div>

          {/* Blood Type and District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Blood Type
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                District *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="form-input"
                required
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
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Home className="w-4 h-4" />
              City/Area *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Your city or area"
              required
            />
          </div>

          {/* Last Donation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last Donation Date *
            </label>
            <input
              type="date"
              name="last_donation_date"
              value={formData.last_donation_date}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the terms and conditions and confirm that I meet the eligibility criteria for blood donation.
            </label>
          </div>

          {/* Submit Button */}
          <div className="text-center">
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