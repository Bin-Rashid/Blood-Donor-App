import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Droplets,
  CheckCircle,
  XCircle,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const DonorTable = ({
  donors,
  loading,
  selectedDonors,
  onSelectDonor,
  onSelectAll,
  onViewProfile,
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange
}) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDeleteDonor = async (donorId, donorName) => {
    if (window.confirm(`Are you sure you want to delete donor ${donorName}?`)) {
      try {
        const { error } = await supabase
          .from('donors')
          .delete()
          .eq('id', donorId);
          
        if (error) throw error;
        
        alert('Donor deleted successfully');
        onRefresh();
      } catch (error) {
        console.error('Error deleting donor:', error);
        alert('Failed to delete donor');
      }
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={donors.length > 0 && selectedDonors.length === donors.length}
                  onChange={onSelectAll}
                />
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Donor</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Contact</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Location</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Blood Type</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Last Donation</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center">
                  <div className="text-gray-500">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No donors found</p>
                  </div>
                </td>
              </tr>
            ) : (
              donors.map((donor) => {
                const eligibility = calculateEligibility(donor.last_donation_date);
                
                return (
                  <tr key={donor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={selectedDonors.includes(donor.id)}
                        onChange={() => onSelectDonor(donor.id)}
                      />
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-semibold">
                            {donor.name?.charAt(0).toUpperCase() || 'D'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{donor.name}</p>
                          <p className="text-xs text-gray-500">ID: {donor.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-700">{donor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {donor.email || 'No email'}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-800">{donor.district || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{donor.city || ''}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                          <span className="text-red-600 font-semibold">{donor.blood_type}</span>
                        </div>
                        <span className="text-gray-700">{donor.blood_type}</span>
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
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {formatDate(donor.last_donation_date)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewProfile(donor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.location.href = `/admin/donors?action=edit&id=${donor.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteDonor(donor.id, donor.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {donors.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                value={pagination.limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            
            <span className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} donors
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg ${
                    pagination.page === pageNum
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorTable;