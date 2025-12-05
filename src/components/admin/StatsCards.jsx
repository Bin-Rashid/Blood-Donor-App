// src/components/admin/StatsCards.jsx
import React from 'react';
import { Users, CheckCircle, TrendingUp, AlertCircle, Droplets, Calendar } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      icon: Users,
      title: 'Total Donors',
      value: stats.totalDonors,
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-500',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Registered donors'
    },
    {
      icon: CheckCircle,
      title: 'Eligible Now',
      value: stats.eligibleDonors,
      change: '+8%',
      trend: 'up',
      color: 'bg-green-500',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Ready to donate'
    },
    {
      icon: TrendingUp,
      title: 'New This Week',
      value: stats.newRegistrations,
      change: '+24%',
      trend: 'up',
      color: 'bg-purple-500',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Recent registrations'
    },
    {
      icon: AlertCircle,
      title: 'Pending Requests',
      value: stats.pendingRequests || 8,
      change: '-3%',
      trend: 'down',
      color: 'bg-red-500',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Blood requests'
    },
    {
      icon: Droplets,
      title: 'Most Common Type',
      value: Object.keys(stats.bloodGroupDistribution).length > 0 
        ? Object.entries(stats.bloodGroupDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
        : 'N/A',
      change: '→',
      trend: 'same',
      color: 'bg-orange-500',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Blood group'
    },
    {
      icon: Calendar,
      title: 'Avg. Response Time',
      value: '2.4h',
      change: '-15%',
      trend: 'up',
      color: 'bg-indigo-500',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'To requests'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend === 'up';
        
        return (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                isPositive 
                  ? 'bg-green-100 text-green-800' 
                  : card.trend === 'down'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {card.change}
              </span>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {typeof card.value === 'number' && card.value > 999 
                  ? `${(card.value / 1000).toFixed(1)}k` 
                  : card.value}
              </p>
              <p className="text-gray-600 text-sm mb-2">{card.title}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{card.description}</p>
                <div className={`w-2 h-2 rounded-full ${card.color}`}></div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${card.color} transition-all duration-500`}
                  style={{ 
                    width: `${Math.min((parseInt(card.value) || 0) / 1000 * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;