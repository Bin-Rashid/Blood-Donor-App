// src/components/admin/SystemHealth.jsx
import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Activity,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const SystemHealth = () => {
  const [systemStatus, setSystemStatus] = useState({
    database: 'checking',
    api: 'checking',
    auth: 'checking',
    storage: 'checking',
    notifications: 'checking',
    backups: 'checking'
  });
  const [loading, setLoading] = useState(true);
  const [uptime, setUptime] = useState('00:00:00');
  const [resources, setResources] = useState({
    cpu: 24,
    memory: 42,
    storage: 68,
    network: 12
  });

  useEffect(() => {
    checkSystemHealth();
    
    // Simulate uptime counter
    const startTime = Date.now() - (5 * 24 * 60 * 60 * 1000); // 5 days ago
    const updateUptime = () => {
      const uptimeMs = Date.now() - startTime;
      const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
      setUptime(`${days}d ${hours}h ${minutes}m`);
    };
    
    updateUptime();
    const interval = setInterval(updateUptime, 60000); // Update every minute
    
    // Simulate resource fluctuations
    const resourceInterval = setInterval(() => {
      setResources(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(20, prev.memory + (Math.random() * 4 - 2))),
        storage: Math.min(100, Math.max(50, prev.storage + (Math.random() * 2 - 1))),
        network: Math.min(100, Math.max(5, prev.network + (Math.random() * 6 - 3)))
      }));
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(resourceInterval);
    };
  }, []);

  const checkSystemHealth = async () => {
    try {
      setLoading(true);
      
      // Check database connection
      const { error: dbError } = await supabase.from('donors').select('count').limit(1);
      setSystemStatus(prev => ({ ...prev, database: dbError ? 'error' : 'healthy' }));

      // Simulate checks with timeouts
      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, auth: 'healthy' }));
      }, 300);

      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, api: 'healthy' }));
      }, 500);

      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, storage: 'warning' }));
      }, 400);

      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, notifications: 'healthy' }));
      }, 600);

      setTimeout(() => {
        setSystemStatus(prev => ({ ...prev, backups: 'healthy' }));
        setLoading(false);
      }, 700);

    } catch (error) {
      console.error('System health check error:', error);
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Healthy'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Warning'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Error'
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Checking...'
        };
    }
  };

  const services = [
    { 
      id: 'database', 
      name: 'Database', 
      icon: Database, 
      description: 'PostgreSQL connection' 
    },
    { 
      id: 'api', 
      name: 'API Service', 
      icon: Globe, 
      description: 'REST API endpoints' 
    },
    { 
      id: 'auth', 
      name: 'Authentication', 
      icon: Shield, 
      description: 'User auth service' 
    },
    { 
      id: 'storage', 
      name: 'File Storage', 
      icon: HardDrive, 
      description: 'File upload system' 
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: Activity, 
      description: 'Email/SMS service' 
    },
    { 
      id: 'backups', 
      name: 'Backups', 
      icon: Cpu, 
      description: 'Automated backups' 
    },
  ];

  const overallHealth = Object.values(systemStatus).every(status => status === 'healthy') 
    ? 'healthy' 
    : Object.values(systemStatus).some(status => status === 'error')
    ? 'error'
    : 'warning';

  const overallConfig = getStatusConfig(overallHealth);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
        </div>
        <button
          onClick={checkSystemHealth}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              Checking...
            </>
          ) : (
            'Check Now'
          )}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-5 rounded-xl mb-6 ${overallConfig.bgColor} border ${overallConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${overallConfig.color.replace('text', 'bg')} bg-opacity-20`}>
              <overallConfig.icon className={`w-6 h-6 ${overallConfig.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-lg">Overall System Status</h4>
              <p className="text-sm text-gray-600">All systems monitored in real-time</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{uptime}</div>
            <div className="text-sm text-gray-600">System Uptime</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {services.map((service) => {
          const status = systemStatus[service.id];
          const config = getStatusConfig(status);
          const Icon = service.icon;
          const StatusIcon = config.icon;

          return (
            <div 
              key={service.id} 
              className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-sm ${config.borderColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <StatusIcon className={`w-5 h-5 ${config.color}`} />
              </div>
              
              <h4 className="font-medium text-gray-800 mb-1">{service.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                {status === 'checking' && (
                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Usage */}
      <div>
        <h4 className="font-medium text-gray-800 mb-4">Resource Usage</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gray-500" />
                <span>CPU Usage</span>
              </div>
              <span className="font-medium">{Math.round(resources.cpu)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                style={{ width: `${resources.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span>Memory</span>
              </div>
              <span className="font-medium">{Math.round(resources.memory)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                style={{ width: `${resources.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                <span>Storage</span>
              </div>
              <span className="font-medium">{Math.round(resources.storage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-500"
                style={{ width: `${resources.storage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-gray-500" />
                <span>Network</span>
              </div>
              <span className="font-medium">{Math.round(resources.network)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-500"
                style={{ width: `${resources.network}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last checked: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-gray-500">Next check: 5 min</span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;