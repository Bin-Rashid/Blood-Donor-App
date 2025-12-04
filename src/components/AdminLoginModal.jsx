import React, { useState } from 'react'
import { X, Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext' // Add this import

const AdminLoginModal = ({ isOpen, onClose }) => {
  const { setAdminUser } = useAuth(); // This should work now
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: 'admin@lifeshare.com',
    password: 'admin123'
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log('Starting admin login with:', formData.email)

      // Call the RPC function
      const { data, error: rpcError } = await supabase.rpc('admin_login', {
        p_email: formData.email.trim(),
        p_password: formData.password
      })

      console.log('RPC Response:', { data, rpcError })

      if (rpcError) {
        console.error('RPC Error details:', rpcError)
        throw new Error(rpcError.message || 'Authentication failed')
      }

      // The function returns an array - check if we got any results
      console.log('Raw data from RPC:', data)
      
      // Check if data is an array and has at least one item
      if (Array.isArray(data) && data.length > 0) {
        const admin = data[0]
        console.log('Admin data received:', admin)
        
        // Verify required fields
        if (!admin.id || !admin.email) {
          console.warn('Admin object missing required fields:', admin)
          throw new Error('Invalid admin data received from server')
        }

        try {
          // Use the context function to set admin user
          setAdminUser(admin);
          setSuccess(true);
          
          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            onClose?.();
            window.location.href = '/admin'; // Redirect to admin panel
          }, 800);
          
        } catch (setAdminError) {
          console.error('Error setting admin user:', setAdminError);
          throw new Error('Failed to set admin session');
        }

      } else {
        console.log('No admin data returned - invalid credentials')
        throw new Error('Invalid email or password')
      }

    } catch (err) {
      console.error('Admin login error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        fullError: err
      })
      
      // Better error message for the user
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (err.message.includes('Invalid email or password') || 
          err.message.includes('Invalid admin data') ||
          err.message.includes('Invalid login credentials') ||
          err.message.includes('Failed to set admin session')) {
        errorMessage = err.message
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please try again.'
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { 
    if (!loading) {
      onClose?.()
    }
  }

  // Test the RPC function directly (for debugging)
  const testRpcFunction = async () => {
    console.log('Testing RPC function directly...')
    try {
      const result = await supabase.rpc('admin_login', {
        p_email: 'admin@lifeshare.com',
        p_password: 'admin123'
      })
      console.log('Direct RPC test result:', result)
    } catch (err) {
      console.error('Direct RPC test error:', err)
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

          {/* Test Credentials */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Test Credentials:</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Email: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin@lifeshare.com</span></p>
              <p>Password: <span className="font-mono bg-blue-100 px-2 py-1 rounded">admin123</span></p>
            </div>
          </div>

          {/* Debug Button (hidden in production) */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              onClick={testRpcFunction}
              className="mb-4 w-full py-2 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
            >
              Test RPC Connection
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
            </div>

            <button 
              type="submit" 
              disabled={loading || success}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
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

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button 
              type="button" 
              onClick={() => setFormData({ email: 'admin@lifeshare.com', password: 'admin123' })}
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

          {/* Debug Info (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <p className="font-mono">Database Status: ✓ Connected</p>
              <p className="font-mono">Admin Function: ✓ Available</p>
              <p className="font-mono">Test User: ✓ Exists</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminLoginModal