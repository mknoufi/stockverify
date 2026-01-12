import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserManagementStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Plus,
  User,
  UserCheck,
  Shield,
  Search,
  MoreVertical,
  UserX,
  Edit2,
  Trash2,
} from 'lucide-react-native';
import type { UserRole } from '@/lib/types';

export default function UsersScreen() {
  const router = useRouter();
  const users = useUserManagementStore((s) => s.users);
  const addUser = useUserManagementStore((s) => s.addUser);
  const updateUser = useUserManagementStore((s) => s.updateUser);
  const deactivateUser = useUserManagementStore((s) => s.deactivateUser);
  const activateUser = useUserManagementStore((s) => s.activateUser);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!newUsername.trim() || !newName.trim()) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUser({
      username: newUsername.trim().toLowerCase(),
      name: newName.trim(),
      role: newRole,
      isActive: true,
    });
    setShowAddModal(false);
    setNewUsername('');
    setNewName('');
    setNewRole('staff');
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive) {
      deactivateUser(userId);
    } else {
      activateUser(userId);
    }
  };

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
                <Pressable
                  onPress={() => setShowAddModal(true)}
                  className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center active:opacity-80"
                >
                  <Plus size={20} color="#fff" />
                </Pressable>
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
                    {users.filter((u) => u.role === 'staff').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Staff</Text>
                </View>
                <View className="flex-1 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {users.filter((u) => u.role === 'supervisor').length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Supervisors</Text>
                </View>
                <View className="flex-1 bg-purple-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <Text className="text-white text-2xl font-bold">
                    {users.filter((u) => u.role === 'admin').length}
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

              {filteredUsers.map((user) => {
                const roleColors = getRoleColor(user.role);
                const RoleIcon = getRoleIcon(user.role);

                return (
                  <View
                    key={user.id}
                    className={cn(
                      'bg-slate-800/50 rounded-2xl p-4 mb-3 border',
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

                    <View className="flex-row gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Pressable
                        onPress={() => handleToggleStatus(user.id, user.isActive)}
                        className={cn(
                          'flex-1 rounded-xl py-2.5 items-center flex-row justify-center',
                          user.isActive ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'
                        )}
                      >
                        {user.isActive ? (
                          <UserX size={16} color="#EF4444" />
                        ) : (
                          <UserCheck size={16} color="#22C55E" />
                        )}
                        <Text className={cn('font-medium ml-2', user.isActive ? 'text-red-400' : 'text-green-400')}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setEditingUser(user.id);
                          setNewUsername(user.username);
                          setNewName(user.name);
                          setNewRole(user.role);
                          setShowAddModal(true);
                        }}
                        className="flex-1 bg-slate-700/50 rounded-xl py-2.5 items-center flex-row justify-center"
                      >
                        <Edit2 size={16} color="#9CA3AF" />
                        <Text className="text-gray-400 font-medium ml-2">Edit</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Add/Edit User Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-slate-900 rounded-t-3xl p-6">
            <Text className="text-white font-bold text-xl mb-6">
              {editingUser ? 'Edit User' : 'Add New User'}
            </Text>

            <Text className="text-gray-400 text-sm mb-2">Username *</Text>
            <TextInput
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter username"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Text className="text-gray-400 text-sm mb-2">Full Name *</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter full name"
              placeholderTextColor="#64748B"
              className="bg-slate-800 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Text className="text-gray-400 text-sm mb-2">Role *</Text>
            <View className="flex-row gap-2 mb-6">
              {(['staff', 'supervisor', 'admin'] as UserRole[]).map((role) => {
                const colors = getRoleColor(role);
                return (
                  <Pressable
                    key={role}
                    onPress={() => setNewRole(role)}
                    className={cn(
                      'flex-1 py-3 rounded-xl items-center border',
                      newRole === role
                        ? `${colors.bg} border-transparent`
                        : 'bg-slate-800 border-slate-700'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-medium capitalize',
                        newRole === role ? colors.text : 'text-gray-400'
                      )}
                    >
                      {role}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  setNewUsername('');
                  setNewName('');
                  setNewRole('staff');
                }}
                className="flex-1 bg-slate-800 rounded-xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (editingUser) {
                    updateUser(editingUser, {
                      username: newUsername.trim().toLowerCase(),
                      name: newName.trim(),
                      role: newRole,
                    });
                    setShowAddModal(false);
                    setEditingUser(null);
                    setNewUsername('');
                    setNewName('');
                    setNewRole('staff');
                  } else {
                    handleAddUser();
                  }
                }}
                className={cn(
                  'flex-1 rounded-xl py-4 items-center active:opacity-80',
                  newUsername.trim() && newName.trim() ? 'bg-purple-500' : 'bg-purple-500/50'
                )}
              >
                <Text className="text-white font-semibold">
                  {editingUser ? 'Update' : 'Add User'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
