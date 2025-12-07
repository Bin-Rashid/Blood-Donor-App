// src/components/admin/DonorTable.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  Droplets,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

const DonorTable = ({
  donors,
  loading,
  selectedDonors,
  onSelectDonor,
  onSelectAll,
  onViewProfile,
  onEditDonor,
  onDeleteDonor,
  onMessageDonor,
  onCallDonor,
  pagination,
  onPageChange,
  onLimitChange
}) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getEligibilityStatus = (lastDonationDate) => {
    if (!lastDonationDate) return 'eligible';
    
    const lastDonation = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return lastDonation <= threeMonthsAgo ? 'eligible' : 'not-eligible';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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

  if (!donors.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donors found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
          <button
            onClick={() => window.location.href = '/admin/donors?action=add'}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add First Donor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    checked={selectedDonors.length === donors.length && donors.length > 0}
                    onChange={onSelectAll}
                  />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Donor
                  {sortField === 'name' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('blood_type')}
              >
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Blood Type
                  {sortField === 'blood_type' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('district')}
              >
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                  {sortField === 'district' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_donation_date')}
              >
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last Donation
                  {sortField === 'last_donation_date' && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Eligibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donors.map((donor) => {
              const isEligible = getEligibilityStatus(donor.last_donation_date) === 'eligible';
              
              return (
                <tr key={donor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      checked={selectedDonors.includes(donor.id)}
                      onChange={() => onSelectDonor(donor.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{donor.name || 'Unnamed Donor'}</div>
                      <div className="text-sm text-gray-500">
                        ID: {donor.id.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        donor.blood_type?.includes('+') ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <span className="font-semibold text-gray-900">
                        {donor.blood_type || 'Not specified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{donor.district || 'Unknown'}</div>
                    {donor.thana && (
                      <div className="text-xs text-gray-500">{donor.thana}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {donor.phone || 'No phone'}
                      </div>
                      {donor.email && (
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">
                          {donor.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(donor.last_donation_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isEligible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isEligible ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Eligible
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Not Eligible
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewProfile(donor)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onEditDonor(donor)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {donor.phone && (
                        <a
                          href={`tel:${donor.phone}`}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Call"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => onMessageDonor(donor)}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Message"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onDeleteDonor(donor)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> donors
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={pagination.limit}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                >
                  {[5, 10, 25, 50, 100].map(limit => (
                    <option key={limit} value={limit}>{limit}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first 3, last 3, and pages around current
                      if (page <= 3) return true;
                      if (page > Math.ceil(pagination.total / pagination.limit) - 3) return true;
                      if (Math.abs(page - pagination.page) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => onPageChange(page)}
                          className={`px-3 py-1 rounded ${
                            pagination.page === page
                              ? 'bg-red-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorTable;