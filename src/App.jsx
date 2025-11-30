// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDonors } from './context/DonorContext';

import Header from './components/Header';
import Footer from './components/Footer'; // ✅ এই import টি চেক করুন
import Register from './pages/Register';
import Donors from './pages/Donors';
import ResetPassword from './pages/ResetPassword';
import AdminModal from './components/AdminModal';
import GuidelinesPopup from './components/GuidelinesPopup'; // নতুন কম্পোনেন্ট

import { supabase } from './services/supabase';
import './index.css';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading LifeShare...</p>
    </div>
  </div>
);

function AppContent() {
  const [activeTab, setActiveTab] = useState('register');
  const [heroSettings, setHeroSettings] = useState({
    text: 'Connecting blood donors with those in need. Your single donation can save up to three lives.',
    whatsapp_number: '+880XXXXXXXXX',
    instructions_text: 'জীবন বাঁচাতে রক্তদান করুন', // আপডেট করা
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showGuidelinesPopup, setShowGuidelinesPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAuth();
  const { donors, loading: donorsLoading } = useDonors();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchHeroSettings();
        
        // Guidelines popup check
        const hasSeenGuidelines = localStorage.getItem('hasSeenGuidelines');
        if (!hasSeenGuidelines) {
          setShowGuidelinesPopup(true);
        }
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
    if (isAdmin) {
      setShowAdminModal(true);
    }
  };

  const handleCloseGuidelinesPopup = () => {
    localStorage.setItem('hasSeenGuidelines', 'true');
    setShowGuidelinesPopup(false);
  };

  const updateHeroSettings = async (newSettings) => {
    try {
      const { data: existingData } = await supabase
        .from('hero_settings')
        .select('id')
        .single();

      let error;

      if (existingData?.id) {
        const { error: updateError } = await supabase
          .from('hero_settings')
          .update(newSettings)
          .eq('id', existingData.id);

        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('hero_settings')
          .insert([newSettings]);

        error = insertError;
      }

      if (error) throw error;

      setHeroSettings(newSettings);
      setShowAdminModal(false);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating hero settings:', error);
      alert('Failed to update settings: ' + error.message);
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

        {isAdmin && (
          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
            settings={heroSettings}
            onSave={updateHeroSettings}
          />
        )}

        <GuidelinesPopup 
          isOpen={showGuidelinesPopup}
          onClose={handleCloseGuidelinesPopup}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}

export default App;