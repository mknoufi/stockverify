import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockItems, useSessionStore } from '@/lib/store';
import type { ItemCondition, DateEntryType, BundleItem } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Plus,
  Minus,
  Calendar,
  Hash,
  Camera,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  Layers,
  X,
} from 'lucide-react-native';

type DateType = DateEntryType;

const CONDITIONS: { value: ItemCondition; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-green-500' },
  { value: 'aged', label: 'Aged', color: 'bg-amber-500' },
  { value: 'issue', label: 'Issue', color: 'bg-red-500' },
];

const DATE_TYPES: { value: DateType; label: string }[] = [
  { value: 'none', label: 'Not Required' },
  { value: 'year_only', label: 'Year Only' },
  { value: 'month_year', label: 'Month & Year' },
  { value: 'full_date', label: 'Full Date' },
];

export default function EntryFormScreen() {
  const router = useRouter();
  const { itemId, barcode } = useLocalSearchParams<{ itemId: string; barcode: string }>();
  const currentSession = useSessionStore((s) => s.currentSession);
  const addEntry = useSessionStore((s) => s.addEntry);

  const item = mockItems.find((i) => i.id === itemId);
  const variant = item?.variants?.find((v) => v.barcode === barcode);
  const systemStock = variant?.systemStock ?? item?.systemStock ?? 0;

  const [countedQty, setCountedQty] = useState(0);
  const [condition, setCondition] = useState<ItemCondition>('new');
  const [issueDetails, setIssueDetails] = useState('');
  const [editedMrp, setEditedMrp] = useState('');
  const [mfgDateType, setMfgDateType] = useState<DateType>('none');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDateType, setExpiryDateType] = useState<DateType>('none');
  const [expiryDate, setExpiryDate] = useState('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [currentSerial, setCurrentSerial] = useState('');
  const [remark, setRemark] = useState('');
  const [showMfgDatePicker, setShowMfgDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // Bundle state
  const [isBundled, setIsBundled] = useState(false);
  const [bundleCount, setBundleCount] = useState(2);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

  const variance = countedQty - systemStock;

  const getVarianceColor = () => {
    if (variance < 0) return 'text-red-400';
    if (variance > 0) return 'text-amber-400';
    return 'text-green-400';
  };

  const getVarianceBg = () => {
    if (variance < 0) return 'bg-red-500/20';
    if (variance > 0) return 'bg-amber-500/20';
    return 'bg-green-500/20';
  };

  const handleAddSerial = () => {
    if (currentSerial.trim() && !serialNumbers.includes(currentSerial.trim())) {
      setSerialNumbers([...serialNumbers, currentSerial.trim()]);
      setCurrentSerial('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveSerial = (serial: string) => {
    setSerialNumbers(serialNumbers.filter((s) => s !== serial));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (!currentSession || !item) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Navigate to confirmation screen
    router.push({
      pathname: '/confirm-entry',
      params: {
        itemId: item.id,
        barcode: barcode ?? item.barcode,
        countedQty: countedQty.toString(),
        variance: variance.toString(),
        condition,
        issueDetails: condition === 'issue' ? issueDetails : '',
        editedMrp,
        mfgDateType,
        mfgDate,
        expiryDateType,
        expiryDate,
        serialNumbers: JSON.stringify(serialNumbers),
        remark,
        bundleItems: JSON.stringify(bundleItems),
      },
    });
  };

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
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-6 pt-4 pb-8">
                {/* Header */}
                <View className="flex-row items-center mb-6">
                  <Pressable
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                  >
                    <ArrowLeft size={20} color="#fff" />
                  </Pressable>
                  <View className="ml-4 flex-1">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-slate-400 text-sm">{barcode ?? item.barcode}</Text>
                  </View>
                </View>

                {/* Quantity Counter */}
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="bg-slate-800/50 rounded-2xl p-5 mb-4"
                >
                  <Text className="text-slate-400 text-sm mb-3">Counted Quantity</Text>
                  <View className="flex-row items-center justify-center">
                    <Pressable
                      onPress={() => {
                        if (countedQty > 0) {
                          setCountedQty(countedQty - 1);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      className="w-14 h-14 rounded-full bg-slate-700 items-center justify-center active:opacity-70"
                    >
                      <Minus size={24} color="#fff" />
                    </Pressable>
                    <TextInput
                      value={countedQty.toString()}
                      onChangeText={(v) => setCountedQty(parseInt(v) || 0)}
                      keyboardType="number-pad"
                      className="w-24 text-center text-white text-4xl font-bold mx-4"
                    />
                    <Pressable
                      onPress={() => {
                        setCountedQty(countedQty + 1);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center active:opacity-70"
                    >
                      <Plus size={24} color="#fff" />
                    </Pressable>
                  </View>

                  {/* Variance Display */}
                  <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-700">
                    <View>
                      <Text className="text-slate-400 text-sm">System Stock</Text>
                      <Text className="text-white font-semibold text-lg">
                        {systemStock} {item.uom}
                      </Text>
                    </View>
                    <View className={cn('px-4 py-2 rounded-xl', getVarianceBg())}>
                      <Text className="text-slate-400 text-xs">Variance</Text>
                      <Text className={cn('font-bold text-xl', getVarianceColor())}>
                        {variance > 0 ? '+' : ''}
                        {variance}
                      </Text>
                    </View>
                  </View>
                </Animated.View>

                {/* Condition */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(50)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <Text className="text-slate-400 text-sm mb-3">Item Condition</Text>
                  <View className="flex-row gap-2">
                    {CONDITIONS.map((c) => (
                      <Pressable
                        key={c.value}
                        onPress={() => {
                          setCondition(c.value);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className={cn(
                          'flex-1 py-3 rounded-xl items-center border-2',
                          condition === c.value
                            ? `${c.color} border-transparent`
                            : 'bg-slate-700/50 border-slate-600'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-semibold',
                            condition === c.value ? 'text-white' : 'text-slate-400'
                          )}
                        >
                          {c.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Issue Details */}
                  {condition === 'issue' && (
                    <View className="mt-3">
                      <TextInput
                        value={issueDetails}
                        onChangeText={setIssueDetails}
                        placeholder="Describe the issue..."
                        placeholderTextColor="#64748B"
                        multiline
                        numberOfLines={2}
                        className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                      />
                    </View>
                  )}
                </Animated.View>

                {/* Edit MRP */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(100)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-slate-400 text-sm">Edit MRP (Optional)</Text>
                    <Text className="text-slate-500 text-sm">
                      Current: ₹{item.mrp.toLocaleString()}
                    </Text>
                  </View>
                  <TextInput
                    value={editedMrp}
                    onChangeText={setEditedMrp}
                    placeholder="Enter new MRP if different"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                  />
                </Animated.View>

                {/* Manufacturing Date */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(150)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <Text className="text-slate-400 text-sm mb-3">Manufacturing Date</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                  >
                    <View className="flex-row gap-2">
                      {DATE_TYPES.map((dt) => (
                        <Pressable
                          key={dt.value}
                          onPress={() => {
                            setMfgDateType(dt.value);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg',
                            mfgDateType === dt.value ? 'bg-blue-500' : 'bg-slate-700'
                          )}
                        >
                          <Text
                            className={cn(
                              'text-sm',
                              mfgDateType === dt.value ? 'text-white' : 'text-slate-400'
                            )}
                          >
                            {dt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                  {mfgDateType !== 'none' && (
                    <TextInput
                      value={mfgDate}
                      onChangeText={setMfgDate}
                      placeholder={
                        mfgDateType === 'year_only'
                          ? 'YYYY'
                          : mfgDateType === 'month_year'
                            ? 'MM/YYYY'
                            : 'DD/MM/YYYY'
                      }
                      placeholderTextColor="#64748B"
                      className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mt-3"
                    />
                  )}
                </Animated.View>

                {/* Expiry Date */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(200)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <Text className="text-slate-400 text-sm mb-3">Expiry Date</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                  >
                    <View className="flex-row gap-2">
                      {DATE_TYPES.map((dt) => (
                        <Pressable
                          key={dt.value}
                          onPress={() => {
                            setExpiryDateType(dt.value);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          className={cn(
                            'px-4 py-2 rounded-lg',
                            expiryDateType === dt.value ? 'bg-blue-500' : 'bg-slate-700'
                          )}
                        >
                          <Text
                            className={cn(
                              'text-sm',
                              expiryDateType === dt.value ? 'text-white' : 'text-slate-400'
                            )}
                          >
                            {dt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                  {expiryDateType !== 'none' && (
                    <TextInput
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      placeholder={
                        expiryDateType === 'year_only'
                          ? 'YYYY'
                          : expiryDateType === 'month_year'
                            ? 'MM/YYYY'
                            : 'DD/MM/YYYY'
                      }
                      placeholderTextColor="#64748B"
                      className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mt-3"
                    />
                  )}
                </Animated.View>

                {/* Serial Numbers (for serialized items) */}
                {item.isSerialized && (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(250)}
                    className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row items-center mb-3">
                      <Hash size={18} color="#64748B" />
                      <Text className="text-slate-400 text-sm ml-2">
                        Serial Numbers ({serialNumbers.length}/{countedQty})
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TextInput
                        value={currentSerial}
                        onChangeText={setCurrentSerial}
                        placeholder="Enter or scan serial number"
                        placeholderTextColor="#64748B"
                        className="flex-1 bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                        onSubmitEditing={handleAddSerial}
                      />
                      <Pressable
                        onPress={handleAddSerial}
                        className="bg-blue-500 w-12 rounded-xl items-center justify-center active:opacity-80"
                      >
                        <Plus size={24} color="#fff" />
                      </Pressable>
                    </View>
                    {serialNumbers.length > 0 && (
                      <View className="mt-3 flex-row flex-wrap gap-2">
                        {serialNumbers.map((serial) => (
                          <View
                            key={serial}
                            className="bg-slate-700 px-3 py-2 rounded-lg flex-row items-center"
                          >
                            <Text className="text-white text-sm">{serial}</Text>
                            <Pressable
                              onPress={() => handleRemoveSerial(serial)}
                              className="ml-2"
                            >
                              <X size={16} color="#EF4444" />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    )}
                  </Animated.View>
                )}

                {/* Bundle Option */}
                {item.isBundleEnabled && (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(300)}
                    className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                  >
                    <Pressable
                      onPress={() => {
                        setIsBundled(!isBundled);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Layers size={20} color="#A855F7" />
                        <Text className="text-white font-medium ml-3">Bundle Item</Text>
                      </View>
                      <View
                        className={cn(
                          'w-12 h-7 rounded-full p-1',
                          isBundled ? 'bg-purple-500' : 'bg-slate-600'
                        )}
                      >
                        <View
                          className={cn(
                            'w-5 h-5 rounded-full bg-white',
                            isBundled ? 'ml-auto' : 'ml-0'
                          )}
                        />
                      </View>
                    </Pressable>

                    {isBundled && (
                      <View className="mt-4">
                        <Text className="text-slate-400 text-sm mb-2">Items in bundle</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ flexGrow: 0 }}
                        >
                          <View className="flex-row gap-2">
                            {[2, 3, 4, 5].map((num) => (
                              <Pressable
                                key={num}
                                onPress={() => setBundleCount(num)}
                                className={cn(
                                  'w-10 h-10 rounded-lg items-center justify-center',
                                  bundleCount === num ? 'bg-purple-500' : 'bg-slate-700'
                                )}
                              >
                                <Text className="text-white font-semibold">{num}</Text>
                              </Pressable>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </Animated.View>
                )}

                {/* Remark */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(350)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-6"
                >
                  <View className="flex-row items-center mb-3">
                    <MessageSquare size={18} color="#64748B" />
                    <Text className="text-slate-400 text-sm ml-2">Remark (Optional)</Text>
                  </View>
                  <TextInput
                    value={remark}
                    onChangeText={setRemark}
                    placeholder="Add any notes..."
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={2}
                    className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                  />
                </Animated.View>

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-bold text-lg">Review & Submit</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
