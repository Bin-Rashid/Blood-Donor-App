import React from 'react';
import { Users, CheckCircle, TrendingUp, Clock, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

const AdminStatsCards = ({ stats }) => {
  const statCards = [
    {
      icon: Users,
      title: 'Total Donors',
      value: stats.totalDonors,
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-500',
      description: 'Registered donors'
    },
    {
      icon: CheckCircle,
      title: 'Eligible Now',
      value: stats.eligibleDonors,
      change: '+8%',
      trend: 'up',
      color: 'bg-green-500',
      description: 'Ready to donate'
    },
    {
      icon: TrendingUp,
      title: 'New This Week',
      value: stats.newRegistrations,
      change: '+24%',
      trend: 'up',
      color: 'bg-purple-500',
      description: 'Recent registrations'
    },
    {
      icon: AlertCircle,
      title: 'Blood Requests',
      value: stats.bloodRequests || 0,
      change: '-3%',
      trend: 'down',
      color: 'bg-red-500',
      description: 'Pending requests'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <span className={`text-sm font-medium flex items-center gap-1 ${
              card.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {card.trend === 'up' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {card.change}
            </span>
          </div>
          
          <div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            <p className="text-gray-600 mt-1">{card.title}</p>
            <p className="text-sm text-gray-500 mt-2">{card.description}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${card.color}`}
                style={{ 
                  width: `${Math.min((card.value / (stats.totalDonors || 1)) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;