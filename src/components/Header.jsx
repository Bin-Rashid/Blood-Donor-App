import React, { useState, useEffect } from 'react'
import { Heart, Droplet, User, LogIn, UserPlus, Shield, LogOut, Edit, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import AdminLoginModal from './AdminLoginModal'

const Header = ({ heroText, onEditHero, donorsCount = 0 }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  
  const { user, isAdmin, adminUser, signOut, fullSignOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Active tab detection based on URL
  const activeTab = location.pathname === '/donors' ? 'donors' : 'register'

  const handleSignOut = async () => {
    try {
      if (isAdmin && adminUser) {
        await fullSignOut();
      } else if (user) {
        await signOut();
        navigate('/');
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  }

  const handleEditProfile = () => {
    setShowDropdown(false);
    if (user && !isAdmin) {
      navigate('/profile'); // Navigate to profile page for donors
    } else if (isAdmin) {
      alert('Admin profile editing coming soon...');
    }
  }

  const handleGoToAdminPanel = () => {
    setShowDropdown(false);
    navigate('/admin');
  }

  // Get display name
  const getDisplayName = () => {
    if (isAdmin && adminUser) {
      return adminUser.name || adminUser.email?.split('@')[0] || 'Admin';
    }
    if (user) {
      return user.email?.split('@')[0] || 'User';
    }
    return 'Account';
  }

  // Get user role text
  const getUserRole = () => {
    if (isAdmin && adminUser) {
      return 'Administrator';
    }
    if (user) {
      return 'Blood Donor';
    }
    return '';
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
          <div className="flex items-center gap-3">
            <Droplet className="w-8 h-8" fill="white" />
            <h1 className="text-2xl font-bold">LifeShare</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Show Admin Login button when NOT logged in as admin */}
            {!isAdmin && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Admin Login</span>
              </button>
            )}

            {/* Show Admin Panel link when logged in as admin */}
            {isAdmin && adminUser && (
              <button
                onClick={handleGoToAdminPanel}
                className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
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
                  {getDisplayName()}
                </span>
                {isAdmin && adminUser && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  {!user && !isAdmin ? (
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
                        <div className="font-medium text-gray-800">
                          {isAdmin ? (adminUser?.email || 'Administrator') : user?.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getUserRole()}
                          {isAdmin && (
                            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleEditProfile}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                        {isAdmin ? 'Admin Settings' : 'Edit Profile'}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            onEditHero?.()
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-gray-700 border-t border-gray-100"
                        >
                          <Shield className="w-4 h-4" />
                          System Settings
                        </button>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-red-600 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        {isAdmin ? 'Logout Admin' : 'Logout'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="px-6 pb-8 text-center relative">
          <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed bangla">
            {heroText}
          </p>
          {isAdmin && adminUser && (
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
          <Link
            to="/register"
            className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Register as Donor
          </Link>

          <Link
            to="/donors"
            className={`flex-1 py-4 text-center font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'donors'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            <Users className="w-5 h-5" />
            Find Donors
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {donorsCount || 1}
            </span>
          </Link>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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