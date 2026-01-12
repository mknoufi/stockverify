import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockItems, useSessionStore } from '@/lib/store';
import type { ItemCondition, DateEntryType } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  X,
  CheckCircle2,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';

export default function ConfirmEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemId: string;
    barcode: string;
    countedQty: string;
    variance: string;
    condition: ItemCondition;
    issueDetails: string;
    editedMrp: string;
    mfgDateType: DateEntryType;
    mfgDate: string;
    expiryDateType: DateEntryType;
    expiryDate: string;
    serialNumbers: string;
    remark: string;
    bundleItems: string;
  }>();

  const currentSession = useSessionStore((s) => s.currentSession);
  const addEntry = useSessionStore((s) => s.addEntry);

  const item = mockItems.find((i) => i.id === params.itemId);
  const countedQty = parseInt(params.countedQty ?? '0');
  const variance = parseInt(params.variance ?? '0');
  const serialNumbers: string[] = params.serialNumbers ? JSON.parse(params.serialNumbers) : [];

  const getVarianceIcon = () => {
    if (variance < 0) return TrendingDown;
    if (variance > 0) return TrendingUp;
    return CheckCircle2;
  };

  const getVarianceColor = () => {
    if (variance < 0) return '#EF4444';
    if (variance > 0) return '#F59E0B';
    return '#22C55E';
  };

  const getVarianceBg = () => {
    if (variance < 0) return 'bg-red-500/20';
    if (variance > 0) return 'bg-amber-500/20';
    return 'bg-green-500/20';
  };

  const getVarianceLabel = () => {
    if (variance < 0) return 'SHORT';
    if (variance > 0) return 'OVER';
    return 'MATCHED';
  };

  const handleConfirm = async () => {
    if (!currentSession || !item) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    addEntry({
      sessionId: currentSession.id,
      itemId: item.id,
      itemBarcode: params.barcode ?? item.barcode,
      countedQty,
      variance,
      condition: params.condition ?? 'new',
      issueDetails: params.issueDetails || undefined,
      mrp: item.mrp,
      editedMrp: params.editedMrp ? parseFloat(params.editedMrp) : undefined,
      mfgDateType: params.mfgDateType ?? 'none',
      mfgDate: params.mfgDate || undefined,
      expiryDateType: params.expiryDateType ?? 'none',
      expiryDate: params.expiryDate || undefined,
      serialNumbers: serialNumbers.length > 0 ? serialNumbers : undefined,
      remark: params.remark || undefined,
      bundleItems: params.bundleItems ? JSON.parse(params.bundleItems) : undefined,
    });

    // Go back to scan screen
    router.dismissAll();
    router.replace('/scan');
  };

  const handleCancel = () => {
    router.back();
  };

  const VarianceIcon = getVarianceIcon();

  if (!item) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Item not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1" edges={['bottom']}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-6 pb-8">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Pressable
                  onPress={handleCancel}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <X size={20} color="#fff" />
                </Pressable>
                <Text className="text-white font-bold text-xl">Confirm Entry</Text>
                <View className="w-10" />
              </View>

              {/* Variance Hero */}
              <Animated.View
                entering={FadeInDown.duration(500)}
                className={cn('rounded-3xl p-6 mb-6 items-center', getVarianceBg())}
              >
                <View
                  className={cn(
                    'w-20 h-20 rounded-full items-center justify-center mb-4',
                    variance < 0
                      ? 'bg-red-500/30'
                      : variance > 0
                        ? 'bg-amber-500/30'
                        : 'bg-green-500/30'
                  )}
                >
                  <VarianceIcon size={40} color={getVarianceColor()} />
                </View>
                <Text
                  className={cn(
                    'text-4xl font-bold',
                    variance < 0
                      ? 'text-red-400'
                      : variance > 0
                        ? 'text-amber-400'
                        : 'text-green-400'
                  )}
                >
                  {variance > 0 ? '+' : ''}
                  {variance}
                </Text>
                <Text className="text-slate-400 text-sm mt-1">{getVarianceLabel()}</Text>
              </Animated.View>

              {/* Item Details */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="bg-slate-800/50 rounded-2xl p-4 mb-4"
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-xl bg-blue-500/20 items-center justify-center">
                    <Package size={24} color="#3B82F6" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-white font-semibold" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-slate-400 text-sm">{params.barcode}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between py-3 border-t border-slate-700">
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-xs">System Stock</Text>
                    <Text className="text-white font-bold text-lg">
                      {item.systemStock}
                    </Text>
                  </View>
                  <View className="w-px bg-slate-700" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-xs">Counted</Text>
                    <Text className="text-blue-400 font-bold text-lg">{countedQty}</Text>
                  </View>
                  <View className="w-px bg-slate-700" />
                  <View className="items-center flex-1">
                    <Text className="text-slate-400 text-xs">Variance</Text>
                    <Text
                      className={cn(
                        'font-bold text-lg',
                        variance < 0
                          ? 'text-red-400'
                          : variance > 0
                            ? 'text-amber-400'
                            : 'text-green-400'
                      )}
                    >
                      {variance > 0 ? '+' : ''}
                      {variance}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Entry Details */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(150)}
                className="bg-slate-800/50 rounded-2xl p-4 mb-4"
              >
                <Text className="text-white font-semibold mb-3">Entry Details</Text>

                <View className="space-y-3">
                  <View className="flex-row justify-between py-2 border-b border-slate-700/50">
                    <Text className="text-slate-400">Condition</Text>
                    <View
                      className={cn(
                        'px-3 py-1 rounded-full',
                        params.condition === 'new'
                          ? 'bg-green-500/20'
                          : params.condition === 'aged'
                            ? 'bg-amber-500/20'
                            : 'bg-red-500/20'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-sm font-medium capitalize',
                          params.condition === 'new'
                            ? 'text-green-400'
                            : params.condition === 'aged'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        )}
                      >
                        {params.condition}
                      </Text>
                    </View>
                  </View>

                  {params.issueDetails && (
                    <View className="py-2 border-b border-slate-700/50">
                      <Text className="text-slate-400 text-sm">Issue Details</Text>
                      <Text className="text-white mt-1">{params.issueDetails}</Text>
                    </View>
                  )}

                  {params.editedMrp && (
                    <View className="flex-row justify-between py-2 border-b border-slate-700/50">
                      <Text className="text-slate-400">Edited MRP</Text>
                      <Text className="text-amber-400 font-medium">
                        ₹{parseFloat(params.editedMrp).toLocaleString()}
                      </Text>
                    </View>
                  )}

                  {params.mfgDate && (
                    <View className="flex-row justify-between py-2 border-b border-slate-700/50">
                      <Text className="text-slate-400">Mfg Date</Text>
                      <Text className="text-white">{params.mfgDate}</Text>
                    </View>
                  )}

                  {params.expiryDate && (
                    <View className="flex-row justify-between py-2 border-b border-slate-700/50">
                      <Text className="text-slate-400">Expiry Date</Text>
                      <Text className="text-white">{params.expiryDate}</Text>
                    </View>
                  )}

                  {serialNumbers.length > 0 && (
                    <View className="py-2">
                      <Text className="text-slate-400 text-sm mb-2">
                        Serial Numbers ({serialNumbers.length})
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {serialNumbers.map((serial) => (
                          <View
                            key={serial}
                            className="bg-slate-700 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-white text-sm">{serial}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {params.remark && (
                    <View className="py-2">
                      <Text className="text-slate-400 text-sm">Remark</Text>
                      <Text className="text-white mt-1">{params.remark}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <Animated.View
                entering={FadeInUp.duration(400).delay(200)}
                className="flex-row gap-3"
              >
                <Pressable
                  onPress={handleCancel}
                  className="flex-1 bg-slate-700 rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-bold text-lg">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirm}
                  className="flex-1 bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-bold text-lg">Confirm</Text>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
