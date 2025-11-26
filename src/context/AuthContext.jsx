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
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await checkAdminStatus(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.log('Admin check error:', error)
        setIsAdmin(false)
        return false
      }
      
      setIsAdmin(!!data)
      return !!data
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
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: donorError } = await supabase
          .from('donors')
          .insert([{
            id: authData.user.id,
            email: authData.user.email,
            ...userData
          }])

        if (donorError) throw donorError

        // Auto sign in after registration
        await signIn(email, password)
      }

      return authData
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    // Check admin status after sign in
    if (data.user) {
      await checkAdminStatus(data.user.id)
    }
    
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setIsAdmin(false)
  }

  const adminLogin = async (email, password) => {
    // First sign in normally
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Then check if user is admin
    if (data.user) {
      const isUserAdmin = await checkAdminStatus(data.user.id)
      if (!isUserAdmin) {
        await supabase.auth.signOut()
        throw new Error('You are not authorized as admin. Please contact system administrator.')
      }
    }

    return data
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
      {!loading && children}
    </AuthContext.Provider>
  )
}