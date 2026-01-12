import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  Session,
  CountedEntry,
  DashboardStats,
  Item,
  UserRole,
  VerificationStatus,
  VerificationEntry,
} from './types';
import * as Device from 'expo-device';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pin: string | null;
  login: (user: User, pin: string) => void;
  logout: () => void;
  verifyPin: (pin: string) => boolean;
  getCurrentUserRole: () => UserRole | null;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  entries: CountedEntry[];
  users: User[]; // Mock users for demo
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'totalScanned' | 'totalVerified'>) => Session;
  setCurrentSession: (session: Session | null) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  completeSession: (id: string) => void;
  submitSessionForVerification: (sessionId: string) => void;
  addEntry: (entry: Omit<CountedEntry, 'id' | 'createdAt' | 'verificationStatus'>) => CountedEntry;
  updateEntry: (id: string, updates: Partial<CountedEntry>) => void;
  approveEntry: (entryId: string, supervisorId: string, remarks?: string) => void;
  rejectEntry: (entryId: string, supervisorId: string, reason: string, remarks?: string) => void;
  requestRecount: (entryId: string, supervisorId: string, reason: string, assignToUserId: string) => void;
  getSessionEntries: (sessionId: string) => CountedEntry[];
  getPendingVerifications: (supervisorId?: string) => VerificationEntry[];
  getDashboardStats: (userId: string, userRole: UserRole) => DashboardStats;
  getUserById: (userId: string) => User | undefined;
  checkDuplicateEntry: (sessionId: string, itemId: string, barcode: string) => CountedEntry | undefined;
  getItemEntriesAcrossSessions: (itemId: string) => CountedEntry[];
}

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'staff1',
    name: 'Rajesh Kumar',
    role: 'staff',
    isActive: true,
    pin: '1234',
  },
  {
    id: '2',
    username: 'staff2',
    name: 'Priya Sharma',
    role: 'staff',
    isActive: true,
    pin: '5678',
  },
  {
    id: '3',
    username: 'supervisor1',
    name: 'Amit Patel',
    role: 'supervisor',
    isActive: true,
    pin: '1111',
    assignedScope: {
      floors: ['ground', 'first'],
    },
  },
  {
    id: '4',
    username: 'admin1',
    name: 'Manager',
    role: 'admin',
    isActive: true,
    pin: '0000',
  },
];

