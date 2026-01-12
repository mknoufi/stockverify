import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Clock,
  Play,
  Trash2,
} from 'lucide-react-native';
import { format } from 'date-fns';

export default function SessionsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sessions = useSessionStore((s) => s.sessions);
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession);
  const completeSession = useSessionStore((s) => s.completeSession);

  const userSessions = sessions
    .filter((s) => s.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeSessions = userSessions.filter((s) => s.status === 'active');
  const completedSessions = userSessions.filter((s) => s.status === 'completed');

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

  const SessionCard = ({
    session,
    isActive,
  }: {
    session: (typeof sessions)[0];
    isActive: boolean;
  }) => (
    <View className="bg-slate-800/50 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className={cn(
              'w-10 h-10 rounded-xl items-center justify-center',
              isActive ? 'bg-amber-500/20' : 'bg-green-500/20'
            )}
          >
            {isActive ? (
              <Clock size={20} color="#F59E0B" />
            ) : (
              <CheckCircle2 size={20} color="#22C55E" />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold">
              {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
              {session.floor ?? session.area}
            </Text>
            <Text className="text-slate-400 text-sm">Rack: {session.rackNo}</Text>
          </View>
        </View>
        <View
          className={cn(
            'px-3 py-1 rounded-full',
            isActive ? 'bg-amber-500/20' : 'bg-green-500/20'
          )}
        >
          <Text
            className={cn(
              'text-xs font-medium',
              isActive ? 'text-amber-400' : 'text-green-400'
            )}
          >
            {isActive ? 'Active' : 'Completed'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-slate-700 pt-3">
        <View className="flex-row items-center">
          <Text className="text-slate-400 text-sm">
            {format(new Date(session.createdAt), 'MMM d, h:mm a')}
          </Text>
          <View className="w-1 h-1 rounded-full bg-slate-600 mx-2" />
          <Text className="text-slate-400 text-sm">
            {session.totalScanned} scanned
          </Text>
        </View>

        {isActive && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => handleFinishSession(session.id)}
              className="bg-green-500/20 px-4 py-2 rounded-xl flex-row items-center active:opacity-70"
            >
              <CheckCircle2 size={16} color="#22C55E" />
              <Text className="text-green-400 font-medium ml-1 text-sm">Finish</Text>
            </Pressable>
            <Pressable
              onPress={() => handleResumeSession(session.id)}
              className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center active:opacity-80"
            >
              <Play size={16} color="#fff" />
              <Text className="text-white font-medium ml-1 text-sm">Resume</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <Text className="text-white font-bold text-xl ml-4">Sessions</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
                  <Text className="text-white font-semibold text-lg mb-3">
                    Active Sessions ({activeSessions.length})
                  </Text>
                  {activeSessions.map((session) => (
                    <SessionCard key={session.id} session={session} isActive />
                  ))}
                </Animated.View>
              )}

              {/* Completed Sessions */}
              {completedSessions.length > 0 && (
                <Animated.View entering={FadeInDown.duration(400).delay(100)}>
                  <Text className="text-white font-semibold text-lg mb-3">
                    Completed Sessions ({completedSessions.length})
                  </Text>
                  {completedSessions.map((session) => (
                    <SessionCard key={session.id} session={session} isActive={false} />
                  ))}
                </Animated.View>
              )}

              {/* Empty State */}
              {userSessions.length === 0 && (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="flex-1 items-center justify-center py-20"
                >
                  <View className="w-20 h-20 rounded-full bg-slate-800 items-center justify-center mb-4">
                    <ClipboardList size={40} color="#64748B" />
                  </View>
                  <Text className="text-white font-semibold text-lg">No Sessions Yet</Text>
                  <Text className="text-slate-400 text-center mt-2">
                    Start a new session to begin{'\n'}stock verification
                  </Text>
                  <Pressable
                    onPress={() => router.push('/create-session')}
                    className="bg-blue-500 px-6 py-3 rounded-xl mt-6 active:opacity-80"
                  >
                    <Text className="text-white font-semibold">Create Session</Text>
                  </Pressable>
                </Animated.View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
