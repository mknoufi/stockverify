import React from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Scan, ShieldCheck, BarChart3 } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    { icon: Scan, title: 'Barcode Scanning', desc: 'Quick item identification' },
    { icon: ShieldCheck, title: 'Stock Verification', desc: 'Accurate inventory counts' },
    { icon: BarChart3, title: 'Real-time Reports', desc: 'Track variances instantly' },
  ];

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/login');
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0F172A', '#1E3A5F', '#0F172A']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-12">
            {/* Logo & Title */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              className="items-center mb-12"
            >
              <View className="w-20 h-20 rounded-2xl bg-blue-500/20 items-center justify-center mb-4">
                <Scan size={40} color="#3B82F6" strokeWidth={1.5} />
              </View>
              <Text className="text-3xl font-bold text-white text-center">
                StockVerify
              </Text>
              <Text className="text-base text-slate-400 text-center mt-2">
                Professional Inventory Audit System
              </Text>
            </Animated.View>

            {/* Features */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(300)}
              className="flex-1 justify-center"
            >
              {features.map((feature, index) => (
                <Animated.View
                  key={feature.title}
                  entering={FadeInDown.duration(500).delay(400 + index * 100)}
                  className="flex-row items-center bg-white/5 rounded-2xl p-4 mb-3"
                >
                  <View className="w-12 h-12 rounded-xl bg-blue-500/20 items-center justify-center">
                    <feature.icon size={24} color="#3B82F6" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white font-semibold text-base">
                      {feature.title}
                    </Text>
                    <Text className="text-slate-400 text-sm mt-0.5">
                      {feature.desc}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>

            {/* CTA Buttons */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(700)}
              className="pb-8"
            >
              <Pressable
                onPress={handleGetStarted}
                className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
              >
                <Text className="text-white font-bold text-lg">
                  Get Started
                </Text>
              </Pressable>

              <Text className="text-slate-500 text-center text-sm mt-4">
                Secure login with PIN & Biometric
              </Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