// Mock items data with comprehensive fields
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Samsung Galaxy S24 Ultra',
    itemCode: 'MOB-SAM-S24U-001',
    barcode: '8801234567890',
    serialBarcode: '5101234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Samsung',
    mrp: 134999,
    salePrice: 129999,
    costPrice: 120000,
    systemStock: 15,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8517' },
    variants: [
      { barcode: '8801234567891', systemStock: 8, uom: 'PCS' },
      { barcode: '8801234567892', systemStock: 5, uom: 'PCS' },
    ],
  },
  {
    id: '2',
    name: 'Apple iPhone 15 Pro Max',
    itemCode: 'MOB-APP-IP15PM-001',
    barcode: '1901234567890',
    serialBarcode: '5201234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Apple',
    mrp: 159900,
    salePrice: 154900,
    costPrice: 145000,
    systemStock: 12,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8517' },
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5 Headphones',
    itemCode: 'AUD-SON-WH1000XM5-001',
    barcode: '4901234567890',
    serialBarcode: '5301234567890',
    category: 'Electronics',
    subCategory: 'Audio',
    brand: 'Sony',
    mrp: 29990,
    salePrice: 26990,
    costPrice: 25000,
    systemStock: 25,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: { gstPercent: 18, hsn: '8518' },
  },
  {
    id: '4',
    name: 'LG 55" OLED TV C3',
    itemCode: 'TV-LG-55OLED-C3-001',
    barcode: '8801234500001',
    category: 'Electronics',
    subCategory: 'Televisions',
    brand: 'LG',
    mrp: 139990,
    salePrice: 129990,
    costPrice: 120000,
    systemStock: 5,
    uom: 'PCS',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: { gstPercent: 28, hsn: '8528' },
  },
  {
    id: '5',
    name: 'Duracell AA Batteries 4-Pack',
    itemCode: 'BAT-DUR-AA4PK-001',
    barcode: '5001234567890',
    category: 'Electronics',
    subCategory: 'Batteries',
    brand: 'Duracell',
    mrp: 299,
    salePrice: 249,
    costPrice: 200,
    systemStock: 150,
    uom: 'PKT',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '8506' },
  },
  {
    id: '6',
    name: 'Philips LED Bulb 9W',
    itemCode: 'LGT-PHI-LED9W-001',
    barcode: '8901234567890',
    category: 'Lighting',
    subCategory: 'LED Bulbs',
    brand: 'Philips',
    mrp: 149,
    salePrice: 129,
    costPrice: 100,
    systemStock: 200,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '8539' },
  },
  {
    id: '7',
    name: 'Bosch Power Drill Kit',
    itemCode: 'TLS-BOS-DRILL-001',
    barcode: '4001234567890',
    category: 'Tools',
    subCategory: 'Power Tools',
    brand: 'Bosch',
    mrp: 8999,
    salePrice: 7999,
    costPrice: 7000,
    systemStock: 18,
    uom: 'SET',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: { gstPercent: 18, hsn: '8467' },
  },
  {
    id: '8',
    name: 'Prestige Pressure Cooker 5L',
    itemCode: 'KIT-PRE-PC5L-001',
    barcode: '8901234500002',
    category: 'Kitchen',
    subCategory: 'Cookware',
    brand: 'Prestige',
    mrp: 2499,
    salePrice: 2199,
    costPrice: 1800,
    systemStock: 30,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: { gstPercent: 18, hsn: '7323' },
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      pin: null,
      login: async (user, pin) => {
        // In production, get device ID for single active device enforcement
        const deviceId = Device.modelId || 'unknown';
        const updatedUser = { ...user, deviceId, lastLoginAt: new Date().toISOString() };
        set({ user: updatedUser, isAuthenticated: true, pin });
      },
      logout: () => set({ user: null, isAuthenticated: false, pin: null }),
      verifyPin: (pin) => get().pin === pin,
      getCurrentUserRole: () => get().user?.role || null,
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
      users: mockUsers,
      createSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          totalScanned: 0,
          totalVerified: 0,
          status: 'active',
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
      submitSessionForVerification: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: 'submitted' as const, submittedAt: new Date().toISOString() }
              : s
          ),
          entries: state.entries.map((e) =>
            e.sessionId === sessionId && e.verificationStatus === 'pending'
              ? { ...e, submittedAt: new Date().toISOString() }
              : e
          ),
        }));
      },
      addEntry: (entryData) => {
        const newEntry: CountedEntry = {
          ...entryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          verificationStatus: 'pending',
        };
        set((state) => {
          const updatedEntries = [...state.entries, newEntry];
          // Update session stats
          const sessionEntries = updatedEntries.filter((e) => e.sessionId === entryData.sessionId);
          const totalScanned = sessionEntries.length;
          const totalVerified = sessionEntries.filter(
            (e) => e.verificationStatus === 'approved'
          ).length;
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
      approveEntry: (entryId, supervisorId, remarks) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  verificationStatus: 'approved' as const,
                  verifiedBy: supervisorId,
                  verifiedAt: new Date().toISOString(),
                  supervisorRemarks: remarks,
                }
              : e
          ),
        }));
      },
      rejectEntry: (entryId, supervisorId, reason, remarks) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  verificationStatus: 'rejected' as const,
                  verifiedBy: supervisorId,
                  verifiedAt: new Date().toISOString(),
                  rejectionReason: reason,
                  supervisorRemarks: remarks,
                }
              : e
          ),
        }));
      },
      requestRecount: (entryId, supervisorId, reason, assignToUserId) => {
        set((state) => {
          const originalEntry = state.entries.find((e) => e.id === entryId);
          if (!originalEntry) return state;

          const recountEntry: CountedEntry = {
            ...originalEntry,
            id: Date.now().toString(),
            verificationStatus: 'recount' as const,
            isRecount: true,
            originalEntryId: entryId,
            createdAt: new Date().toISOString(),
          };

          return {
            entries: [
              ...state.entries.map((e) =>
                e.id === entryId
                  ? {
                      ...e,
                      verificationStatus: 'recount' as const,
                      verifiedBy: supervisorId,
                      verifiedAt: new Date().toISOString(),
                      rejectionReason: reason,
                      recountAssignedTo: assignToUserId,
                      recountRequestedAt: new Date().toISOString(),
                    }
                  : e
              ),
              recountEntry,
            ],
          };
        });
      },
      getSessionEntries: (sessionId) => get().entries.filter((e) => e.sessionId === sessionId),
      getPendingVerifications: (supervisorId) => {
        const state = get();
        const pendingEntries = state.entries.filter(
          (e) => e.verificationStatus === 'pending' || e.verificationStatus === 'recount'
        );
        return pendingEntries.map((entry) => {
          const session = state.sessions.find((s) => s.id === entry.sessionId);
          const item = mockItems.find((i) => i.id === entry.itemId);
          const user = state.users.find((u) => u.id === session?.userId);
          return {
            entry,
            session: session!,
            item: item!,
            staffName: user?.name || 'Unknown',
          };
        });
      },
      getDashboardStats: (userId, userRole) => {
        const state = get();
        const userSessions =
          userRole === 'admin'
            ? state.sessions
            : userRole === 'supervisor'
              ? state.sessions.filter((s) => {
                  // Filter by supervisor's assigned scope
                  const supervisor = state.users.find((u) => u.id === userId);
                  if (!supervisor?.assignedScope) return true;
                  // Simplified scope check - in production, implement full scope logic
                  return true;
                })
              : state.sessions.filter((s) => s.userId === userId);

        const userEntries = state.entries.filter((e) =>
          userSessions.some((s) => s.id === e.sessionId)
        );

        const stats: DashboardStats = {
          totalScanned: userEntries.length,
          totalVerified: userEntries.filter((e) => e.verificationStatus === 'approved').length,
          totalRacksFinished: userSessions.filter((s) => s.status === 'completed').length,
          shortItems: userEntries.filter((e) => e.variance < 0).length,
          overItems: userEntries.filter((e) => e.variance > 0).length,
          matchedItems: userEntries.filter((e) => e.variance === 0).length,
        };

        if (userRole === 'supervisor' || userRole === 'admin') {
          stats.pendingVerifications = state.entries.filter(
            (e) => e.verificationStatus === 'pending'
          ).length;
          stats.activeSessions = userSessions.filter((s) => s.status === 'active').length;
        }

        return stats;
      },
      getUserById: (userId) => get().users.find((u) => u.id === userId),
      checkDuplicateEntry: (sessionId, itemId, barcode) => {
        return get().entries.find(
          (e) => e.sessionId === sessionId && e.itemId === itemId && e.itemBarcode === barcode
        );
      },
      getItemEntriesAcrossSessions: (itemId) => {
        return get().entries.filter((e) => e.itemId === itemId);
      },
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to search items with prefix-based routing
export function searchItems(query: string): Item[] {
  if (query.length < 3) return [];
  
  // Prefix-based routing: 51/52/53 → Barcode search only
  const prefix = query.substring(0, 2);
  const isBarcodePrefix = prefix === '51' || prefix === '52' || prefix === '53';
  
  if (isBarcodePrefix) {
    // Barcode search only (including serial barcode)
    return mockItems.filter(
      (item) =>
        item.barcode.includes(query) ||
        item.serialBarcode?.includes(query) ||
        item.variants?.some((v) => v.barcode.includes(query))
    );
  } else {
    // Item name search only (exclude item code from public search)
    const lowerQuery = query.toLowerCase();
    return mockItems.filter((item) => item.name.toLowerCase().includes(lowerQuery));
  }
}

export function getItemByBarcode(barcode: string): Item | undefined {
  // Check main barcode, serial barcode, and variants
  return (
    mockItems.find((item) => item.barcode === barcode) ||
    mockItems.find((item) => item.serialBarcode === barcode) ||
    mockItems.find((item) => item.variants?.some((v) => v.barcode === barcode))
  );
}
