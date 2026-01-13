import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/lib/settings-store';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Fingerprint, ShieldCheck, X } from 'lucide-react-native';

export default function BiometricSetupScreen() {
  const router = useRouter();

  const setBiometricEnabled = useSettingsStore((s) => s.setBiometricEnabled);
  const setBiometricSetupShown = useSettingsStore((s) => s.setBiometricSetupShown);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Determine biometric type based on platform
  const biometricType = Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint';

  const handleEnableBiometric = async () => {
    setIsAuthenticating(true);

    // Simulate biometric authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setBiometricEnabled(true);
    setBiometricSetupShown(true);
    setIsAuthenticating(false);
    router.replace('/dashboard');
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBiometricSetupShown(true);
    router.replace('/dashboard');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            {/* Close Button */}
            <View className="flex-row justify-end">
              <Pressable
                onPress={handleClose}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <X size={20} color="#fff" />
              </Pressable>
            </View>

            <View className="flex-1 justify-center items-center">
              <Animated.View entering={FadeInDown.duration(600)} className="items-center">
                {/* Icon */}
                <View className="w-24 h-24 rounded-full bg-blue-500/20 items-center justify-center mb-6">
                  <Fingerprint size={48} color="#3B82F6" />
                </View>

                <Text className="text-2xl font-bold text-white text-center mb-3">
                  Enable {biometricType}
                </Text>

                <Text className="text-slate-400 text-center text-base mb-8 px-4">
                  Use {biometricType} for faster and more secure login to your account
                </Text>

                {/* Benefits */}
                <View className="w-full bg-slate-800/50 rounded-2xl p-4 mb-8">
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                      <ShieldCheck size={16} color="#22C55E" />
                    </View>
                    <Text className="text-white ml-3 flex-1">Quick and secure access</Text>
                  </View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                      <ShieldCheck size={16} color="#22C55E" />
                    </View>
                    <Text className="text-white ml-3 flex-1">No need to remember PIN</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                      <ShieldCheck size={16} color="#22C55E" />
                    </View>
                    <Text className="text-white ml-3 flex-1">Protected by device security</Text>
                  </View>
                </View>
              </Animated.View>

              {/* Buttons */}
              <Animated.View entering={FadeInUp.duration(600).delay(200)} className="w-full">
                <Pressable
                  onPress={handleEnableBiometric}
                  disabled={isAuthenticating}
                  className={`bg-blue-500 rounded-2xl py-4 items-center mb-3 ${isAuthenticating ? 'opacity-50' : 'active:opacity-80'}`}
                >
                  <Text className="text-white font-bold text-lg">
                    {isAuthenticating ? 'Authenticating...' : `Enable ${biometricType}`}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSkip}
                  disabled={isAuthenticating}
                  className="py-4 items-center"
                >
                  <Text className="text-slate-400 font-medium text-base">
                    Skip for now
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
