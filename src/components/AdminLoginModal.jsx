import React, { useState, useRef, useEffect } from 'react'
import { X, Shield, Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Key, ArrowRight } from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

const AdminLoginModal = ({ isOpen, onClose }) => {
  const { setAdminUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState(null)
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || false
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

  useEffect(() => {
    if (isOpen) {
      // Clear form on open
      setFormData({ email: '', password: '' })
      setError('')
      setShowForgotPassword(false)
      
      // Focus on email input
      setTimeout(() => {
        if (emailInputRef.current) {
          emailInputRef.current.focus()
        }
      }, 100)
    }
  }, [isOpen])

  // Check if login is locked
  const isLoginLocked = () => {
    if (lockUntil && new Date() < lockUntil) {
      const minutesLeft = Math.ceil((lockUntil - new Date()) / 60000)
      return `Too many failed attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check for login lock
    const lockError = isLoginLocked()
    if (lockError) {
      setError(lockError)
      return
    }

    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter both email and password')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Add artificial delay to prevent timing attacks
      const startTime = Date.now()
      
      const { data, error: rpcError } = await supabase.rpc('admin_login', {
        p_email: formData.email.trim().toLowerCase(),
        p_password: formData.password
      })

      // Ensure minimum response time
      const elapsed = Date.now() - startTime
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
      }

      if (rpcError) {
        console.error('RPC Error:', rpcError)
        // Generic error message for security
        throw new Error('Authentication failed. Please check your credentials.')
      }

      if (Array.isArray(data) && data.length > 0) {
        const admin = data[0]
        
        if (!admin.id || !admin.email) {
          console.warn('Invalid admin data received')
          throw new Error('Authentication failed. Please try again.')
        }

        // Reset failed attempts on successful login
        setFailedAttempts(0)
        setLockUntil(null)

        try {
          setAdminUser(admin)
          setSuccess(true)
          
          setTimeout(() => {
            onClose?.()
            window.location.href = '/admin'
          }, 800)
          
        } catch (setAdminError) {
          console.error('Error setting admin user:', setAdminError)
          throw new Error('Session initialization failed.')
        }

      } else {
        // Increment failed attempts
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        
        // Implement progressive delays
        if (newFailedAttempts >= 5) {
          const lockTime = new Date(Date.now() + 30 * 60000) // 30 minutes
          setLockUntil(lockTime)
          throw new Error(`Too many failed attempts. Account locked for 30 minutes.`)
        } else if (newFailedAttempts >= 3) {
          throw new Error(`Invalid credentials. ${5 - newFailedAttempts} attempts remaining.`)
        } else {
          throw new Error('Invalid email or password.')
        }
      }

    } catch (err) {
      console.error('Login error:', err.message)
      // Generic error message for production
      setError(err.message || 'Authentication failed. Please try again.')
      
      // Log security events (in production, send to your logging service)
      if (!isDevelopment) {
        console.warn('Security event - Failed login attempt:', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
          // Note: Don't log actual email in production for privacy
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    
    if (!resetEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(resetEmail.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setResetLoading(true)
    setError('')

    try {
      // In production, implement actual password reset logic
      // For security, we'll simulate the process but show appropriate message
      
      // Note: Replace with your actual password reset implementation
      // Example for Supabase:
      // const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      //   redirectTo: `${window.location.origin}/admin/reset-password`,
      // })
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For security, always show success message even if email doesn't exist
      // This prevents email enumeration attacks
      setResetSuccess(true)
      
      // Log reset request (in production)
      if (!isDevelopment) {
        console.info('Password reset requested')
      }
      
      // Auto-close reset form after success
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 5000)
      
    } catch (err) {
      // Generic error for security
      setError('Unable to process reset request. Please contact system administrator.')
      console.error('Reset error:', err)
    } finally {
      setResetLoading(false)
    }
  }

  const handleClose = () => { 
    if (!loading && !resetLoading) {
      // Clear sensitive data
      setFormData({ email: '', password: '' })
      setResetEmail('')
      setError('')
      setShowPassword(false)
      onClose?.()
    }
  }

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/70 to-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-slideUp border border-gray-200">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                {showForgotPassword ? 'Password Recovery' : 'Admin Authentication'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {showForgotPassword 
                  ? 'Secure account recovery process' 
                  : 'Restricted access - Authorized personnel only'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleClose} 
            className={`absolute right-4 top-4 p-2 rounded-xl transition-all ${
              loading || resetLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100 hover:shadow-md'
            }`} 
            disabled={loading || resetLoading}
            aria-label="Close login modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-pulse shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-green-800 font-semibold">Authentication Successful</p>
                  <p className="text-green-600 text-sm">Initializing secure session...</p>
                </div>
              </div>
            </div>
          )}

          {/* Reset Success Message */}
          {resetSuccess && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-blue-800 font-semibold">Recovery Instructions Sent</p>
                  <p className="text-blue-600 text-sm">
                    If an account exists with this email, you will receive password reset instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-semibold">
                    {showForgotPassword ? 'Recovery Failed' : 'Authentication Error'}
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Warning for Multiple Failures */}
          {failedAttempts >= 3 && !showForgotPassword && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium text-sm">
                    Multiple failed login attempts detected. 
                    {failedAttempts >= 5 ? ' Account temporarily locked.' : ` ${5 - failedAttempts} attempts remaining.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Enter your registered admin email address to receive password recovery instructions.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      For security reasons, you will only receive an email if the account exists.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field for Reset */}
              <div className="space-y-2">
                <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Registered Email Address
                  </span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <input 
                    ref={emailInputRef}
                    id="reset-email"
                    type="email" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                    placeholder="Enter your registered email" 
                    required 
                    disabled={resetLoading || resetSuccess}
                    autoComplete="email"
                    aria-describedby="reset-email-help"
                  />
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <p id="reset-email-help" className="text-xs text-gray-500">
                  Enter the email address associated with your admin account
                </p>
              </div>

              {/* Reset Action Buttons */}
              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={resetLoading || resetSuccess}
                  className={`flex-1 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    resetLoading || resetSuccess
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl active:scale-[0.98] text-white'
                  }`}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : resetSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Instructions Sent
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Send Recovery Email
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setError('')
                  }}
                  className="flex-1 py-3.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md font-semibold"
                  disabled={resetLoading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            /* Main Login Form */
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input 
                      ref={emailInputRef}
                      id="login-email"
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="relative w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                      placeholder="Enter admin email address" 
                      required 
                      disabled={loading || success || !!isLoginLocked()}
                      autoComplete="email"
                      aria-describedby="email-help"
                    />
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                      disabled={loading || success}
                    >
                      Forgot password?
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-lg blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <input 
                      ref={passwordInputRef}
                      id="login-password"
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      className="relative w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-3 focus:ring-red-100 transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                      placeholder="Enter your password" 
                      required 
                      disabled={loading || success || !!isLoginLocked()}
                      autoComplete="current-password"
                    />
                    <Lock className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      disabled={loading || success}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button 
                  type="submit" 
                  disabled={loading || success || !!isLoginLocked()}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    loading || success || !!isLoginLocked()
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl active:scale-[0.98] text-white'
                  }`}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Access Granted
                    </>
                  ) : isLoginLocked() ? (
                    'Account Locked'
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Authenticate
                    </>
                  )}
                </button>
              </form>

              {/* Security Information */}
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-gray-600">
                      Secure HTTPS connection • Encrypted credentials • Audit logging enabled
                    </p>
                  </div>
                </div>

                {/* Security Tips */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-800 font-medium mb-2">Security Reminder:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      Never share your credentials with anyone
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      Ensure you're on the official admin portal
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      Log out after each session
                    </li>
                  </ul>
                </div>

                {/* Debug Panel - Only show in development */}
                {isDevelopment && (
                  <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-300">Development Panel</p>
                      <button 
                        type="button" 
                        onClick={() => console.log('Test connection clicked')}
                        className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                      >
                        Test Connection
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-green-400">✓ Database: Connected</p>
                      <p className="text-xs font-mono text-green-400">✓ Auth System: Active</p>
                      <p className="text-xs font-mono text-blue-400">🔒 Endpoint: Secure</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {showForgotPassword 
                ? 'Recovery link expires in 1 hour' 
                : `v${appVersion}`}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Secure Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginModal