import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, useSessionStore, mockUsers } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { ArrowLeft, User, Lock, Fingerprint, Eye, EyeOff, KeyRound } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type LoginMode = 'pin' | 'credentials';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<LoginMode>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  const shakeX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withSpring(-10),
      withSpring(10),
      withSpring(-10),
      withSpring(10),
      withSpring(0)
    );
  };

  const handleBiometric = async () => {
    // Biometric is simulated for demo - in production, integrate with device biometrics
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Default to staff user for biometric
    const defaultUser = mockUsers.find((u) => u.role === 'staff') || mockUsers[0];
    login(defaultUser, defaultUser.pin || '1234');
    router.replace('/dashboard');
  };

  const handleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === 'pin') {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        triggerShake();
        return;
      }
      // Find user by PIN
      const user = mockUsers.find((u) => u.pin === pin && u.isActive);
      if (!user) {
        setError('Invalid PIN');
        triggerShake();
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(user, pin);
      router.replace('/dashboard');
    } else {
      if (!username || !password) {
        setError('Please enter username and password');
        triggerShake();
        return;
      }

      if (isRegistering) {
        // Show PIN setup for registration
        setShowPinSetup(true);
        return;
      }

      // Find user by username (password check simplified for demo)
      const user = mockUsers.find((u) => u.username === username && u.isActive);
      if (!user) {
        setError('Invalid username or password');
        triggerShake();
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(user, user.pin || '1234');
      router.replace('/dashboard');
    }
  };

  const handlePinSetup = async () => {
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      triggerShake();
      return;
    }
    // Create new staff user for registration
    const newUser = {
      id: Date.now().toString(),
      username,
      name: username,
      role: 'staff' as const,
      isActive: true,
      pin: newPin,
    };
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    login(newUser, newPin);
    router.replace('/dashboard');
  };

  const PinInput = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <View className="mb-4">
      <Text className="text-slate-400 text-sm mb-2">{label}</Text>
      <View className="flex-row justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={cn(
              'w-14 h-14 rounded-xl items-center justify-center border-2',
              value.length > i ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 bg-slate-800/50'
            )}
          >
            <Text className="text-2xl text-white font-bold">
              {value.length > i ? '•' : ''}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        className="absolute opacity-0 w-full h-14"
        autoFocus={mode === 'pin'}
      />
    </View>
  );

  if (showPinSetup) {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={['#0F172A', '#1E3A5F', '#0F172A']}
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={() => setShowPinSetup(false)}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <View className="flex-1 justify-center">
                <Animated.View entering={FadeInDown.duration(500)}>
                  <Text className="text-2xl font-bold text-white text-center mb-2">
                    Set Your PIN
                  </Text>
                  <Text className="text-slate-400 text-center mb-8">
                    Create a 4-digit PIN for quick access
                  </Text>

                  <PinInput value={newPin} onChange={setNewPin} label="Enter 4-digit PIN" />

                  {error ? (
                    <Text className="text-red-400 text-center mb-4">{error}</Text>
                  ) : null}

                  <Pressable
                    onPress={handlePinSetup}
                    className="bg-blue-500 rounded-2xl py-4 items-center mt-6 active:opacity-80"
                  >
                    <Text className="text-white font-bold text-lg">Complete Setup</Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0F172A', '#1E3A5F', '#0F172A']}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <Animated.View
                entering={FadeInDown.duration(500)}
                className="mt-8 mb-6"
              >
                <Text className="text-2xl font-bold text-white">
                  {isRegistering ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text className="text-slate-400 mt-1">
                  {isRegistering ? 'Register to get started' : 'Sign in to continue'}
                </Text>
              </Animated.View>

              {/* Mode Toggle */}
              <Animated.View
                entering={FadeInDown.duration(500).delay(100)}
                className="flex-row bg-slate-800/50 rounded-xl p-1 mb-6"
              >
                <Pressable
                  onPress={() => { setMode('credentials'); setError(''); }}
                  className={cn(
                    'flex-1 py-3 rounded-lg items-center',
                    mode === 'credentials' && 'bg-blue-500'
                  )}
                >
                  <Text className={cn('font-semibold', mode === 'credentials' ? 'text-white' : 'text-slate-400')}>
                    Username
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { setMode('pin'); setError(''); setIsRegistering(false); }}
                  className={cn(
                    'flex-1 py-3 rounded-lg items-center',
                    mode === 'pin' && 'bg-blue-500'
                  )}
                >
                  <Text className={cn('font-semibold', mode === 'pin' ? 'text-white' : 'text-slate-400')}>
                    PIN
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={animatedStyle}>
                {mode === 'credentials' ? (
                  <Animated.View entering={FadeInDown.duration(400)}>
                    {/* Username */}
                    <View className="mb-4">
                      <Text className="text-slate-400 text-sm mb-2">Username</Text>
                      <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <User size={20} color="#64748B" />
                        <TextInput
                          value={username}
                          onChangeText={setUsername}
                          placeholder="Enter username"
                          placeholderTextColor="#64748B"
                          autoCapitalize="none"
                          className="flex-1 py-4 px-3 text-white text-base"
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View className="mb-4">
                      <Text className="text-slate-400 text-sm mb-2">Password</Text>
                      <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <Lock size={20} color="#64748B" />
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Enter password"
                          placeholderTextColor="#64748B"
                          secureTextEntry={!showPassword}
                          className="flex-1 py-4 px-3 text-white text-base"
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <EyeOff size={20} color="#64748B" />
                          ) : (
                            <Eye size={20} color="#64748B" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInDown.duration(400)}>
                    <PinInput value={pin} onChange={setPin} label="Enter your 4-digit PIN" />
                  </Animated.View>
                )}
              </Animated.View>

              {error ? (
                <Text className="text-red-400 text-center mb-4">{error}</Text>
              ) : null}

              {/* Login Button */}
              <Animated.View entering={FadeInUp.duration(500).delay(200)}>
                <Pressable
                  onPress={handleLogin}
                  className="bg-blue-500 rounded-2xl py-4 items-center active:opacity-80"
                >
                  <Text className="text-white font-bold text-lg">
                    {isRegistering ? 'Register' : 'Login'}
                  </Text>
                </Pressable>

                {/* Biometric */}
                {mode === 'pin' && (
                  <Pressable
                    onPress={handleBiometric}
                    className="flex-row items-center justify-center mt-4 py-3"
                  >
                    <Fingerprint size={24} color="#3B82F6" />
                    <Text className="text-blue-400 ml-2 font-medium">
                      Use Biometric
                    </Text>
                  </Pressable>
                )}

                {/* Toggle Register/Login */}
                {mode === 'credentials' && (
                  <Pressable
                    onPress={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="mt-6"
                  >
                    <Text className="text-slate-400 text-center">
                      {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                      <Text className="text-blue-400 font-semibold">
                        {isRegistering ? 'Login' : 'Register'}
                      </Text>
                    </Text>
                  </Pressable>
                )}
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
