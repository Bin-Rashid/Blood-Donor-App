import React, { useState, useEffect } from 'react'
import { User, Phone, Cake, Droplets, MapPin, Home, Calendar, Edit, Trash2, ArrowLeft, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { calculateEligibility, formatPhoneNumber } from '../utils/helpers'
import EditModal from '../components/EditModal'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDonorProfile()
    }
  }, [user])

  const fetchDonorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setDonor(data)
    } catch (error) {
      console.error('Error fetching donor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত আপনার প্রোফাইল ডিলিট করতে চান? এই কাজটি অপরিবর্তনীয়।')) {
      return
    }

    try {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      alert('আপনার প্রোফাইল সফলভাবে ডিলিট করা হয়েছে!')
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('প্রোফাইল ডিলিট করতে সমস্যা হয়েছে: ' + error.message)
    }
  }

  const handleUpdateProfile = () => {
    fetchDonorProfile() // Refresh data after update
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!donor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">প্রোফাইল পাওয়া যায়নি</h2>
          <p className="text-gray-500 mb-4">আপনার প্রোফাইল ডাটা লোড করতে সমস্যা হচ্ছে</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  const eligibility = calculateEligibility(donor.last_donation_date)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>হোম পেজে ফিরে যান</span>
          </button>
          
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-800">আমার প্রোফাইল</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="card p-8">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold border-4 border-red-100">
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
            
            <div className="inline-block bg-red-600 text-white px-4 py-2 rounded-full text-lg font-bold mb-3">
              {donor.blood_type || 'অজানা'}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-2 bangla">{donor.name}</h2>
            <p className="text-gray-600 text-lg">{donor.age} বছর</p>
          </div>

          {/* Eligibility Status */}
          <div className={`text-center text-lg font-semibold p-4 rounded-lg mb-8 ${
            eligibility.eligible ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-red-50 text-red-700 border-2 border-red-200'
          } bangla`}>
            {eligibility.message}
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">ফোন নম্বর</p>
                  <p className="font-semibold bangla">{formatPhoneNumber(donor.phone)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Droplets className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">ব্লাড গ্রুপ</p>
                  <p className="font-semibold">{donor.blood_type || 'অজানা'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Cake className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">বয়স</p>
                  <p className="font-semibold bangla">{donor.age} বছর</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">জেলা</p>
                  <p className="font-semibold bangla">{donor.district}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">শহর/এলাকা</p>
                  <p className="font-semibold bangla">{donor.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">সর্বশেষ ডোনেশন</p>
                  <p className="font-semibold bangla">
                    {new Date(donor.last_donation_date).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex-1 btn-primary py-4 text-lg"
            >
              <Edit className="w-5 h-5" />
              প্রোফাইল এডিট করুন
            </button>
            
            <button
              onClick={handleDeleteProfile}
              className="flex-1 bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              প্রোফাইল ডিলিট করুন
            </button>
          </div>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 bangla text-center">
              ⚠️ রক্তদানের পর অবশ্যই "সর্বশেষ ডোনেশন তারিখ" আপডেট করুন। এটি অন্য ডোনারদের সঠিক তথ্য পেতে সাহায্য করবে।
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        donor={donor}
        onUpdate={handleUpdateProfile}
      />
    </div>
  )
}

export default Profile