import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';

// Helper function to check admin status from localStorage
const checkAdminStatus = () => {
  try {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminUser = localStorage.getItem('adminUser');
    
    if (isAdmin === 'true' && adminUser) {
      const parsedUser = JSON.parse(adminUser);
      
      // Check if session is less than 24 hours old
      if (parsedUser.loggedInAt) {
        const loginTime = new Date(parsedUser.loggedInAt).getTime();
        const currentTime = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (currentTime - loginTime < twentyFourHours) {
          return parsedUser;
        }
      }
    }
    
    // Clear expired session
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    return null;
  } catch (err) {
    console.warn('Error checking admin status:', err);
    // Clear on error
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    return null;
  }
};

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  adminUser: null,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => ({}),
  adminSignOut: async () => ({}),
  fullSignOut: async () => ({}),
  setAdminUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(() => checkAdminStatus());
  const [loading, setLoading] = useState(true);
  const [initialised, setInitialised] = useState(false);

  // Main auth effect
  useEffect(() => {
    let mounted = true;
    let listener = null;

    (async () => {
      try {
        if (!supabase || !supabase.auth) {
          console.warn('Supabase client not available');
          if (mounted) {
            setUser(null);
            setLoading(false);
            setInitialised(true);
          }
          return;
        }

        const res = await supabase.auth.getSession();
        if (mounted) {
          setUser(res?.data?.session?.user ?? null);
          setLoading(false);
          setInitialised(true);
        }

        // Subscribe to auth changes
        listener = supabase.auth.onAuthStateChange((event, session) => {
          try {
            if (!mounted) return;
            console.log('Auth state changed:', event);
            setUser(session?.user ?? null);
          } catch (err) {
            console.warn('Error handling auth state change', err);
          }
        });
      } catch (err) {
        console.warn('Error initializing auth:', err);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setInitialised(true);
        }
      }
    })();

    return () => {
      mounted = false;
      try {
        if (listener && listener.data && typeof listener.data.subscription?.unsubscribe === 'function') {
          listener.data.subscription.unsubscribe();
        }
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Sign up function
  const signUp = useCallback(async (email, password, metadata = {}) => {
    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Auth client not available');
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (result?.error) {
        return { error: result.error, data: result.data ?? null };
      }

      return { data: result?.data ?? null, error: null };
    } catch (err) {
      return { error: err, data: null };
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Auth client not available');
      }
      
      const result = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (result?.error) {
        return { error: result.error, data: null };
      }
      
      return { data: result?.data ?? null, error: null };
    } catch (err) {
      return { error: err, data: null };
    }
  }, []);

  // Regular user sign out
  const signOut = useCallback(async () => {
    try {
      if (!supabase || !supabase.auth) {
        throw new Error('Auth client not available');
      }
      
      const result = await supabase.auth.signOut();
      if (result?.error) {
        return { error: result.error };
      }
      
      setUser(null);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, []);

  // Admin sign out - clears admin session ONLY
  const adminSignOut = useCallback(async () => {
    console.log('Admin sign out called');
    
    try {
      // Clear all admin-related localStorage items
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      
      // Update state
      setAdminUser(null);
      
      console.log('Admin session cleared');
      return { error: null };
    } catch (err) {
      console.error('Admin sign out error:', err);
      return { error: err };
    }
  }, []);

  // Combined sign out - clears both admin and regular user sessions
  const fullSignOut = useCallback(async () => {
    console.log('Full sign out called');
    
    try {
      // Clear admin session from localStorage
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      
      // Update admin user state
      setAdminUser(null);
      
      // Clear regular user session if exists
      if (user) {
        await supabase.auth.signOut();
        setUser(null);
      }
      
      // Force a page reload to reset all states
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error: null };
    } catch (err) {
      console.error('Full sign out error:', err);
      return { error: err };
    }
  }, [user]);

  // Set admin user (called from AdminLoginModal after successful login)
  const setAdminUserContext = useCallback((adminData) => {
    console.log('Setting admin user context:', adminData);
    
    try {
      const adminSession = {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name || adminData.email.split('@')[0],
        role: 'admin',
        loggedInAt: new Date().toISOString()
      };
      
      // Generate a simple session token
      const token = Math.random().toString(36).substring(2) + 
                   Date.now().toString(36);
      
      localStorage.setItem('adminUser', JSON.stringify(adminSession));
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminToken', token);
      
      setAdminUser(adminSession);
      
      console.log('Admin session set successfully');
      return { success: true, adminSession };
    } catch (err) {
      console.error('Error setting admin user:', err);
      throw err;
    }
  }, []);

  // Derive isAdmin from both sources
  const isAdmin = useMemo(() => {
    try {
      // Check localStorage admin first
      if (adminUser) {
        return true;
      }
      
      // Check Supabase user metadata
      if (!user) return false;
      
      const role = user?.app_metadata?.role ?? 
                   user?.user_metadata?.role ?? 
                   user?.user_metadata?.is_admin;
      
      if (role === true || role === 'true') return true;
      if (typeof role === 'string' && role.toLowerCase() === 'admin') return true;
      
      return false;
    } catch (err) {
      return false;
    }
  }, [user, adminUser]);

  // Combined user object (prefers admin user if exists)
  const currentUser = useMemo(() => {
    return adminUser || user;
  }, [user, adminUser]);

  // Show loading state
  if (!initialised) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user: currentUser,
        loading, 
        isAdmin, 
        adminUser,
        signUp, 
        signIn, 
        signOut,
        adminSignOut,
        fullSignOut,
        setAdminUser: setAdminUserContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};