import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useAuthStore, mockUsers } from '@/lib/store';
import { useSettingsStore } from '@/lib/settings-store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ArrowLeft, User, Lock, Fingerprint, Eye, EyeOff, Phone, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { sendWhatsAppOTP, verifyOTP, formatPhoneNumber } from '@/lib/whatsapp-service';

const { width, height } = Dimensions.get('window');

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

  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('details');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef<TextInput>(null);
  const pinInputRef = useRef<TextInput>(null);

  const shakeX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shakeX.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animateButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

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
    animateButton();
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

  // Enhanced PIN Input Component
  const PinInput = ({ value, onChange, label, digits = 4, autoFocusInput = false }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    digits?: number;
    autoFocusInput?: boolean;
  }) => (
    <View className="mb-6">
      <Text className="text-slate-400 text-sm mb-4 text-center">{label}</Text>
      <View className="flex-row justify-center" style={{ gap: 12 }}>
        {Array.from({ length: digits }).map((_, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.duration(300).delay(i * 50)}
          >
            <View
              className={cn(
                'w-14 h-16 rounded-2xl items-center justify-center border-2',
                value.length > i
                  ? 'border-blue-500 bg-blue-500/10'
                  : value.length === i
                    ? 'border-blue-400 bg-white/5'
                    : 'border-slate-700 bg-white/[0.02]'
              )}
            >
              <Text className="text-2xl text-white font-bold">
                {value.length > i ? (digits === 4 ? '●' : value[i]) : ''}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>
      <TextInput
        ref={digits === 6 ? otpInputRef : pinInputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, '').slice(0, digits))}
        keyboardType="number-pad"
        maxLength={digits}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: 60 }}
        autoFocus={autoFocusInput}
      />
    </View>
  );

  // Background Component
  const BackgroundGradient = () => (
    <>
      <LinearGradient
        colors={['#020617', '#0c1929', '#0f172a', '#020617']}
        locations={[0, 0.3, 0.7, 1]}
        style={{ position: 'absolute', width, height }}
      />
      <View
        style={{
          position: 'absolute',
          top: -height * 0.2,
          right: -width * 0.3,
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: width * 0.4,
          backgroundColor: '#1d4ed8',
          opacity: 0.15,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.1,
          left: -width * 0.3,
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: width * 0.3,
          backgroundColor: '#0d9488',
          opacity: 0.1,
        }}
      />
    </>
  );

  // Phone Number Entry Screen
  if (isRegistering && registrationStep === 'phone') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={handleRegistrationBack}
                className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <View className="flex-1 justify-center">
                <Animated.View entering={FadeInDown.duration(500)}>
                  <View className="items-center mb-8">
                    <View className="w-20 h-20 rounded-3xl bg-emerald-500/15 items-center justify-center mb-5">
                      <MessageCircle size={36} color="#10B981" strokeWidth={1.5} />
                    </View>
                    <Text className="text-2xl font-bold text-white text-center mb-2">
                      Verify via WhatsApp
                    </Text>
                    <Text className="text-slate-400 text-center text-base">
                      We'll send a verification code to your WhatsApp
                    </Text>
                  </View>

                  <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mb-6">
                    <View className="p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                      <View className="flex-row items-center px-4">
                        <View className="bg-white/10 px-3 py-2 rounded-lg mr-3">
                          <Text className="text-white font-semibold">+91</Text>
                        </View>
                        <TextInput
                          value={phoneNumber}
                          onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="Enter phone number"
                          placeholderTextColor="#64748B"
                          keyboardType="phone-pad"
                          maxLength={10}
                          className="flex-1 py-4 text-white text-lg"
                        />
                      </View>
                    </View>
                  </BlurView>

                  {error ? (
                    <Animated.Text entering={FadeIn.duration(200)} className="text-red-400 text-center mb-4">
                      {error}
                    </Animated.Text>
                  ) : null}

                  <Pressable
                    onPress={handleSendOTP}
                    disabled={isLoading}
                    className="overflow-hidden rounded-2xl active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={isLoading ? ['#1e40af', '#1e3a8a'] : ['#2563eb', '#1d4ed8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text className="text-white font-bold text-[17px] mr-2">Send OTP</Text>
                          <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  // OTP Verification Screen
  if (isRegistering && registrationStep === 'otp') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={handleRegistrationBack}
                className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <View className="flex-1 justify-center">
                <Animated.View entering={FadeInDown.duration(500)}>
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-bold text-white text-center mb-2">
                      Enter OTP
                    </Text>
                    <Text className="text-slate-400 text-center text-base">
                      We sent a 6-digit code to{'\n'}
                      <Text className="text-white font-medium">+91 {phoneNumber}</Text>
                    </Text>
                  </View>

                  <PinInput value={otp} onChange={setOtp} label="" digits={6} autoFocusInput />

                  {error ? (
                    <Animated.Text entering={FadeIn.duration(200)} className="text-red-400 text-center mb-4">
                      {error}
                    </Animated.Text>
                  ) : null}

                  <Pressable
                    onPress={handleVerifyOTP}
                    disabled={isLoading}
                    className="overflow-hidden rounded-2xl active:scale-[0.98]"
                  >
                    <LinearGradient
                      colors={isLoading ? ['#1e40af', '#1e3a8a'] : ['#2563eb', '#1d4ed8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 18, alignItems: 'center' }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text className="text-white font-bold text-[17px]">Verify</Text>
                      )}
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={handleResendOTP} disabled={resendTimer > 0} className="mt-6 py-3">
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
      </View>
    );
  }

  // PIN Setup Screen
  if (isRegistering && registrationStep === 'pin') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            <Pressable
              onPress={handleRegistrationBack}
              className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            <View className="flex-1 justify-center">
              <Animated.View entering={FadeInDown.duration(500)}>
                <View className="items-center mb-6">
                  <View className="w-20 h-20 rounded-3xl bg-blue-500/15 items-center justify-center mb-5">
                    <ShieldCheck size={36} color="#3B82F6" strokeWidth={1.5} />
                  </View>
                  <Text className="text-2xl font-bold text-white text-center mb-2">
                    Set Your PIN
                  </Text>
                  <Text className="text-slate-400 text-center text-base">
                    Create a 4-digit PIN for quick access
                  </Text>
                </View>

                <PinInput value={newPin} onChange={setNewPin} label="" autoFocusInput />

                {error ? (
                  <Animated.Text entering={FadeIn.duration(200)} className="text-red-400 text-center mb-4">
                    {error}
                  </Animated.Text>
                ) : null}

                <Pressable
                  onPress={handlePinSetup}
                  className="overflow-hidden rounded-2xl active:scale-[0.98]"
                >
                  <LinearGradient
                    colors={['#2563eb', '#1d4ed8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 18, alignItems: 'center' }}
                  >
                    <Text className="text-white font-bold text-[17px]">Complete Setup</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Main Login Screen
  return (
    <View className="flex-1 bg-[#020617]">
      <BackgroundGradient />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 px-6 pt-4">
            <Pressable
              onPress={handleBack}
              className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>

            <Animated.View entering={FadeInDown.duration(500)} className="mt-8 mb-8">
              <Text className="text-3xl font-bold text-white">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text className="text-slate-400 mt-2 text-base">
                {isRegistering ? 'Register to get started' : 'Sign in to continue'}
              </Text>
            </Animated.View>

            {/* Mode Toggle */}
            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
              <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mb-6">
                <View className="flex-row p-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                  <Pressable
                    onPress={() => { setMode('credentials'); setError(''); resetRegistration(); }}
                    className={cn(
                      'flex-1 py-3.5 rounded-xl items-center',
                      mode === 'credentials' && 'bg-blue-500'
                    )}
                  >
                    <Text className={cn('font-semibold text-[15px]', mode === 'credentials' ? 'text-white' : 'text-slate-400')}>
                      Username
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setMode('pin'); setError(''); resetRegistration(); }}
                    className={cn(
                      'flex-1 py-3.5 rounded-xl items-center',
                      mode === 'pin' && 'bg-blue-500'
                    )}
                  >
                    <Text className={cn('font-semibold text-[15px]', mode === 'pin' ? 'text-white' : 'text-slate-400')}>
                      PIN
                    </Text>
                  </Pressable>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View style={animatedStyle}>
              {mode === 'credentials' ? (
                <Animated.View entering={FadeInDown.duration(400)}>
                  {/* Username */}
                  <View className="mb-4">
                    <Text className="text-slate-400 text-sm mb-2 ml-1">Username</Text>
                    <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden">
                      <View className="flex-row items-center px-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
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
                    </BlurView>
                  </View>

                  {/* Password */}
                  <View className="mb-4">
                    <Text className="text-slate-400 text-sm mb-2 ml-1">Password</Text>
                    <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden">
                      <View className="flex-row items-center px-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                        <Lock size={20} color="#64748B" />
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Enter password"
                          placeholderTextColor="#64748B"
                          secureTextEntry={!showPassword}
                          className="flex-1 py-4 px-3 text-white text-base"
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
                          {showPassword ? (
                            <EyeOff size={20} color="#64748B" />
                          ) : (
                            <Eye size={20} color="#64748B" />
                          )}
                        </Pressable>
                      </View>
                    </BlurView>
                  </View>
                </Animated.View>
              ) : (
                <Animated.View entering={FadeInDown.duration(400)} className="py-4">
                  <PinInput value={pin} onChange={setPin} label="Enter your 4-digit PIN" autoFocusInput />
                </Animated.View>
              )}
            </Animated.View>

            {error ? (
              <Animated.Text entering={FadeIn.duration(200)} className="text-red-400 text-center mb-4">
                {error}
              </Animated.Text>
            ) : null}

            {/* Login Button */}
            <Animated.View entering={FadeInUp.duration(500).delay(200)} style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleLogin}
                className="overflow-hidden rounded-2xl active:scale-[0.98]"
              >
                <LinearGradient
                  colors={['#2563eb', '#1d4ed8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <Text className="text-white font-bold text-[17px] mr-2">
                    {isRegistering ? 'Continue' : 'Login'}
                  </Text>
                  <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                </LinearGradient>
              </Pressable>

              {/* Biometric */}
              {mode === 'pin' && (
                <Pressable
                  onPress={handleBiometric}
                  className="flex-row items-center justify-center mt-5 py-3"
                >
                  <View className="w-10 h-10 rounded-full bg-blue-500/15 items-center justify-center mr-3">
                    <Fingerprint size={22} color="#3B82F6" />
                  </View>
                  <Text className="text-blue-400 font-medium text-base">
                    Use Biometric
                  </Text>
                </Pressable>
              )}

              {/* Forgot Password/PIN */}
              {!isRegistering && (
                <Pressable onPress={handleForgotPassword} className="mt-4 py-2">
                  <Text className="text-slate-400 text-center">
                    Forgot {mode === 'credentials' ? 'Password' : 'PIN'}?{' '}
                    <Text className="text-amber-400 font-medium">Reset</Text>
                  </Text>
                </Pressable>
              )}

              {/* Toggle Register/Login */}
              {mode === 'credentials' && (
                <Pressable
                  onPress={() => { setIsRegistering(!isRegistering); setError(''); }}
                  className="mt-3 py-2"
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
    </View>
  );
}
