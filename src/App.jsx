// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DonorProvider } from './context/DonorContext';
import { useAuth } from './context/AuthContext';
import { useDonors } from './context/DonorContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Donors from './pages/Donors';
import ResetPassword from './pages/ResetPassword';
import AdminLoginModal from './components/AdminLoginModal';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import GuidelinesPopup from './components/GuidelinesPopup';

import { supabase } from './services/supabase';
import './index.css';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin, adminUser } = useAuth();
  
  if (!isAdmin || !adminUser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading LifeShare...</p>
    </div>
  </div>
);

// Frontend Layout Component (for regular pages)
function FrontendLayout() {
  const [activeTab, setActiveTab] = useState('register');
  const [heroSettings, setHeroSettings] = useState({
    text: 'Connecting blood donors with those in need. Your single donation can save up to three lives.',
    whatsapp_number: '+880XXXXXXXXX',
    instructions_text: 'জীবন বাঁচাতে রক্তদান করুন',
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showGuidelinesPopup, setShowGuidelinesPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user, isAdmin, adminUser, signOut, fullSignOut } = useAuth();
  const { donors, loading: donorsLoading } = useDonors();

  useEffect(() => {
  const initializeApp = async () => {
    try {
      await fetchHeroSettings();
      
      // Guidelines popup check
      const hasSeenGuidelines = localStorage.getItem('hasSeenGuidelines');
      if (!hasSeenGuidelines) {
        setTimeout(() => {
          setShowGuidelinesPopup(true);
        }, 1000);
      }
      
      // Listen for storage events (for cross-tab communication)
      const handleStorageChange = (event) => {
        if (event.key === 'lastRegisteredDonor') {
          console.log('🔄 Storage event: New donor registered in another tab');
          // Trigger a refresh if on donors page
          if (window.location.pathname.includes('/donors')) {
            window.dispatchEvent(new Event('refreshDonors'));
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Cleanup
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  initializeApp();
}, []);

  const fetchHeroSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('hero_settings').select('*');

      if (error) {
        console.error('Error fetching hero settings:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const settings = data[0];
        setHeroSettings({
          text: settings.text || 'Connecting blood donors with those in need. Your single donation can save up to three lives.',
          whatsapp_number: settings.whatsapp_number || '+880XXXXXXXXX',
          instructions_text: settings.instructions_text || 'জীবন বাঁচাতে রক্তদান করুন',
        });
      }
    } catch (error) {
      console.error('Error in fetchHeroSettings:', error);
    }
  }, []);

  const handleEditHero = () => {
    // Show admin login modal if not admin
    if (!isAdmin) {
      setShowAdminLoginModal(true);
    } else {
      alert('You are already logged in as admin. Navigate to admin panel for settings.');
    }
  };

  const handleCloseGuidelinesPopup = () => {
    localStorage.setItem('hasSeenGuidelines', 'true');
    setShowGuidelinesPopup(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (isAdmin && adminUser) {
        // If admin is logged in, do full logout
        await fullSignOut?.();
      } else if (user) {
        // If regular user is logged in
        await signOut?.();
        window.location.href = '/'; // Redirect to home
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error during logout. Please try again.');
    }
  };

  if (loading || donorsLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden min-h-screen flex flex-col">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          heroText={heroSettings.text}
          onEditHero={handleEditHero}
          donorsCount={donors.length}
          isAdmin={isAdmin}
          user={user}
          adminUser={adminUser}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/donors" element={<Donors />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </main>

        <Footer
          whatsappNumber={heroSettings.whatsapp_number}
          instructions={heroSettings.instructions_text}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal 
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
        />

        <GuidelinesPopup 
          isOpen={showGuidelinesPopup}
          onClose={handleCloseGuidelinesPopup}
        />
      </div>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <DonorProvider>
          <Routes>
            {/* Frontend Routes */}
            <Route path="/*" element={<FrontendLayout />} />
            
            {/* Admin Routes - Completely separate layout */}
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </DonorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;