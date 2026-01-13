import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';
export type FontStyle = 'default' | 'rounded' | 'serif';

interface SettingsState {
  // Appearance
  theme: ThemeMode;
  fontSize: FontSize;
  fontStyle: FontStyle;

  // Security
  biometricEnabled: boolean;
  biometricSetupShown: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in minutes

  // Notifications
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setFontStyle: (style: FontStyle) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setBiometricSetupShown: (shown: boolean) => void;
  setAutoLockEnabled: (enabled: boolean) => void;
  setAutoLockTimeout: (timeout: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  theme: 'dark' as ThemeMode,
  fontSize: 'medium' as FontSize,
  fontStyle: 'default' as FontStyle,
  biometricEnabled: false,
  biometricSetupShown: false,
  autoLockEnabled: true,
  autoLockTimeout: 5,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontStyle: (fontStyle) => set({ fontStyle }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setBiometricSetupShown: (biometricSetupShown) => set({ biometricSetupShown }),
      setAutoLockEnabled: (autoLockEnabled) => set({ autoLockEnabled }),
      setAutoLockTimeout: (autoLockTimeout) => set({ autoLockTimeout }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Font size multipliers
export const fontSizeMultipliers: Record<FontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
};

// Get scaled font size
export function getScaledFontSize(baseSize: number, fontSize: FontSize): number {
  return Math.round(baseSize * fontSizeMultipliers[fontSize]);
}
