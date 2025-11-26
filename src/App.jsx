import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Register from './pages/Register'
import Donors from './pages/Donors'
import AdminModal from './components/AdminModal'
import { supabase } from './services/supabase'
import './index.css'

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading LifeShare...</p>
    </div>
  </div>
)

function AppContent() {
  const [activeTab, setActiveTab] = useState('register')
  const [heroSettings, setHeroSettings] = useState({
    text: 'Connecting blood donors with those in need. Your single donation can save up to three lives.',
    whatsapp_number: '+880XXXXXXXXX',
    instructions_text: 'Find Blood Donors Connect with available donors in your area'
  })
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [donors, setDonors] = useState([])
  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchHeroSettings()
    fetchDonors() 
  }, [])

  const fetchHeroSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .single()

      if (data) {
        setHeroSettings({
          text: data.text,
          whatsapp_number: data.whatsapp_number,
          instructions_text: data.instructions_text
        })
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Donors fetch function যোগ করুন
  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
      
      if (error) throw error
      setDonors(data || [])
    } catch (error) {
      console.error('Error fetching donors:', error)
    }
  }

  const handleEditHero = () => {
    if (isAdmin) {
      setShowAdminModal(true)
    }
  }

  const updateHeroSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from('hero_settings')
        .update(newSettings)
        .eq('id', (await supabase.from('hero_settings').select('id').single()).data?.id)

      if (error) throw error
      
      setHeroSettings(newSettings)
      setShowAdminModal(false)
      alert('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating hero settings:', error)
      alert('Failed to update settings: ' + error.message)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

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
          {activeTab === 'register' && <Register />}
          {activeTab === 'donors' && <Donors />}
        </main>

        <Footer 
          whatsappNumber={heroSettings.whatsapp_number}
          instructions={heroSettings.instructions_text}
        />

        {/* Admin Settings Modal */}
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
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App