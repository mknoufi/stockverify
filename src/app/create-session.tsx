import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore } from '@/lib/store';
import type { LocationType, ShowroomFloor, GodownArea } from '@/lib/types';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  ArrowLeft,
  Store,
  Warehouse,
  ChevronRight,
  Package,
} from 'lucide-react-native';

type Step = 'location' | 'area' | 'rack';

export default function CreateSessionScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createSession = useSessionStore((s) => s.createSession);
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession);

  const [step, setStep] = useState<Step>('location');
  const [locationType, setLocationType] = useState<LocationType | null>(null);
  const [floor, setFloor] = useState<ShowroomFloor | null>(null);
  const [area, setArea] = useState<GodownArea | null>(null);
  const [rackNo, setRackNo] = useState('');
  const [error, setError] = useState('');

  const showroomFloors: { value: ShowroomFloor; label: string }[] = [
    { value: 'ground', label: 'Ground Floor' },
    { value: 'first', label: 'First Floor' },
    { value: 'second', label: 'Second Floor' },
  ];

  const godownAreas: { value: GodownArea; label: string }[] = [
    { value: 'main', label: 'Main Godown' },
    { value: 'top', label: 'Top Godown' },
    { value: 'damage', label: 'Damage Section' },
  ];

  const handleLocationSelect = async (type: LocationType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocationType(type);
    setStep('area');
  };

  const handleAreaSelect = async (value: ShowroomFloor | GodownArea) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (locationType === 'showroom') {
      setFloor(value as ShowroomFloor);
    } else {
      setArea(value as GodownArea);
    }
    setStep('rack');
  };

  const handleCreateSession = async () => {
    if (!rackNo.trim()) {
      setError('Please enter rack number');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const session = createSession({
      userId: user?.id ?? '',
      locationType: locationType!,
      floor: locationType === 'showroom' ? floor! : undefined,
      area: locationType === 'godown' ? area! : undefined,
      rackNo: rackNo.trim().toUpperCase(),
      status: 'active',
    });

    setCurrentSession(session);
    router.replace('/scan');
  };

  const handleBack = () => {
    if (step === 'rack') {
      setStep('area');
      setRackNo('');
    } else if (step === 'area') {
      setStep('location');
      setFloor(null);
      setArea(null);
    } else {
      router.back();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'location':
        return 'Select Location';
      case 'area':
        return locationType === 'showroom' ? 'Select Floor' : 'Select Area';
      case 'rack':
        return 'Enter Rack Number';
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <Text className="text-white font-bold text-xl ml-4">New Session</Text>
            </View>

            {/* Progress */}
            <View className="flex-row items-center mb-8">
              {['location', 'area', 'rack'].map((s, i) => (
                <React.Fragment key={s}>
                  <View
                    className={cn(
                      'w-8 h-8 rounded-full items-center justify-center',
                      step === s || ['location', 'area', 'rack'].indexOf(step) > i
                        ? 'bg-blue-500'
                        : 'bg-slate-700'
                    )}
                  >
                    <Text className="text-white font-bold text-sm">{i + 1}</Text>
                  </View>
                  {i < 2 && (
                    <View
                      className={cn(
                        'flex-1 h-1 mx-2',
                        ['location', 'area', 'rack'].indexOf(step) > i
                          ? 'bg-blue-500'
                          : 'bg-slate-700'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Step Title */}
            <Animated.Text
              entering={FadeInDown.duration(400)}
              className="text-white text-2xl font-bold mb-6"
            >
              {getStepTitle()}
            </Animated.Text>

            {/* Step Content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {step === 'location' && (
                <Animated.View entering={FadeInDown.duration(400)}>
                  <Pressable
                    onPress={() => handleLocationSelect('showroom')}
                    className="bg-slate-800/50 rounded-2xl p-5 mb-4 flex-row items-center active:opacity-80"
                  >
                    <View className="w-14 h-14 rounded-xl bg-blue-500/20 items-center justify-center">
                      <Store size={28} color="#3B82F6" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-lg">Showroom</Text>
                      <Text className="text-slate-400 text-sm mt-1">
                        Ground, First, or Second Floor
                      </Text>
                    </View>
                    <ChevronRight size={24} color="#64748B" />
                  </Pressable>

                  <Pressable
                    onPress={() => handleLocationSelect('godown')}
                    className="bg-slate-800/50 rounded-2xl p-5 flex-row items-center active:opacity-80"
                  >
                    <View className="w-14 h-14 rounded-xl bg-amber-500/20 items-center justify-center">
                      <Warehouse size={28} color="#F59E0B" />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-white font-semibold text-lg">Godown</Text>
                      <Text className="text-slate-400 text-sm mt-1">
                        Main, Top, or Damage Section
                      </Text>
                    </View>
                    <ChevronRight size={24} color="#64748B" />
                  </Pressable>
                </Animated.View>
              )}

              {step === 'area' && (
                <Animated.View entering={FadeInDown.duration(400)}>
                  {(locationType === 'showroom' ? showroomFloors : godownAreas).map(
                    (item, index) => (
                      <Pressable
                        key={item.value}
                        onPress={() => handleAreaSelect(item.value)}
                        className="bg-slate-800/50 rounded-2xl p-5 mb-3 flex-row items-center active:opacity-80"
                      >
                        <View className="w-12 h-12 rounded-xl bg-slate-700 items-center justify-center">
                          <Text className="text-white font-bold text-lg">{index + 1}</Text>
                        </View>
                        <Text className="text-white font-semibold text-lg ml-4 flex-1">
                          {item.label}
                        </Text>
                        <ChevronRight size={24} color="#64748B" />
                      </Pressable>
                    )
                  )}
                </Animated.View>
              )}

              {step === 'rack' && (
                <Animated.View entering={FadeInDown.duration(400)}>
                  <View className="bg-slate-800/50 rounded-2xl p-5 mb-4">
                    <View className="flex-row items-center mb-4">
                      <Package size={24} color="#3B82F6" />
                      <Text className="text-slate-400 ml-3">
                        {locationType === 'showroom' ? 'Showroom' : 'Godown'} -{' '}
                        {floor ?? area}
                      </Text>
                    </View>
                    <TextInput
                      value={rackNo}
                      onChangeText={(v) => {
                        setRackNo(v);
                        setError('');
                      }}
                      placeholder="Enter rack number (e.g., A1, B2)"
                      placeholderTextColor="#64748B"
                      autoCapitalize="characters"
                      autoFocus
                      className="bg-slate-900/50 rounded-xl px-4 py-4 text-white text-lg border border-slate-700"
                    />
                    {error ? (
                      <Text className="text-red-400 text-sm mt-2">{error}</Text>
                    ) : null}
                  </View>

                  <Pressable
                    onPress={handleCreateSession}
                    className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
                  >
                    <Text className="text-white font-bold text-lg">Start Session</Text>
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
