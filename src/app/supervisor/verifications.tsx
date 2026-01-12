import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore, useUserManagementStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  User,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react-native';
import { format } from 'date-fns';
import type { Session, CountedEntry } from '@/lib/types';

export default function VerificationsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);
  const getSessionEntries = useSessionStore((s) => s.getSessionEntries);
  const verifyEntry = useSessionStore((s) => s.verifyEntry);
  const rejectEntry = useSessionStore((s) => s.rejectEntry);
  const updateSession = useSessionStore((s) => s.updateSession);
  const users = useUserManagementStore((s) => s.users);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CountedEntry | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reassignToUserId, setReassignToUserId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingSessions = sessions.filter((s) => s.status === 'pending_verification');
  const staffUsers = users.filter((u) => u.role === 'staff' && u.isActive);

  const filteredSessions = pendingSessions.filter((session) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.rackNo.toLowerCase().includes(query) ||
        session.userName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleVerifyEntry = async (entry: CountedEntry) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    verifyEntry(entry.id, user?.id ?? '');
  };

  const handleRejectEntry = async () => {
    if (!selectedEntry || !rejectReason.trim()) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    rejectEntry(selectedEntry.id, user?.id ?? '', rejectReason, reassignToUserId ?? undefined);
    setShowRejectModal(false);
    setRejectReason('');
    setReassignToUserId(null);
    setSelectedEntry(null);
  };

  const handleApproveSession = async (session: Session) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSession(session.id, {
      status: 'verified',
      verifiedBy: user?.id,
      verifiedAt: new Date().toISOString(),
    });
    setSelectedSession(null);
  };

  const handleRejectSession = async (session: Session) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    updateSession(session.id, {
      status: 'rejected',
      verifiedBy: user?.id,
      verifiedAt: new Date().toISOString(),
      rejectionReason: 'Requires re-verification',
    });
    setSelectedSession(null);
  };

  const getVarianceStats = (sessionId: string) => {
    const sessionEntries = getSessionEntries(sessionId);
    return {
      total: sessionEntries.length,
      matched: sessionEntries.filter((e) => e.variance === 0).length,
      short: sessionEntries.filter((e) => e.variance < 0).length,
      over: sessionEntries.filter((e) => e.variance > 0).length,
      pending: sessionEntries.filter((e) => e.status === 'pending').length,
      verified: sessionEntries.filter((e) => e.status === 'verified').length,
    };
  };

  if (selectedSession) {
    const sessionEntries = getSessionEntries(selectedSession.id);
    const stats = getVarianceStats(selectedSession.id);

    return (
      <View className="flex-1 bg-[#0A0F1C]">
        <LinearGradient colors={['#0A0F1C', '#111827']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="px-5 pt-2 pb-4 flex-row items-center">
                <Pressable
                  onPress={() => setSelectedSession(null)}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold text-xl">Session Review</Text>
                  <Text className="text-gray-400 text-sm">
                    {selectedSession.locationType === 'showroom' ? 'Showroom' : 'Godown'} - Rack {selectedSession.rackNo}
                  </Text>
                </View>
              </View>

              {/* Session Info */}
              <Animated.View entering={FadeInDown.duration(400)} className="px-5 mb-4">
                <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center">
                      <User size={20} color="#3B82F6" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-white font-semibold">{selectedSession.userName}</Text>
                      <Text className="text-gray-400 text-sm">
                        {format(new Date(selectedSession.createdAt), 'MMM d, h:mm a')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-green-500/10 rounded-xl p-3 items-center">
                      <Text className="text-green-400 font-bold text-lg">{stats.matched}</Text>
                      <Text className="text-gray-500 text-xs">Matched</Text>
                    </View>
                    <View className="flex-1 bg-red-500/10 rounded-xl p-3 items-center">
                      <Text className="text-red-400 font-bold text-lg">{stats.short}</Text>
                      <Text className="text-gray-500 text-xs">Short</Text>
                    </View>
                    <View className="flex-1 bg-amber-500/10 rounded-xl p-3 items-center">
                      <Text className="text-amber-400 font-bold text-lg">{stats.over}</Text>
                      <Text className="text-gray-500 text-xs">Over</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Entries List */}
              <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-4">
                <Text className="text-white font-semibold text-lg mb-3">
                  Items ({sessionEntries.length})
                </Text>
                {sessionEntries.map((entry, index) => (
                  <Pressable
                    key={entry.id}
                    className={cn(
                      'bg-slate-800/50 rounded-2xl p-4 mb-3 border',
                      entry.status === 'verified' ? 'border-green-500/30' :
                      entry.status === 'rejected' || entry.status === 'recount_required' ? 'border-red-500/30' :
                      'border-slate-700/50'
                    )}
                  >
                    <View className="flex-row items-center mb-3">
                      <View className={cn(
                        'w-10 h-10 rounded-xl items-center justify-center',
                        entry.variance === 0 ? 'bg-green-500/20' :
                        entry.variance < 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
                      )}>
                        {entry.variance === 0 ? (
                          <CheckCircle2 size={20} color="#22C55E" />
                        ) : entry.variance < 0 ? (
                          <TrendingDown size={20} color="#EF4444" />
                        ) : (
                          <TrendingUp size={20} color="#F59E0B" />
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-white font-medium" numberOfLines={1}>
                          {entry.itemName}
                        </Text>
                        <Text className="text-gray-400 text-sm">{entry.itemBarcode}</Text>
                      </View>
                      <View className={cn(
                        'px-3 py-1 rounded-full',
                        entry.status === 'verified' ? 'bg-green-500/20' :
                        entry.status === 'rejected' || entry.status === 'recount_required' ? 'bg-red-500/20' :
                        'bg-amber-500/20'
                      )}>
                        <Text className={cn(
                          'text-xs font-semibold capitalize',
                          entry.status === 'verified' ? 'text-green-400' :
                          entry.status === 'rejected' || entry.status === 'recount_required' ? 'text-red-400' :
                          'text-amber-400'
                        )}>
                          {entry.status === 'recount_required' ? 'Recount' : entry.status}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between py-2 border-t border-slate-700/50">
                      <View className="items-center flex-1">
                        <Text className="text-gray-500 text-xs">System</Text>
                        <Text className="text-white font-semibold">{entry.systemStock}</Text>
                      </View>
                      <View className="w-px bg-slate-700" />
                      <View className="items-center flex-1">
                        <Text className="text-gray-500 text-xs">Counted</Text>
                        <Text className="text-blue-400 font-semibold">{entry.countedQty}</Text>
                      </View>
                      <View className="w-px bg-slate-700" />
                      <View className="items-center flex-1">
                        <Text className="text-gray-500 text-xs">Variance</Text>
                        <Text className={cn(
                          'font-semibold',
                          entry.variance === 0 ? 'text-green-400' :
                          entry.variance < 0 ? 'text-red-400' : 'text-amber-400'
                        )}>
                          {entry.variance > 0 ? '+' : ''}{entry.variance}
                        </Text>
                      </View>
                    </View>

                    {entry.status === 'pending' && (
                      <View className="flex-row gap-2 mt-3">
                        <Pressable
                          onPress={() => handleVerifyEntry(entry)}
                          className="flex-1 bg-green-500 rounded-xl py-2.5 items-center active:opacity-80"
                        >
                          <Text className="text-white font-semibold">Approve</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            setSelectedEntry(entry);
                            setShowRejectModal(true);
                          }}
                          className="flex-1 bg-red-500/20 rounded-xl py-2.5 items-center border border-red-500/30 active:opacity-80"
                        >
                          <Text className="text-red-400 font-semibold">Reject</Text>
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                ))}
              </Animated.View>

              {/* Session Actions */}
              <Animated.View entering={FadeInUp.duration(400).delay(200)} className="px-5 pb-8">
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => handleRejectSession(selectedSession)}
                    className="flex-1 bg-red-500/20 rounded-2xl py-4 items-center border border-red-500/30 active:opacity-80"
                  >
                    <Text className="text-red-400 font-bold text-lg">Reject All</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleApproveSession(selectedSession)}
                    className="flex-1 bg-green-500 rounded-2xl py-4 items-center active:opacity-80"
                  >
                    <Text className="text-white font-bold text-lg">Approve All</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        {/* Reject Modal */}
        <Modal
          visible={showRejectModal}
          transparent
          animationType="slide"
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-slate-900 rounded-t-3xl p-6">
              <Text className="text-white font-bold text-xl mb-4">Reject Entry</Text>

              <Text className="text-gray-400 text-sm mb-2">Reason for rejection *</Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Enter reason..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                className="bg-slate-800 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
                style={{ textAlignVertical: 'top', minHeight: 80 }}
              />

              <Text className="text-gray-400 text-sm mb-2">Reassign to (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <Pressable
                  onPress={() => setReassignToUserId(null)}
                  className={cn(
                    'px-4 py-2 rounded-full mr-2 border',
                    !reassignToUserId ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-700'
                  )}
                >
                  <Text className={cn('font-medium', !reassignToUserId ? 'text-white' : 'text-gray-400')}>
                    Same Staff
                  </Text>
                </Pressable>
                {staffUsers.map((staff) => (
                  <Pressable
                    key={staff.id}
                    onPress={() => setReassignToUserId(staff.id)}
                    className={cn(
                      'px-4 py-2 rounded-full mr-2 border',
                      reassignToUserId === staff.id ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-700'
                    )}
                  >
                    <Text className={cn('font-medium', reassignToUserId === staff.id ? 'text-white' : 'text-gray-400')}>
                      {staff.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedEntry(null);
                  }}
                  className="flex-1 bg-slate-800 rounded-xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleRejectEntry}
                  className={cn(
                    'flex-1 rounded-xl py-4 items-center active:opacity-80',
                    rejectReason.trim() ? 'bg-red-500' : 'bg-red-500/50'
                  )}
                >
                  <Text className="text-white font-semibold">Reject</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient colors={['#0A0F1C', '#111827']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-2 pb-4">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-white font-bold text-xl ml-3">Verifications</Text>
              </View>
            </Animated.View>

            {/* Search */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-4">
              <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                <Search size={20} color="#64748B" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by rack or staff name..."
                  placeholderTextColor="#64748B"
                  className="flex-1 py-3 px-3 text-white"
                />
              </View>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 mb-5">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                  <View className="w-10 h-10 rounded-xl bg-amber-500/20 items-center justify-center mb-2">
                    <Clock size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{pendingSessions.length}</Text>
                  <Text className="text-gray-500 text-xs">Pending</Text>
                </View>
                <View className="flex-1 bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                  <View className="w-10 h-10 rounded-xl bg-green-500/20 items-center justify-center mb-2">
                    <CheckCircle2 size={20} color="#22C55E" />
                  </View>
                  <Text className="text-white text-2xl font-bold">
                    {sessions.filter((s) => s.status === 'verified').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Verified</Text>
                </View>
                <View className="flex-1 bg-red-500/10 rounded-2xl p-4 border border-red-500/20">
                  <View className="w-10 h-10 rounded-xl bg-red-500/20 items-center justify-center mb-2">
                    <XCircle size={20} color="#EF4444" />
                  </View>
                  <Text className="text-white text-2xl font-bold">
                    {sessions.filter((s) => s.status === 'rejected').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Rejected</Text>
                </View>
              </View>
            </Animated.View>

            {/* Pending Sessions */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 pb-8">
              <Text className="text-white font-semibold text-lg mb-3">
                Pending Sessions ({filteredSessions.length})
              </Text>

              {filteredSessions.length === 0 ? (
                <View className="bg-slate-800/50 rounded-2xl p-8 items-center border border-slate-700/50">
                  <CheckCircle2 size={48} color="#22C55E" />
                  <Text className="text-white font-semibold text-lg mt-4">All caught up!</Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">
                    No sessions pending verification
                  </Text>
                </View>
              ) : (
                filteredSessions.map((session) => {
                  const stats = getVarianceStats(session.id);
                  return (
                    <Pressable
                      key={session.id}
                      onPress={() => setSelectedSession(session)}
                      className="bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/50 active:opacity-80"
                    >
                      <View className="flex-row items-center mb-3">
                        <View className="w-11 h-11 rounded-xl bg-amber-500/20 items-center justify-center">
                          <Clock size={22} color="#F59E0B" />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-white font-semibold">
                            {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} - {session.floor ?? session.area}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <Text className="text-gray-400 text-sm">
                              Rack {session.rackNo}
                            </Text>
                            <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                            <Text className="text-gray-400 text-sm">
                              {session.userName}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color="#64748B" />
                      </View>

                      <View className="flex-row gap-2">
                        <View className="flex-1 bg-slate-900/50 rounded-lg p-2 items-center">
                          <Text className="text-gray-500 text-xs">Items</Text>
                          <Text className="text-white font-semibold">{stats.total}</Text>
                        </View>
                        <View className="flex-1 bg-green-500/10 rounded-lg p-2 items-center">
                          <Text className="text-green-400 text-xs">Match</Text>
                          <Text className="text-green-400 font-semibold">{stats.matched}</Text>
                        </View>
                        <View className="flex-1 bg-red-500/10 rounded-lg p-2 items-center">
                          <Text className="text-red-400 text-xs">Short</Text>
                          <Text className="text-red-400 font-semibold">{stats.short}</Text>
                        </View>
                        <View className="flex-1 bg-amber-500/10 rounded-lg p-2 items-center">
                          <Text className="text-amber-400 text-xs">Over</Text>
                          <Text className="text-amber-400 font-semibold">{stats.over}</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
