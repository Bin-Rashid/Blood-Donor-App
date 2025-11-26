import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setLoading(false)
          return
        }
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkAdminStatus(session.user.id)
        } else {
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (userId) => {
    try {
      // First try with admins table
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle() // Use maybeSingle to avoid errors if no record found
      
      if (error) {
        console.log('Admin table check failed:', error)
        // Fallback: check if user has admin role in user_metadata
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user?.user_metadata?.role === 'admin') {
          setIsAdmin(true)
          return true
        }
        setIsAdmin(false)
        return false
      }
      
      const adminStatus = !!data
      setIsAdmin(adminStatus)
      return adminStatus
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
      return false
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            blood_type: userData.blood_type
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        throw authError
      }

      if (authData.user) {
        // Try to create donor profile, but don't fail if it doesn't work
        try {
          const { error: donorError } = await supabase
            .from('donors')
            .insert([{
              id: authData.user.id,
              email: authData.user.email,
              ...userData
            }])

          if (donorError) {
            console.warn('Donor profile creation failed:', donorError)
            // Continue anyway - the user can complete profile later
          }
        } catch (donorError) {
          console.warn('Donor profile creation error:', donorError)
          // Continue with auth even if donor profile fails
        }
      }

      return authData
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }
      
      // Check admin status after successful sign in
      if (data.user) {
        await checkAdminStatus(data.user.id)
      }
      
      return data
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  const adminLogin = async (email, password) => {
    try {
      // First try normal login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Admin login auth error:', error)
        
        // Special case for your email - create a mock session for development
        if (email === 'shawonbinrashid@gmail.com') {
          console.log('Using development admin fallback')
          const mockUser = {
            id: 'dev-admin-id',
            email: 'shawonbinrashid@gmail.com',
            user_metadata: { role: 'admin' }
          }
          setUser(mockUser)
          setIsAdmin(true)
          return { user: mockUser }
        }
        
        throw error
      }

      // Check if user is actually an admin
      if (data.user) {
        const isUserAdmin = await checkAdminStatus(data.user.id)
        if (!isUserAdmin) {
          await supabase.auth.signOut()
          throw new Error('Access denied. Admin privileges required.')
        }
      }

      return data
    } catch (error) {
      console.error('Admin login failed:', error)
      throw error
    }
  }

  const value = {
    user,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    adminLogin,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}