import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useSettingsStore, ThemeMode, FontSize, FontStyle } from '@/lib/settings-store';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
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
  Palette,
  Settings2,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'light', label: 'Light', icon: Sun, desc: 'Bright and clean appearance' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes at night' },
    { value: 'system', label: 'System', icon: Smartphone, desc: 'Follows device settings' },
  ];

  const fontSizeOptions: { value: FontSize; label: string; desc: string; scale: number }[] = [
    { value: 'small', label: 'Small', desc: 'Compact text', scale: 0.85 },
    { value: 'medium', label: 'Medium', desc: 'Default size', scale: 1 },
    { value: 'large', label: 'Large', desc: 'Larger text', scale: 1.15 },
  ];

  const fontStyleOptions: { value: FontStyle; label: string; desc: string }[] = [
    { value: 'default', label: 'Default', desc: 'System font' },
    { value: 'rounded', label: 'Rounded', desc: 'Soft and friendly' },
    { value: 'serif', label: 'Serif', desc: 'Classic and elegant' },
  ];

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
          top: -height * 0.15,
          right: -width * 0.3,
          width: width * 0.7,
          height: width * 0.7,
          borderRadius: width * 0.35,
          backgroundColor: '#1d4ed8',
          opacity: 0.12,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.1,
          left: -width * 0.3,
          width: width * 0.5,
          height: width * 0.5,
          borderRadius: width * 0.25,
          backgroundColor: '#0d9488',
          opacity: 0.08,
        }}
      />
    </>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    value,
    onPress,
    iconBg = 'bg-blue-500/15',
    iconColor = '#3B82F6',
  }: {
    icon: typeof Sun;
    label: string;
    value?: string;
    onPress?: () => void;
    iconBg?: string;
    iconColor?: string;
  }) => (
    <Pressable onPress={onPress} className="active:scale-[0.98] active:opacity-90">
      <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden mb-3">
        <View className="flex-row items-center py-4 px-4 bg-white/[0.03] border border-white/[0.06]">
          <View className={cn('w-11 h-11 rounded-xl items-center justify-center', iconBg)}>
            <Icon size={20} color={iconColor} strokeWidth={1.5} />
          </View>
          <Text className="flex-1 text-white text-[16px] ml-3">{label}</Text>
          {value && <Text className="text-slate-400 mr-2 text-[15px]">{value}</Text>}
          <ChevronRight size={18} color="#64748B" />
        </View>
      </BlurView>
    </Pressable>
  );

  const ToggleRow = ({
    icon: Icon,
    label,
    value,
    onValueChange,
    iconBg = 'bg-blue-500/15',
    iconColor = '#3B82F6',
  }: {
    icon: typeof Sun;
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    iconBg?: string;
    iconColor?: string;
  }) => (
    <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden mb-3">
      <View className="flex-row items-center py-4 px-4 bg-white/[0.03] border border-white/[0.06]">
        <View className={cn('w-11 h-11 rounded-xl items-center justify-center', iconBg)}>
          <Icon size={20} color={iconColor} strokeWidth={1.5} />
        </View>
        <Text className="flex-1 text-white text-[16px] ml-3">{label}</Text>
        <Switch
          value={value}
          onValueChange={(v) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onValueChange(v);
          }}
          trackColor={{ false: '#334155', true: '#2563eb' }}
          thumbColor="#fff"
          ios_backgroundColor="#334155"
        />
      </View>
    </BlurView>
  );

  // Theme Selection Screen
  if (activeSection === 'theme') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            <View className="flex-row items-center mb-8">
              <Pressable
                onPress={handleBack}
                className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <Text className="text-xl font-bold text-white ml-4">Theme</Text>
            </View>

            <Animated.View entering={FadeInDown.duration(400)}>
              {themeOptions.map((option, index) => (
                <Animated.View key={option.value} entering={FadeInDown.duration(400).delay(index * 80)}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setTheme(option.value);
                    }}
                    className="active:scale-[0.98]"
                  >
                    <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mb-3">
                      <View
                        className={cn(
                          'flex-row items-center py-5 px-4 border',
                          theme === option.value
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-white/[0.03] border-white/[0.06]'
                        )}
                      >
                        <View
                          className={cn(
                            'w-12 h-12 rounded-xl items-center justify-center',
                            theme === option.value ? 'bg-blue-500/20' : 'bg-white/10'
                          )}
                        >
                          <option.icon size={24} color={theme === option.value ? '#3B82F6' : '#94A3B8'} strokeWidth={1.5} />
                        </View>
                        <View className="flex-1 ml-4">
                          <Text className="text-white text-[17px] font-semibold">{option.label}</Text>
                          <Text className="text-slate-400 text-sm mt-0.5">{option.desc}</Text>
                        </View>
                        {theme === option.value && (
                          <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                            <Check size={18} color="#fff" strokeWidth={2.5} />
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Font Size Selection Screen
  if (activeSection === 'fontSize') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            <View className="flex-row items-center mb-8">
              <Pressable
                onPress={handleBack}
                className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <Text className="text-xl font-bold text-white ml-4">Font Size</Text>
            </View>

            <Animated.View entering={FadeInDown.duration(400)}>
              {fontSizeOptions.map((option, index) => (
                <Animated.View key={option.value} entering={FadeInDown.duration(400).delay(index * 80)}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontSize(option.value);
                    }}
                    className="active:scale-[0.98]"
                  >
                    <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mb-3">
                      <View
                        className={cn(
                          'flex-row items-center py-5 px-4 border',
                          fontSize === option.value
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-white/[0.03] border-white/[0.06]'
                        )}
                      >
                        <View
                          className={cn(
                            'w-12 h-12 rounded-xl items-center justify-center',
                            fontSize === option.value ? 'bg-blue-500/20' : 'bg-white/10'
                          )}
                        >
                          <Text
                            style={{ fontSize: 16 * option.scale }}
                            className={cn('font-bold', fontSize === option.value ? 'text-blue-400' : 'text-slate-400')}
                          >
                            Aa
                          </Text>
                        </View>
                        <View className="flex-1 ml-4">
                          <Text className="text-white text-[17px] font-semibold">{option.label}</Text>
                          <Text className="text-slate-400 text-sm mt-0.5">{option.desc}</Text>
                        </View>
                        {fontSize === option.value && (
                          <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                            <Check size={18} color="#fff" strokeWidth={2.5} />
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              ))}

              {/* Preview Card */}
              <Animated.View entering={FadeIn.duration(500).delay(300)}>
                <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mt-4">
                  <View className="p-5 bg-white/[0.03] border border-white/[0.06]">
                    <Text className="text-slate-400 text-xs uppercase tracking-wider mb-3">Preview</Text>
                    <Text
                      style={{ fontSize: 16 * fontSizeOptions.find((o) => o.value === fontSize)!.scale }}
                      className="text-white leading-relaxed"
                    >
                      This is how your text will appear throughout the app with the selected font size.
                    </Text>
                  </View>
                </BlurView>
              </Animated.View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Font Style Selection Screen
  if (activeSection === 'fontStyle') {
    return (
      <View className="flex-1 bg-[#020617]">
        <BackgroundGradient />
        <SafeAreaView className="flex-1">
          <View className="flex-1 px-6 pt-4">
            <View className="flex-row items-center mb-8">
              <Pressable
                onPress={handleBack}
                className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
              >
                <ArrowLeft size={20} color="#fff" />
              </Pressable>
              <Text className="text-xl font-bold text-white ml-4">Font Style</Text>
            </View>

            <Animated.View entering={FadeInDown.duration(400)}>
              {fontStyleOptions.map((option, index) => (
                <Animated.View key={option.value} entering={FadeInDown.duration(400).delay(index * 80)}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFontStyle(option.value);
                    }}
                    className="active:scale-[0.98]"
                  >
                    <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden mb-3">
                      <View
                        className={cn(
                          'flex-row items-center py-5 px-4 border',
                          fontStyle === option.value
                            ? 'bg-blue-500/10 border-blue-500/50'
                            : 'bg-white/[0.03] border-white/[0.06]'
                        )}
                      >
                        <View
                          className={cn(
                            'w-12 h-12 rounded-xl items-center justify-center',
                            fontStyle === option.value ? 'bg-blue-500/20' : 'bg-white/10'
                          )}
                        >
                          <Text className={cn('text-lg font-bold', fontStyle === option.value ? 'text-blue-400' : 'text-slate-400')}>
                            Abc
                          </Text>
                        </View>
                        <View className="flex-1 ml-4">
                          <Text className="text-white text-[17px] font-semibold">{option.label}</Text>
                          <Text className="text-slate-400 text-sm mt-0.5">{option.desc}</Text>
                        </View>
                        {fontStyle === option.value && (
                          <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                            <Check size={18} color="#fff" strokeWidth={2.5} />
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Main Settings Screen
  return (
    <View className="flex-1 bg-[#020617]">
      <BackgroundGradient />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-6 pt-4 mb-6">
          <Pressable
            onPress={handleBack}
            className="w-11 h-11 rounded-full bg-white/[0.08] items-center justify-center active:bg-white/[0.12]"
          >
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <View className="ml-4">
            <Text className="text-2xl font-bold text-white">Settings</Text>
            <Text className="text-slate-400 text-sm mt-0.5">Customize your experience</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Appearance Section */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View className="flex-row items-center mb-4 mt-2">
              <Palette size={16} color="#64748B" />
              <Text className="text-slate-400 text-xs font-semibold ml-2 uppercase tracking-wider">Appearance</Text>
            </View>

            <SettingRow
              icon={theme === 'dark' ? Moon : theme === 'light' ? Sun : Smartphone}
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
            <View className="flex-row items-center mb-4 mt-6">
              <Lock size={16} color="#64748B" />
              <Text className="text-slate-400 text-xs font-semibold ml-2 uppercase tracking-wider">Security</Text>
            </View>

            <ToggleRow
              icon={Fingerprint}
              label="Biometric Login"
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              iconBg="bg-emerald-500/15"
              iconColor="#10B981"
            />

            <ToggleRow
              icon={Lock}
              label="Auto-Lock"
              value={autoLockEnabled}
              onValueChange={setAutoLockEnabled}
              iconBg="bg-amber-500/15"
              iconColor="#F59E0B"
            />
          </Animated.View>

          {/* Notifications Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <View className="flex-row items-center mb-4 mt-6">
              <Bell size={16} color="#64748B" />
              <Text className="text-slate-400 text-xs font-semibold ml-2 uppercase tracking-wider">Notifications</Text>
            </View>

            <ToggleRow
              icon={Bell}
              label="Push Notifications"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              iconBg="bg-violet-500/15"
              iconColor="#8B5CF6"
            />

            <ToggleRow
              icon={Volume2}
              label="Sound"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              iconBg="bg-cyan-500/15"
              iconColor="#06B6D4"
            />

            <ToggleRow
              icon={Vibrate}
              label="Vibration"
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              iconBg="bg-pink-500/15"
              iconColor="#EC4899"
            />
          </Animated.View>

          {/* Actions Section */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} className="mb-10">
            <View className="flex-row items-center mb-4 mt-6">
              <Settings2 size={16} color="#64748B" />
              <Text className="text-slate-400 text-xs font-semibold ml-2 uppercase tracking-wider">Actions</Text>
            </View>

            <Pressable onPress={handleResetSettings} className="active:scale-[0.98]">
              <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden mb-3">
                <View className="flex-row items-center py-4 px-4 bg-white/[0.03] border border-white/[0.06]">
                  <View className="w-11 h-11 rounded-xl bg-orange-500/15 items-center justify-center">
                    <RotateCcw size={20} color="#F97316" strokeWidth={1.5} />
                  </View>
                  <Text className="flex-1 text-white text-[16px] ml-3">Reset to Defaults</Text>
                </View>
              </BlurView>
            </Pressable>

            <Pressable onPress={handleLogout} className="active:scale-[0.98]">
              <BlurView intensity={15} tint="dark" className="rounded-2xl overflow-hidden mb-3">
                <View className="flex-row items-center py-4 px-4 bg-red-500/[0.05] border border-red-500/20">
                  <View className="w-11 h-11 rounded-xl bg-red-500/15 items-center justify-center">
                    <LogOut size={20} color="#EF4444" strokeWidth={1.5} />
                  </View>
                  <Text className="flex-1 text-red-400 text-[16px] ml-3 font-medium">Logout</Text>
                </View>
              </BlurView>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
