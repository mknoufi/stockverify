import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Clock,
  Play,
  Search,
  Filter,
  X,
  MapPin,
  Package,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react-native';
import { format } from 'date-fns';
import type { Session } from '@/lib/types';

type FilterType = 'all' | 'active' | 'completed';
type LocationFilter = 'all' | 'showroom' | 'godown';

export default function SessionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession);
  const completeSession = useSessionStore((s) => s.completeSession);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let result = sessions
      .filter((s) => s.userId === user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter((s) => s.locationType === locationFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.rackNo.toLowerCase().includes(query) ||
          s.locationType.toLowerCase().includes(query) ||
          (s.floor?.toLowerCase().includes(query) ?? false) ||
          (s.area?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [sessions, user?.id, statusFilter, locationFilter, searchQuery]);

  const activeSessions = filteredSessions.filter((s) => s.status === 'active');
  const completedSessions = filteredSessions.filter((s) => s.status === 'completed');

  const handleResumeSession = async (sessionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      router.push('/scan');
    }
  };

  const handleFinishSession = async (sessionId: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeSession(sessionId);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setLocationFilter('all');
    setSearchQuery('');
    setShowFilters(false);
  };

  const hasActiveFilters = statusFilter !== 'all' || locationFilter !== 'all' || searchQuery.trim() !== '';

  const SessionCard = ({
    session,
    isActive,
  }: {
    session: Session;
    isActive: boolean;
  }) => (
    <Animated.View
      entering={FadeInRight.duration(300)}
      layout={Layout.springify()}
    >
      <Pressable
        onPress={() => isActive && handleResumeSession(session.id)}
        className={cn(
          'bg-white/5 rounded-2xl p-4 mb-3 border',
          isActive ? 'border-green-500/30' : 'border-white/10'
        )}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <LinearGradient
              colors={isActive ? ['#22C55E', '#16A34A'] : ['#6B7280', '#4B5563']}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isActive ? (
                <Clock size={22} color="#fff" />
              ) : (
                <CheckCircle2 size={22} color="#fff" />
              )}
            </LinearGradient>
            <View className="ml-3 flex-1">
              <Text className="text-white font-semibold text-base">
                {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
                {session.floor ?? session.area}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={12} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">Rack {session.rackNo}</Text>
              </View>
            </View>
          </View>
          <View
            className={cn(
              'px-3 py-1.5 rounded-full flex-row items-center',
              isActive ? 'bg-green-500/20' : 'bg-gray-500/20'
            )}
          >
            {isActive && (
              <View className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
            )}
            <Text
              className={cn(
                'text-xs font-semibold',
                isActive ? 'text-green-400' : 'text-gray-400'
              )}
            >
              {isActive ? 'Active' : 'Done'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-white/5">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm">
              {format(new Date(session.createdAt), 'MMM d, h:mm a')}
            </Text>
            <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
            <View className="flex-row items-center">
              <Package size={12} color="#6B7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {session.totalScanned} items
              </Text>
            </View>
          </View>

          {isActive && (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => handleFinishSession(session.id)}
                className="bg-white/5 px-4 py-2 rounded-xl flex-row items-center border border-white/10 active:opacity-70"
              >
                <CheckCircle2 size={16} color="#22C55E" />
                <Text className="text-green-400 font-medium ml-1.5 text-sm">Done</Text>
              </Pressable>
              <Pressable
                onPress={() => handleResumeSession(session.id)}
                className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center active:opacity-80"
              >
                <Play size={16} color="#fff" />
                <Text className="text-white font-medium ml-1.5 text-sm">Resume</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );

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
                <Text className="text-white font-bold text-xl">Sessions</Text>
                <Text className="text-gray-500 text-sm">
                  {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/create-session')}
                className="bg-blue-500 px-4 py-2.5 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold">+ New</Text>
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <View className="px-5 mb-4">
            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center bg-white/5 rounded-xl px-4 border border-white/10">
                <Search size={18} color="#6B7280" />
                <TextInput
                  placeholder="Search racks, locations..."
                  placeholderTextColor="#6B7280"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 py-3 px-3 text-white"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <X size={18} color="#6B7280" />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFilters(!showFilters);
                }}
                className={cn(
                  'w-12 h-12 rounded-xl items-center justify-center border',
                  showFilters || hasActiveFilters
                    ? 'bg-blue-500/20 border-blue-500/30'
                    : 'bg-white/5 border-white/10'
                )}
              >
                <SlidersHorizontal
                  size={20}
                  color={showFilters || hasActiveFilters ? '#3B82F6' : '#6B7280'}
                />
              </Pressable>
            </View>
          </View>

          {/* Filter Panel */}
          {showFilters && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              className="px-5 mb-4"
            >
              <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
                {/* Status Filter */}
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2">Status</Text>
                  <View className="flex-row gap-2">
                    {(['all', 'active', 'completed'] as FilterType[]).map((filter) => (
                      <Pressable
                        key={filter}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setStatusFilter(filter);
                        }}
                        className={cn(
                          'flex-1 py-2.5 rounded-xl items-center border',
                          statusFilter === filter
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white/5 border-white/10'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-medium text-sm capitalize',
                            statusFilter === filter ? 'text-white' : 'text-gray-400'
                          )}
                        >
                          {filter}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Location Filter */}
                <View className="mb-4">
                  <Text className="text-gray-400 text-sm mb-2">Location</Text>
                  <View className="flex-row gap-2">
                    {(['all', 'showroom', 'godown'] as LocationFilter[]).map((filter) => (
                      <Pressable
                        key={filter}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLocationFilter(filter);
                        }}
                        className={cn(
                          'flex-1 py-2.5 rounded-xl items-center border',
                          locationFilter === filter
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white/5 border-white/10'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-medium text-sm capitalize',
                            locationFilter === filter ? 'text-white' : 'text-gray-400'
                          )}
                        >
                          {filter}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Pressable
                    onPress={clearFilters}
                    className="flex-row items-center justify-center py-2"
                  >
                    <X size={16} color="#EF4444" />
                    <Text className="text-red-400 font-medium ml-1">Clear Filters</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}

          <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  <Text className="text-white font-semibold text-lg">
                    Active ({activeSessions.length})
                  </Text>
                </View>
                {activeSessions.map((session) => (
                  <SessionCard key={session.id} session={session} isActive />
                ))}
              </View>
            )}

            {/* Completed Sessions */}
            {completedSessions.length > 0 && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-2 h-2 rounded-full bg-gray-500 mr-2" />
                  <Text className="text-white font-semibold text-lg">
                    Completed ({completedSessions.length})
                  </Text>
                </View>
                {completedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} isActive={false} />
                ))}
              </View>
            )}

            {/* Empty State */}
            {filteredSessions.length === 0 && (
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="flex-1 items-center justify-center py-20"
              >
                <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
                  <ClipboardList size={40} color="#4B5563" />
                </View>
                <Text className="text-white font-semibold text-lg">
                  {hasActiveFilters ? 'No Matching Sessions' : 'No Sessions Yet'}
                </Text>
                <Text className="text-gray-500 text-center mt-2 px-8">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to find sessions'
                    : 'Start a new session to begin stock verification'}
                </Text>
                {hasActiveFilters ? (
                  <Pressable
                    onPress={clearFilters}
                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl mt-6 active:opacity-80"
                  >
                    <Text className="text-white font-semibold">Clear Filters</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => router.push('/create-session')}
                    className="bg-blue-500 px-6 py-3 rounded-xl mt-6 active:opacity-80"
                  >
                    <Text className="text-white font-semibold">Create Session</Text>
                  </Pressable>
                )}
              </Animated.View>
            )}

            <View className="h-8" />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
