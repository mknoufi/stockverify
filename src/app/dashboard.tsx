import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { LucideIcon } from 'lucide-react-native';
import {
  Scan,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Plus,
  ClipboardList,
  LogOut,
  User,
  BarChart3,
  FileText,
  ChevronRight,
  Activity,
  Layers,
  Calendar,
  Bell,
  Zap,
  Target,
  Award,
  Users,
  Shield,
  Clock,
  UserCheck,
  FileSearch,
  LayoutDashboard,
} from 'lucide-react-native';
import { format } from 'date-fns';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onPress: () => Promise<void>;
  primary?: boolean;
  badge?: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getDashboardStats = useSessionStore((s) => s.getDashboardStats);
  const sessions = useSessionStore((s) => s.sessions);
  const entries = useSessionStore((s) => s.entries);
  const notifications = useSessionStore((s) => s.notifications);

  const userRole = user?.role ?? 'staff';
  const stats = getDashboardStats(user?.id ?? '');

  // Role-specific session filters
  const activeSessions = sessions.filter((s) => s.status === 'active' && s.userId === user?.id);
  const pendingVerificationSessions = sessions.filter((s) => s.status === 'pending_verification');
  const allSessions = sessions;

  // Unread notifications for current user
  const unreadNotifications = notifications.filter((n) => n.userId === user?.id && !n.isRead);

  // Calculate accuracy rate
  const accuracyRate = stats.totalScanned > 0
    ? Math.round((stats.matchedItems / stats.totalScanned) * 100)
    : 0;

  // Today's entries
  const today = new Date().toDateString();
  const todayEntries = entries.filter(
    (e) => new Date(e.createdAt).toDateString() === today &&
    sessions.some((s) => s.id === e.sessionId && (userRole === 'admin' || s.userId === user?.id))
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

  const handleVerifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/supervisor/verifications');
  };

  const handleUserManagement = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin/users');
  };

  const handleSystemSettings = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin/settings');
  };

  const handleAuditLogs = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin/audit-logs');
  };

  const handleAdminDashboard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/admin/dashboard');
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin': return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'supervisor': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
      default: return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
    }
  };

  const roleColors = getRoleBadgeColor();

  // Staff Quick Actions
  const staffActions: QuickAction[] = [
    { label: 'New Session', icon: Plus, color: '#3B82F6', bgColor: '#3B82F6', onPress: handleNewSession, primary: true },
    { label: 'Sessions', icon: ClipboardList, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)', onPress: handleViewSessions },
    { label: 'Reports', icon: FileText, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', onPress: handleViewReports },
    { label: 'Analytics', icon: BarChart3, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)', onPress: handleViewAnalytics },
  ];

  // Supervisor Quick Actions
  const supervisorActions: QuickAction[] = [
    { label: 'Verify', icon: UserCheck, color: '#F59E0B', bgColor: '#F59E0B', onPress: handleVerifications, primary: true, badge: pendingVerificationSessions.length },
    { label: 'Sessions', icon: ClipboardList, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)', onPress: handleViewSessions },
    { label: 'Reports', icon: FileText, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', onPress: handleViewReports },
    { label: 'Analytics', icon: BarChart3, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)', onPress: handleViewAnalytics },
  ];

  // Admin Quick Actions
  const adminActions: QuickAction[] = [
    { label: 'Dashboard', icon: LayoutDashboard, color: '#8B5CF6', bgColor: '#8B5CF6', onPress: handleAdminDashboard, primary: true },
    { label: 'Users', icon: Users, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', onPress: handleUserManagement },
    { label: 'Verify', icon: UserCheck, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)', onPress: handleVerifications, badge: pendingVerificationSessions.length },
    { label: 'Reports', icon: FileText, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)', onPress: handleViewReports },
  ];

  const quickActions = userRole === 'admin' ? adminActions : userRole === 'supervisor' ? supervisorActions : staffActions;

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient
        colors={['#0A0F1C', '#111827', '#0A0F1C']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Offline Banner */}
            <OfflineBanner />

            {/* Header */}
            <Animated.View
              entering={FadeInDown.duration(400)}
              className="px-5 pt-2 pb-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <LinearGradient
                    colors={userRole === 'admin' ? ['#8B5CF6', '#A855F7'] : userRole === 'supervisor' ? ['#F59E0B', '#D97706'] : ['#3B82F6', '#8B5CF6']}
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
                    {userRole === 'admin' ? <Shield size={24} color="#fff" /> : userRole === 'supervisor' ? <UserCheck size={24} color="#fff" /> : <User size={24} color="#fff" />}
                  </LinearGradient>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 text-xs uppercase tracking-wider">Welcome back</Text>
                      <View className={cn('ml-2 px-2 py-0.5 rounded-full', roleColors.bg, roleColors.border, 'border')}>
                        <Text className={cn('text-[10px] font-semibold uppercase', roleColors.text)}>{userRole}</Text>
                      </View>
                    </View>
                    <Text className="text-white font-bold text-xl" numberOfLines={1}>
                      {user?.name ?? 'User'}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable className="w-11 h-11 rounded-xl bg-white/5 items-center justify-center border border-white/10 relative">
                    <Bell size={20} color="#9CA3AF" />
                    {unreadNotifications.length > 0 && (
                      <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">{unreadNotifications.length}</Text>
                      </View>
                    )}
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

            {/* Role-specific Summary Card */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="px-5 mb-5"
            >
              <LinearGradient
                colors={userRole === 'admin' ? ['#4C1D95', '#1E293B'] : userRole === 'supervisor' ? ['#78350F', '#1E293B'] : ['#1E3A5F', '#1E293B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 20 }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Calendar size={18} color={userRole === 'admin' ? '#A855F7' : userRole === 'supervisor' ? '#F59E0B' : '#60A5FA'} />
                    <Text className={cn('font-medium ml-2', userRole === 'admin' ? 'text-purple-400' : userRole === 'supervisor' ? 'text-amber-400' : 'text-blue-400')}>
                      {format(new Date(), 'EEEE, MMM d')}
                    </Text>
                  </View>
                  <View className={cn('px-3 py-1 rounded-full', userRole === 'admin' ? 'bg-purple-500/20' : userRole === 'supervisor' ? 'bg-amber-500/20' : 'bg-blue-500/20')}>
                    <Text className={cn('text-xs font-medium', userRole === 'admin' ? 'text-purple-400' : userRole === 'supervisor' ? 'text-amber-400' : 'text-blue-400')}>Today</Text>
                  </View>
                </View>

                {/* Role-specific stats */}
                {userRole === 'staff' && (
                  <>
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
                    <View className="flex-row mt-5 pt-4 border-t border-white/10">
                      <View className="flex-1 items-center">
                        <Text className="text-green-400 font-bold text-lg">{activeSessions.length}</Text>
                        <Text className="text-gray-500 text-xs">Active</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-blue-400 font-bold text-lg">{stats.pendingVerification}</Text>
                        <Text className="text-gray-500 text-xs">Pending</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-purple-400 font-bold text-lg">{stats.totalRacksFinished}</Text>
                        <Text className="text-gray-500 text-xs">Racks</Text>
                      </View>
                    </View>
                  </>
                )}

                {userRole === 'supervisor' && (
                  <>
                    <View className="flex-row items-end justify-between">
                      <View>
                        <Text className="text-gray-400 text-sm mb-1">Pending Verifications</Text>
                        <Text className="text-white text-4xl font-bold">{pendingVerificationSessions.length}</Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <CheckCircle2 size={16} color="#22C55E" />
                          <Text className="text-green-400 font-semibold ml-1">{entries.filter(e => e.status === 'verified').length}</Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Verified Today</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-5 pt-4 border-t border-white/10">
                      <View className="flex-1 items-center">
                        <Text className="text-amber-400 font-bold text-lg">{pendingVerificationSessions.length}</Text>
                        <Text className="text-gray-500 text-xs">Awaiting</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-green-400 font-bold text-lg">{sessions.filter(s => s.status === 'verified').length}</Text>
                        <Text className="text-gray-500 text-xs">Approved</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-red-400 font-bold text-lg">{sessions.filter(s => s.status === 'rejected').length}</Text>
                        <Text className="text-gray-500 text-xs">Rejected</Text>
                      </View>
                    </View>
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <View className="flex-row items-end justify-between">
                      <View>
                        <Text className="text-gray-400 text-sm mb-1">Total Sessions</Text>
                        <Text className="text-white text-4xl font-bold">{allSessions.length}</Text>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Users size={16} color="#A855F7" />
                          <Text className="text-purple-400 font-semibold ml-1">{new Set(sessions.map(s => s.userId)).size}</Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">Active Users</Text>
                      </View>
                    </View>
                    <View className="flex-row mt-5 pt-4 border-t border-white/10">
                      <View className="flex-1 items-center">
                        <Text className="text-green-400 font-bold text-lg">{sessions.filter(s => s.status === 'active').length}</Text>
                        <Text className="text-gray-500 text-xs">Active</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-amber-400 font-bold text-lg">{pendingVerificationSessions.length}</Text>
                        <Text className="text-gray-500 text-xs">Pending</Text>
                      </View>
                      <View className="w-px bg-white/10" />
                      <View className="flex-1 items-center">
                        <Text className="text-blue-400 font-bold text-lg">{sessions.filter(s => s.status === 'completed').length}</Text>
                        <Text className="text-gray-500 text-xs">Completed</Text>
                      </View>
                    </View>
                  </>
                )}
              </LinearGradient>
            </Animated.View>

            {/* Quick Actions */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="px-5 mb-5"
            >
              <Text className="text-white font-semibold text-lg mb-3">Quick Actions</Text>
              <View className="flex-row flex-wrap gap-3">
                {quickActions.map((action) => (
                  <Pressable
                    key={action.label}
                    onPress={action.onPress}
                    className={cn(
                      'rounded-2xl p-4 active:opacity-80 relative',
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
                    {action.badge !== undefined && action.badge > 0 && (
                      <View className="absolute top-2 right-2 min-w-[20px] h-5 rounded-full bg-red-500 items-center justify-center px-1">
                        <Text className="text-white text-[10px] font-bold">{action.badge}</Text>
                      </View>
                    )}
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
                <Pressable onPress={handleViewAnalytics} className="flex-row items-center">
                  <Text className="text-gray-500 text-sm mr-1">View All</Text>
                  <ChevronRight size={16} color="#6B7280" />
                </Pressable>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-blue-500/20 items-center justify-center">
                      <Scan size={18} color="#3B82F6" />
                    </View>
                    <Zap size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{userRole === 'admin' ? entries.length : stats.totalScanned}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Total Scanned</Text>
                </View>

                <View className="flex-1 bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-green-500/20 items-center justify-center">
                      <CheckCircle2 size={18} color="#22C55E" />
                    </View>
                    <Target size={14} color="#22C55E" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{userRole === 'admin' ? entries.filter(e => e.status === 'verified').length : stats.totalVerified}</Text>
                  <Text className="text-gray-500 text-xs mt-1">Verified</Text>
                </View>

                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="w-9 h-9 rounded-xl bg-purple-500/20 items-center justify-center">
                      <Layers size={18} color="#A855F7" />
                    </View>
                    <Award size={14} color="#A855F7" />
                  </View>
                  <Text className="text-white text-2xl font-bold">{userRole === 'admin' ? sessions.filter(s => s.status === 'completed').length : stats.totalRacksFinished}</Text>
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
                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-green-500/20 items-center justify-center mb-2">
                      <CheckCircle2 size={28} color="#22C55E" />
                    </View>
                    <Text className="text-white text-xl font-bold">{userRole === 'admin' ? entries.filter(e => e.variance === 0).length : stats.matchedItems}</Text>
                    <Text className="text-green-400 text-xs font-medium">Matched</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-red-500/20 items-center justify-center mb-2">
                      <TrendingDown size={28} color="#EF4444" />
                    </View>
                    <Text className="text-white text-xl font-bold">{userRole === 'admin' ? entries.filter(e => e.variance < 0).length : stats.shortItems}</Text>
                    <Text className="text-red-400 text-xs font-medium">Short</Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="w-14 h-14 rounded-2xl bg-amber-500/20 items-center justify-center mb-2">
                      <TrendingUp size={28} color="#F59E0B" />
                    </View>
                    <Text className="text-white text-xl font-bold">{userRole === 'admin' ? entries.filter(e => e.variance > 0).length : stats.overItems}</Text>
                    <Text className="text-amber-400 text-xs font-medium">Over</Text>
                  </View>
                </View>

                <View className="h-2 bg-gray-800 rounded-full overflow-hidden flex-row">
                  {(userRole === 'admin' ? entries.length : stats.totalScanned) > 0 && (
                    <>
                      <View
                        className="h-full bg-green-500"
                        style={{ width: `${((userRole === 'admin' ? entries.filter(e => e.variance === 0).length : stats.matchedItems) / (userRole === 'admin' ? entries.length : stats.totalScanned)) * 100}%` }}
                      />
                      <View
                        className="h-full bg-red-500"
                        style={{ width: `${((userRole === 'admin' ? entries.filter(e => e.variance < 0).length : stats.shortItems) / (userRole === 'admin' ? entries.length : stats.totalScanned)) * 100}%` }}
                      />
                      <View
                        className="h-full bg-amber-500"
                        style={{ width: `${((userRole === 'admin' ? entries.filter(e => e.variance > 0).length : stats.overItems) / (userRole === 'admin' ? entries.length : stats.totalScanned)) * 100}%` }}
                      />
                    </>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* Pending Verifications for Supervisor/Admin */}
            {(userRole === 'supervisor' || userRole === 'admin') && pendingVerificationSessions.length > 0 && (
              <Animated.View
                entering={FadeInDown.duration(500).delay(500)}
                className="px-5 mb-5"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-white font-semibold text-lg">Pending Verification</Text>
                    <View className="ml-2 w-6 h-6 rounded-full bg-amber-500 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{pendingVerificationSessions.length}</Text>
                    </View>
                  </View>
                  <Pressable onPress={handleVerifications} className="flex-row items-center">
                    <Text className="text-amber-400 text-sm mr-1">Review All</Text>
                    <ChevronRight size={16} color="#F59E0B" />
                  </Pressable>
                </View>
                {pendingVerificationSessions.slice(0, 2).map((session) => (
                  <Pressable
                    key={session.id}
                    onPress={handleVerifications}
                    className="bg-amber-500/10 rounded-2xl p-4 mb-3 border border-amber-500/20 active:opacity-80"
                  >
                    <View className="flex-row items-center">
                      <View className="w-11 h-11 rounded-xl bg-amber-500/20 items-center justify-center">
                        <Clock size={22} color="#F59E0B" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-semibold text-base">
                          {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} - {session.floor ?? session.area}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-500 text-sm">by {session.userName}</Text>
                          <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                          <Text className="text-gray-500 text-sm">{session.totalScanned} items</Text>
                        </View>
                      </View>
                      <View className="bg-amber-500/20 px-3 py-1.5 rounded-full">
                        <Text className="text-amber-400 text-xs font-semibold">Review</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </Animated.View>
            )}

            {/* Active Sessions for Staff */}
            {userRole === 'staff' && activeSessions.length > 0 && (
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
                {activeSessions.slice(0, 2).map((session) => (
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
                          {session.locationType === 'showroom' ? 'Showroom' : 'Godown'} - {session.floor ?? session.area}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-gray-500 text-sm">Rack {session.rackNo}</Text>
                          <View className="w-1 h-1 rounded-full bg-gray-600 mx-2" />
                          <Text className="text-gray-500 text-sm">{session.totalScanned} items</Text>
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
                  if (!session) return null;
                  if (userRole === 'staff' && session.userId !== user?.id) return null;

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
                          {entry.itemName}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {format(new Date(entry.createdAt), 'h:mm a')} • {session.userName}
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
                        {entry.variance === 0 ? 'Match' : entry.variance > 0 ? `+${entry.variance}` : entry.variance}
                      </Text>
                    </View>
                  );
                })}

                {entries.length === 0 && (
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
