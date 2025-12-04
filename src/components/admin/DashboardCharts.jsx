import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Calendar } from 'lucide-react';

const DashboardCharts = ({ stats }) => {
  // Blood group data for pie chart
  const bloodGroupData = Object.entries(stats.bloodGroupDistribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Registration trend data (last 7 days - mock data)
  const registrationTrendData = [
    { day: 'Mon', registrations: 12 },
    { day: 'Tue', registrations: 19 },
    { day: 'Wed', registrations: 8 },
    { day: 'Thu', registrations: 15 },
    { day: 'Fri', registrations: 11 },
    { day: 'Sat', registrations: 6 },
    { day: 'Sun', registrations: 14 }
  ];

  // Eligibility comparison data
  const eligibilityData = [
    { name: 'Eligible', value: stats.eligibleDonors, color: '#10b981' },
    { name: 'Not Eligible', value: stats.totalDonors - stats.eligibleDonors, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Blood Group Distribution Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Blood Group Distribution</h3>
          <span className="text-sm text-gray-500">
            Total: {stats.totalDonors} donors
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bloodGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bloodGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} donors`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Distribution Details</h4>
            {bloodGroupData.map((group, index) => (
              <div key={group.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">{group.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${(group.value / stats.totalDonors) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                  <span className="font-semibold text-gray-800">{group.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Registration Trend</h3>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">+24% this week</span>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={registrationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                formatter={(value) => [`${value} registrations`, 'Count']}
                labelStyle={{ color: '#666' }}
              />
              <Legend />
              <Bar 
                dataKey="registrations" 
                name="New Registrations" 
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Eligibility Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Donor Eligibility</h3>
          <div className="space-y-4">
            {eligibilityData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${(item.value / stats.totalDonors) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">This Week's Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">New Donors</p>
                  <p className="text-sm text-gray-600">This week</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-700">{stats.newRegistrations}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">Avg. Daily</p>
                  <p className="text-sm text-gray-600">Registrations</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-700">
                {Math.round(stats.newRegistrations / 7)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;