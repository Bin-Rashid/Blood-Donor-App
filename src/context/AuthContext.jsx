import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin status from localStorage and database
  const checkAdminStatus = async (email) => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('Not an admin or admin not found');
        setIsAdmin(false);
        localStorage.removeItem('admin_session');
        return false;
      }

      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      localStorage.removeItem('admin_session');
      return false;
    }
  };

  // Load admin session from localStorage
  const loadAdminSession = async () => {
    try {
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession) {
        return false;
      }

      const sessionData = JSON.parse(adminSession);
      const { email, adminId, loginTime } = sessionData;

      // Check if session is expired (24 hours)
      const sessionAge = Date.now() - new Date(loginTime).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        localStorage.removeItem('admin_session');
        return false;
      }

      // Verify admin still exists and is active
      const { data: adminData, error } = await supabase
        .from('admin')
        .select('*')
        .eq('id', adminId)
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !adminData) {
        localStorage.removeItem('admin_session');
        return false;
      }

      // Set admin user
      const adminUser = {
        id: adminId,
        email: email,
        user_metadata: {
          name: adminData.full_name || 'Administrator',
          role: adminData.role || 'admin'
        },
        isAdmin: true
      };

      setUser(adminUser);
      setIsAdmin(true);
      
      return true;
    } catch (error) {
      console.error('Error loading admin session:', error);
      localStorage.removeItem('admin_session');
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First try to load admin session
        const adminLoaded = await loadAdminSession();
        
        if (!adminLoaded) {
          // If no admin session, check regular Supabase auth
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            setUser(null);
            setIsAdmin(false);
          } else {
            setUser(session?.user ?? null);
            
            // Check if this user is also an admin
            if (session?.user?.email) {
              await checkAdminStatus(session.user.email);
            } else {
              setIsAdmin(false);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes (only for regular users)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        // If we already have an admin session, don't override it
        const adminSession = localStorage.getItem('admin_session');
        if (adminSession) {
          console.log('Admin session exists, skipping auth change');
          return;
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ✅ UPDATED: Admin login function
  const adminLogin = async (email, password) => {
    try {
      console.log('🔐 Admin login attempt for:', email);

      // 1. Verify admin credentials
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_admin_password', {
          p_email: email,
          p_password: password
        });

      if (verifyError) {
        throw new Error('Database error: ' + verifyError.message);
      }

      if (!verifyData || verifyData.length === 0 || !verifyData[0].is_valid) {
        throw new Error('Invalid admin credentials');
      }

      const adminId = verifyData[0].admin_id;

      // 2. Get admin details
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .eq('id', adminId)
        .single();

      if (adminError || !adminData) {
        throw new Error('Admin not found');
      }

      // 3. Update last login
      await supabase
        .from('admin')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId);

      // 4. Create admin session in localStorage
      const adminSession = {
        adminId,
        email,
        name: adminData.full_name,
        role: adminData.role,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('admin_session', JSON.stringify(adminSession));

      // 5. Set state WITHOUT reloading page
      const adminUser = {
        id: adminId,
        email: email,
        user_metadata: {
          name: adminData.full_name || 'Administrator',
          role: adminData.role || 'admin'
        },
        isAdmin: true
      };
      
      setUser(adminUser);
      setIsAdmin(true);

      console.log('✅ Admin login successful');
      return { 
        success: true, 
        admin: adminData,
        user: adminUser
      };

    } catch (error) {
      console.error('❌ Admin login error:', error);
      localStorage.removeItem('admin_session');
      setIsAdmin(false);
      throw error;
    }
  };

  // Regular user signup
  const signUp = async (email, password, userData) => {
    try {
      console.log('Starting registration for:', email);
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('User created, creating donor profile...');
        
        const donorData = {
          id: authData.user.id,
          email: authData.user.email,
          ...userData,
        };

        const { error: donorError } = await supabase
          .from('donors')
          .insert([donorData]);

        if (donorError) throw donorError;

        console.log('Donor profile created successfully');
        
        // Check if this user is also an admin
        await checkAdminStatus(email);
        
        return authData;
      }

      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Regular user login
  const signIn = async (email, password) => {
    try {
      console.log('Signing in:', email);
      
      // Clear any existing admin session
      localStorage.removeItem('admin_session');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful');
      
      // Check if this user is an admin
      await checkAdminStatus(email);
      
      return data;
    } catch (error) {
      console.error('Sign in process error:', error);
      throw error;
    }
  };

  // Sign out (both admin and regular user)
  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // Clear admin session
      localStorage.removeItem('admin_session');
      
      // Clear Supabase session if it exists
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Supabase signout error:', error);
      }
      
      // Clear local state
      setUser(null);
      setIsAdmin(false);
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      console.log('Sending password reset email to:', email);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      console.log('Password reset email sent successfully');
      return data;
    } catch (error) {
      console.error('Password reset process error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    adminLogin,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};