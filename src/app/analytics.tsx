import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Package,
  Scan,
  Target,
  Award,
  ChevronDown,
} from 'lucide-react-native';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const { width } = Dimensions.get('window');

type TimeFilter = '7d' | '30d' | 'all';

export default function AnalyticsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  // Filter data based on time
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = new Date(0);
    }

    const userSessions = sessions.filter(
      (s) =>
        s.userId === user?.id &&
        new Date(s.createdAt) >= startDate
    );

    const userEntries = entries.filter((e) =>
      userSessions.some((s) => s.id === e.sessionId)
    );

    return { userSessions, userEntries };
  };

  const { userSessions, userEntries } = getFilteredData();

  // Calculate stats
  const totalScanned = userEntries.length;
  const matchedItems = userEntries.filter((e) => e.variance === 0).length;
  const shortItems = userEntries.filter((e) => e.variance < 0).length;
  const overItems = userEntries.filter((e) => e.variance > 0).length;
  const accuracyRate = totalScanned > 0 ? Math.round((matchedItems / totalScanned) * 100) : 0;
  const completedSessions = userSessions.filter((s) => s.status === 'completed').length;
  const activeSessions = userSessions.filter((s) => s.status === 'active').length;

  // Calculate daily averages
  const daysInPeriod = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
  const avgScannedPerDay = Math.round(totalScanned / daysInPeriod);
  const avgSessionsPerDay = (userSessions.length / daysInPeriod).toFixed(1);

  // Get location breakdown
  const showroomSessions = userSessions.filter((s) => s.locationType === 'showroom').length;
  const godownSessions = userSessions.filter((s) => s.locationType === 'godown').length;

  // Weekly data for chart (simplified bar representation)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayEntries = entries.filter(
      (e) =>
        sessions.some((s) => s.id === e.sessionId && s.userId === user?.id) &&
        isWithinInterval(new Date(e.createdAt), {
          start: startOfDay(date),
          end: endOfDay(date),
        })
    );
    return {
      day: format(date, 'EEE'),
      count: dayEntries.length,
    };
  });

  const maxCount = Math.max(...last7Days.map((d) => d.count), 1);

  const timeFilters: { label: string; value: TimeFilter }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient
        colors={['#0A0F1C', '#111827', '#0A0F1C']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-5 pt-2 pb-4">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-xl">Analytics</Text>
                <Text className="text-gray-500 text-sm">Performance insights</Text>
              </View>
              <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center border border-amber-500/20">
                <BarChart3 size={20} color="#F59E0B" />
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Time Filter */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="px-5 mb-5"
            >
              <View className="flex-row bg-white/5 rounded-xl p-1 border border-white/10">
                {timeFilters.map((filter) => (
                  <Pressable
                    key={filter.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTimeFilter(filter.value);
                    }}
                    className={cn(
                      'flex-1 py-2.5 rounded-lg items-center',
                      timeFilter === filter.value && 'bg-blue-500'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-medium text-sm',
                        timeFilter === filter.value ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            {/* Accuracy Score Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="px-5 mb-5"
            >
              <LinearGradient
                colors={['#065F46', '#064E3B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 20 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Target size={20} color="#34D399" />
                    <Text className="text-emerald-300 font-medium ml-2">Accuracy Score</Text>
                  </View>
                  <Award size={24} color="#34D399" />
                </View>

                <View className="flex-row items-end">
                  <Text className="text-white text-5xl font-bold">{accuracyRate}</Text>
                  <Text className="text-emerald-300 text-2xl font-bold mb-1">%</Text>
                </View>

                <View className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${accuracyRate}%` }}
                  />
                </View>

                <Text className="text-emerald-200/70 text-sm mt-3">
                  {matchedItems} matched out of {totalScanned} scanned items
                </Text>
              </LinearGradient>
            </Animated.View>

            {/* Weekly Activity Chart */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Weekly Activity</Text>
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <View className="flex-row items-end justify-between h-32 mb-2">
                  {last7Days.map((day, index) => (
                    <View key={day.day} className="items-center flex-1">
                      <View
                        className="w-8 rounded-lg bg-blue-500"
                        style={{
                          height: `${Math.max((day.count / maxCount) * 100, 5)}%`,
                          opacity: day.count > 0 ? 1 : 0.3,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View className="flex-row justify-between">
                  {last7Days.map((day) => (
                    <View key={day.day} className="items-center flex-1">
                      <Text className="text-gray-500 text-xs">{day.day}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">{day.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* Stats Grid */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Key Metrics</Text>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1 bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <Scan size={20} color="#3B82F6" />
                  <Text className="text-white text-2xl font-bold mt-3">{totalScanned}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Total Scanned</Text>
                </View>
                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <Package size={20} color="#A855F7" />
                  <Text className="text-white text-2xl font-bold mt-3">{completedSessions}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Sessions Done</Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-cyan-500/10 rounded-2xl p-4 border border-cyan-500/20">
                  <Activity size={20} color="#06B6D4" />
                  <Text className="text-white text-2xl font-bold mt-3">{avgScannedPerDay}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Avg/Day</Text>
                </View>
                <View className="flex-1 bg-pink-500/10 rounded-2xl p-4 border border-pink-500/20">
                  <Clock size={20} color="#EC4899" />
                  <Text className="text-white text-2xl font-bold mt-3">{avgSessionsPerDay}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Sessions/Day</Text>
                </View>
              </View>
            </Animated.View>

            {/* Variance Breakdown */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(400)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Variance Breakdown</Text>
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                {/* Matched */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <CheckCircle2 size={18} color="#22C55E" />
                      <Text className="text-white font-medium ml-2">Matched</Text>
                    </View>
                    <Text className="text-green-400 font-bold">{matchedItems}</Text>
                  </View>
                  <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: totalScanned > 0 ? `${(matchedItems / totalScanned) * 100}%` : '0%' }}
                    />
                  </View>
                </View>

                {/* Short */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <TrendingDown size={18} color="#EF4444" />
                      <Text className="text-white font-medium ml-2">Short</Text>
                    </View>
                    <Text className="text-red-400 font-bold">{shortItems}</Text>
                  </View>
                  <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: totalScanned > 0 ? `${(shortItems / totalScanned) * 100}%` : '0%' }}
                    />
                  </View>
                </View>

                {/* Over */}
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <TrendingUp size={18} color="#F59E0B" />
                      <Text className="text-white font-medium ml-2">Over</Text>
                    </View>
                    <Text className="text-amber-400 font-bold">{overItems}</Text>
                  </View>
                  <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: totalScanned > 0 ? `${(overItems / totalScanned) * 100}%` : '0%' }}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Location Stats */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(500)}
              className="px-5 pb-8"
            >
              <Text className="text-white font-semibold text-lg mb-3">By Location</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-400 text-sm">Showroom</Text>
                    <View className="w-8 h-8 rounded-lg bg-blue-500/20 items-center justify-center">
                      <Package size={16} color="#3B82F6" />
                    </View>
                  </View>
                  <Text className="text-white text-3xl font-bold">{showroomSessions}</Text>
                  <Text className="text-gray-500 text-xs mt-1">sessions</Text>
                </View>
                <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-gray-400 text-sm">Godown</Text>
                    <View className="w-8 h-8 rounded-lg bg-orange-500/20 items-center justify-center">
                      <Package size={16} color="#F97316" />
                    </View>
                  </View>
                  <Text className="text-white text-3xl font-bold">{godownSessions}</Text>
                  <Text className="text-gray-500 text-xs mt-1">sessions</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
