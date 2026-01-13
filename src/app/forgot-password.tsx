import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore, mockUsers } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Phone, MessageCircle, KeyRound, Lock } from 'lucide-react-native';
import { sendWhatsAppOTP, verifyOTP, formatPhoneNumber } from '@/lib/whatsapp-service';

type RecoveryMode = 'password' | 'pin';
type RecoveryStep = 'phone' | 'otp' | 'reset';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<RecoveryMode>('password');
  const [step, setStep] = useState<RecoveryStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
    } else if (step === 'reset') {
      setStep('otp');
      setNewPassword('');
      setNewPin('');
      setConfirmPin('');
      setError('');
    } else {
      router.back();
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Check if phone number exists in system
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const userExists = mockUsers.some((u) => u.phone === formattedPhone || u.username === phoneNumber);

    // For demo purposes, allow any phone number
    // In production, verify against your user database

    setIsLoading(true);
    setError('');

    try {
      const result = await sendWhatsAppOTP(phoneNumber);
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('otp');
        setResendTimer(60);
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = verifyOTP(phoneNumber, otp);
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('reset');
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (mode === 'password') {
      if (!newPassword || newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else {
      if (newPin.length !== 4) {
        setError('PIN must be 4 digits');
        return;
      }
      if (newPin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
    }

    // In production, update the user's password/PIN in the database
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // For demo, find or create user and log them in
    const existingUser = mockUsers.find((u) => u.username === phoneNumber) || mockUsers[0];
    const updatedUser = {
      ...existingUser,
      pin: mode === 'pin' ? newPin : existingUser.pin,
    };

    login(updatedUser, updatedUser.pin || '1234');
    router.replace('/dashboard');
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    await handleSendOTP();
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
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, '').slice(0, digits))}
        keyboardType="number-pad"
        maxLength={digits}
        className="absolute opacity-0 w-full h-14"
        autoFocus
      />
    </View>
  );

  // Phone Number Entry
  if (step === 'phone') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
              <View className="flex-1 px-6 pt-4">
                <Pressable
                  onPress={handleBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>

                <View className="flex-1 justify-center">
                  <Animated.View entering={FadeInDown.duration(500)}>
                    <View className="items-center mb-6">
                      <View className="w-16 h-16 rounded-full bg-orange-500/20 items-center justify-center mb-4">
                        <KeyRound size={32} color="#F97316" />
                      </View>
                      <Text className="text-2xl font-bold text-white text-center mb-2">
                        Account Recovery
                      </Text>
                      <Text className="text-slate-400 text-center">
                        Enter your phone number to reset your {mode === 'password' ? 'password' : 'PIN'}
                      </Text>
                    </View>

                    {/* Mode Toggle */}
                    <View className="flex-row bg-slate-800/50 rounded-xl p-1 mb-6">
                      <Pressable
                        onPress={() => setMode('password')}
                        className={cn(
                          'flex-1 py-3 rounded-lg items-center',
                          mode === 'password' && 'bg-blue-500'
                        )}
                      >
                        <Text className={cn('font-semibold', mode === 'password' ? 'text-white' : 'text-slate-400')}>
                          Password
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setMode('pin')}
                        className={cn(
                          'flex-1 py-3 rounded-lg items-center',
                          mode === 'pin' && 'bg-blue-500'
                        )}
                      >
                        <Text className={cn('font-semibold', mode === 'pin' ? 'text-white' : 'text-slate-400')}>
                          PIN
                        </Text>
                      </Pressable>
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

  // OTP Verification
  if (step === 'otp') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
              <View className="flex-1 px-6 pt-4">
                <Pressable
                  onPress={handleBack}
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
                        Enter OTP
                      </Text>
                      <Text className="text-slate-400 text-center">
                        We sent a 6-digit code to{'\n'}
                        <Text className="text-white font-medium">+91 {phoneNumber}</Text>
                      </Text>
                    </View>

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

  // Reset Password/PIN
  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>

              <View className="flex-1 justify-center">
                <Animated.View entering={FadeInDown.duration(500)}>
                  <View className="items-center mb-6">
                    <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center mb-4">
                      <Lock size={32} color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-bold text-white text-center mb-2">
                      {mode === 'password' ? 'Reset Password' : 'Reset PIN'}
                    </Text>
                    <Text className="text-slate-400 text-center">
                      {mode === 'password'
                        ? 'Create a new password for your account'
                        : 'Create a new 4-digit PIN for quick access'
                      }
                    </Text>
                  </View>

                  {mode === 'password' ? (
                    <View className="mb-4">
                      <Text className="text-slate-400 text-sm mb-2">New Password</Text>
                      <View className="flex-row items-center bg-slate-800/50 rounded-xl px-4 border border-slate-700">
                        <Lock size={20} color="#64748B" />
                        <TextInput
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Enter new password"
                          placeholderTextColor="#64748B"
                          secureTextEntry
                          className="flex-1 py-4 px-3 text-white text-base"
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <PinInput value={newPin} onChange={setNewPin} label="New PIN" />
                      <PinInput value={confirmPin} onChange={setConfirmPin} label="Confirm PIN" />
                    </>
                  )}

                  {error ? (
                    <Text className="text-red-400 text-center mb-4">{error}</Text>
                  ) : null}

                  <Pressable
                    onPress={handleResetPassword}
                    className="bg-blue-500 rounded-2xl py-4 items-center mt-4 active:opacity-80"
                  >
                    <Text className="text-white font-bold text-lg">
                      {mode === 'password' ? 'Reset Password' : 'Reset PIN'}
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
