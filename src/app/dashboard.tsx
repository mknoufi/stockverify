import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Scan,
  CheckCircle2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  ClipboardList,
  LogOut,
  User,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getDashboardStats = useSessionStore((s) => s.getDashboardStats);
  const sessions = useSessionStore((s) => s.sessions);

  const stats = getDashboardStats(user?.id ?? '');
  const activeSessions = sessions.filter((s) => s.status === 'active' && s.userId === user?.id);

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace('/');
  };

  const handleNewSession = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-session');
  };

  const handleViewSessions = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/sessions');
  };

  const statCards = [
    {
      label: 'Total Scanned',
      value: stats.totalScanned,
      icon: Scan,
      color: '#3B82F6',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Verified',
      value: stats.totalVerified,
      icon: CheckCircle2,
      color: '#22C55E',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'Racks Finished',
      value: stats.totalRacksFinished,
      icon: Package,
      color: '#A855F7',
      bgColor: 'bg-purple-500/20',
    },
  ];

  const varianceCards = [
    {
      label: 'Short Items',
      value: stats.shortItems,
      icon: TrendingDown,
      color: '#EF4444',
      bgColor: 'bg-red-500/20',
    },
    {
      label: 'Matched',
      value: stats.matchedItems,
      icon: CheckCircle2,
      color: '#22C55E',
      bgColor: 'bg-green-500/20',
    },
    {
      label: 'Over Items',
      value: stats.overItems,
      icon: TrendingUp,
      color: '#F59E0B',
      bgColor: 'bg-amber-500/20',
    },
  ];

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 pt-4 pb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
                    <User size={24} color="#3B82F6" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-slate-400 text-sm">Welcome back,</Text>
                    <Text className="text-white font-bold text-lg">{user?.name ?? 'User'}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleLogout}
                  className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center active:opacity-70"
                >
                  <LogOut size={20} color="#EF4444" />
                </Pressable>
              </View>
            </View>

            {/* Stats Grid */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="px-6 mb-6"
            >
              <Text className="text-white font-semibold text-lg mb-3">Overview</Text>
              <View className="flex-row flex-wrap gap-3">
                {statCards.map((card, index) => (
                  <View
                    key={card.label}
                    className={cn('flex-1 min-w-[100px] rounded-2xl p-4', card.bgColor)}
                  >
                    <card.icon size={24} color={card.color} />
                    <Text className="text-white text-2xl font-bold mt-2">{card.value}</Text>
                    <Text className="text-slate-400 text-xs mt-1">{card.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Variance Stats */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="px-6 mb-6"
            >
              <Text className="text-white font-semibold text-lg mb-3">Variance Summary</Text>
              <View className="flex-row gap-3">
                {varianceCards.map((card) => (
                  <View
                    key={card.label}
                    className={cn('flex-1 rounded-2xl p-4 items-center', card.bgColor)}
                  >
                    <card.icon size={20} color={card.color} />
                    <Text className="text-white text-xl font-bold mt-2">{card.value}</Text>
                    <Text className="text-slate-400 text-xs mt-1 text-center">{card.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(300)}
                className="px-6 mb-6"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">Active Sessions</Text>
                  <Pressable onPress={handleViewSessions}>
                    <Text className="text-blue-400 text-sm">View All</Text>
                  </Pressable>
                </View>
                {activeSessions.slice(0, 2).map((session) => (
                  <Pressable
                    key={session.id}
                    onPress={() => {
                      useSessionStore.getState().setCurrentSession(session);
                      router.push('/scan');
                    }}
                    className="bg-slate-800/50 rounded-2xl p-4 mb-3 flex-row items-center active:opacity-80"
                  >
                    <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center">
                      <ClipboardList size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-white font-medium">
                        {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
                        {session.floor ?? session.area}
                      </Text>
                      <Text className="text-slate-400 text-sm">
                        Rack: {session.rackNo} | Scanned: {session.totalScanned}
                      </Text>
                    </View>
                    <View className="bg-amber-500/20 px-3 py-1 rounded-full">
                      <Text className="text-amber-400 text-xs font-medium">Active</Text>
                    </View>
                  </Pressable>
                ))}
              </Animated.View>
            )}

            {/* Action Buttons */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(400)}
              className="px-6 pb-8"
            >
              <Pressable
                onPress={handleNewSession}
                className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center mb-3 active:opacity-80"
              >
                <Plus size={24} color="#fff" />
                <Text className="text-white font-bold text-lg ml-2">New Session</Text>
              </Pressable>

              <Pressable
                onPress={handleViewSessions}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <ClipboardList size={24} color="#3B82F6" />
                <Text className="text-blue-400 font-bold text-lg ml-2">View Sessions</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
