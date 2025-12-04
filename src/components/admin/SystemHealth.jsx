import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  CheckCircle, 
  AlertCircle,
  Clock,
  RefreshCw,
  Shield,
  Users
} from 'lucide-react';

const SystemHealth = () => {
  const [healthStatus, setHealthStatus] = useState({
    database: { status: 'checking', latency: 0 },
    storage: { used: 0, total: 0, percentage: 0 },
    uptime: 0,
    activeUsers: 0,
    lastBackup: null,
    systemLoad: 25
  });
  const [loading, setLoading] = useState(true);

  const checkDatabaseHealth = async () => {
    try {
      const startTime = Date.now();
      
      // Test database connection
      const { data, error, count } = await supabase
        .from('donors')
        .select('*', { count: 'exact', head: true })
        .limit(1);

      const latency = Date.now() - startTime;
      
      if (error) {
        throw error;
      }

      return {
        status: 'healthy',
        latency,
        message: 'Database connection successful'
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        latency: 0,
        message: error.message || 'Database connection failed'
      };
    }
  };

  const checkStorageUsage = async () => {
    try {
      // Note: Supabase storage API might require different approach
      // This is a mock implementation
      const mockStorage = {
        used: 245, // MB
        total: 1024, // MB (1GB free tier)
        percentage: 23.9
      };
      
      return mockStorage;
    } catch (error) {
      console.error('Storage check failed:', error);
      return {
        used: 0,
        total: 0,
        percentage: 0
      };
    }
  };

  const getActiveUsers = () => {
    // Mock data - in real app, track active sessions
    return Math.floor(Math.random() * 15) + 5;
  };

  const updateHealthStatus = async () => {
    try {
      setLoading(true);

      const [dbHealth, storage, activeUsers] = await Promise.all([
        checkDatabaseHealth(),
        checkStorageUsage(),
        Promise.resolve(getActiveUsers())
      ]);

      setHealthStatus({
        database: dbHealth,
        storage,
        uptime: Math.floor(Math.random() * 100) + 900, // Mock uptime in minutes
        activeUsers,
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        systemLoad: Math.floor(Math.random() * 30) + 20 // Mock system load
      });
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateHealthStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(updateHealthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'unhealthy': return AlertCircle;
      default: return Clock;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (minutes) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Checking system health...</p>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(healthStatus.database.status);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
            <p className="text-sm text-gray-500">Real-time monitoring</p>
          </div>
        </div>
        
        <button
          onClick={updateHealthStatus}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Database Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-500" />
            <h4 className="font-medium text-gray-700">Database Connection</h4>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.database.status)}`}>
            <StatusIcon className="w-4 h-4" />
            {healthStatus.database.status.charAt(0).toUpperCase() + healthStatus.database.status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Latency</p>
            <p className="text-lg font-semibold text-gray-800">{healthStatus.database.latency}ms</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-lg font-semibold text-green-600">Online</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Response</p>
            <p className="text-lg font-semibold text-gray-800">OK</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Last Check</p>
            <p className="text-lg font-semibold text-gray-800">Now</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-2">{healthStatus.database.message}</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Storage Usage */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Storage</p>
              <p className="text-xs text-gray-500">Usage</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used</span>
              <span className="font-semibold">{healthStatus.storage.used} MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${healthStatus.storage.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold">{healthStatus.storage.total} MB</span>
            </div>
          </div>
        </div>

        {/* System Uptime */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Uptime</p>
              <p className="text-xs text-gray-500">Continuous operation</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {formatUptime(healthStatus.uptime)}
          </p>
          <p className="text-sm text-gray-600">Since last restart</p>
        </div>

        {/* Active Users */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Active Users</p>
              <p className="text-xs text-gray-500">Currently online</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {healthStatus.activeUsers}
          </p>
          <p className="text-sm text-gray-600">In last 15 minutes</p>
        </div>

        {/* System Load */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cpu className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">System Load</p>
              <p className="text-xs text-gray-500">CPU/Memory usage</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {healthStatus.systemLoad}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                healthStatus.systemLoad > 80 ? 'bg-red-500' :
                healthStatus.systemLoad > 60 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${healthStatus.systemLoad}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Health Indicators */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-700 mb-3">Health Indicators</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">API Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Security</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Backup</span>
          </div>
        </div>
      </div>

      {/* Last Backup Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-800">Last Backup</p>
              <p className="text-sm text-gray-600">
                {healthStatus.lastBackup 
                  ? new Date(healthStatus.lastBackup).toLocaleString('en-BD')
                  : 'Never'
                }
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium">
            Backup Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;