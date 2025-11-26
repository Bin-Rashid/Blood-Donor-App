import React from 'react'
import { Users, CheckCircle, Droplets, Activity } from 'lucide-react'

const StatsCards = ({ stats }) => {
  const statItems = [
    {
      icon: Users,
      value: stats.totalDonors,
      label: 'Total Donors',
      color: 'text-blue-600'
    },
    {
      icon: CheckCircle,
      value: stats.eligibleDonors,
      label: 'Eligible Now',
      color: 'text-green-600'
    },
    {
      icon: Droplets,
      value: stats.universalDonors,
      label: 'O- Donors',
      color: 'text-red-600'
    },
    {
      icon: Activity,
      value: stats.recentDonors,
      label: 'Active This Week',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <div key={index} className="card p-6 border-l-4 border-l-red-500 hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">{item.value}</p>
              <p className="text-gray-600 mt-1">{item.label}</p>
            </div>
            <div className={`p-3 rounded-full bg-gray-100 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards