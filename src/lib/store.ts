import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session, CountedEntry, DashboardStats, Item } from './types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pin: string | null;
  login: (user: User, pin: string) => void;
  logout: () => void;
  verifyPin: (pin: string) => boolean;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  entries: CountedEntry[];
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'totalScanned' | 'totalVerified'>) => Session;
  setCurrentSession: (session: Session | null) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  completeSession: (id: string) => void;
  addEntry: (entry: Omit<CountedEntry, 'id' | 'createdAt'>) => CountedEntry;
  updateEntry: (id: string, updates: Partial<CountedEntry>) => void;
  getSessionEntries: (sessionId: string) => CountedEntry[];
  getDashboardStats: (userId: string) => DashboardStats;
}

// Mock items data
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    barcode: '8801234567890',
    mrp: 134999,
    salePrice: 129999,
    systemStock: 15,
    uom: 'PCS',
    isSerialized: true,
    variants: [
      { barcode: '8801234567891', systemStock: 8, uom: 'PCS' },
      { barcode: '8801234567892', systemStock: 5, uom: 'PCS' },
    ],
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max',
    barcode: '1901234567890',
    mrp: 159900,
    salePrice: 154900,
    systemStock: 12,
    uom: 'PCS',
    isSerialized: true,
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    barcode: '4901234567890',
    mrp: 29990,
    salePrice: 26990,
    systemStock: 25,
    uom: 'PCS',
    isSerialized: true,
  },
  {
    id: '4',
    name: 'LG 55" OLED TV C3',
    barcode: '8801234500001',
    mrp: 139990,
    salePrice: 129990,
    systemStock: 5,
    uom: 'PCS',
    isSerialized: true,
    isBundleEnabled: true,
  },
  {
    id: '5',
    name: 'Duracell AA Batteries 4-Pack',
    barcode: '5001234567890',
    mrp: 299,
    salePrice: 249,
    systemStock: 150,
    uom: 'PKT',
    isSerialized: false,
  },
  {
    id: '6',
    name: 'Philips LED Bulb 9W',
    barcode: '8901234567890',
    mrp: 149,
    salePrice: 129,
    systemStock: 200,
    uom: 'PCS',
    isSerialized: false,
  },
  {
    id: '7',
    name: 'Bosch Power Drill Kit',
    barcode: '4001234567890',
    mrp: 8999,
    salePrice: 7999,
    systemStock: 18,
    uom: 'SET',
    isSerialized: true,
    isBundleEnabled: true,
  },
  {
    id: '8',
    name: 'Prestige Pressure Cooker 5L',
    barcode: '8901234500002',
    mrp: 2499,
    salePrice: 2199,
    systemStock: 30,
    uom: 'PCS',
    isSerialized: false,
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pin: null,
      login: (user, pin) => set({ user, isAuthenticated: true, pin }),
      logout: () => set({ user: null, isAuthenticated: false, pin: null }),
      verifyPin: (pin) => get().pin === pin,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      entries: [],
      createSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          totalScanned: 0,
          totalVerified: 0,
        };
        set((state) => ({ sessions: [...state.sessions, newSession] }));
        return newSession;
      },
      setCurrentSession: (session) => set({ currentSession: session }),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          currentSession:
            state.currentSession?.id === id
              ? { ...state.currentSession, ...updates }
              : state.currentSession,
        })),
      completeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: 'completed' as const } : s
          ),
          currentSession: state.currentSession?.id === id ? null : state.currentSession,
        })),
      addEntry: (entryData) => {
        const newEntry: CountedEntry = {
          ...entryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const updatedEntries = [...state.entries, newEntry];
          // Update session stats
          const sessionEntries = updatedEntries.filter((e) => e.sessionId === entryData.sessionId);
          const totalScanned = sessionEntries.length;
          const totalVerified = sessionEntries.filter((e) => e.variance === 0).length;
          return {
            entries: updatedEntries,
            sessions: state.sessions.map((s) =>
              s.id === entryData.sessionId ? { ...s, totalScanned, totalVerified } : s
            ),
            currentSession:
              state.currentSession?.id === entryData.sessionId
                ? { ...state.currentSession, totalScanned, totalVerified }
                : state.currentSession,
          };
        });
        return newEntry;
      },
      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      getSessionEntries: (sessionId) => get().entries.filter((e) => e.sessionId === sessionId),
      getDashboardStats: (userId) => {
        const state = get();
        const userSessions = state.sessions.filter((s) => s.userId === userId);
        const userEntries = state.entries.filter((e) =>
          userSessions.some((s) => s.id === e.sessionId)
        );
        return {
          totalScanned: userEntries.length,
          totalVerified: userEntries.filter((e) => e.variance === 0).length,
          totalRacksFinished: userSessions.filter((s) => s.status === 'completed').length,
          shortItems: userEntries.filter((e) => e.variance < 0).length,
          overItems: userEntries.filter((e) => e.variance > 0).length,
          matchedItems: userEntries.filter((e) => e.variance === 0).length,
        };
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to search items
export function searchItems(query: string): Item[] {
  if (query.length < 3) return [];
  const lowerQuery = query.toLowerCase();
  return mockItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) || item.barcode.includes(query)
  );
}

export function getItemByBarcode(barcode: string): Item | undefined {
  return mockItems.find((item) => item.barcode === barcode);
}
