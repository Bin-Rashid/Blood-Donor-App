import React from 'react';
import { User, Phone, MapPin, Calendar, Droplets, CheckCircle, XCircle } from 'lucide-react';

const RecentDonorsTable = ({ donors }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return { status: 'eligible', daysLeft: 0 };
    
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const isEligible = lastDonation <= threeMonthsAgo;
    const timeDiff = today.getTime() - lastDonation.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const daysLeft = Math.max(0, 90 - daysDiff);
    
    return { 
      status: isEligible ? 'eligible' : 'not-eligible', 
      daysLeft 
    };
  };

  if (donors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No donors found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Donor</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Registered</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor) => {
            const eligibility = calculateEligibility(donor.last_donation_date);
            
            return (
              <tr key={donor.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                      {donor.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{donor.name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Droplets className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-gray-600">{donor.blood_type || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{donor.age || 'N/A'} yrs</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{donor.phone || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{donor.email || 'No email'}</p>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-700">{donor.district || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{donor.city || ''}</p>
                    </div>
                  </div>
                </td>
                
                <td className="py-3 px-4">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    eligibility.status === 'eligible'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {eligibility.status === 'eligible' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Eligible
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        {eligibility.daysLeft}d left
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Last: {formatDate(donor.last_donation_date)}
                  </p>
                </td>
                
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {formatDate(donor.created_at)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentDonorsTable;