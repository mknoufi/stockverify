import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Search,
  FileText,
  User,
  CheckCircle2,
  XCircle,
  Edit2,
  Plus,
  RefreshCw,
  Filter,
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function AuditLogsScreen() {
  const router = useRouter();
  const auditLogs = useSessionStore((s) => s.auditLogs);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Generate audit logs from session and entry activities
  const generatedLogs = [
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      action: s.status === 'completed' ? 'Session Completed' : s.status === 'verified' ? 'Session Verified' : 'Session Created',
      userId: s.userId,
      userName: s.userName,
      details: `${s.locationType} - ${s.floor ?? s.area} - Rack ${s.rackNo}`,
      timestamp: s.verifiedAt ?? s.createdAt,
      type: 'session',
    })),
    ...entries.slice(-20).map((e) => ({
      id: `entry-${e.id}`,
      action: e.status === 'verified' ? 'Entry Verified' : e.status === 'rejected' ? 'Entry Rejected' : 'Entry Created',
      userId: e.verifiedBy ?? '',
      userName: 'Staff',
      details: `${e.itemName} - Variance: ${e.variance}`,
      timestamp: e.verifiedAt ?? e.createdAt,
      type: 'entry',
    })),
    ...auditLogs,
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = generatedLogs.filter((log) => {
    const matchesSearch = searchQuery
      ? log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('Verified') || action.includes('Completed')) return CheckCircle2;
    if (action.includes('Rejected')) return XCircle;
    if (action.includes('Created')) return Plus;
    if (action.includes('Updated') || action.includes('Edit')) return Edit2;
    return FileText;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Verified') || action.includes('Completed')) return { bg: 'bg-green-500/20', color: '#22C55E' };
    if (action.includes('Rejected')) return { bg: 'bg-red-500/20', color: '#EF4444' };
    if (action.includes('Created')) return { bg: 'bg-blue-500/20', color: '#3B82F6' };
    return { bg: 'bg-gray-500/20', color: '#9CA3AF' };
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'session', label: 'Sessions' },
    { value: 'entry', label: 'Entries' },
  ];

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
                <Text className="text-white font-bold text-xl ml-3">Audit Logs</Text>
              </View>
            </Animated.View>

            {/* Search */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-4">
              <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                <Search size={20} color="#64748B" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search logs..."
                  placeholderTextColor="#64748B"
                  className="flex-1 py-3 px-3 text-white"
                />
              </View>
            </Animated.View>

            {/* Filters */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 mb-5">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {filterOptions.map((filter) => (
                  <Pressable
                    key={filter.value}
                    onPress={() => setFilterType(filter.value)}
                    className={cn(
                      'px-4 py-2 rounded-full mr-2 border',
                      filterType === filter.value
                        ? 'bg-green-500 border-green-500'
                        : 'bg-slate-800 border-slate-700'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-medium',
                        filterType === filter.value ? 'text-white' : 'text-gray-400'
                      )}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Stats */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)} className="px-5 mb-5">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <Text className="text-white text-2xl font-bold">{generatedLogs.length}</Text>
                  <Text className="text-gray-500 text-xs">Total Logs</Text>
                </View>
                <View className="flex-1 bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {generatedLogs.filter((l) => l.action.includes('Verified')).length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Verified</Text>
                </View>
                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {generatedLogs.filter((l) => l.type === 'session').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Sessions</Text>
                </View>
              </View>
            </Animated.View>

            {/* Logs List */}
            <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-5 pb-8">
              <Text className="text-white font-semibold text-lg mb-3">
                Activity Log ({filteredLogs.length})
              </Text>

              {filteredLogs.length === 0 ? (
                <View className="bg-slate-800/50 rounded-2xl p-8 items-center border border-slate-700/50">
                  <FileText size={48} color="#4B5563" />
                  <Text className="text-white font-semibold text-lg mt-4">No logs found</Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">
                    Audit logs will appear here as actions are performed
                  </Text>
                </View>
              ) : (
                filteredLogs.slice(0, 50).map((log, index) => {
                  const ActionIcon = getActionIcon(log.action);
                  const colors = getActionColor(log.action);

                  return (
                    <View
                      key={log.id}
                      className={cn(
                        'bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/50',
                        index === 0 && 'border-l-4 border-l-green-500'
                      )}
                    >
                      <View className="flex-row items-start">
                        <View className={cn('w-10 h-10 rounded-xl items-center justify-center', colors.bg)}>
                          <ActionIcon size={20} color={colors.color} />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-white font-semibold">{log.action}</Text>
                          <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                            {log.details}
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <User size={12} color="#64748B" />
                            <Text className="text-gray-500 text-xs ml-1">{log.userName}</Text>
                            <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                            <Text className="text-gray-500 text-xs">
                              {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                            </Text>
                          </View>
                        </View>
                        <View className={cn('px-2 py-1 rounded-full', colors.bg)}>
                          <Text className="text-xs font-medium capitalize" style={{ color: colors.color }}>
                            {log.type}
                          </Text>
                        </View>
                      </View>
                    </View>
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
