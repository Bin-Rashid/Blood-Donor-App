import React, { useState } from 'react'
import { X, Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const AdminLoginModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: 'admin@lifeshare.com',
    password: 'admin123'
  })
  
  const { adminLogin, isAdmin } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  setSuccess(false)
  
  try {
    const result = await adminLogin(formData.email, formData.password)
    console.log('✅ Admin login successful:', result)
    
    setSuccess(true)
      
     // Success message WITHOUT reload
    setTimeout(() => {
      alert('✅ Admin login successful! You now have admin privileges.')
      onClose()
      // NO window.location.reload() - state already updated
    }, 1000)
    
  } catch (error) {
    console.error('❌ Admin login error:', error)
    setError(error.message || 'Login failed. Please check your credentials.')
  } finally {
    setLoading(false)
  }
}
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Admin Login</h3>
              <p className="text-sm text-gray-500">System Administrator Access</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-all ${loading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Login Successful!</p>
                  <p className="text-green-600 text-sm">Redirecting to admin panel...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Login Failed</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Test Credentials Hint */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Test Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Email: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin@lifeshare.com</span></p>
              <p>Password: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin123</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="admin@lifeshare.com"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="Enter admin password"
                  required
                  disabled={loading || success}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Admin passwords are separate from regular user accounts
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                loading || success 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Login Successful!
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Login as Admin
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Security Notice</p>
                <p className="text-xs text-gray-600">
                  This login is for authorized administrators only. All login attempts are logged.
                  {isAdmin && (
                    <span className="text-green-600 font-medium block mt-1">
                      ✓ You are currently logged in as admin
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Fill Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({
                email: 'admin@lifeshare.com',
                password: 'admin123'
              })}
              className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors"
              disabled={loading || success}
            >
              Fill Test Credentials
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: '', password: '' })}
              className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors"
              disabled={loading || success}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginModal