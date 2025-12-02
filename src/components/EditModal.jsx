import React, { useState, useEffect } from 'react'
import { X, Save, User, Phone, Cake, Droplets, MapPin, Home, Calendar, Camera, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { districts, bloodTypes } from '../utils/helpers'
import { compressDonorImage } from '../utils/imageCompression'

const EditModal = ({ isOpen, onClose, donor, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false) // New state for image upload
  const [profilePicture, setProfilePicture] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    blood_type: '',
    district: '',
    city: '',
    last_donation_date: ''
  })

  // New state for compressed image file
  const [compressedImageFile, setCompressedImageFile] = useState(null)

  useEffect(() => {
    if (donor) {
      setFormData({
        name: donor.name || '',
        phone: donor.phone || '',
        age: donor.age || '',
        blood_type: donor.blood_type || '',
        district: donor.district || '',
        city: donor.city || '',
        last_donation_date: donor.last_donation_date || ''
      })
    }
  }, [donor])

  if (!isOpen || !donor) return null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)

    try {
      // Auto compress image before uploading
      console.log('Compressing image...')
      const compressedFile = await compressDonorImage(file)
      
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        // Create a preview URL for the compressed image
        const previewUrl = e.target.result
        // We'll store this in formData for immediate preview
        setFormData(prev => ({
          ...prev,
          _previewPicture: previewUrl // Temporary field for preview
        }))
      }
      reader.readAsDataURL(compressedFile)

      // Store the compressed file for upload
      setCompressedImageFile(compressedFile)
      
      console.log('Image compressed successfully')
    } catch (error) {
      console.error('Image compression error:', error)
      alert('Failed to process image. Please try another image.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let profilePictureUrl = donor.profile_picture

      // Upload new profile picture if selected
      if (compressedImageFile) {
        const fileExt = 'jpg' // Always use jpg after compression
        const fileName = `${donor.id}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, compressedImageFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName)

        profilePictureUrl = publicUrl
        console.log('Image uploaded to:', publicUrl)
      }

      // Direct update without RLS policy recursion
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        blood_type: formData.blood_type,
        district: formData.district,
        city: formData.city,
        last_donation_date: formData.last_donation_date,
        updated_at: new Date().toISOString()
      }

      // Only add profile picture if it was updated
      if (profilePictureUrl !== donor.profile_picture) {
        updateData.profile_picture = profilePictureUrl
      }

      console.log('Updating donor with data:', updateData)

      // Use service role key for admin updates to bypass RLS
      const { error } = await supabase
        .from('donors')
        .update(updateData)
        .eq('id', donor.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Call the update callback
      if (onUpdate) {
        onUpdate()
      }

      alert('Profile updated successfully!')
      onClose()
      
    } catch (error) {
      console.error('Error updating donor:', error)
      
      // User-friendly error message
      let errorMessage = 'Error updating profile: ' + error.message
      if (error.code === '42P17') {
        errorMessage = 'Database policy error. Please contact administrator.'
      } else if (error.code === '42501') {
        errorMessage = 'Permission denied. You can only edit your own profile.'
      } else if (error.message.includes('storage')) {
        errorMessage = 'Failed to upload image. Please try again.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Function to get the profile picture for display
  const getProfilePicture = () => {
    if (formData._previewPicture) {
      return formData._previewPicture
    }
    return donor.profile_picture
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Donor Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-red-100 flex items-center justify-center text-gray-500 text-2xl font-bold overflow-hidden">
                  {uploading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                  ) : getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    donor.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Uploading indicator */}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">Compressing...</span>
                  </div>
                )}
              </div>
              
              <label className="cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={uploading}
                />
                <span className={`btn-outline py-2 px-4 text-sm flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Processing...' : 'Change Profile Picture'}
                </span>
                {uploading && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </label>
              
              {compressedImageFile && (
                <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ✓ Image compressed for optimal storage
                </div>
              )}
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
                placeholder="Enter full name"
                required
              />
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
              <p className="text-sm text-gray-500 mt-1">
                Please update this date after every blood donation
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Profile
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className={`flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditModal