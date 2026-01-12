import React, { useState, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSessionStore, searchItems, getItemByBarcode } from '@/lib/store';
import type { Item } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  ArrowLeft,
  Search,
  ScanBarcode,
  Package,
  ChevronRight,
  X,
  Info,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ScanScreen() {
  const router = useRouter();
  const currentSession = useSessionStore((s) => s.currentSession);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const searchInputRef = useRef<TextInput>(null);

  // Determine search mode based on prefix (51/52/53 → barcode, else → name)
  const getSearchMode = (query: string): 'barcode' | 'name' | null => {
    if (query.length < 2) return null;
    const prefix = query.substring(0, 2);
    if (prefix === '51' || prefix === '52' || prefix === '53') {
      return 'barcode';
    }
    return 'name';
  };

  const searchMode = getSearchMode(searchQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const results = searchItems(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectItem = async (item: Item) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/item-detail',
      params: { itemId: item.id },
    });
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (scanned) return;
    setScanned(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const item = getItemByBarcode(barcode);
    if (item) {
      setShowScanner(false);
      setScanned(false);
      router.push({
        pathname: '/item-detail',
        params: { itemId: item.id },
      });
    } else {
      Alert.alert('Item Not Found', `No item found with barcode: ${barcode}`, [
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
      ]);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan barcodes');
        return;
      }
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowScanner(true);
  };

  if (showScanner) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
          }}
          onBarcodeScanned={(result) => handleBarcodeScan(result.data)}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-6 pt-4">
              <Pressable
                onPress={() => {
                  setShowScanner(false);
                  setScanned(false);
                }}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
              >
                <X size={24} color="#fff" />
              </Pressable>
              <Text className="text-white font-semibold text-lg">Scan Barcode</Text>
              <View className="w-10" />
            </View>

            <View className="flex-1 items-center justify-center">
              <View className="w-72 h-72 relative">
                {/* Scanner Frame */}
                <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />
                {/* Scan line animation could go here */}
              </View>
            </View>

            <View className="px-6 pb-8">
              <Text className="text-white/70 text-center">
                Position the barcode within the frame
              </Text>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <View className="ml-3">
                  <Text className="text-white font-bold text-lg">Scan Items</Text>
                  <Text className="text-slate-400 text-sm">
                    Rack: {currentSession?.rackNo ?? '-'}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                <Text className="text-blue-400 text-sm font-medium">
                  {currentSession?.totalScanned ?? 0} scanned
                </Text>
              </View>
            </View>

            {/* Search Bar */}
            <Animated.View entering={FadeInDown.duration(400)} className="mb-4">
              <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                <Search size={20} color="#64748B" />
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder="Search by name or barcode (min 3 chars)"
                  placeholderTextColor="#64748B"
                  className="flex-1 py-4 px-3 text-white text-base"
                />
                {searchMode && (
                  <View className={`px-2 py-1 rounded-full mr-2 ${searchMode === 'barcode' ? 'bg-purple-500/20' : 'bg-green-500/20'}`}>
                    <Text className={`text-xs font-medium ${searchMode === 'barcode' ? 'text-purple-400' : 'text-green-400'}`}>
                      {searchMode === 'barcode' ? 'Barcode' : 'Name'}
                    </Text>
                  </View>
                )}
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <X size={20} color="#64748B" />
                  </Pressable>
                )}
              </View>
              {searchMode && (
                <Text className="text-slate-500 text-xs mt-2 px-1">
                  {searchMode === 'barcode'
                    ? 'Prefix 51/52/53 detected - searching by barcode'
                    : 'Searching by item name'}
                </Text>
              )}
            </Animated.View>

            {/* Scan Button */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} className="mb-4">
              <Pressable
                onPress={openScanner}
                className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <ScanBarcode size={24} color="#fff" />
                <Text className="text-white font-bold text-lg ml-2">Scan Barcode</Text>
              </Pressable>
            </Animated.View>

            {/* Checkout Button */}
            {currentSession && (currentSession.totalScanned ?? 0) > 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(150)} className="mb-6">
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({
                      pathname: '/checkout',
                      params: { sessionId: currentSession.id },
                    });
                  }}
                  className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
                >
                  <ClipboardCheck size={24} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Checkout ({currentSession.totalScanned} items)
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Search Results */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <Text className="text-slate-400 text-center py-4">
                  Type at least 3 characters to search
                </Text>
              )}

              {searchQuery.length >= 3 && searchResults.length === 0 && (
                <View className="items-center py-10">
                  <Package size={48} color="#64748B" />
                  <Text className="text-slate-400 mt-3">No items found</Text>
                </View>
              )}

              {searchResults.length > 0 && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <Text className="text-slate-400 text-sm mb-3">
                    {searchResults.length} item{searchResults.length > 1 ? 's' : ''} found
                  </Text>
                  {searchResults.map((item, index) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleSelectItem(item)}
                      className="bg-slate-800/50 rounded-2xl p-4 mb-3 active:opacity-80"
                    >
                      <View className="flex-row items-start">
                        <View className="w-12 h-12 rounded-xl bg-slate-700 items-center justify-center">
                          <Package size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="text-white font-semibold" numberOfLines={2}>
                            {item.name}
                          </Text>
                          <Text className="text-slate-400 text-sm mt-1">
                            {item.barcode}
                          </Text>
                          <View className="flex-row items-center mt-2">
                            <Text className="text-blue-400 font-medium">
                              Stock: {item.systemStock} {item.uom}
                            </Text>
                            <View className="w-1 h-1 rounded-full bg-slate-600 mx-2" />
                            <Text className="text-green-400">
                              MRP: ₹{item.mrp.toLocaleString()}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={20} color="#64748B" />
                      </View>
                    </Pressable>
                  ))}
                </Animated.View>
              )}

              {/* Recent Items Placeholder */}
              {searchQuery.length === 0 && (
                <Animated.View entering={FadeInDown.duration(400).delay(200)}>
                  <Text className="text-white font-semibold text-lg mb-3">Quick Tips</Text>
                  <View className="bg-slate-800/30 rounded-2xl p-4">
                    <View className="flex-row items-center mb-3">
                      <ScanBarcode size={20} color="#3B82F6" />
                      <Text className="text-slate-300 ml-3 flex-1">
                        Use the scanner for quick barcode lookup
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                      <Search size={20} color="#3B82F6" />
                      <Text className="text-slate-300 ml-3 flex-1">
                        Search by item name or barcode number
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Package size={20} color="#3B82F6" />
                      <Text className="text-slate-300 ml-3 flex-1">
                        Select an item to enter counted quantity
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
