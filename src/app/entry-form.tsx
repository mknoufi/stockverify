import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { mockItems, useSessionStore } from '@/lib/store';
import type { ItemCondition, DateEntryType, BundleItem, DamageCategory, CountedEntry, SerialStatus, SerialEntry, DamageEntry, BatchInfo, BoxCount } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
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
  AlertTriangle,
  MapPin,
  Package,
  Image as ImageIcon,
  Trash2,
  Box,
  ScanLine,
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

const DAMAGE_CATEGORIES: { value: DamageCategory; label: string }[] = [
  { value: 'transit', label: 'Transit Damage' },
  { value: 'handling', label: 'Handling Damage' },
  { value: 'customer_return', label: 'Customer Return' },
  { value: 'storage', label: 'Storage Damage' },
  { value: 'unknown', label: 'Unknown' },
];

const SERIAL_STATUSES: { value: SerialStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'damaged', label: 'Damaged', color: 'bg-red-500' },
  { value: 'missing', label: 'Missing', color: 'bg-amber-500' },
];

export default function EntryFormScreen() {
  const router = useRouter();
  const { itemId, barcode } = useLocalSearchParams<{ itemId: string; barcode: string }>();
  const currentSession = useSessionStore((s) => s.currentSession);
  const checkDuplicateEntry = useSessionStore((s) => s.checkDuplicateEntry);
  const getItemEntriesAcrossSessions = useSessionStore((s) => s.getItemEntriesAcrossSessions);

  const item = mockItems.find((i) => i.id === itemId);
  const variant = item?.variants?.find((v) => v.barcode === barcode);
  const systemStock = variant?.systemStock ?? item?.systemStock ?? 0;

  // Check for duplicate entry in current session
  const [duplicateEntry, setDuplicateEntry] = useState<CountedEntry | undefined>(undefined);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [otherLocationEntries, setOtherLocationEntries] = useState<CountedEntry[]>([]);

  useEffect(() => {
    if (currentSession && item) {
      const existing = checkDuplicateEntry(currentSession.id, item.id, barcode ?? item.barcode);
      setDuplicateEntry(existing);
      if (existing) {
        setShowDuplicateModal(true);
      }

      // Check if item exists in other sessions/locations
      const otherEntries = getItemEntriesAcrossSessions(item.id).filter(
        (e) => e.sessionId !== currentSession.id
      );
      setOtherLocationEntries(otherEntries);
    }
  }, [currentSession, item, barcode]);

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

  // Bundle state
  const [isBundled, setIsBundled] = useState(false);
  const [bundleCount, setBundleCount] = useState(2);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

  // Location in rack
  const [locationInRack, setLocationInRack] = useState('');

  // Damage tracking
  const [damageQty, setDamageQty] = useState(0);
  const [damageEntries, setDamageEntries] = useState<DamageEntry[]>([]);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [currentDamageQty, setCurrentDamageQty] = useState(1);
  const [currentDamageCategory, setCurrentDamageCategory] = useState<DamageCategory>('unknown');
  const [currentDamageRemarks, setCurrentDamageRemarks] = useState('');
  const [currentDamagePhotos, setCurrentDamagePhotos] = useState<string[]>([]);

  // Batch tracking
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentBatchNo, setCurrentBatchNo] = useState('');
  const [currentBatchQty, setCurrentBatchQty] = useState(1);
  const [currentBatchMfg, setCurrentBatchMfg] = useState('');
  const [currentBatchExpiry, setCurrentBatchExpiry] = useState('');

  // Photo upload
  const [photos, setPhotos] = useState<string[]>([]);

  // Box counting
  const [enableBoxCounting, setEnableBoxCounting] = useState(false);
  const [boxCounts, setBoxCounts] = useState<BoxCount[]>([]);
  const [showBoxModal, setShowBoxModal] = useState(false);
  const [currentBoxNo, setCurrentBoxNo] = useState('');
  const [currentBoxQty, setCurrentBoxQty] = useState(1);
  const [currentBoxPartial, setCurrentBoxPartial] = useState(false);
  const [currentBoxRemarks, setCurrentBoxRemarks] = useState('');

  // Enhanced serial number tracking
  const [serialEntries, setSerialEntries] = useState<SerialEntry[]>([]);
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [currentSerialNo, setCurrentSerialNo] = useState('');
  const [currentSerialStatus, setCurrentSerialStatus] = useState<SerialStatus>('active');
  const [currentSerialCondition, setCurrentSerialCondition] = useState<ItemCondition>('new');
  const [currentSerialDamageCategory, setCurrentSerialDamageCategory] = useState<DamageCategory>('unknown');
  const [currentSerialDamageRemarks, setCurrentSerialDamageRemarks] = useState('');

  const variance = countedQty - systemStock;
  const totalDamage = damageEntries.reduce((sum, d) => sum + (d.quantity ?? 0), 0);
  const totalBoxQty = boxCounts.reduce((sum, b) => sum + (b.quantityInBox ?? 0), 0);

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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddDamageEntry = () => {
    if (currentDamageQty > 0) {
      const newEntry: DamageEntry = {
        quantity: currentDamageQty,
        category: currentDamageCategory,
        description: currentDamageRemarks || '',
        remarks: currentDamageRemarks || undefined,
        photos: currentDamagePhotos.length > 0 ? currentDamagePhotos : undefined,
      };
      setDamageEntries([...damageEntries, newEntry]);
      setDamageQty(damageQty + currentDamageQty);

      // Reset modal state
      setCurrentDamageQty(1);
      setCurrentDamageCategory('unknown');
      setCurrentDamageRemarks('');
      setCurrentDamagePhotos([]);
      setShowDamageModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveDamageEntry = (index: number) => {
    const removed = damageEntries[index];
    setDamageEntries(damageEntries.filter((_, i) => i !== index));
    setDamageQty(damageQty - (removed.quantity ?? 0));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddBatch = () => {
    if (currentBatchNo.trim() && currentBatchQty > 0) {
      const newBatch: BatchInfo = {
        id: Date.now().toString(),
        batchNo: currentBatchNo.trim(),
        quantity: currentBatchQty,
        damageQty: 0,
        mfgDate: currentBatchMfg || undefined,
        expiryDate: currentBatchExpiry || undefined,
      };
      setBatches([...batches, newBatch]);

      // Reset modal state
      setCurrentBatchNo('');
      setCurrentBatchQty(1);
      setCurrentBatchMfg('');
      setCurrentBatchExpiry('');
      setShowBatchModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveBatch = (index: number) => {
    setBatches(batches.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Box counting handlers
  const handleAddBox = () => {
    if (currentBoxNo.trim() && currentBoxQty > 0) {
      const newBox: BoxCount = {
        id: Date.now().toString(),
        boxNo: currentBoxNo.trim(),
        quantityInBox: currentBoxQty,
        isPartial: currentBoxPartial,
        remarks: currentBoxRemarks || undefined,
      };
      setBoxCounts([...boxCounts, newBox]);

      // Auto-update counted qty based on box totals
      const newTotal = totalBoxQty + currentBoxQty;
      setCountedQty(newTotal);

      // Reset modal state
      setCurrentBoxNo('');
      setCurrentBoxQty(1);
      setCurrentBoxPartial(false);
      setCurrentBoxRemarks('');
      setShowBoxModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveBox = (index: number) => {
    const removed = boxCounts[index];
    setBoxCounts(boxCounts.filter((_, i) => i !== index));
    // Update counted qty
    setCountedQty(countedQty - (removed.quantityInBox ?? 0));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Enhanced serial number handlers
  const handleAddSerialEntry = () => {
    if (currentSerialNo.trim()) {
      // Check for duplicate
      if (serialEntries.some(s => s.serialNumber === currentSerialNo.trim())) {
        Alert.alert('Duplicate', 'This serial number has already been added');
        return;
      }

      const newSerial: SerialEntry = {
        id: Date.now().toString(),
        serialNumber: currentSerialNo.trim(),
        status: currentSerialStatus,
        condition: currentSerialCondition,
        damageCategory: currentSerialStatus === 'damaged' ? currentSerialDamageCategory : undefined,
        damageRemarks: currentSerialStatus === 'damaged' ? currentSerialDamageRemarks : undefined,
      };
      setSerialEntries([...serialEntries, newSerial]);

      // Auto-update counted qty
      setCountedQty(serialEntries.length + 1);

      // Reset modal state
      setCurrentSerialNo('');
      setCurrentSerialStatus('active');
      setCurrentSerialCondition('new');
      setCurrentSerialDamageCategory('unknown');
      setCurrentSerialDamageRemarks('');
      setShowSerialModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRemoveSerialEntry = (index: number) => {
    setSerialEntries(serialEntries.filter((_, i) => i !== index));
    setCountedQty(Math.max(0, countedQty - 1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateExisting = () => {
    setShowDuplicateModal(false);
    // Pre-fill with existing data
    if (duplicateEntry) {
      setCountedQty(duplicateEntry.countedQty);
      setCondition(duplicateEntry.condition);
      setRemark(duplicateEntry.remark ?? '');
    }
  };

  const handleAddNewLocation = () => {
    setShowDuplicateModal(false);
    // Continue with fresh entry but mark as multi-location
  };

  const handleSubmit = async () => {
    if (!currentSession || !item) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Navigate to confirmation screen with all data
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
        locationInRack,
        damageQty: damageQty.toString(),
        damageEntries: JSON.stringify(damageEntries),
        batches: JSON.stringify(batches),
        photos: JSON.stringify(photos),
        isMultiLocation: (otherLocationEntries.length > 0).toString(),
        previousEntryId: duplicateEntry?.id ?? '',
        // New box counting and serial entries
        boxCounts: JSON.stringify(boxCounts),
        totalBoxes: boxCounts.length.toString(),
        serialEntries: JSON.stringify(serialEntries),
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

                {/* Multi-location Warning */}
                {otherLocationEntries.length > 0 && (
                  <Animated.View
                    entering={FadeInDown.duration(400)}
                    className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row items-center">
                      <AlertTriangle size={20} color="#F59E0B" />
                      <Text className="text-amber-400 font-semibold ml-2">Multi-Location Item</Text>
                    </View>
                    <Text className="text-amber-400/80 text-sm mt-2">
                      This item exists in {otherLocationEntries.length} other location(s).
                      Current entry will be tracked separately.
                    </Text>
                  </Animated.View>
                )}

                {/* Location in Rack */}
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center mb-3">
                    <MapPin size={18} color="#64748B" />
                    <Text className="text-slate-400 text-sm ml-2">Location in Rack (Optional)</Text>
                  </View>
                  <TextInput
                    value={locationInRack}
                    onChangeText={setLocationInRack}
                    placeholder="e.g., Shelf 2, Bin A, Top Row"
                    placeholderTextColor="#64748B"
                    className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                  />
                </Animated.View>

                {/* Quantity Counter */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(50)}
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

                {/* Damage Tracking */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(75)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <AlertTriangle size={18} color="#EF4444" />
                      <Text className="text-slate-400 text-sm ml-2">Damage Tracking</Text>
                    </View>
                    {totalDamage > 0 && (
                      <View className="bg-red-500/20 px-3 py-1 rounded-full">
                        <Text className="text-red-400 text-sm font-medium">{totalDamage} damaged</Text>
                      </View>
                    )}
                  </View>

                  {/* Damage entries list */}
                  {damageEntries.length > 0 && (
                    <View className="mb-3 space-y-2">
                      {damageEntries.map((entry, index) => (
                        <View key={index} className="bg-red-500/10 rounded-xl p-3 flex-row items-center justify-between">
                          <View>
                            <Text className="text-white font-medium">{entry.quantity} units</Text>
                            <Text className="text-red-400 text-sm">
                              {DAMAGE_CATEGORIES.find(c => c.value === entry.category)?.label}
                            </Text>
                            {entry.remarks && (
                              <Text className="text-slate-400 text-xs mt-1">{entry.remarks}</Text>
                            )}
                          </View>
                          <Pressable onPress={() => handleRemoveDamageEntry(index)}>
                            <Trash2 size={18} color="#EF4444" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <Pressable
                    onPress={() => setShowDamageModal(true)}
                    className="bg-red-500/20 border border-red-500/30 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                  >
                    <Plus size={18} color="#EF4444" />
                    <Text className="text-red-400 font-medium ml-2">Add Damage Entry</Text>
                  </Pressable>
                </Animated.View>

                {/* Batch Tracking */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(100)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Package size={18} color="#A855F7" />
                      <Text className="text-slate-400 text-sm ml-2">Batch Management</Text>
                    </View>
                    {batches.length > 0 && (
                      <View className="bg-purple-500/20 px-3 py-1 rounded-full">
                        <Text className="text-purple-400 text-sm font-medium">{batches.length} batches</Text>
                      </View>
                    )}
                  </View>

                  {/* Batch list */}
                  {batches.length > 0 && (
                    <View className="mb-3 space-y-2">
                      {batches.map((batch, index) => (
                        <View key={batch.id} className="bg-purple-500/10 rounded-xl p-3 flex-row items-center justify-between">
                          <View>
                            <Text className="text-white font-medium">Batch: {batch.batchNo}</Text>
                            <Text className="text-purple-400 text-sm">{batch.quantity} units</Text>
                            {batch.expiryDate && (
                              <Text className="text-slate-400 text-xs">Exp: {batch.expiryDate}</Text>
                            )}
                          </View>
                          <Pressable onPress={() => handleRemoveBatch(index)}>
                            <Trash2 size={18} color="#A855F7" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <Pressable
                    onPress={() => setShowBatchModal(true)}
                    className="bg-purple-500/20 border border-purple-500/30 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                  >
                    <Plus size={18} color="#A855F7" />
                    <Text className="text-purple-400 font-medium ml-2">Add Batch</Text>
                  </Pressable>
                </Animated.View>

                {/* Box Counting */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(110)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Box size={18} color="#06B6D4" />
                      <Text className="text-slate-400 text-sm ml-2">Box Counting</Text>
                    </View>
                    <Pressable
                      onPress={() => setEnableBoxCounting(!enableBoxCounting)}
                      className={cn(
                        'px-3 py-1 rounded-full',
                        enableBoxCounting ? 'bg-cyan-500' : 'bg-slate-700'
                      )}
                    >
                      <Text className={enableBoxCounting ? 'text-white text-sm' : 'text-slate-400 text-sm'}>
                        {enableBoxCounting ? 'Enabled' : 'Disabled'}
                      </Text>
                    </Pressable>
                  </View>

                  {enableBoxCounting && (
                    <>
                      {/* Box summary */}
                      {boxCounts.length > 0 && (
                        <View className="bg-cyan-500/10 rounded-xl p-3 mb-3">
                          <View className="flex-row justify-between">
                            <Text className="text-cyan-400">Total Boxes: {boxCounts.length}</Text>
                            <Text className="text-cyan-400 font-bold">Total Qty: {totalBoxQty}</Text>
                          </View>
                        </View>
                      )}

                      {/* Box list */}
                      {boxCounts.length > 0 && (
                        <View className="mb-3 space-y-2">
                          {boxCounts.map((box, index) => (
                            <View key={box.id} className="bg-cyan-500/10 rounded-xl p-3 flex-row items-center justify-between">
                              <View>
                                <View className="flex-row items-center">
                                  <Text className="text-white font-medium">Box {box.boxNo}</Text>
                                  {box.isPartial && (
                                    <View className="bg-amber-500/20 px-2 py-0.5 rounded-full ml-2">
                                      <Text className="text-amber-400 text-xs">Partial</Text>
                                    </View>
                                  )}
                                </View>
                                <Text className="text-cyan-400 text-sm">{box.quantityInBox} items</Text>
                                {box.remarks && (
                                  <Text className="text-slate-400 text-xs mt-1">{box.remarks}</Text>
                                )}
                              </View>
                              <Pressable onPress={() => handleRemoveBox(index)}>
                                <Trash2 size={18} color="#06B6D4" />
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}

                      <Pressable
                        onPress={() => setShowBoxModal(true)}
                        className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                      >
                        <Plus size={18} color="#06B6D4" />
                        <Text className="text-cyan-400 font-medium ml-2">Add Box</Text>
                      </Pressable>
                    </>
                  )}
                </Animated.View>

                {/* Photo Upload */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(125)}
                  className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                >
                  <View className="flex-row items-center mb-3">
                    <ImageIcon size={18} color="#64748B" />
                    <Text className="text-slate-400 text-sm ml-2">Item Photos ({photos.length})</Text>
                  </View>

                  {/* Photo gallery */}
                  {photos.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" style={{ flexGrow: 0 }}>
                      <View className="flex-row gap-2">
                        {photos.map((uri, index) => (
                          <View key={index} className="relative">
                            <Image source={{ uri }} className="w-20 h-20 rounded-xl" />
                            <Pressable
                              onPress={() => handleRemovePhoto(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                            >
                              <X size={14} color="#fff" />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleTakePhoto}
                      className="flex-1 bg-slate-700 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                    >
                      <Camera size={18} color="#fff" />
                      <Text className="text-white font-medium ml-2">Take Photo</Text>
                    </Pressable>
                    <Pressable
                      onPress={handlePickImage}
                      className="flex-1 bg-slate-700 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                    >
                      <ImageIcon size={18} color="#fff" />
                      <Text className="text-white font-medium ml-2">Gallery</Text>
                    </Pressable>
                  </View>
                </Animated.View>

                {/* Condition */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(150)}
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
                  entering={FadeInDown.duration(400).delay(175)}
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

                {/* Serial Numbers (for serialized items) - Enhanced */}
                {item.isSerialized && (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(200)}
                    className="bg-slate-800/50 rounded-2xl p-4 mb-4"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <ScanLine size={18} color="#22C55E" />
                        <Text className="text-slate-400 text-sm ml-2">
                          Serial Numbers ({serialEntries.length}/{countedQty})
                        </Text>
                      </View>
                      {serialEntries.length > 0 && (
                        <View className="flex-row gap-1">
                          <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
                            <Text className="text-green-400 text-xs">
                              {serialEntries.filter(s => s.status === 'active').length} OK
                            </Text>
                          </View>
                          {serialEntries.filter(s => s.status === 'damaged').length > 0 && (
                            <View className="bg-red-500/20 px-2 py-0.5 rounded-full">
                              <Text className="text-red-400 text-xs">
                                {serialEntries.filter(s => s.status === 'damaged').length} DMG
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Serial entries list */}
                    {serialEntries.length > 0 && (
                      <View className="mb-3 space-y-2">
                        {serialEntries.map((serial, index) => (
                          <View key={serial.id} className={cn(
                            'rounded-xl p-3 flex-row items-center justify-between',
                            serial.status === 'active' ? 'bg-green-500/10' :
                            serial.status === 'damaged' ? 'bg-red-500/10' : 'bg-amber-500/10'
                          )}>
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <Text className="text-white font-medium">{serial.serialNumber}</Text>
                                <View className={cn(
                                  'px-2 py-0.5 rounded-full ml-2',
                                  serial.status === 'active' ? 'bg-green-500/20' :
                                  serial.status === 'damaged' ? 'bg-red-500/20' : 'bg-amber-500/20'
                                )}>
                                  <Text className={cn(
                                    'text-xs capitalize',
                                    serial.status === 'active' ? 'text-green-400' :
                                    serial.status === 'damaged' ? 'text-red-400' : 'text-amber-400'
                                  )}>
                                    {serial.status}
                                  </Text>
                                </View>
                              </View>
                              {serial.damageRemarks && (
                                <Text className="text-slate-400 text-xs mt-1">{serial.damageRemarks}</Text>
                              )}
                            </View>
                            <Pressable onPress={() => handleRemoveSerialEntry(index)}>
                              <Trash2 size={18} color="#64748B" />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    )}

                    <Pressable
                      onPress={() => setShowSerialModal(true)}
                      className="bg-green-500/20 border border-green-500/30 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                    >
                      <Plus size={18} color="#22C55E" />
                      <Text className="text-green-400 font-medium ml-2">Add Serial Number</Text>
                    </Pressable>
                  </Animated.View>
                )}

                {/* Remark */}
                <Animated.View
                  entering={FadeInDown.duration(400).delay(225)}
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
                    numberOfLines={3}
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

      {/* Duplicate Entry Modal */}
      <Modal visible={showDuplicateModal} transparent animationType="fade">
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="bg-slate-800 rounded-2xl p-6 w-full">
            <View className="flex-row items-center mb-4">
              <AlertCircle size={24} color="#F59E0B" />
              <Text className="text-white font-bold text-lg ml-2">Duplicate Entry</Text>
            </View>
            <Text className="text-slate-300 mb-4">
              This item has already been scanned in this session at {duplicateEntry?.location || 'current location'}.
              What would you like to do?
            </Text>
            <View className="gap-3">
              <Pressable
                onPress={handleUpdateExisting}
                className="bg-blue-500 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Update Existing Entry</Text>
              </Pressable>
              <Pressable
                onPress={handleAddNewLocation}
                className="bg-amber-500 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Add as Different Location</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                className="bg-slate-700 rounded-xl py-3 items-center active:opacity-80"
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Damage Entry Modal */}
      <Modal visible={showDamageModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Add Damage Entry</Text>
              <Pressable onPress={() => setShowDamageModal(false)}>
                <X size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-slate-400 text-sm mb-2">Quantity</Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => currentDamageQty > 1 && setCurrentDamageQty(currentDamageQty - 1)}
                className="w-12 h-12 rounded-xl bg-slate-700 items-center justify-center"
              >
                <Minus size={20} color="#fff" />
              </Pressable>
              <TextInput
                value={currentDamageQty.toString()}
                onChangeText={(v) => setCurrentDamageQty(parseInt(v) || 1)}
                keyboardType="number-pad"
                className="flex-1 text-center text-white text-2xl font-bold mx-4"
              />
              <Pressable
                onPress={() => setCurrentDamageQty(currentDamageQty + 1)}
                className="w-12 h-12 rounded-xl bg-red-500 items-center justify-center"
              >
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>

            <Text className="text-slate-400 text-sm mb-2">Damage Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ flexGrow: 0 }}>
              <View className="flex-row gap-2">
                {DAMAGE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCurrentDamageCategory(cat.value)}
                    className={cn(
                      'px-4 py-2 rounded-xl',
                      currentDamageCategory === cat.value ? 'bg-red-500' : 'bg-slate-700'
                    )}
                  >
                    <Text className={currentDamageCategory === cat.value ? 'text-white' : 'text-slate-400'}>
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-slate-400 text-sm mb-2">Remarks</Text>
            <TextInput
              value={currentDamageRemarks}
              onChangeText={setCurrentDamageRemarks}
              placeholder="Describe the damage..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={2}
              className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Pressable
              onPress={handleAddDamageEntry}
              className="bg-red-500 rounded-xl py-4 items-center active:opacity-80"
            >
              <Text className="text-white font-bold">Add Damage Entry</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Batch Modal */}
      <Modal visible={showBatchModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Add Batch</Text>
              <Pressable onPress={() => setShowBatchModal(false)}>
                <X size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-slate-400 text-sm mb-2">Batch Number *</Text>
            <TextInput
              value={currentBatchNo}
              onChangeText={setCurrentBatchNo}
              placeholder="Enter batch number"
              placeholderTextColor="#64748B"
              className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Text className="text-slate-400 text-sm mb-2">Quantity</Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => currentBatchQty > 1 && setCurrentBatchQty(currentBatchQty - 1)}
                className="w-12 h-12 rounded-xl bg-slate-700 items-center justify-center"
              >
                <Minus size={20} color="#fff" />
              </Pressable>
              <TextInput
                value={currentBatchQty.toString()}
                onChangeText={(v) => setCurrentBatchQty(parseInt(v) || 1)}
                keyboardType="number-pad"
                className="flex-1 text-center text-white text-2xl font-bold mx-4"
              />
              <Pressable
                onPress={() => setCurrentBatchQty(currentBatchQty + 1)}
                className="w-12 h-12 rounded-xl bg-purple-500 items-center justify-center"
              >
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-slate-400 text-sm mb-2">Mfg Date</Text>
                <TextInput
                  value={currentBatchMfg}
                  onChangeText={setCurrentBatchMfg}
                  placeholder="MM/YYYY"
                  placeholderTextColor="#64748B"
                  className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 text-sm mb-2">Expiry Date</Text>
                <TextInput
                  value={currentBatchExpiry}
                  onChangeText={setCurrentBatchExpiry}
                  placeholder="MM/YYYY"
                  placeholderTextColor="#64748B"
                  className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700"
                />
              </View>
            </View>

            <Pressable
              onPress={handleAddBatch}
              disabled={!currentBatchNo.trim()}
              className={cn(
                'rounded-xl py-4 items-center',
                currentBatchNo.trim() ? 'bg-purple-500 active:opacity-80' : 'bg-slate-700'
              )}
            >
              <Text className={currentBatchNo.trim() ? 'text-white font-bold' : 'text-slate-500 font-bold'}>
                Add Batch
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Box Modal */}
      <Modal visible={showBoxModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Add Box</Text>
              <Pressable onPress={() => setShowBoxModal(false)}>
                <X size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-slate-400 text-sm mb-2">Box Number *</Text>
            <TextInput
              value={currentBoxNo}
              onChangeText={setCurrentBoxNo}
              placeholder="Enter box number (e.g., B001, Box-1)"
              placeholderTextColor="#64748B"
              className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Text className="text-slate-400 text-sm mb-2">Items in Box</Text>
            <View className="flex-row items-center mb-4">
              <Pressable
                onPress={() => currentBoxQty > 1 && setCurrentBoxQty(currentBoxQty - 1)}
                className="w-12 h-12 rounded-xl bg-slate-700 items-center justify-center"
              >
                <Minus size={20} color="#fff" />
              </Pressable>
              <TextInput
                value={currentBoxQty.toString()}
                onChangeText={(v) => setCurrentBoxQty(parseInt(v) || 1)}
                keyboardType="number-pad"
                className="flex-1 text-center text-white text-2xl font-bold mx-4"
              />
              <Pressable
                onPress={() => setCurrentBoxQty(currentBoxQty + 1)}
                className="w-12 h-12 rounded-xl bg-cyan-500 items-center justify-center"
              >
                <Plus size={20} color="#fff" />
              </Pressable>
            </View>

            <Pressable
              onPress={() => setCurrentBoxPartial(!currentBoxPartial)}
              className="flex-row items-center mb-4"
            >
              <View className={cn(
                'w-6 h-6 rounded-md border-2 items-center justify-center mr-3',
                currentBoxPartial ? 'bg-amber-500 border-amber-500' : 'border-slate-600'
              )}>
                {currentBoxPartial && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text className="text-slate-300">Partial box (not full)</Text>
            </Pressable>

            <Text className="text-slate-400 text-sm mb-2">Remarks (Optional)</Text>
            <TextInput
              value={currentBoxRemarks}
              onChangeText={setCurrentBoxRemarks}
              placeholder="Any notes about this box..."
              placeholderTextColor="#64748B"
              className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
            />

            <Pressable
              onPress={handleAddBox}
              disabled={!currentBoxNo.trim()}
              className={cn(
                'rounded-xl py-4 items-center',
                currentBoxNo.trim() ? 'bg-cyan-500 active:opacity-80' : 'bg-slate-700'
              )}
            >
              <Text className={currentBoxNo.trim() ? 'text-white font-bold' : 'text-slate-500 font-bold'}>
                Add Box
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Serial Number Modal */}
      <Modal visible={showSerialModal} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-slate-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Add Serial Number</Text>
              <Pressable onPress={() => setShowSerialModal(false)}>
                <X size={24} color="#64748B" />
              </Pressable>
            </View>

            <Text className="text-slate-400 text-sm mb-2">Serial Number *</Text>
            <TextInput
              value={currentSerialNo}
              onChangeText={setCurrentSerialNo}
              placeholder="Enter or scan serial number"
              placeholderTextColor="#64748B"
              className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
              autoCapitalize="characters"
            />

            <Text className="text-slate-400 text-sm mb-2">Status</Text>
            <View className="flex-row gap-2 mb-4">
              {SERIAL_STATUSES.map((status) => (
                <Pressable
                  key={status.value}
                  onPress={() => setCurrentSerialStatus(status.value)}
                  className={cn(
                    'flex-1 py-3 rounded-xl items-center border-2',
                    currentSerialStatus === status.value
                      ? `${status.color} border-transparent`
                      : 'bg-slate-700/50 border-slate-600'
                  )}
                >
                  <Text
                    className={cn(
                      'font-semibold',
                      currentSerialStatus === status.value ? 'text-white' : 'text-slate-400'
                    )}
                  >
                    {status.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {currentSerialStatus === 'damaged' && (
              <>
                <Text className="text-slate-400 text-sm mb-2">Damage Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ flexGrow: 0 }}>
                  <View className="flex-row gap-2">
                    {DAMAGE_CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat.value}
                        onPress={() => setCurrentSerialDamageCategory(cat.value)}
                        className={cn(
                          'px-4 py-2 rounded-xl',
                          currentSerialDamageCategory === cat.value ? 'bg-red-500' : 'bg-slate-700'
                        )}
                      >
                        <Text className={currentSerialDamageCategory === cat.value ? 'text-white' : 'text-slate-400'}>
                          {cat.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                <Text className="text-slate-400 text-sm mb-2">Damage Remarks</Text>
                <TextInput
                  value={currentSerialDamageRemarks}
                  onChangeText={setCurrentSerialDamageRemarks}
                  placeholder="Describe the damage..."
                  placeholderTextColor="#64748B"
                  multiline
                  numberOfLines={2}
                  className="bg-slate-900/50 rounded-xl px-4 py-3 text-white border border-slate-700 mb-4"
                />
              </>
            )}

            <Pressable
              onPress={handleAddSerialEntry}
              disabled={!currentSerialNo.trim()}
              className={cn(
                'rounded-xl py-4 items-center',
                currentSerialNo.trim() ? 'bg-green-500 active:opacity-80' : 'bg-slate-700'
              )}
            >
              <Text className={currentSerialNo.trim() ? 'text-white font-bold' : 'text-slate-500 font-bold'}>
                Add Serial Number
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
