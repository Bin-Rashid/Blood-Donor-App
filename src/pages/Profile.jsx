import React, { useState, useEffect } from 'react'
import { 
  User, Edit, LogOut, Calendar, Droplets, MapPin, 
  Phone, Mail, Save, Camera, Shield, AlertCircle,
  Loader2, Trash2, ChevronLeft, Heart
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { compressDonorImage } from '../utils/imageCompression'
import { districts, bloodTypes } from '../utils/helpers'

const Profile = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [donorData, setDonorData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    blood_type: '',
    district: '',
    city: '',
    last_donation_date: ''
  })
  const [compressedImageFile, setCompressedImageFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchDonorProfile()
  }, [user, navigate])

  const fetchDonorProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setDonorData(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          age: data.age || '',
          blood_type: data.blood_type || '',
          district: data.district || '',
          city: data.city || '',
          last_donation_date: data.last_donation_date || ''
        })
      }
    } catch (error) {
      console.error('Error fetching donor profile:', error)
      alert('Error loading profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match('image.*')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)

    try {
      console.log('Compressing image...')
      const compressedFile = await compressDonorImage(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePreview(e.target.result)
      }
      reader.readAsDataURL(compressedFile)

      setCompressedImageFile(compressedFile)
      console.log('Image compressed successfully')
    } catch (error) {
      console.error('Image compression error:', error)
      alert('Failed to process image. Please try another image.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!donorData) return
    
    setSaving(true)

    try {
      let profilePictureUrl = donorData.profile_picture

      // Upload new profile picture if selected
      if (compressedImageFile) {
        const fileExt = 'jpg'
        const fileName = `${donorData.id}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, compressedImageFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName)

        profilePictureUrl = publicUrl
      }

      // Update donor data
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

      if (profilePictureUrl !== donorData.profile_picture) {
        updateData.profile_picture = profilePictureUrl
      }

      const { error } = await supabase
        .from('donors')
        .update(updateData)
        .eq('id', donorData.id)

      if (error) throw error

      // Refresh data
      await fetchDonorProfile()
      setIsEditing(false)
      setCompressedImageFile(null)
      setProfilePreview(null)
      
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!donorData) return
    
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', donorData.id)

      if (error) throw error

      await signOut()
      alert('Your account has been deleted successfully.')
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error deleting account: ' + error.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Calculate eligibility
  const calculateEligibility = () => {
    if (!donorData?.last_donation_date) return { status: 'eligible', daysLeft: 0 }
    
    const lastDonation = new Date(donorData.last_donation_date)
    const today = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(today.getMonth() - 3)
    
    const isEligible = lastDonation <= threeMonthsAgo
    const timeDiff = today.getTime() - lastDonation.getTime()
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
    const daysLeft = Math.max(0, 90 - daysDiff)
    
    return { 
      status: isEligible ? 'eligible' : 'not-eligible', 
      daysLeft 
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get profile picture URL
  const getProfilePicture = () => {
    if (profilePreview) return profilePreview
    return donorData?.profile_picture
  }

  const eligibility = calculateEligibility()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!donorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Not Found</h3>
          <p className="text-gray-500 mb-4">Unable to load your profile data.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Back Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-red-500 to-red-600 relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-xl">
                  {uploading ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                  ) : getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt={donorData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                
                {/* Edit Photo Button (only in edit mode) */}
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Camera className="w-4 h-4" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 pb-8 px-6 text-center">
            <div className="flex flex-col items-center">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-gray-800 border-2 border-red-200 rounded-lg px-4 py-2 text-center focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">{donorData.name}</h1>
              )}
              
              <div className="flex items-center gap-3 mt-2">
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  {isEditing ? (
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleInputChange}
                      className="bg-transparent border-none focus:ring-0 text-red-600 font-semibold"
                    >
                      <option value="">Select Type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    donorData.blood_type || 'Unknown'
                  )}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-16 border-2 border-gray-200 rounded-lg px-2 py-1 text-center focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                      min="18"
                      max="65"
                      placeholder="Age"
                    />
                  ) : (
                    `${donorData.age} years`
                  )}
                </span>
              </div>

              {/* Eligibility Badge */}
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                eligibility.status === 'eligible'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {eligibility.status === 'eligible' ? (
                  <>
                    <Heart className="w-4 h-4" />
                    Eligible to Donate
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Next donation in {eligibility.daysLeft} days
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">05</div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">03</div>
            <div className="text-sm text-gray-600">Requests</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">06</div>
            <div className="text-sm text-gray-600">Life Saved</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatDate(donorData.last_donation_date)}
            </div>
            <div className="text-sm text-gray-600">Last Donation</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Email Address</div>
                <div className="text-gray-800 font-medium">{donorData.email}</div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Phone Number</div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    placeholder="Phone number"
                  />
                ) : (
                  <div className="text-gray-800 font-medium">{donorData.phone}</div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Location</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                      placeholder="City/Area"
                    />
                  </div>
                ) : (
                  <div className="text-gray-800 font-medium">
                    {donorData.city && donorData.district 
                      ? `${donorData.city}, ${donorData.district}`
                      : donorData.district || donorData.city || 'Not specified'
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Last Donation */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Last Donation Date</div>
                {isEditing ? (
                  <input
                    type="date"
                    name="last_donation_date"
                    value={formData.last_donation_date}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                ) : (
                  <div className="text-gray-800 font-medium">
                    {formatDate(donorData.last_donation_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <Shield className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Account Created</div>
                <div className="text-gray-800 font-medium">
                  {new Date(donorData.created_at).toLocaleDateString('en-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setProfilePreview(null)
                  setCompressedImageFile(null)
                  // Reset form data to original
                  setFormData({
                    name: donorData.name || '',
                    phone: donorData.phone || '',
                    age: donorData.age || '',
                    blood_type: donorData.blood_type || '',
                    district: donorData.district || '',
                    city: donorData.city || '',
                    last_donation_date: donorData.last_donation_date || ''
                  })
                }}
                disabled={saving}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
              <button
                onClick={signOut}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Account</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile