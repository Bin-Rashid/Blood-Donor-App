// src/components/admin/DashboardCharts.jsx
import React from 'react';
import { TrendingUp, Users, Calendar, PieChart as PieChartIcon, BarChart3, Download } from 'lucide-react';

const DashboardCharts = ({ stats }) => {
  // Blood group data
  const bloodGroupData = Object.entries(stats.bloodGroupDistribution || {})
    .map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / stats.totalDonors) * 100)
    }))
    .sort((a, b) => b.value - a.value);

  // Colors for charts
  const COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];

  // Registration trend data (last 7 days - simulated)
  const registrationTrendData = [
    { day: 'Mon', registrations: 12 },
    { day: 'Tue', registrations: 19 },
    { day: 'Wed', registrations: 8 },
    { day: 'Thu', registrations: 15 },
    { day: 'Fri', registrations: 11 },
    { day: 'Sat', registrations: 6 },
    { day: 'Sun', registrations: 14 }
  ];

  const maxRegistrations = Math.max(...registrationTrendData.map(d => d.registrations));

  // Eligibility data
  const eligiblePercentage = stats.totalDonors > 0 
    ? Math.round((stats.eligibleDonors / stats.totalDonors) * 100) 
    : 0;

  // Monthly growth data
  const monthlyGrowth = [
    { month: 'Jan', growth: 12 },
    { month: 'Feb', growth: 18 },
    { month: 'Mar', growth: 15 },
    { month: 'Apr', growth: 22 },
    { month: 'May', growth: 19 },
    { month: 'Jun', growth: 24 },
  ];

  const maxGrowth = Math.max(...monthlyGrowth.map(d => d.growth));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Analytics & Charts</h3>
          <p className="text-gray-600">Visual representation of your data</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Blood Group Distribution */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-800">Blood Group Distribution</h4>
          </div>
          <span className="text-sm text-gray-500">
            Total: {stats.totalDonors} donors
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donut Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
              
              {/* Segments */}
              {bloodGroupData.map((group, index) => {
                const percentage = (group.value / stats.totalDonors) * 100;
                const prevPercentage = bloodGroupData
                  .slice(0, index)
                  .reduce((sum, g) => sum + (g.value / stats.totalDonors) * 100, 0);
                
                return (
                  <div
                    key={group.name}
                    className="absolute inset-0 rounded-full border-[12px] border-transparent"
                    style={{
                      borderTopColor: COLORS[index % COLORS.length],
                      borderRightColor: COLORS[index % COLORS.length],
                      borderBottomColor: COLORS[index % COLORS.length],
                      borderLeftColor: COLORS[index % COLORS.length],
                      clipPath: `conic-gradient(transparent 0% ${prevPercentage}%, ${COLORS[index % COLORS.length]} ${prevPercentage}% ${prevPercentage + percentage}%, transparent ${prevPercentage + percentage}% 100%)`,
                      transform: 'rotate(-90deg)',
                      transition: 'all 0.5s ease'
                    }}
                  ></div>
                );
              })}
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">{stats.totalDonors}</div>
                  <div className="text-sm text-gray-500">Total Donors</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Distribution Details */}
          <div>
            <h5 className="font-medium text-gray-700 mb-4">Distribution Details</h5>
            <div className="space-y-4">
              {bloodGroupData.map((group, index) => (
                <div key={group.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <span className="font-medium text-gray-700">{group.name}</span>
                      <span className="ml-2 text-sm text-gray-500">({group.percentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden group-hover:w-36 transition-all duration-300">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${group.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 min-w-[40px] text-right">
                      {group.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Most Common</div>
                  <div className="font-semibold text-gray-900">
                    {bloodGroupData[0]?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rarest</div>
                  <div className="font-semibold text-gray-900">
                    {bloodGroupData[bloodGroupData.length - 1]?.name || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Trend */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-800">Registration Trend</h4>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">+24% this week</span>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-1 px-4">
          {registrationTrendData.map((item, index) => (
            <div key={item.day} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full">
                <div 
                  className="w-full bg-gradient-to-t from-red-500 to-red-600 rounded-t-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 group-hover:shadow-lg"
                  style={{ 
                    height: `${(item.registrations / maxRegistrations) * 80}%`,
                    minHeight: '10px'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[100px] text-center">
                    <div className="font-bold">{item.registrations}</div>
                    <div className="text-gray-300">registrations</div>
                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700">{item.day}</span>
              <span className="text-xs text-gray-500 mt-1">{item.registrations}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Growth & Eligibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Growth */}
        <div>
          <h5 className="font-medium text-gray-700 mb-4">Monthly Growth</h5>
          <div className="h-48 flex items-end justify-between gap-2">
            {monthlyGrowth.map((item) => (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg"
                  style={{ 
                    height: `${(item.growth / maxGrowth) * 100}%`,
                    minHeight: '10px'
                  }}
                ></div>
                <span className="mt-2 text-xs text-gray-600">{item.month}</span>
                <span className="text-xs font-medium text-gray-800">{item.growth}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Eligibility Progress */}
        <div>
          <h5 className="font-medium text-gray-700 mb-4">Eligibility Status</h5>
          <div className="relative">
            <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${eligiblePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Not Eligible</span>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{eligiblePercentage}%</div>
                <div className="text-xs text-gray-500">Eligible Rate</div>
              </div>
              <span className="text-sm text-gray-600">Eligible</span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.eligibleDonors}</div>
                <div className="text-sm text-gray-600">Eligible Donors</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{stats.totalDonors - stats.eligibleDonors}</div>
                <div className="text-sm text-gray-600">Not Eligible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;