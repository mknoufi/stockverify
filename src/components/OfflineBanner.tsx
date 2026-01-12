import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSessionStore } from '@/lib/store';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface OfflineBannerProps {
  onSync?: () => void;
}

export function OfflineBanner({ onSync }: OfflineBannerProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const offlineQueue = useSessionStore((s) => s.offlineQueue);
  const syncOfflineQueue = useSessionStore((s) => s.syncOfflineQueue);

  const pendingActions = offlineQueue.filter((a) => !a.isSynced).length;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    if (!isConnected || pendingActions === 0) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncing(true);

    // Simulate sync delay
    setTimeout(() => {
      syncOfflineQueue();
      setIsSyncing(false);
      onSync?.();
    }, 1500);
  };

  // Don't show if connected and no pending actions
  if (isConnected && pendingActions === 0) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className="mx-4 mb-3"
    >
      {!isConnected ? (
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
          <AlertCircle size={20} color="#F59E0B" />
        </View>
      ) : pendingActions > 0 ? (
        <View className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center mr-3">
            <RefreshCw size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-400 font-semibold">Pending Sync</Text>
            <Text className="text-blue-400/70 text-sm">
              {pendingActions} action{pendingActions > 1 ? 's' : ''} ready to sync
            </Text>
          </View>
          <Pressable
            onPress={handleSync}
            disabled={isSyncing}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center active:opacity-80"
          >
            {isSyncing ? (
              <RefreshCw size={16} color="#fff" />
            ) : (
              <Check size={16} color="#fff" />
            )}
            <Text className="text-white font-medium ml-1">
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}
