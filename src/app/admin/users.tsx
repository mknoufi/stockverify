import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  User,
  UserCheck,
  Shield,
  Search,
  UserX,
  Edit2,
} from 'lucide-react-native';
import type { UserRole, User as UserType } from '@/lib/types';

export default function UsersScreen() {
  const router = useRouter();
  const users = useSessionStore((s) => s.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const filteredUsers = users.filter((user: UserType) => {
    const matchesSearch = searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return Shield;
      case 'supervisor': return UserCheck;
      default: return User;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return { bg: 'bg-purple-500/20', text: 'text-purple-400', color: '#A855F7' };
      case 'supervisor': return { bg: 'bg-amber-500/20', text: 'text-amber-400', color: '#F59E0B' };
      default: return { bg: 'bg-blue-500/20', text: 'text-blue-400', color: '#3B82F6' };
    }
  };

  const roleFilters: { value: UserRole | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'staff', label: 'Staff' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' },
  ];

  const handleViewUser = async (user: UserType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <View className="flex-1 bg-[#0A0F1C]">
      <LinearGradient colors={['#0A0F1C', '#111827']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-2 pb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                  >
                    <ArrowLeft size={20} color="#fff" />
                  </Pressable>
                  <Text className="text-white font-bold text-xl ml-3">User Management</Text>
                </View>
              </View>
            </Animated.View>

            {/* Search */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="px-5 mb-4">
              <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                <Search size={20} color="#64748B" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search users..."
                  placeholderTextColor="#64748B"
                  className="flex-1 py-3 px-3 text-white"
                />
              </View>
            </Animated.View>

            {/* Role Filters */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)} className="px-5 mb-5">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {roleFilters.map((filter) => (
                  <Pressable
                    key={filter.value}
                    onPress={() => setFilterRole(filter.value)}
                    className={cn(
                      'px-4 py-2 rounded-full mr-2 border',
                      filterRole === filter.value
                        ? 'bg-purple-500 border-purple-500'
                        : 'bg-slate-800 border-slate-700'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-medium',
                        filterRole === filter.value ? 'text-white' : 'text-gray-400'
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
                  <Text className="text-white text-2xl font-bold">
                    {users.filter((u: UserType) => u.role === 'staff').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Staff</Text>
                </View>
                <View className="flex-1 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {users.filter((u: UserType) => u.role === 'supervisor').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Supervisors</Text>
                </View>
                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {users.filter((u: UserType) => u.role === 'admin').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Admins</Text>
                </View>
              </View>
            </Animated.View>

            {/* Users List */}
            <Animated.View entering={FadeInDown.duration(400).delay(250)} className="px-5 pb-8">
              <Text className="text-white font-semibold text-lg mb-3">
                Users ({filteredUsers.length})
              </Text>

              {filteredUsers.map((user: UserType) => {
                const roleColors = getRoleColor(user.role);
                const RoleIcon = getRoleIcon(user.role);

                return (
                  <Pressable
                    key={user.id}
                    onPress={() => handleViewUser(user)}
                    className={cn(
                      'bg-slate-800/50 rounded-2xl p-4 mb-3 border active:opacity-80',
                      user.isActive ? 'border-slate-700/50' : 'border-red-500/30 opacity-60'
                    )}
                  >
                    <View className="flex-row items-center">
                      <View className={cn('w-12 h-12 rounded-xl items-center justify-center', roleColors.bg)}>
                        <RoleIcon size={24} color={roleColors.color} />
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center">
                          <Text className="text-white font-semibold">{user.name}</Text>
                          {!user.isActive && (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20">
                              <Text className="text-red-400 text-[10px] font-semibold">INACTIVE</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-400 text-sm">@{user.username}</Text>
                      </View>
                      <View className={cn('px-3 py-1 rounded-full', roleColors.bg)}>
                        <Text className={cn('text-xs font-semibold capitalize', roleColors.text)}>
                          {user.role}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}

              {filteredUsers.length === 0 && (
                <View className="bg-slate-800/50 rounded-2xl p-8 items-center border border-slate-700/50">
                  <User size={48} color="#64748B" />
                  <Text className="text-white font-semibold text-lg mt-4">No Users Found</Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">
                    Try adjusting your search or filter
                  </Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* User Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 rounded-t-3xl p-6">
            {selectedUser && (
              <>
                <View className="items-center mb-6">
                  <View className={cn('w-20 h-20 rounded-2xl items-center justify-center mb-3', getRoleColor(selectedUser.role).bg)}>
                    {(() => {
                      const RoleIcon = getRoleIcon(selectedUser.role);
                      return <RoleIcon size={40} color={getRoleColor(selectedUser.role).color} />;
                    })()}
                  </View>
                  <Text className="text-white font-bold text-xl">{selectedUser.name}</Text>
                  <Text className="text-gray-400">@{selectedUser.username}</Text>
                  <View className={cn('mt-2 px-4 py-1 rounded-full', getRoleColor(selectedUser.role).bg)}>
                    <Text className={cn('font-semibold capitalize', getRoleColor(selectedUser.role).text)}>
                      {selectedUser.role}
                    </Text>
                  </View>
                </View>

                <View className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Status</Text>
                    <Text className={selectedUser.isActive ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">User ID</Text>
                    <Text className="text-white">{selectedUser.id}</Text>
                  </View>
                  {selectedUser.lastLoginAt && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Last Login</Text>
                      <Text className="text-white">{selectedUser.lastLoginAt}</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                  }}
                  className="bg-slate-800 rounded-xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-semibold">Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
