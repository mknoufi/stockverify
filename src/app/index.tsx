import React, { useEffect } from 'react';
import { View, Text, Pressable, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Scan, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WelcomeScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0.2);
  const floatY = useSharedValue(0);

  useEffect(() => {
    SplashScreen.hideAsync();

    logoScale.value = withSequence(
      withTiming(1.05, { duration: 400, easing: Easing.out(Easing.exp) }),
      withTiming(1, { duration: 200 })
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
      -1,
      true
    );

    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: floatY.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const features = [
    { icon: Scan, title: 'Smart Scanning', desc: 'Instant barcode recognition', color: '#3B82F6' },
    { icon: ShieldCheck, title: 'Verified Counts', desc: 'Multi-level approval workflow', color: '#10B981' },
    { icon: BarChart3, title: 'Live Analytics', desc: 'Real-time variance tracking', color: '#F59E0B' },
  ];

  const handleGetStarted = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/login');
  };

  return (
    <View className="flex-1 bg-[#020617]">
      <LinearGradient
        colors={['#020617', '#0c1929', '#0f172a', '#020617']}
        locations={[0, 0.3, 0.7, 1]}
        style={{ position: 'absolute', width, height }}
      />

      {/* Animated Glow Orbs */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.1,
            left: -width * 0.4,
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: width * 0.45,
            backgroundColor: '#1d4ed8',
          },
          glowAnimatedStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: height * 0.15,
            right: -width * 0.4,
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            backgroundColor: '#0d9488',
          },
          glowAnimatedStyle,
        ]}
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* Logo Section */}
          <Animated.View
            entering={FadeIn.duration(800).delay(200)}
            className="items-center mt-10"
          >
            <Animated.View style={logoAnimatedStyle} className="items-center">
              <Image
                source={require('../../assets/icon.png')}
                style={{
                  width: 200,
                  height: 100,
                  resizeMode: 'contain',
                }}
              />
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.duration(600).delay(400)}
              className="text-slate-500 text-sm mt-4 tracking-widest uppercase"
            >
              Inventory Management System
            </Animated.Text>
          </Animated.View>

          {/* Features Section */}
          <View className="flex-1 justify-center py-6">
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.duration(500).delay(600 + index * 120)}
              >
                <BlurView
                  intensity={25}
                  tint="dark"
                  className="rounded-2xl mb-3 overflow-hidden"
                >
                  <View className="flex-row items-center p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                    <View
                      style={{ backgroundColor: `${feature.color}15` }}
                      className="w-14 h-14 rounded-2xl items-center justify-center"
                    >
                      <feature.icon size={26} color={feature.color} strokeWidth={1.5} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-white font-semibold text-[17px]">
                        {feature.title}
                      </Text>
                      <Text className="text-slate-400 text-sm mt-1">
                        {feature.desc}
                      </Text>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </View>

          {/* CTA Section */}
          <Animated.View
            entering={FadeInUp.duration(600).delay(1000)}
            className="pb-6"
          >
            <AnimatedPressable
              onPress={handleGetStarted}
              className="overflow-hidden rounded-2xl active:scale-[0.98]"
              style={{ transform: [{ scale: 1 }] }}
            >
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-[17px] mr-2">
                  Get Started
                </Text>
                <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
            </AnimatedPressable>

            <View className="flex-row items-center justify-center mt-5">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
              <Text className="text-slate-500 text-sm">
                Secure PIN & Biometric Login
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
