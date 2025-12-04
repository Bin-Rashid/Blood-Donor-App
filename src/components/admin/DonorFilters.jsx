import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabase';

const DonorFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [districts, setDistricts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch unique districts for filter
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { data, error } = await supabase
          .from('donors')
          .select('district')
          .not('district', 'is', null);
          
        if (error) throw error;
        
        const uniqueDistricts = [...new Set(data.map(item => item.district))].sort();
        setDistricts(uniqueDistricts);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    
    fetchDistricts();
  }, []);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const eligibilityOptions = [
    { value: '', label: 'All' },
    { value: 'eligible', label: 'Eligible Now' },
    { value: 'not-eligible', label: 'Not Eligible' }
  ];

  const handleFilterUpdate = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (key, value) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filter Header */}
      <div 
        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-700">Filters</h3>
            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {Object.values(filters).filter(v => v !== '' && 
                (typeof v !== 'object' || Object.values(v).some(sv => sv !== ''))
              ).length} active
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showFilters ? (
              <X className="w-4 h-4 text-gray-400" />
            ) : (
              <span className="text-sm text-gray-500">Click to expand</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {showFilters && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blood Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={filters.bloodType}
                onChange={(e) => handleFilterUpdate('bloodType', e.target.value)}
              >
                <option value="">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={filters.district}
                onChange={(e) => handleFilterUpdate('district', e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Eligibility Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eligibility
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={filters.eligibility}
                onChange={(e) => handleFilterUpdate('eligibility', e.target.value)}
              >
                {eligibilityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Date
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all filters
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onFilterChange(filters);
                  setShowFilters(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorFilters;