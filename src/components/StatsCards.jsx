import React from 'react'
import { Users, CheckCircle, Droplets, Activity } from 'lucide-react'

const StatsCards = ({ stats = {} }) => {
  // Default values if stats is undefined or null
  const safeStats = {
    totalDonors: stats?.totalDonors || 0,
    eligibleDonors: stats?.eligibleDonors || 0,
    universalDonors: stats?.universalDonors || 0,
    recentDonors: stats?.recentDonors || 0
  }

  const statItems = [
    {
      icon: Users,
      value: safeStats.totalDonors,
      label: 'Total Donors',
      color: 'text-blue-600'
    },
    {
      icon: CheckCircle,
      value: safeStats.eligibleDonors,
      label: 'Eligible Now',
      color: 'text-green-600'
    },
    {
      icon: Droplets,
      value: safeStats.universalDonors,
      label: 'O- Donors',
      color: 'text-red-600'
    },
    {
      icon: Activity,
      value: safeStats.recentDonors,
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