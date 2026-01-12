import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSyncStore, startAutoSync, stopAutoSync, startNetworkListener, stopNetworkListener } from '@/lib/sync';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Database,
} from 'lucide-react-native';

const SYNC_INTERVALS = [
  { label: '1 min', value: 1 * 60 * 1000 },
  { label: '5 min', value: 5 * 60 * 1000 },
  { label: '15 min', value: 15 * 60 * 1000 },
  { label: '30 min', value: 30 * 60 * 1000 },
  { label: '1 hour', value: 60 * 60 * 1000 },
];

export default function SyncSettingsScreen() {
  const router = useRouter();

  // Initialize network listener when screen opens
  useEffect(() => {
    startNetworkListener();
    return () => stopNetworkListener();
  }, []);

  const status = useSyncStore((s) => s.status);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const lastError = useSyncStore((s) => s.lastError);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const isConnected = useSyncStore((s) => s.isConnected);
  const erpConnected = useSyncStore((s) => s.erpConnected);
  const mongoConnected = useSyncStore((s) => s.mongoConnected);
  const syncInterval = useSyncStore((s) => s.syncInterval);
  const autoSync = useSyncStore((s) => s.autoSync);
  const items = useSyncStore((s) => s.items);
  const users = useSyncStore((s) => s.users);
  const offlineOperations = useSyncStore((s) => s.offlineOperations);
  const setSyncInterval = useSyncStore((s) => s.setSyncInterval);
  const setAutoSync = useSyncStore((s) => s.setAutoSync);
  const syncNow = useSyncStore((s) => s.syncNow);

  const pendingChanges = offlineOperations.filter((op) => !op.synced).length;

  const handleSyncNow = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    syncNow();
  };

  const handleToggleAutoSync = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !autoSync;
    setAutoSync(newValue);
    if (newValue) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
  };

  const handleSetInterval = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSyncInterval(value);
    if (autoSync) {
      stopAutoSync();
      startAutoSync();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#22C55E';
      case 'error':
        return '#EF4444';
      case 'syncing':
        return '#3B82F6';
      case 'offline':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return CheckCircle2;
      case 'error':
        return AlertCircle;
      case 'syncing':
        return RefreshCw;
      case 'offline':
        return WifiOff;
      default:
        return Clock;
    }
  };

  const StatusIcon = getStatusIcon();

  const formatLastSync = () => {
    if (!lastSyncAt) return 'Never';
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-4 pb-8">
              {/* Header */}
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-white font-bold text-xl ml-4">Sync Settings</Text>
              </View>

              {/* Sync Status Card */}
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="bg-slate-800/50 rounded-2xl p-5 mb-4"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white font-semibold text-lg">Sync Status</Text>
                  <View
                    className={cn(
                      'flex-row items-center px-3 py-1.5 rounded-full',
                      status === 'success'
                        ? 'bg-green-500/20'
                        : status === 'error'
                          ? 'bg-red-500/20'
                          : status === 'syncing'
                            ? 'bg-blue-500/20'
                            : 'bg-slate-700'
                    )}
                  >
                    <StatusIcon size={14} color={getStatusColor()} />
                    <Text
                      className="text-sm font-medium ml-1.5 capitalize"
                      style={{ color: getStatusColor() }}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-3">
                  {isConnected ? (
                    <Wifi size={18} color="#22C55E" />
                  ) : (
                    <WifiOff size={18} color="#F59E0B" />
                  )}
                  <Text className="text-slate-400 ml-2">
                    {isConnected ? 'Connected to network' : 'Offline'}
                  </Text>
                </View>

                {isConnected && (
                  <View className="flex-row gap-3 mb-3">
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${erpConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <Database size={12} color={erpConnected ? '#22C55E' : '#EF4444'} />
                      <Text className={`text-xs ml-1.5 ${erpConnected ? 'text-green-400' : 'text-red-400'}`}>
                        SQL Server
                      </Text>
                    </View>
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${mongoConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <Database size={12} color={mongoConnected ? '#22C55E' : '#EF4444'} />
                      <Text className={`text-xs ml-1.5 ${mongoConnected ? 'text-green-400' : 'text-red-400'}`}>
                        MongoDB
                      </Text>
                    </View>
                  </View>
                )}

                <View className="flex-row items-center mb-4">
                  <Clock size={18} color="#64748B" />
                  <Text className="text-slate-400 ml-2">Last sync: {formatLastSync()}</Text>
                </View>

                {lastError && (
                  <View className="bg-red-500/10 rounded-xl p-3 mb-4">
                    <Text className="text-red-400 text-sm">{lastError}</Text>
                  </View>
                )}

                {pendingChanges > 0 && (
                  <View className="bg-amber-500/10 rounded-xl p-3 mb-4 flex-row items-center">
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text className="text-amber-400 text-sm ml-2">
                      {pendingChanges} pending change{pendingChanges > 1 ? 's' : ''} to sync
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleSyncNow}
                  disabled={isSyncing || !isConnected}
                  className={cn(
                    'py-3 rounded-xl flex-row items-center justify-center',
                    isSyncing || !isConnected ? 'bg-slate-700' : 'bg-blue-500 active:opacity-80'
                  )}
                >
                  <RefreshCw
                    size={18}
                    color={isSyncing || !isConnected ? '#64748B' : '#fff'}
                  />
                  <Text
                    className={cn(
                      'font-semibold ml-2',
                      isSyncing || !isConnected ? 'text-slate-500' : 'text-white'
                    )}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Auto Sync Toggle */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(50)}
                className="bg-slate-800/50 rounded-2xl p-5 mb-4"
              >
                <Pressable
                  onPress={handleToggleAutoSync}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <RefreshCw size={20} color="#3B82F6" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-white font-medium">Auto Sync</Text>
                      <Text className="text-slate-400 text-sm">
                        Sync data automatically
                      </Text>
                    </View>
                  </View>
                  <View
                    className={cn(
                      'w-12 h-7 rounded-full p-1',
                      autoSync ? 'bg-blue-500' : 'bg-slate-600'
                    )}
                  >
                    <View
                      className={cn(
                        'w-5 h-5 rounded-full bg-white',
                        autoSync ? 'ml-auto' : 'ml-0'
                      )}
                    />
                  </View>
                </Pressable>
              </Animated.View>

              {/* Sync Interval */}
              {autoSync && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(100)}
                  className="bg-slate-800/50 rounded-2xl p-5 mb-4"
                >
                  <Text className="text-white font-semibold mb-3">Sync Interval</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {SYNC_INTERVALS.map((interval) => (
                      <Pressable
                        key={interval.value}
                        onPress={() => handleSetInterval(interval.value)}
                        className={cn(
                          'px-4 py-2 rounded-xl',
                          syncInterval === interval.value ? 'bg-blue-500' : 'bg-slate-700'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-medium',
                            syncInterval === interval.value ? 'text-white' : 'text-slate-400'
                          )}
                        >
                          {interval.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Animated.View>
              )}

              {/* Data Stats */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(150)}
                className="bg-slate-800/50 rounded-2xl p-5 mb-4"
              >
                <View className="flex-row items-center mb-4">
                  <Database size={20} color="#A855F7" />
                  <Text className="text-white font-semibold ml-2">Synced Data</Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-900/50 rounded-xl p-4 items-center">
                    <Text className="text-2xl font-bold text-white">{items.length}</Text>
                    <Text className="text-slate-400 text-sm">Items</Text>
                  </View>
                  <View className="flex-1 bg-slate-900/50 rounded-xl p-4 items-center">
                    <Text className="text-2xl font-bold text-white">{users.length}</Text>
                    <Text className="text-slate-400 text-sm">Users</Text>
                  </View>
                </View>
              </Animated.View>

              {/* API Configuration Notice */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="bg-slate-800/50 rounded-2xl p-5"
              >
                <View className="flex-row items-center mb-3">
                  <Settings size={20} color="#64748B" />
                  <Text className="text-white font-semibold ml-2">API Configuration</Text>
                </View>
                <Text className="text-slate-400 text-sm leading-5">
                  Configure your database API endpoint in the ENV tab. Set EXPO_PUBLIC_API_BASE_URL
                  to your local network server address (e.g., http://192.168.1.100:3000/api).
                </Text>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
