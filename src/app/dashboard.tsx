import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
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
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Activity,
  Layers,
  Calendar,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Award,
} from 'lucide-react-native';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getDashboardStats = useSessionStore((s) => s.getDashboardStats);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);

  const stats = getDashboardStats(user?.id ?? '');
  const activeSessions = sessions.filter((s) => s.status === 'active' && s.userId === user?.id);
  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.userId === user?.id);

  // Calculate accuracy rate
  const accuracyRate = stats.totalScanned > 0
    ? Math.round((stats.matchedItems / stats.totalScanned) * 100)
    : 0;

  // Today's stats
  const today = new Date().toDateString();
  const todayEntries = entries.filter(
    (e) => new Date(e.createdAt).toDateString() === today &&
    sessions.some((s) => s.id === e.sessionId && s.userId === user?.id)
  );

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

  const handleViewReports = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/reports');
  };

  const handleViewAnalytics = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/analytics');
  };

  // Quick action cards
  const quickActions = [
    {
      label: 'New Session',
      icon: Plus,
      color: '#3B82F6',
      bgColor: '#3B82F6',
      onPress: handleNewSession,
      primary: true,
    },
    {
      label: 'Sessions',
      icon: ClipboardList,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      onPress: handleViewSessions,
    },
    {
      label: 'Reports',
      icon: FileText,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      onPress: handleViewReports,
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      onPress: handleViewAnalytics,
    },
  ];

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient
        colors={['#0A0F1C', '#111827', '#0A0F1C']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="px-5 pt-2 pb-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={24} color="#fff" />
                  </LinearGradient>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider">Welcome back</Text>
                    <Text className="text-white font-bold text-xl" numberOfLines={1}>
                      {user?.name ?? 'Admin'}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    className="w-11 h-11 rounded-xl bg-white/5 items-center justify-center border border-white/10"
                  >
                    <Bell size={20} color="#9CA3AF" />
                  </Pressable>
                  <Pressable
                    onPress={handleLogout}
                    className="w-11 h-11 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20 active:opacity-70"
                  >
                    <LogOut size={20} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            {/* Today's Summary Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="px-5 mb-5"
            >
              <LinearGradient
                colors={['#1E3A5F', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 20 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Calendar size={18} color="#60A5FA" />
                    <Text className="text-blue-400 font-medium ml-2">
                      {format(new Date(), 'EEEE, MMM d')}
                    </Text>
                  </View>
                  <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                    <Text className="text-blue-400 text-xs font-medium">Today</Text>
                  </View>
                </View>

                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className="text-gray-400 text-sm mb-1">Items Scanned</Text>
                    <Text className="text-white text-4xl font-bold">{todayEntries.length}</Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center">
                      <Activity size={16} color="#22C55E" />
                      <Text className="text-green-400 font-semibold ml-1">{accuracyRate}%</Text>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">Accuracy Rate</Text>
                  </View>
                </View>

                {/* Mini Stats Row */}
                <View className="flex-row mt-5 pt-4 border-t border-white/10">
                  <View className="flex-1 items-center">
                    <Text className="text-green-400 font-bold text-lg">{activeSessions.length}</Text>
                    <Text className="text-gray-500 text-xs">Active</Text>
                  </View>
                  <View className="w-px bg-white/10" />
                  <View className="flex-1 items-center">
                    <Text className="text-blue-400 font-bold text-lg">{completedSessions.length}</Text>
                    <Text className="text-gray-500 text-xs">Completed</Text>
                  </View>
                  <View className="w-px bg-white/10" />
                  <View className="flex-1 items-center">
                    <Text className="text-purple-400 font-bold text-lg">{stats.totalRacksFinished}</Text>
                    <Text className="text-gray-500 text-xs">Racks</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Quick Actions</Text>
              <View className="flex-row flex-wrap gap-3">
                {quickActions.map((action, index) => (
                  <Pressable
                    key={action.label}
                    onPress={action.onPress}
                    className={cn(
                      'rounded-2xl p-4 active:opacity-80',
                      action.primary ? 'flex-1 min-w-[48%]' : 'flex-1 min-w-[28%]'
                    )}
                    style={{
                      backgroundColor: action.primary ? action.bgColor : action.bgColor,
                    }}
                  >
                    <View
                      className={cn(
                        'w-10 h-10 rounded-xl items-center justify-center mb-2',
                        action.primary ? 'bg-white/20' : 'bg-white/10'
                      )}
                    >
                      <action.icon size={22} color={action.primary ? '#fff' : action.color} />
                    </View>
                    <Text
                      className={cn(
                        'font-semibold',
                        action.primary ? 'text-white' : 'text-white/90'
                      )}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Stats Overview */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="px-5 mb-5"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold text-lg">Overview</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm mr-1">All Time</Text>
                  <ChevronRight size={16} color="#6B7280" />
                </View>
              </View>

              <View className="flex-row gap-3">
                {/* Total Scanned */}
                <View className="flex-1 bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-blue-500/20 items-center justify-center">
                      <Scan size={18} color="#3B82F6" />
                    </View>
                    <Zap size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{stats.totalScanned}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Total Scanned</Text>
                </View>

                {/* Verified */}
                <View className="flex-1 bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-green-500/20 items-center justify-center">
                      <CheckCircle2 size={18} color="#22C55E" />
                    </View>
                    <Target size={14} color="#22C55E" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{stats.totalVerified}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Verified</Text>
                </View>

                {/* Racks */}
                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-purple-500/20 items-center justify-center">
                      <Layers size={18} color="#A855F7" />
                    </View>
                    <Award size={14} color="#A855F7" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{stats.totalRacksFinished}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Racks Done</Text>
                </View>
              </View>
            </Animated.View>

            {/* Variance Analysis */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(400)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Variance Analysis</Text>
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-center justify-between mb-4">
                  {/* Matched - Center */}
                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-green-500/20 items-center justify-center mb-2">
                      <CheckCircle2 size={28} color="#22C55E" />
                    </View>
                    <Text className="text-white text-xl font-bold">{stats.matchedItems}</Text>
                    <Text className="text-green-400 text-xs font-medium">Matched</Text>
                  </View>

                  {/* Short */}
                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-red-500/20 items-center justify-center mb-2">
                      <TrendingDown size={28} color="#EF4444" />
                    </View>
                    <Text className="text-white text-xl font-bold">{stats.shortItems}</Text>
                    <Text className="text-red-400 text-xs font-medium">Short</Text>
                  </View>

                  {/* Over */}
                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-amber-500/20 items-center justify-center mb-2">
                      <TrendingUp size={28} color="#F59E0B" />
                    </View>
                    <Text className="text-white text-xl font-bold">{stats.overItems}</Text>
                    <Text className="text-amber-400 text-xs font-medium">Over</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2 bg-gray-800 rounded-full overflow-hidden flex-row">
                  {stats.totalScanned > 0 && (
                    <>
                      <View
                        className="h-full bg-green-500"
                        style={{ width: `${(stats.matchedItems / stats.totalScanned) * 100}%` }}
                      />
                      <View
                        className="h-full bg-red-500"
                        style={{ width: `${(stats.shortItems / stats.totalScanned) * 100}%` }}
                      />
                      <View
                        className="h-full bg-amber-500"
                        style={{ width: `${(stats.overItems / stats.totalScanned) * 100}%` }}
                      />
                    </>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(500)}
                className="px-5 mb-5"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">Active Sessions</Text>
                  <Pressable onPress={handleViewSessions} className="flex-row items-center">
                    <Text className="text-blue-400 text-sm mr-1">View All</Text>
                    <ChevronRight size={16} color="#60A5FA" />
                  </Pressable>
                </View>
                {activeSessions.slice(0, 2).map((session, index) => (
                  <Pressable
                    key={session.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      useSessionStore.getState().setCurrentSession(session);
                      router.push('/scan');
                    }}
                    className="bg-white/5 rounded-2xl p-4 mb-3 border border-white/10 active:opacity-80"
                  >
                    <View className="flex-row items-center">
                      <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ClipboardList size={22} color="#fff" />
                      </LinearGradient>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-semibold text-base">
                          {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
                          {session.floor ?? session.area}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-500 text-sm">
                            Rack {session.rackNo}
                          </Text>
                          <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                          <Text className="text-gray-500 text-sm">
                            {session.totalScanned} items
                          </Text>
                        </View>
                      </View>
                      <View className="bg-green-500/20 px-3 py-1.5 rounded-full flex-row items-center">
                        <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
                        <Text className="text-green-400 text-xs font-semibold">Live</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </Animated.View>
            )}

            {/* Recent Activity */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(600)}
              className="px-5 pb-8"
            >
              <Text className="text-white font-semibold text-lg mb-3">Recent Activity</Text>
              <View className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                {entries.slice(-3).reverse().map((entry, index) => {
                  const session = sessions.find((s) => s.id === entry.sessionId);
                  if (!session || session.userId !== user?.id) return null;

                  return (
                    <View
                      key={entry.id}
                      className={cn(
                        'p-4 flex-row items-center',
                        index < 2 && 'border-b border-white/5'
                      )}
                    >
                      <View
                        className={cn(
                          'w-10 h-10 rounded-xl items-center justify-center',
                          entry.variance === 0
                            ? 'bg-green-500/20'
                            : entry.variance < 0
                            ? 'bg-red-500/20'
                            : 'bg-amber-500/20'
                        )}
                      >
                        {entry.variance === 0 ? (
                          <CheckCircle2 size={20} color="#22C55E" />
                        ) : entry.variance < 0 ? (
                          <TrendingDown size={20} color="#EF4444" />
                        ) : (
                          <TrendingUp size={20} color="#F59E0B" />
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white text-sm font-medium" numberOfLines={1}>
                          Item #{entry.itemBarcode.slice(-6)}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {format(new Date(entry.createdAt), 'h:mm a')} • Rack {session?.rackNo}
                        </Text>
                      </View>
                      <Text
                        className={cn(
                          'font-semibold text-sm',
                          entry.variance === 0
                            ? 'text-green-400'
                            : entry.variance < 0
                            ? 'text-red-400'
                            : 'text-amber-400'
                        )}
                      >
                        {entry.variance === 0
                          ? 'Match'
                          : entry.variance > 0
                          ? `+${entry.variance}`
                          : entry.variance}
                      </Text>
                    </View>
                  );
                })}

                {entries.filter((e) =>
                  sessions.some((s) => s.id === e.sessionId && s.userId === user?.id)
                ).length === 0 && (
                  <View className="p-8 items-center">
                    <Activity size={32} color="#4B5563" />
                    <Text className="text-gray-500 text-sm mt-2">No recent activity</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
