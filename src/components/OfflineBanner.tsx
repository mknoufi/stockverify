import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/lib/store';
import { useSyncStore } from '@/lib/sync';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { WifiOff, RefreshCw, Check, AlertCircle, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface OfflineBannerProps {
  onSync?: () => void;
}

export function OfflineBanner({ onSync }: OfflineBannerProps) {
  const router = useRouter();

  // Session store for offline queue
  const offlineQueue = useSessionStore((s) => s.offlineQueue);
  const syncOfflineQueue = useSessionStore((s) => s.syncOfflineQueue);

  // Sync store for connection and sync status
  const isConnected = useSyncStore((s) => s.isConnected);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const status = useSyncStore((s) => s.status);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const syncNow = useSyncStore((s) => s.syncNow);

  const pendingActions = offlineQueue.filter((a) => !a.isSynced).length;

  const handleSync = async () => {
    if (!isConnected || isSyncing) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Sync with server
    await syncNow();

    // Also sync local offline queue
    if (pendingActions > 0) {
      syncOfflineQueue();
    }

    onSync?.();
  };

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sync-settings');
  };

  const formatLastSync = () => {
    if (!lastSyncAt) return 'Never synced';
    const date = new Date(lastSyncAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Synced just now';
    if (diffMins < 60) return `Synced ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `Synced ${diffHours}h ago`;
  };

  // Show offline banner
  if (!isConnected) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(200)}
        className="mx-4 mb-3"
      >
        <Pressable onPress={handleOpenSettings}>
          <View className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mr-3">
              <WifiOff size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-400 font-semibold">You're Offline</Text>
              <Text className="text-amber-400/70 text-sm">
                {pendingActions > 0
                  ? `${pendingActions} action${pendingActions > 1 ? 's' : ''} pending sync`
                  : 'Changes will sync when connected'}
              </Text>
            </View>
            <Settings size={20} color="#F59E0B" />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Show syncing banner
  if (isSyncing) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(200)}
        className="mx-4 mb-3"
      >
        <View className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
            <RefreshCw size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-400 font-semibold">Syncing...</Text>
            <Text className="text-blue-400/70 text-sm">Updating data from server</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Show pending actions banner
  if (pendingActions > 0) {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(200)}
        className="mx-4 mb-3"
      >
        <View className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
            <AlertCircle size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-400 font-semibold">Pending Sync</Text>
            <Text className="text-blue-400/70 text-sm">
              {pendingActions} action{pendingActions > 1 ? 's' : ''} ready to upload
            </Text>
          </View>
          <Pressable
            onPress={handleSync}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center active:opacity-80"
          >
            <Check size={16} color="#fff" />
            <Text className="text-white font-medium ml-1">Sync</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // Show sync error banner
  if (status === 'error') {
    return (
      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutUp.duration(200)}
        className="mx-4 mb-3"
      >
        <Pressable onPress={handleOpenSettings}>
          <View className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-3">
              <AlertCircle size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-red-400 font-semibold">Sync Error</Text>
              <Text className="text-red-400/70 text-sm">Tap to view details</Text>
            </View>
            <Pressable
              onPress={handleSync}
              className="bg-red-500 px-4 py-2 rounded-lg flex-row items-center active:opacity-80"
            >
              <RefreshCw size={16} color="#fff" />
              <Text className="text-white font-medium ml-1">Retry</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Don't show anything if all is good
  return null;
}
