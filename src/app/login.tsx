import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useAuthStore, mockUsers } from '@/lib/store';
import { useSettingsStore } from '@/lib/settings-store';
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
import { ArrowLeft, User, Lock, Fingerprint, Eye, EyeOff, Phone, MessageCircle } from 'lucide-react-native';
import { sendWhatsAppOTP, verifyOTP, formatPhoneNumber } from '@/lib/whatsapp-service';

type LoginMode = 'pin' | 'credentials';
type RegistrationStep = 'details' | 'phone' | 'otp' | 'pin';

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const login = useAuthStore((s) => s.login);
  const biometricSetupShown = useSettingsStore((s) => s.biometricSetupShown);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Navigate to dashboard or biometric setup based on first login
  const navigateAfterLogin = () => {
    if (!biometricSetupShown) {
      router.replace('/biometric-setup');
    } else {
      router.replace('/dashboard');
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const [mode, setMode] = useState<LoginMode>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration flow states
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('details');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef<TextInput>(null);

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

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleBiometric = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const defaultUser = mockUsers.find((u) => u.role === 'staff') || mockUsers[0];
    login(defaultUser, defaultUser.pin || '1234');
    navigateAfterLogin();
  };

  const handleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === 'pin') {
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        triggerShake();
        return;
      }
      const user = mockUsers.find((u) => u.pin === pin && u.isActive);
      if (!user) {
        setError('Invalid PIN');
        triggerShake();
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(user, pin);
      navigateAfterLogin();
    } else {
      if (!username || !password) {
        setError('Please enter username and password');
        triggerShake();
        return;
      }

      if (isRegistering) {
        // Move to phone number step
        setRegistrationStep('phone');
        setError('');
        return;
      }

      const user = mockUsers.find((u) => u.username === username && u.isActive);
      if (!user) {
        setError('Invalid username or password');
        triggerShake();
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(user, user.pin || '1234');
      navigateAfterLogin();
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendWhatsAppOTP(phoneNumber);
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRegistrationStep('otp');
        setResendTimer(60);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } else {
        setError(result.error || 'Failed to send OTP');
        triggerShake();
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = verifyOTP(phoneNumber, otp);
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRegistrationStep('pin');
      } else {
        setError(result.error || 'Invalid OTP');
        triggerShake();
      }
    } catch {
      setError('Verification failed. Please try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    await handleSendOTP();
  };

  const handlePinSetup = async () => {
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      triggerShake();
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      name: username,
      role: 'staff' as const,
      isActive: true,
      pin: newPin,
      phone: formatPhoneNumber(phoneNumber),
    };
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    login(newUser, newPin);
    navigateAfterLogin();
  };

  const handleRegistrationBack = () => {
    setError('');
    if (registrationStep === 'phone') {
      setRegistrationStep('details');
    } else if (registrationStep === 'otp') {
      setRegistrationStep('phone');
      setOtp('');
    } else if (registrationStep === 'pin') {
      setRegistrationStep('otp');
      setNewPin('');
    }
  };

  const resetRegistration = () => {
    setIsRegistering(false);
    setRegistrationStep('details');
    setPhoneNumber('');
    setOtp('');
    setNewPin('');
    setError('');
  };

  const PinInput = ({ value, onChange, label, digits = 4 }: { value: string; onChange: (v: string) => void; label: string; digits?: number }) => (
    <View className="mb-4">
      <Text className="text-slate-400 text-sm mb-2">{label}</Text>
      <View className="flex-row justify-center gap-3">
        {Array.from({ length: digits }).map((_, i) => (
          <View
            key={i}
            className={cn(
              'w-12 h-14 rounded-xl items-center justify-center border-2',
              value.length > i ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 bg-slate-800/50'
            )}
          >
            <Text className="text-2xl text-white font-bold">
              {value.length > i ? (digits === 4 ? '•' : value[i]) : ''}
            </Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={digits === 6 ? otpInputRef : undefined}
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, '').slice(0, digits))}
        keyboardType="number-pad"
        maxLength={digits}
        className="absolute opacity-0 w-full h-14"
        autoFocus
      />
    </View>
  );

  // Phone Number Entry Screen
  if (isRegistering && registrationStep === 'phone') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
              <View className="flex-1 px-6 pt-4">
                <Pressable
                  onPress={handleRegistrationBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>

                <View className="flex-1 justify-center">
                  <Animated.View entering={FadeInDown.duration(500)}>
                    <View className="items-center mb-6">
                      <View className="w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4">
                        <MessageCircle size={32} color="#22C55E" />
                      </View>
                      <Text className="text-2xl font-bold text-white text-center mb-2">
                        Verify via WhatsApp
                      </Text>
                      <Text className="text-slate-400 text-center">
                        We'll send a verification code to your WhatsApp
                      </Text>
                    </View>

                    <View className="mb-6">
                      <Text className="text-slate-400 text-sm mb-2">Phone Number</Text>
                      <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <Text className="text-white text-base mr-2">+91</Text>
                        <Phone size={20} color="#64748B" />
                        <TextInput
                          value={phoneNumber}
                          onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="Enter phone number"
                          placeholderTextColor="#64748B"
                          keyboardType="phone-pad"
                          maxLength={10}
                          className="flex-1 py-4 px-3 text-white text-base"
                        />
                      </View>
                    </View>

                    {error ? (
                      <Text className="text-red-400 text-center mb-4">{error}</Text>
                    ) : null}

                    <Pressable
                      onPress={handleSendOTP}
                      disabled={isLoading}
                      className={cn(
                        'rounded-2xl py-4 items-center',
                        isLoading ? 'bg-blue-500/50' : 'bg-blue-500 active:opacity-80'
                      )}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-lg">Send OTP</Text>
                      )}
                    </Pressable>
                  </Animated.View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // OTP Verification Screen
  if (isRegistering && registrationStep === 'otp') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
              <View className="flex-1 px-6 pt-4">
                <Pressable
                  onPress={handleRegistrationBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>

                <View className="flex-1 justify-center">
                  <Animated.View entering={FadeInDown.duration(500)}>
                    <Text className="text-2xl font-bold text-white text-center mb-2">
                      Enter OTP
                    </Text>
                    <Text className="text-slate-400 text-center mb-8">
                      We sent a 6-digit code to{'\n'}
                      <Text className="text-white font-medium">+91 {phoneNumber}</Text>
                    </Text>

                    <PinInput value={otp} onChange={setOtp} label="Enter 6-digit OTP" digits={6} />

                    {error ? (
                      <Text className="text-red-400 text-center mb-4">{error}</Text>
                    ) : null}

                    <Pressable
                      onPress={handleVerifyOTP}
                      disabled={isLoading}
                      className={cn(
                        'rounded-2xl py-4 items-center mt-4',
                        isLoading ? 'bg-blue-500/50' : 'bg-blue-500 active:opacity-80'
                      )}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-lg">Verify</Text>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={handleResendOTP}
                      disabled={resendTimer > 0}
                      className="mt-6"
                    >
                      <Text className="text-center">
                        {resendTimer > 0 ? (
                          <Text className="text-slate-500">Resend OTP in {resendTimer}s</Text>
                        ) : (
                          <Text className="text-blue-400 font-medium">Resend OTP</Text>
                        )}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // PIN Setup Screen
  if (isRegistering && registrationStep === 'pin') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={handleRegistrationBack}
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

  // Main Login Screen
  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <Animated.View entering={FadeInDown.duration(500)} className="mt-8 mb-6">
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
                  onPress={() => { setMode('credentials'); setError(''); resetRegistration(); }}
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
                  onPress={() => { setMode('pin'); setError(''); resetRegistration(); }}
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
                    {isRegistering ? 'Continue' : 'Login'}
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

                {/* Forgot Password/PIN */}
                {!isRegistering && (
                  <Pressable
                    onPress={handleForgotPassword}
                    className="mt-4"
                  >
                    <Text className="text-slate-400 text-center">
                      Forgot {mode === 'credentials' ? 'Password' : 'PIN'}?{' '}
                      <Text className="text-orange-400 font-medium">Reset</Text>
                    </Text>
                  </Pressable>
                )}

                {/* Toggle Register/Login */}
                {mode === 'credentials' && (
                  <Pressable
                    onPress={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="mt-4"
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
