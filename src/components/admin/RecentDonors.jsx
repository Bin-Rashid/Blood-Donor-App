// src/components/admin/RecentDonors.jsx
import React from 'react';
import { User, Phone, MapPin, Droplets, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecentDonors = ({ donors = [] }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short' });
  };

  const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { status: 'eligible', label: 'Eligible', color: 'bg-green-100 text-green-800' };
    
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const isEligible = lastDonation <= threeMonthsAgo;
    return isEligible 
      ? { status: 'eligible', label: 'Eligible', color: 'bg-green-100 text-green-800' }
      : { status: 'not-eligible', label: 'Not Eligible', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Recent Donors</h3>
          <button
            onClick={() => navigate('/admin/donors')}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Latest donor registrations</p>
      </div>

      <div className="divide-y divide-gray-100">
        {donors.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No recent donors</p>
            <p className="text-sm text-gray-400 mt-1">New donors will appear here</p>
          </div>
        ) : (
          donors.map((donor, index) => {
            const eligibility = calculateEligibility(donor.last_donation_date);
            
            return (
              <div 
                key={donor.id || index} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/donors/${donor.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-red-600">
                      {donor.name?.charAt(0).toUpperCase() || 'D'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 truncate">
                          {donor.name || 'Anonymous Donor'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            {donor.phone || 'No phone'}
                          </span>
                          {donor.district && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {donor.district}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className={`text-xs px-2 py-1 rounded-full ${eligibility.color}`}>
                          {eligibility.label}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {formatDate(donor.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {donor.blood_type || 'Unknown'}
                        </span>
                      </div>
                      
                      {donor.last_donation_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Last: {formatDate(donor.last_donation_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {donors.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/admin/donors?action=add')}
            className="w-full py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Add New Donor
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentDonors;