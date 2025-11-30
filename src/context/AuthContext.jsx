import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setIsAdmin(false);
        } else {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // In a real app, you would fetch the user's role from your database
            // and set the isAdmin state based on that.
            // For now, we'll just assume the user is not an admin.
            setIsAdmin(false);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // In a real app, you would fetch the user's role from your database
          // and set the isAdmin state based on that.
          // For now, we'll just assume the user is not an admin.
          setIsAdmin(false);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      console.log('Starting registration for:', email);
      
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

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

        if (donorError) {
          console.error('Donor creation error:', donorError);
          // IMPORTANT: The following line is removed because it will fail in the browser
          // and leaves an orphaned auth user. This should be handled in a serverless function.
          // await supabase.auth.admin.deleteUser(authData.user.id)
          throw donorError;
        }

        console.log('Donor profile created successfully');
        
        // Auto sign in after successful registration
        const signInResult = await signIn(email, password);
        return { ...authData, signInResult };
      }

      return authData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Signing in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful');
      
      return data;
    } catch (error) {
      console.error('Sign in process error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Local state clear
      setUser(null);
      setIsAdmin(false);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const adminLogin = async (email, password) => {
    try {
      console.log('Admin login attempt for:', email);

      // First try normal login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login auth error:', error);
        throw error;
      }

      // In a real app, you would fetch the user's role from your database
      // and set the isAdmin state based on that.
      // For now, we'll just assume the user is not an admin.
      setIsAdmin(false);

      console.log('Admin login successful');
      return data;
    } catch (error) {
      console.error('Admin login process error:', error);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      console.log('Sending password reset email to:', email);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

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