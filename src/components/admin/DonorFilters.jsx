// src/components/admin/DonorFilters.jsx
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

const DonorFilters = ({ filters = {}, onFilterChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const districts = [
    'Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal',
    'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Noakhali'
  ];

  // ✅ safer check for active filters
  const hasActiveFilters = Object.values(filters).some(value => {
    if (typeof value === 'string') return !!value;
    if (typeof value === 'object' && value !== null) return Object.values(value).some(v => !!v);
    return false;
  });

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleDateChange = (rangeKey, value) => {
    onFilterChange({
      ...filters,
      dateRange: { ...(filters.dateRange || {}), [rangeKey]: value }
    });
  };

  // ✅ provide safe defaults
  const {
    bloodType = '',
    district = '',
    eligibility = '',
    dateRange = {},
    lastDonationFilter = '',
    ageMin = '',
    ageMax = '',
    gender = ''
  } = filters;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blood Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Blood Type
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={bloodType}
            onChange={(e) => handleChange('bloodType', e.target.value)}
          >
            <option value="">All Blood Types</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={district}
            onChange={(e) => handleChange('district', e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Eligibility Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Eligibility
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            value={eligibility}
            onChange={(e) => handleChange('eligibility', e.target.value)}
          >
            <option value="">All Donors</option>
            <option value="eligible">Eligible to Donate</option>
            <option value="not-eligible">Not Eligible</option>
          </select>
        </div>

        {/* Date Range (Collapsible) */}
        {isExpanded && (
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={dateRange.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                max={dateRange.end || new Date().toISOString().split('T')[0]}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={dateRange.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={dateRange.start || ''}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters (Expanded) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Donation
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={lastDonationFilter}
                onChange={(e) => handleChange('lastDonationFilter', e.target.value)}
              >
                <option value="">Any Time</option>
                <option value="last-week">Last Week</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
                <option value="never">Never Donated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="18"
                  max="65"
                  value={ageMin}
                  onChange={(e) => handleChange('ageMin', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="18"
                  max="65"
                  value={ageMax}
                  onChange={(e) => handleChange('ageMax', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorFilters;