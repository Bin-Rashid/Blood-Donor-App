import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, User, LogIn, UserPlus, Shield, LogOut, Edit, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import AdminLoginModal from './AdminLoginModal'

const Header = ({ activeTab, setActiveTab, heroText, onEditHero, donorsCount = 0, user }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const { isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
      setActiveTab('register')
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleEditProfile = () => {
    setShowDropdown(false)
    setActiveTab('profile')
    navigate('/profile')
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    
    // If user is not logged in and tries to access profile, show auth modal
    if (tab === 'profile' && !user) {
      setShowAuthModal(true)
      return
    }
    
    // Navigate to corresponding routes
    if (tab === 'register') {
      navigate('/')
    } else if (tab === 'donors') {
      navigate('/donors')
    } else if (tab === 'profile') {
      navigate('/profile')
    }
  }

  const handleHomeClick = () => {
    setActiveTab('register')
    navigate('/')
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setActiveTab('profile')
    navigate('/profile')
  }

  return (
    <div className="primary-gradient text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'><circle cx='50' cy='50' r='1' fill='white'/></pattern></defs><rect width='100' height='100' fill='url(%23grain)'/></svg>")`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Top Bar */}
        <div className="px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleHomeClick}
          >
            <Heart className="w-8 h-8" fill="white" />
            <h1 className="text-2xl font-bold">LifeShare</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Login Button - Show only when no user is logged in */}
            {!user && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Admin Login</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">
                  {user ? user.email.split('@')[0] : 'Account'}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  {!user ? (
                    <>
                      <button 
                        onClick={() => {
                          setShowAuthModal(true)
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                      >
                        <LogIn className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Sign In</div>
                          <div className="text-sm text-gray-500">Access your account</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          setShowAuthModal(true)
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700 border-t border-gray-100"
                      >
                        <UserPlus className="w-4 h-4" />
                        <div>
                          <div className="font-medium">Register</div>
                          <div className="text-sm text-gray-500">Join as blood donor</div>
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-medium text-gray-800">{user.email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {isAdmin ? 'Administrator' : 'Blood Donor'}
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleEditProfile}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                        My Profile
                      </button>

                      {isAdmin && (
                        <button 
                          onClick={() => {
                            onEditHero()
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700 border-t border-gray-100"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Settings
                        </button>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-red-600 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 pb-8 text-center relative">
          <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            {heroText}
          </p>
          {isAdmin && (
            <button
              onClick={onEditHero}
              className="absolute right-6 top-0 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm transition-all"
            >
              <Edit className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-white">
          {!user ? (
            <>
              <button
                onClick={() => handleTabClick('register')}
                className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'register'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Register as Donor
              </button>
              <button
                onClick={() => handleTabClick('donors')}
                className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'donors'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <Users className="w-5 h-5" />
                Find Donors
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {donorsCount}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabClick('profile')}
                className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'profile'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <User className="w-5 h-5" />
                My Profile
              </button>
              <button
                onClick={() => handleTabClick('donors')}
                className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'donors'
                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                <Users className="w-5 h-5" />
                Find Donors
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {donorsCount}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  )
}

export default Header