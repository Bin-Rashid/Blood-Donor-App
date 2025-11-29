import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDonors } from './context/DonorContext'; // Import useDonors

import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Donors from './pages/Donors';
import AdminModal from './components/AdminModal';

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
    instructions_text: 'Find Blood Donors Connect with available donors in your area',
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAuth();
  const { donors, loading: donorsLoading } = useDonors(); // Use donors from context

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetchHeroSettings();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase.from('hero_settings').select('*').single();

      if (error) {
        console.error('Error fetching hero settings:', error);
        return;
      }

      if (data) {
        setHeroSettings({
          text: data.text || 'Connecting blood donors with those in need. Your single donation can save up to three lives.',
          whatsapp_number: data.whatsapp_number || '+880XXXXXXXXX',
          instructions_text: data.instructions_text || 'Find Blood Donors Connect with available donors in your area',
        });
      }
    } catch (error) {
      console.error('Error in fetchHeroSettings:', error);
    }
  };

  const handleEditHero = () => {
    if (isAdmin) {
      setShowAdminModal(true);
    }
  };

  const updateHeroSettings = async (newSettings) => {
    try {
      // Get the existing record ID
      const { data: existingData } = await supabase
        .from('hero_settings')
        .select('id')
        .single();

      let error;
      
      if (existingData?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('hero_settings')
          .update(newSettings)
          .eq('id', existingData.id);

        error = updateError;
      } else {
        // Create new record if doesn't exist
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
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;