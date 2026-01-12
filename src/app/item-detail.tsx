import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockItems, useSessionStore } from '@/lib/store';
import type { Item } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Package,
  Barcode,
  Tag,
  Box,
  ChevronRight,
  AlertTriangle,
  Layers,
} from 'lucide-react-native';

export default function ItemDetailScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const currentSession = useSessionStore((s) => s.currentSession);
  const entries = useSessionStore((s) => s.entries);

  const item = mockItems.find((i) => i.id === itemId);

  if (!item) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Item not found</Text>
      </View>
    );
  }

  // Check if already scanned in current session
  const existingEntry = entries.find(
    (e) => e.sessionId === currentSession?.id && e.itemBarcode === item.barcode
  );

  const handleAddEntry = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/entry-form',
      params: { itemId: item.id, barcode: item.barcode },
    });
  };

  const handleVariantEntry = async (barcode: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/entry-form',
      params: { itemId: item.id, barcode },
    });
  };

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    valueColor = 'text-white',
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    valueColor?: string;
  }) => (
    <View className="flex-row items-center py-3 border-b border-slate-700/50">
      <View className="w-10 h-10 rounded-lg bg-slate-800 items-center justify-center">
        <Icon size={20} color="#64748B" />
      </View>
      <Text className="text-slate-400 ml-3 flex-1">{label}</Text>
      <Text className={cn('font-semibold', valueColor)}>{value}</Text>
    </View>
  );

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-4">
              {/* Header */}
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-white font-bold text-xl ml-4">Item Details</Text>
              </View>

              {/* Item Header */}
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="bg-slate-800/50 rounded-2xl p-5 mb-4"
              >
                <View className="flex-row items-start">
                  <View className="w-16 h-16 rounded-xl bg-blue-500/20 items-center justify-center">
                    <Package size={32} color="#3B82F6" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold text-lg" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Barcode size={16} color="#64748B" />
                      <Text className="text-slate-400 ml-2">{item.barcode}</Text>
                    </View>
                  </View>
                </View>

                {item.isSerialized && (
                  <View className="flex-row items-center mt-3 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <AlertTriangle size={16} color="#F59E0B" />
                    <Text className="text-amber-400 text-sm ml-2">
                      Serialized Item - Serial number required
                    </Text>
                  </View>
                )}

                {item.isBundleEnabled && (
                  <View className="flex-row items-center mt-2 bg-purple-500/10 px-3 py-2 rounded-lg">
                    <Layers size={16} color="#A855F7" />
                    <Text className="text-purple-400 text-sm ml-2">
                      Bundle Item - Multiple products included
                    </Text>
                  </View>
                )}
              </Animated.View>

              {/* Existing Entry Warning */}
              {existingEntry && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(50)}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center">
                    <AlertTriangle size={20} color="#F59E0B" />
                    <Text className="text-amber-400 font-medium ml-2">
                      Already scanned in this session
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-sm mt-1">
                    Counted: {existingEntry.countedQty} | Variance:{' '}
                    <Text
                      className={cn(
                        existingEntry.variance < 0
                          ? 'text-red-400'
                          : existingEntry.variance > 0
                            ? 'text-amber-400'
                            : 'text-green-400'
                      )}
                    >
                      {existingEntry.variance > 0 ? '+' : ''}
                      {existingEntry.variance}
                    </Text>
                  </Text>
                </Animated.View>
              )}

              {/* Details */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="bg-slate-800/50 rounded-2xl px-4 mb-4"
              >
                <DetailRow icon={Tag} label="MRP" value={`₹${item.mrp.toLocaleString()}`} />
                <DetailRow
                  icon={Tag}
                  label="Sale Price"
                  value={`₹${item.salePrice.toLocaleString()}`}
                  valueColor="text-green-400"
                />
                <DetailRow
                  icon={Box}
                  label="System Stock"
                  value={`${item.systemStock} ${item.uom}`}
                  valueColor="text-blue-400"
                />
              </Animated.View>

              {/* Variants */}
              {item.variants && item.variants.length > 0 && (
                <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-4">
                  <Text className="text-white font-semibold text-lg mb-3">
                    Same Item - Different Barcodes
                  </Text>
                  {item.variants.map((variant, index) => (
                    <Pressable
                      key={variant.barcode}
                      onPress={() => handleVariantEntry(variant.barcode)}
                      className="bg-slate-800/50 rounded-xl p-4 mb-2 flex-row items-center active:opacity-80"
                    >
                      <View className="w-10 h-10 rounded-lg bg-slate-700 items-center justify-center">
                        <Barcode size={20} color="#64748B" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-white font-medium">{variant.barcode}</Text>
                        <Text className="text-slate-400 text-sm">
                          Stock: {variant.systemStock} {variant.uom}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#64748B" />
                    </Pressable>
                  ))}
                </Animated.View>
              )}

              {/* Add Entry Button */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="pb-8"
              >
                <Pressable
                  onPress={handleAddEntry}
                  className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-bold text-lg">
                    {existingEntry ? 'Add Another Entry' : 'Enter Counted Quantity'}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
