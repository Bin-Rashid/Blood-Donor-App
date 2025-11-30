// src/components/Footer.jsx
import React from 'react';
import { Heart, MessageCircle, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = ({ whatsappNumber, onEditWhatsApp, instructions }) => {
  const { isAdmin } = useAuth();

  const handleWhatsAppClick = () => {
    if (whatsappNumber && whatsappNumber !== '+880XXXXXXXXX') {
      const message = "Hello, I need information about blood donation..."
      const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    } else {
      alert('WhatsApp number not configured yet.')
    }
  }

  return (
    <footer className="primary-gradient text-white mt-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grain' width='100' height='100' patternUnits='userSpaceOnUse'><circle cx='50' cy='50' r='1' fill='white'/></pattern></defs><rect width='100' height='100' fill='url(%23grain)'/></svg>")`
        }}></div>
      </div>

      <div className="relative z-10">
        {/* Instructions Section - UPDATED */}
        <div className="px-6 py-8 text-center border-b border-white/20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-3 bangla">
              <Heart className="w-6 h-6" fill="white" />
              জীবন বাঁচাতে রক্তদান করুন
            </h3>
            
            {/* Updated Guidelines Section */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
              <h4 className="text-lg font-semibold mb-4 text-center bangla">💡 দ্রুত টিপস</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm bangla">
                <div>
                  <h5 className="font-semibold mb-2 text-green-200">✅ সঠিক নিয়ম</h5>
                  <p>শুধুমাত্র "Eligible" ডোনারদের সাথে যোগাযোগ করুন এবং রক্তদানের পর প্রোফাইল আপডেট করুন।</p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-yellow-200">📞 যোগাযোগ</h5>
                  <p>জরুরী প্রয়োজনে WhatsApp এ আমাদের সাথে যোগাযোগ করুন।</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6" fill="white" />
              <span className="text-xl font-bold">LifeShare</span>
            </div>

            <div className="text-center bangla">
              <p className="text-lg font-semibold mb-1">সাদাকাহ ফান্ড দ্বারা পরিচালিত একটি কার্যক্রম</p>
              <p className="opacity-90">A initiative powered by Sadaqah Fund</p>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <button
                  onClick={handleWhatsAppClick}
                  className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-all shadow-lg hover:scale-110"
                  title={`Contact via WhatsApp: ${whatsappNumber}`}
                >
                  <MessageCircle className="w-6 h-6" fill="white" />
                </button>
                {isAdmin && (
                  <button
                    onClick={onEditWhatsApp}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-all"
                    title="Edit WhatsApp Number"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-white/20">
            <p className="opacity-80">
              &copy; 2024 LifeShare Blood Donor Network. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer; // ✅ এই লাইনটি নিশ্চিত করুন