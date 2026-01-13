import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useSettingsStore, ThemeMode, FontSize, FontStyle } from '@/lib/settings-store';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeft,
  Sun,
  Moon,
  Smartphone,
  Type,
  Fingerprint,
  Bell,
  Volume2,
  Vibrate,
  Lock,
  RotateCcw,
  ChevronRight,
  Check,
  LogOut,
} from 'lucide-react-native';

type SettingSection = 'main' | 'theme' | 'fontSize' | 'fontStyle';

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const logout = useAuthStore((s) => s.logout);

  const [activeSection, setActiveSection] = useState<SettingSection>('main');

  const theme = useSettingsStore((s) => s.theme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const fontStyle = useSettingsStore((s) => s.fontStyle);
  const biometricEnabled = useSettingsStore((s) => s.biometricEnabled);
  const autoLockEnabled = useSettingsStore((s) => s.autoLockEnabled);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled);

  const setTheme = useSettingsStore((s) => s.setTheme);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setFontStyle = useSettingsStore((s) => s.setFontStyle);
  const setBiometricEnabled = useSettingsStore((s) => s.setBiometricEnabled);
  const setAutoLockEnabled = useSettingsStore((s) => s.setAutoLockEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setVibrationEnabled = useSettingsStore((s) => s.setVibrationEnabled);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const handleBack = () => {
    if (activeSection !== 'main') {
      setActiveSection('main');
      return;
    }
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
    router.replace('/');
  };

  const handleResetSettings = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetSettings();
  };

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Smartphone },
  ];

  const fontSizeOptions: { value: FontSize; label: string; size: string }[] = [
    { value: 'small', label: 'Small', size: 'Aa' },
    { value: 'medium', label: 'Medium', size: 'Aa' },
    { value: 'large', label: 'Large', size: 'Aa' },
  ];

  const fontStyleOptions: { value: FontStyle; label: string; preview: string }[] = [
    { value: 'default', label: 'Default', preview: 'Abc' },
    { value: 'rounded', label: 'Rounded', preview: 'Abc' },
    { value: 'serif', label: 'Serif', preview: 'Abc' },
  ];

  const SettingRow = ({
    icon: Icon,
    label,
    value,
    onPress,
    hasChevron = true,
  }: {
    icon: typeof Sun;
    label: string;
    value?: string;
    onPress?: () => void;
    hasChevron?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-slate-800/50 rounded-xl mb-3 active:opacity-80"
    >
      <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
        <Icon size={20} color="#3B82F6" />
      </View>
      <Text className="flex-1 text-white text-base ml-3">{label}</Text>
      {value && <Text className="text-slate-400 mr-2">{value}</Text>}
      {hasChevron && <ChevronRight size={20} color="#64748B" />}
    </Pressable>
  );

  const ToggleRow = ({
    icon: Icon,
    label,
    value,
    onValueChange,
    iconColor = '#3B82F6',
  }: {
    icon: typeof Sun;
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    iconColor?: string;
  }) => (
    <View className="flex-row items-center py-4 px-4 bg-slate-800/50 rounded-xl mb-3">
      <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
        <Icon size={20} color={iconColor} />
      </View>
      <Text className="flex-1 text-white text-base ml-3">{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(v);
        }}
        trackColor={{ false: '#475569', true: '#3B82F6' }}
        thumbColor="#fff"
      />
    </View>
  );

  // Theme Selection Screen
  if (activeSection === 'theme') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={handleBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-xl font-bold text-white ml-4">Theme</Text>
              </View>

              <Animated.View entering={FadeInDown.duration(400)}>
                {themeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTheme(option.value);
                    }}
                    className={cn(
                      'flex-row items-center py-4 px-4 rounded-xl mb-3',
                      theme === option.value ? 'bg-blue-500/30 border border-blue-500' : 'bg-slate-800/50'
                    )}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <option.icon size={20} color="#3B82F6" />
                    </View>
                    <Text className="flex-1 text-white text-base ml-3">{option.label}</Text>
                    {theme === option.value && <Check size={20} color="#3B82F6" />}
                  </Pressable>
                ))}
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Font Size Selection Screen
  if (activeSection === 'fontSize') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={handleBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-xl font-bold text-white ml-4">Font Size</Text>
              </View>

              <Animated.View entering={FadeInDown.duration(400)}>
                {fontSizeOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontSize(option.value);
                    }}
                    className={cn(
                      'flex-row items-center py-4 px-4 rounded-xl mb-3',
                      fontSize === option.value ? 'bg-blue-500/30 border border-blue-500' : 'bg-slate-800/50'
                    )}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <Text
                        className={cn(
                          'text-blue-400 font-bold',
                          option.value === 'small' && 'text-sm',
                          option.value === 'medium' && 'text-base',
                          option.value === 'large' && 'text-lg'
                        )}
                      >
                        {option.size}
                      </Text>
                    </View>
                    <Text className="flex-1 text-white text-base ml-3">{option.label}</Text>
                    {fontSize === option.value && <Check size={20} color="#3B82F6" />}
                  </Pressable>
                ))}

                {/* Preview */}
                <View className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                  <Text className="text-slate-400 text-sm mb-2">Preview</Text>
                  <Text
                    className={cn(
                      'text-white',
                      fontSize === 'small' && 'text-sm',
                      fontSize === 'medium' && 'text-base',
                      fontSize === 'large' && 'text-lg'
                    )}
                  >
                    This is how your text will look with the selected font size.
                  </Text>
                </View>
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Font Style Selection Screen
  if (activeSection === 'fontStyle') {
    return (
      <View className="flex-1">
        <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1">
            <View className="flex-1 px-6 pt-4">
              <View className="flex-row items-center mb-6">
                <Pressable
                  onPress={handleBack}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
                <Text className="text-xl font-bold text-white ml-4">Font Style</Text>
              </View>

              <Animated.View entering={FadeInDown.duration(400)}>
                {fontStyleOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontStyle(option.value);
                    }}
                    className={cn(
                      'flex-row items-center py-4 px-4 rounded-xl mb-3',
                      fontStyle === option.value ? 'bg-blue-500/30 border border-blue-500' : 'bg-slate-800/50'
                    )}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <Text className="text-blue-400 font-bold">{option.preview}</Text>
                    </View>
                    <Text className="flex-1 text-white text-base ml-3">{option.label}</Text>
                    {fontStyle === option.value && <Check size={20} color="#3B82F6" />}
                  </Pressable>
                ))}
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Main Settings Screen
  return (
    <View className="flex-1">
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center px-6 pt-4 mb-4">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <ArrowLeft size={20} color="#fff" />
            </Pressable>
            <Text className="text-xl font-bold text-white ml-4">Settings</Text>
          </View>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {/* Appearance Section */}
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text className="text-slate-400 text-sm font-medium mb-3 mt-2">APPEARANCE</Text>

              <SettingRow
                icon={theme === 'dark' ? Moon : Sun}
                label="Theme"
                value={theme.charAt(0).toUpperCase() + theme.slice(1)}
                onPress={() => setActiveSection('theme')}
              />

              <SettingRow
                icon={Type}
                label="Font Size"
                value={fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
                onPress={() => setActiveSection('fontSize')}
              />

              <SettingRow
                icon={Type}
                label="Font Style"
                value={fontStyle.charAt(0).toUpperCase() + fontStyle.slice(1)}
                onPress={() => setActiveSection('fontStyle')}
              />
            </Animated.View>

            {/* Security Section */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <Text className="text-slate-400 text-sm font-medium mb-3 mt-6">SECURITY</Text>

              <ToggleRow
                icon={Fingerprint}
                label="Biometric Login"
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
              />

              <ToggleRow
                icon={Lock}
                label="Auto-Lock"
                value={autoLockEnabled}
                onValueChange={setAutoLockEnabled}
              />
            </Animated.View>

            {/* Notifications Section */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <Text className="text-slate-400 text-sm font-medium mb-3 mt-6">NOTIFICATIONS</Text>

              <ToggleRow
                icon={Bell}
                label="Push Notifications"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />

              <ToggleRow
                icon={Volume2}
                label="Sound"
                value={soundEnabled}
                onValueChange={setSoundEnabled}
              />

              <ToggleRow
                icon={Vibrate}
                label="Vibration"
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
              />
            </Animated.View>

            {/* Actions Section */}
            <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-8">
              <Text className="text-slate-400 text-sm font-medium mb-3 mt-6">ACTIONS</Text>

              <Pressable
                onPress={handleResetSettings}
                className="flex-row items-center py-4 px-4 bg-slate-800/50 rounded-xl mb-3 active:opacity-80"
              >
                <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                  <RotateCcw size={20} color="#F97316" />
                </View>
                <Text className="flex-1 text-white text-base ml-3">Reset to Defaults</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                className="flex-row items-center py-4 px-4 bg-red-500/10 rounded-xl mb-3 active:opacity-80"
              >
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center">
                  <LogOut size={20} color="#EF4444" />
                </View>
                <Text className="flex-1 text-red-400 text-base ml-3">Logout</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
