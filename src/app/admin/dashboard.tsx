import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Users,
  Activity,
  Scan,
  FileText,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Eye,
  Filter,
  Search,
  ChevronDown,
  Terminal,
  Bug,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react-native';
import { cn } from '@/lib/cn';
import { useSessionStore, useAuthStore, mockUsers, mockItems } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'users' | 'scans' | 'monitoring' | 'logs' | 'errors';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

interface ErrorEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  resolved: boolean;
}

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

// Mock real-time data generators
const generateMockLogs = (): LogEntry[] => {
  const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug'];
  const sources = ['API', 'Auth', 'Scanner', 'Sync', 'Database', 'UI'];
  const messages = [
    'User login successful',
    'Session created',
    'Barcode scanned',
    'Entry saved to database',
    'Sync completed successfully',
    'Cache cleared',
    'Connection timeout - retrying',
    'Failed to fetch item data',
    'Invalid barcode format detected',
    'Session expired - forcing logout',
  ];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `log-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    details: Math.random() > 0.7 ? 'Additional debug information...' : undefined,
  }));
};

const generateMockErrors = (): ErrorEntry[] => {
  const types = ['NetworkError', 'ValidationError', 'SyncError', 'AuthError', 'ScanError'];
  const messages = [
    'Failed to connect to backend server',
    'Invalid PIN format',
    'Sync failed - offline mode active',
    'Session token expired',
    'Barcode not found in database',
    'Network request timeout',
    'Invalid response from server',
  ];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `error-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    stack: Math.random() > 0.5 ? 'at scanBarcode (Scanner.tsx:45)\nat handleScan (ScanScreen.tsx:120)' : undefined,
    userId: Math.random() > 0.5 ? mockUsers[Math.floor(Math.random() * mockUsers.length)].id : undefined,
    sessionId: Math.random() > 0.5 ? `session-${Math.floor(Math.random() * 1000)}` : undefined,
    resolved: Math.random() > 0.7,
  }));
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs());
  const [errors, setErrors] = useState<ErrorEntry[]>(generateMockErrors());
  const [logFilter, setLogFilter] = useState<LogEntry['level'] | 'all'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);
  const users = useSessionStore((s) => s.users);

  // System metrics (mock data - would come from backend in production)
  const systemMetrics: SystemMetric[] = [
    { label: 'CPU Usage', value: 45, max: 100, unit: '%', status: 'good' },
    { label: 'Memory', value: 2.4, max: 4, unit: 'GB', status: 'good' },
    { label: 'Storage', value: 78, max: 100, unit: '%', status: 'warning' },
    { label: 'API Latency', value: 120, max: 500, unit: 'ms', status: 'good' },
  ];

  // Active users (users with active sessions in last 30 min)
  const activeUsers = users.filter((u) =>
    sessions.some(
      (s) =>
        s.userId === u.id &&
        s.status === 'active' &&
        new Date(s.createdAt).getTime() > Date.now() - 30 * 60 * 1000
    )
  );

  // Recent scans (last 50 entries)
  const recentScans = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  // Check backend health
  const checkBackendHealth = useCallback(async () => {
    try {
      await apiClient.healthCheck();
      setIsConnected(true);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Add new log occasionally
      if (Math.random() > 0.7) {
        const newLog = generateMockLogs()[0];
        setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await checkBackendHealth();
    setLogs(generateMockLogs());
    setErrors(generateMockErrors());
    setLastUpdate(new Date());
    setRefreshing(false);
  };

  const handleTabChange = async (tab: TabType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const tabs: { id: TabType; label: string; icon: typeof Users }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'scans', label: 'Scans', icon: Scan },
    { id: 'monitoring', label: 'System', icon: Activity },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'errors', label: 'Errors', icon: Bug },
  ];

  const filteredLogs = logFilter === 'all' ? logs : logs.filter((l) => l.level === logFilter);

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return { bg: 'bg-red-500/20', text: 'text-red-400', dot: '#EF4444' };
      case 'warn':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: '#F59E0B' };
      case 'info':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: '#3B82F6' };
      case 'debug':
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: '#6B7280' };
    }
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
    }
  };

  const getUserBySessionId = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    return users.find((u) => u.id === session?.userId);
  };

  const getItemById = (itemId: string) => {
    return mockItems.find((i) => i.id === itemId);
  };

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient
        colors={['#0A0F1C', '#111827', '#0A0F1C']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="px-5 pt-2 pb-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center mr-3 active:opacity-70"
                >
                  <ArrowLeft size={20} color="#9CA3AF" />
                </Pressable>
                <View>
                  <Text className="text-white font-bold text-xl">Admin Dashboard</Text>
                  <View className="flex-row items-center mt-0.5">
                    <View
                      className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        isConnected ? 'bg-green-400' : 'bg-red-400'
                      )}
                    />
                    <Text className="text-gray-500 text-xs">
                      {isConnected ? 'Connected' : 'Disconnected'} • Updated{' '}
                      {format(lastUpdate, 'h:mm:ss a')}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                onPress={onRefresh}
                className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center border border-purple-500/20 active:opacity-70"
              >
                <RefreshCw size={18} color="#A855F7" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mb-4"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              <View className="bg-green-500/10 rounded-2xl px-4 py-3 border border-green-500/20 min-w-[100px]">
                <View className="flex-row items-center mb-1">
                  <Users size={14} color="#22C55E" />
                  <Text className="text-green-400 text-xs ml-1">Active</Text>
                </View>
                <Text className="text-white font-bold text-2xl">{activeUsers.length}</Text>
              </View>
              <View className="bg-blue-500/10 rounded-2xl px-4 py-3 border border-blue-500/20 min-w-[100px]">
                <View className="flex-row items-center mb-1">
                  <Scan size={14} color="#3B82F6" />
                  <Text className="text-blue-400 text-xs ml-1">Scans</Text>
                </View>
                <Text className="text-white font-bold text-2xl">{entries.length}</Text>
              </View>
              <View className="bg-amber-500/10 rounded-2xl px-4 py-3 border border-amber-500/20 min-w-[100px]">
                <View className="flex-row items-center mb-1">
                  <Clock size={14} color="#F59E0B" />
                  <Text className="text-amber-400 text-xs ml-1">Pending</Text>
                </View>
                <Text className="text-white font-bold text-2xl">
                  {entries.filter((e) => e.verificationStatus === 'pending').length}
                </Text>
              </View>
              <View className="bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/20 min-w-[100px]">
                <View className="flex-row items-center mb-1">
                  <AlertTriangle size={14} color="#EF4444" />
                  <Text className="text-red-400 text-xs ml-1">Errors</Text>
                </View>
                <Text className="text-white font-bold text-2xl">
                  {errors.filter((e) => !e.resolved).length}
                </Text>
              </View>
            </ScrollView>
          </Animated.View>

          {/* Tab Navigation */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5 mb-4"
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex-row items-center px-4 py-2.5 rounded-xl',
                      isActive
                        ? 'bg-purple-500'
                        : 'bg-white/5 border border-white/10'
                    )}
                  >
                    <Icon size={16} color={isActive ? '#fff' : '#9CA3AF'} />
                    <Text
                      className={cn(
                        'ml-2 font-medium',
                        isActive ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      {tab.label}
                    </Text>
                    {tab.id === 'errors' && errors.filter((e) => !e.resolved).length > 0 && (
                      <View className="ml-2 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">
                          {errors.filter((e) => !e.resolved).length}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Tab Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />
            }
          >
            {/* Users Tab */}
            {activeTab === 'users' && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <Text className="text-white font-semibold text-lg mb-3">Live Users</Text>
                {users.map((user, index) => {
                  const userSessions = sessions.filter((s) => s.userId === user.id);
                  const activeSession = userSessions.find((s) => s.status === 'active');
                  const isOnline = !!activeSession;
                  const lastActivity = userSessions.length > 0
                    ? new Date(Math.max(...userSessions.map((s) => new Date(s.createdAt).getTime())))
                    : null;

                  return (
                    <Animated.View
                      key={user.id}
                      entering={FadeInDown.duration(400).delay(index * 50)}
                      className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10"
                    >
                      <View className="flex-row items-center">
                        <LinearGradient
                          colors={
                            user.role === 'admin'
                              ? ['#8B5CF6', '#A855F7']
                              : user.role === 'supervisor'
                              ? ['#F59E0B', '#D97706']
                              : ['#3B82F6', '#60A5FA']
                          }
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text className="text-white font-bold text-lg">
                            {user.name.charAt(0)}
                          </Text>
                        </LinearGradient>
                        <View className="flex-1 ml-3">
                          <View className="flex-row items-center">
                            <Text className="text-white font-semibold">{user.name}</Text>
                            <View
                              className={cn(
                                'ml-2 w-2 h-2 rounded-full',
                                isOnline ? 'bg-green-400' : 'bg-gray-600'
                              )}
                            />
                          </View>
                          <View className="flex-row items-center mt-1">
                            <View
                              className={cn(
                                'px-2 py-0.5 rounded-full mr-2',
                                user.role === 'admin'
                                  ? 'bg-purple-500/20'
                                  : user.role === 'supervisor'
                                  ? 'bg-amber-500/20'
                                  : 'bg-blue-500/20'
                              )}
                            >
                              <Text
                                className={cn(
                                  'text-[10px] font-semibold uppercase',
                                  user.role === 'admin'
                                    ? 'text-purple-400'
                                    : user.role === 'supervisor'
                                    ? 'text-amber-400'
                                    : 'text-blue-400'
                                )}
                              >
                                {user.role}
                              </Text>
                            </View>
                            <Text className="text-gray-500 text-xs">
                              {isOnline
                                ? 'Active now'
                                : lastActivity
                                ? `Last seen ${format(lastActivity, 'h:mm a')}`
                                : 'Never'}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-white font-bold text-lg">
                            {userSessions.length}
                          </Text>
                          <Text className="text-gray-500 text-xs">sessions</Text>
                        </View>
                      </View>
                      {activeSession && (
                        <View className="mt-3 pt-3 border-t border-white/10">
                          <View className="flex-row items-center">
                            <View className="flex-row items-center flex-1">
                              <Scan size={14} color="#22C55E" />
                              <Text className="text-gray-400 text-sm ml-2">
                                {activeSession.locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
                                {activeSession.floor ?? activeSession.area}
                              </Text>
                            </View>
                            <View className="bg-green-500/20 px-2 py-1 rounded-full">
                              <Text className="text-green-400 text-xs font-medium">
                                {activeSession.totalScanned} scans
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </Animated.View>
                  );
                })}
              </Animated.View>
            )}

            {/* Scans Tab */}
            {activeTab === 'scans' && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">Live Scan Updates</Text>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                    <Text className="text-gray-500 text-xs">Real-time</Text>
                  </View>
                </View>

                {/* Table Header */}
                <View className="bg-white/5 rounded-t-xl p-3 flex-row border-b border-white/10">
                  <Text className="text-gray-400 text-xs font-medium flex-1">Time</Text>
                  <Text className="text-gray-400 text-xs font-medium flex-[2]">Item</Text>
                  <Text className="text-gray-400 text-xs font-medium w-16 text-center">Qty</Text>
                  <Text className="text-gray-400 text-xs font-medium w-16 text-center">Var</Text>
                  <Text className="text-gray-400 text-xs font-medium w-20 text-right">Staff</Text>
                </View>

                {/* Table Rows */}
                <View className="bg-white/[0.02] rounded-b-xl overflow-hidden">
                  {recentScans.length === 0 ? (
                    <View className="p-8 items-center">
                      <Scan size={32} color="#4B5563" />
                      <Text className="text-gray-500 mt-2">No scans yet</Text>
                    </View>
                  ) : (
                    recentScans.slice(0, 20).map((entry, index) => {
                      const item = getItemById(entry.itemId);
                      const user = getUserBySessionId(entry.sessionId);

                      return (
                        <View
                          key={entry.id}
                          className={cn(
                            'p-3 flex-row items-center',
                            index < recentScans.slice(0, 20).length - 1 && 'border-b border-white/5'
                          )}
                        >
                          <Text className="text-gray-500 text-xs flex-1">
                            {format(new Date(entry.createdAt), 'h:mm a')}
                          </Text>
                          <View className="flex-[2]">
                            <Text className="text-white text-xs" numberOfLines={1}>
                              {item?.name ?? 'Unknown Item'}
                            </Text>
                          </View>
                          <Text className="text-white text-xs w-16 text-center font-medium">
                            {entry.countedQty}
                          </Text>
                          <View className="w-16 items-center">
                            <View
                              className={cn(
                                'px-2 py-0.5 rounded-full',
                                entry.variance === 0
                                  ? 'bg-green-500/20'
                                  : entry.variance < 0
                                  ? 'bg-red-500/20'
                                  : 'bg-amber-500/20'
                              )}
                            >
                              <Text
                                className={cn(
                                  'text-xs font-medium',
                                  entry.variance === 0
                                    ? 'text-green-400'
                                    : entry.variance < 0
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                )}
                              >
                                {entry.variance === 0 ? '0' : entry.variance > 0 ? `+${entry.variance}` : entry.variance}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-gray-400 text-xs w-20 text-right" numberOfLines={1}>
                            {user?.name?.split(' ')[0] ?? 'Unknown'}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Stats Summary */}
                <View className="mt-4 flex-row gap-3">
                  <View className="flex-1 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                    <Text className="text-green-400 text-xs">Matched</Text>
                    <Text className="text-white font-bold text-xl">
                      {entries.filter((e) => e.variance === 0).length}
                    </Text>
                  </View>
                  <View className="flex-1 bg-red-500/10 rounded-xl p-3 border border-red-500/20">
                    <Text className="text-red-400 text-xs">Short</Text>
                    <Text className="text-white font-bold text-xl">
                      {entries.filter((e) => e.variance < 0).length}
                    </Text>
                  </View>
                  <View className="flex-1 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                    <Text className="text-amber-400 text-xs">Over</Text>
                    <Text className="text-white font-bold text-xl">
                      {entries.filter((e) => e.variance > 0).length}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <Animated.View entering={FadeInRight.duration(400)}>
                {/* Connection Status */}
                <View className="mb-4">
                  <Text className="text-white font-semibold text-lg mb-3">System Health</Text>
                  <View
                    className={cn(
                      'rounded-2xl p-4 border flex-row items-center',
                      isConnected
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    )}
                  >
                    {isConnected ? (
                      <Wifi size={24} color="#22C55E" />
                    ) : (
                      <WifiOff size={24} color="#EF4444" />
                    )}
                    <View className="ml-3 flex-1">
                      <Text className={cn('font-semibold', isConnected ? 'text-green-400' : 'text-red-400')}>
                        {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-0.5">
                        {isConnected ? 'All services operational' : 'Check server status'}
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'px-3 py-1 rounded-full',
                        isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          isConnected ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {isConnected ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* System Metrics */}
                <Text className="text-white font-semibold text-lg mb-3">Performance Metrics</Text>
                {systemMetrics.map((metric, index) => (
                  <Animated.View
                    key={metric.label}
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        {metric.label === 'CPU Usage' && <Cpu size={16} color="#9CA3AF" />}
                        {metric.label === 'Memory' && <Server size={16} color="#9CA3AF" />}
                        {metric.label === 'Storage' && <HardDrive size={16} color="#9CA3AF" />}
                        {metric.label === 'API Latency' && <Zap size={16} color="#9CA3AF" />}
                        <Text className="text-gray-400 ml-2">{metric.label}</Text>
                      </View>
                      <Text className="text-white font-bold">
                        {metric.value}
                        {metric.unit}
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${(metric.value / metric.max) * 100}%`,
                          backgroundColor: getStatusColor(metric.status),
                        }}
                      />
                    </View>
                  </Animated.View>
                ))}

                {/* Quick Actions */}
                <Text className="text-white font-semibold text-lg mb-3 mt-4">Quick Actions</Text>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={onRefresh}
                    className="flex-1 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 active:opacity-70"
                  >
                    <RefreshCw size={20} color="#3B82F6" />
                    <Text className="text-blue-400 font-medium mt-2">Refresh All</Text>
                  </Pressable>
                  <Pressable className="flex-1 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 active:opacity-70">
                    <Server size={20} color="#F59E0B" />
                    <Text className="text-amber-400 font-medium mt-2">Clear Cache</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">Application Logs</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {(['all', 'error', 'warn', 'info', 'debug'] as const).map((level) => (
                        <Pressable
                          key={level}
                          onPress={() => setLogFilter(level)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg',
                            logFilter === level
                              ? 'bg-purple-500'
                              : 'bg-white/5 border border-white/10'
                          )}
                        >
                          <Text
                            className={cn(
                              'text-xs font-medium capitalize',
                              logFilter === level ? 'text-white' : 'text-gray-400'
                            )}
                          >
                            {level}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View className="bg-[#0D1117] rounded-xl overflow-hidden border border-white/10">
                  {filteredLogs.map((log, index) => {
                    const colors = getLogLevelColor(log.level);
                    return (
                      <View
                        key={log.id}
                        className={cn(
                          'p-3',
                          index < filteredLogs.length - 1 && 'border-b border-white/5'
                        )}
                      >
                        <View className="flex-row items-start">
                          <View
                            className="w-2 h-2 rounded-full mt-1.5"
                            style={{ backgroundColor: colors.dot }}
                          />
                          <View className="flex-1 ml-2">
                            <View className="flex-row items-center flex-wrap">
                              <View className={cn('px-1.5 py-0.5 rounded mr-2', colors.bg)}>
                                <Text className={cn('text-[10px] font-mono uppercase', colors.text)}>
                                  {log.level}
                                </Text>
                              </View>
                              <Text className="text-gray-600 text-[10px] font-mono">
                                {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                              </Text>
                              <Text className="text-purple-400/60 text-[10px] font-mono ml-2">
                                [{log.source}]
                              </Text>
                            </View>
                            <Text className="text-gray-300 text-xs font-mono mt-1">
                              {log.message}
                            </Text>
                            {log.details && (
                              <Text className="text-gray-600 text-[10px] font-mono mt-1">
                                {log.details}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <Animated.View entering={FadeInRight.duration(400)}>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">Error Tracking</Text>
                  <View className="flex-row items-center">
                    <View className="bg-red-500/20 px-3 py-1 rounded-full">
                      <Text className="text-red-400 text-xs font-medium">
                        {errors.filter((e) => !e.resolved).length} unresolved
                      </Text>
                    </View>
                  </View>
                </View>

                {errors.map((error, index) => (
                  <Animated.View
                    key={error.id}
                    entering={FadeInDown.duration(400).delay(index * 50)}
                    className={cn(
                      'bg-white/5 rounded-xl p-4 mb-3 border',
                      error.resolved ? 'border-white/10' : 'border-red-500/30'
                    )}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          {error.resolved ? (
                            <CheckCircle2 size={16} color="#22C55E" />
                          ) : (
                            <XCircle size={16} color="#EF4444" />
                          )}
                          <Text
                            className={cn(
                              'ml-2 font-semibold text-sm',
                              error.resolved ? 'text-gray-400' : 'text-red-400'
                            )}
                          >
                            {error.type}
                          </Text>
                        </View>
                        <Text className="text-white text-sm">{error.message}</Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {format(new Date(error.timestamp), 'MMM d, h:mm a')}
                        </Text>
                      </View>
                      <View
                        className={cn(
                          'px-2 py-1 rounded-full',
                          error.resolved ? 'bg-green-500/20' : 'bg-red-500/20'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-[10px] font-semibold',
                            error.resolved ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {error.resolved ? 'Resolved' : 'Active'}
                        </Text>
                      </View>
                    </View>
                    {error.stack && (
                      <View className="mt-2 p-2 bg-black/30 rounded-lg">
                        <Text className="text-gray-500 text-[10px] font-mono">{error.stack}</Text>
                      </View>
                    )}
                    {(error.userId || error.sessionId) && (
                      <View className="mt-2 flex-row gap-4">
                        {error.userId && (
                          <Text className="text-gray-600 text-xs">
                            User: {users.find((u) => u.id === error.userId)?.name ?? error.userId}
                          </Text>
                        )}
                        {error.sessionId && (
                          <Text className="text-gray-600 text-xs">Session: {error.sessionId}</Text>
                        )}
                      </View>
                    )}
                    {!error.resolved && (
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          setErrors((prev) =>
                            prev.map((e) => (e.id === error.id ? { ...e, resolved: true } : e))
                          );
                        }}
                        className="mt-3 bg-green-500/10 rounded-lg py-2 items-center active:opacity-70"
                      >
                        <Text className="text-green-400 font-medium text-sm">Mark as Resolved</Text>
                      </Pressable>
                    )}
                  </Animated.View>
                ))}

                {errors.length === 0 && (
                  <View className="bg-white/5 rounded-xl p-8 items-center border border-white/10">
                    <CheckCircle2 size={48} color="#22C55E" />
                    <Text className="text-white font-semibold text-lg mt-3">No Errors</Text>
                    <Text className="text-gray-500 text-sm mt-1">All systems operational</Text>
                  </View>
                )}
              </Animated.View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
