import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session, CountedEntry, DashboardStats, Item, Notification, AuditLog, OfflineAction, UserRole } from './types';

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
  notifications: Notification[];
  auditLogs: AuditLog[];
  offlineQueue: OfflineAction[];
  createSession: (session: Omit<Session, 'id' | 'createdAt' | 'totalScanned' | 'totalVerified' | 'totalRejected'>) => Session;
  setCurrentSession: (session: Session | null) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  completeSession: (id: string) => void;
  submitForVerification: (id: string) => void;
  addEntry: (entry: Omit<CountedEntry, 'id' | 'createdAt' | 'status' | 'isSynced'>) => CountedEntry;
  updateEntry: (id: string, updates: Partial<CountedEntry>) => void;
  verifyEntry: (id: string, supervisorId: string) => void;
  rejectEntry: (id: string, supervisorId: string, reason: string, reassignTo?: string) => void;
  getSessionEntries: (sessionId: string) => CountedEntry[];
  getDashboardStats: (userId: string) => DashboardStats;
  getPendingVerificationSessions: () => Session[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addToOfflineQueue: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'isSynced'>) => void;
  syncOfflineQueue: () => void;
  // New functions for duplicate detection and multi-location
  checkDuplicateEntry: (sessionId: string, itemId: string, itemBarcode: string) => CountedEntry | null;
  getItemEntriesAcrossSessions: (itemId: string) => CountedEntry[];
}

interface UserManagementState {
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deactivateUser: (id: string) => void;
  activateUser: (id: string) => void;
  getUsersByRole: (role: UserRole) => User[];
}

// Mock items data with full Item type
export const mockItems: Item[] = [
  {
    id: '1',
    itemCode: 'SAM-S24U-001',
    name: 'Samsung Galaxy S24 Ultra',
    barcode: '5101234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Samsung',
    mrp: 134999,
    salePrice: 129999,
    systemStock: 15,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: '18%',
    hsnCode: '8517',
    variants: [
      { barcode: '5101234567891', systemStock: 8, uom: 'PCS' },
      { barcode: '5101234567892', systemStock: 5, uom: 'PCS' },
    ],
  },
  {
    id: '2',
    itemCode: 'APL-IP15PM-001',
    name: 'Apple iPhone 15 Pro Max',
    barcode: '5201234567890',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    brand: 'Apple',
    mrp: 159900,
    salePrice: 154900,
    systemStock: 12,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: '18%',
    hsnCode: '8517',
  },
  {
    id: '3',
    itemCode: 'SNY-WH1000-001',
    name: 'Sony WH-1000XM5 Headphones',
    barcode: '5301234567890',
    category: 'Electronics',
    subCategory: 'Audio',
    brand: 'Sony',
    mrp: 29990,
    salePrice: 26990,
    systemStock: 25,
    uom: 'PCS',
    isSerialized: true,
    taxClassification: '18%',
    hsnCode: '8518',
  },
  {
    id: '4',
    itemCode: 'LG-OLED55C3-001',
    name: 'LG 55" OLED TV C3',
    barcode: '5101234500001',
    category: 'Electronics',
    subCategory: 'Television',
    brand: 'LG',
    mrp: 139990,
    salePrice: 129990,
    systemStock: 5,
    uom: 'PCS',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: '18%',
    hsnCode: '8528',
  },
  {
    id: '5',
    itemCode: 'DUR-AA4PK-001',
    name: 'Duracell AA Batteries 4-Pack',
    barcode: '1001234567890',
    category: 'Accessories',
    subCategory: 'Batteries',
    brand: 'Duracell',
    mrp: 299,
    salePrice: 249,
    systemStock: 150,
    uom: 'PKT',
    isSerialized: false,
    taxClassification: '18%',
    hsnCode: '8506',
  },
  {
    id: '6',
    itemCode: 'PHL-LED9W-001',
    name: 'Philips LED Bulb 9W',
    barcode: '1001234567891',
    category: 'Home',
    subCategory: 'Lighting',
    brand: 'Philips',
    mrp: 149,
    salePrice: 129,
    systemStock: 200,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: '18%',
    hsnCode: '8539',
  },
  {
    id: '7',
    itemCode: 'BSH-DRILL-001',
    name: 'Bosch Power Drill Kit',
    barcode: '5201234567891',
    category: 'Tools',
    subCategory: 'Power Tools',
    brand: 'Bosch',
    mrp: 8999,
    salePrice: 7999,
    systemStock: 18,
    uom: 'SET',
    isSerialized: true,
    isBundleEnabled: true,
    taxClassification: '18%',
    hsnCode: '8467',
  },
  {
    id: '8',
    itemCode: 'PRE-PC5L-001',
    name: 'Prestige Pressure Cooker 5L',
    barcode: '1001234500002',
    category: 'Home',
    subCategory: 'Kitchen',
    brand: 'Prestige',
    mrp: 2499,
    salePrice: 2199,
    systemStock: 30,
    uom: 'PCS',
    isSerialized: false,
    taxClassification: '18%',
    hsnCode: '7615',
  },
];

// Mock users for demo
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'staff1',
    name: 'Rahul Kumar',
    role: 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff2',
    name: 'Priya Sharma',
    role: 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'supervisor1',
    name: 'Amit Patel',
    role: 'supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    username: 'admin',
    name: 'Lavanya Admin',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
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
      notifications: [],
      auditLogs: [],
      offlineQueue: [],

      createSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          totalScanned: 0,
          totalVerified: 0,
          totalRejected: 0,
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

      submitForVerification: (id) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, status: 'pending_verification' as const } : s
          ),
          currentSession: state.currentSession?.id === id ? null : state.currentSession,
        })),

      addEntry: (entryData) => {
        const newEntry: CountedEntry = {
          ...entryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'pending',
          isSynced: false,
        };
        set((state) => {
          const updatedEntries = [...state.entries, newEntry];
          const sessionEntries = updatedEntries.filter((e) => e.sessionId === entryData.sessionId);
          const totalScanned = sessionEntries.length;
          const totalVerified = sessionEntries.filter((e) => e.status === 'verified').length;
          const totalRejected = sessionEntries.filter((e) => e.status === 'rejected').length;
          return {
            entries: updatedEntries,
            sessions: state.sessions.map((s) =>
              s.id === entryData.sessionId ? { ...s, totalScanned, totalVerified, totalRejected } : s
            ),
            currentSession:
              state.currentSession?.id === entryData.sessionId
                ? { ...state.currentSession, totalScanned, totalVerified, totalRejected }
                : state.currentSession,
          };
        });
        return newEntry;
      },

      updateEntry: (id, updates) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)),
        })),

      verifyEntry: (id, supervisorId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id
              ? { ...e, status: 'verified' as const, verifiedBy: supervisorId, verifiedAt: new Date().toISOString() }
              : e
          ),
        })),

      rejectEntry: (id, supervisorId, reason, reassignTo) =>
        set((state) => {
          const entry = state.entries.find((e) => e.id === id);
          const updatedEntries = state.entries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'recount_required' as const,
                  verifiedBy: supervisorId,
                  rejectionReason: reason,
                  recountAssignedTo: reassignTo,
                  recountCount: (e.recountCount ?? 0) + 1,
                }
              : e
          );

          // Add notification for recount if entry exists
          if (entry && reassignTo) {
            const notification: Notification = {
              id: Date.now().toString(),
              userId: reassignTo,
              title: 'Re-count Required',
              message: `Item ${entry.itemName} requires re-counting. Reason: ${reason}`,
              type: 'recount',
              isRead: false,
              relatedSessionId: entry.sessionId,
              createdAt: new Date().toISOString(),
            };
            return {
              entries: updatedEntries,
              notifications: [...state.notifications, notification],
            };
          }
          return { entries: updatedEntries };
        }),

      getSessionEntries: (sessionId) => get().entries.filter((e) => e.sessionId === sessionId),

      getDashboardStats: (userId) => {
        const state = get();
        const userSessions = state.sessions.filter((s) => s.userId === userId);
        const userEntries = state.entries.filter((e) =>
          userSessions.some((s) => s.id === e.sessionId)
        );
        return {
          totalScanned: userEntries.length,
          totalVerified: userEntries.filter((e) => e.status === 'verified').length,
          totalRacksFinished: userSessions.filter((s) => s.status === 'completed').length,
          shortItems: userEntries.filter((e) => e.variance < 0).length,
          overItems: userEntries.filter((e) => e.variance > 0).length,
          matchedItems: userEntries.filter((e) => e.variance === 0).length,
          pendingVerification: userEntries.filter((e) => e.status === 'pending').length,
          rejectedItems: userEntries.filter((e) => e.status === 'rejected' || e.status === 'recount_required').length,
        };
      },

      getPendingVerificationSessions: () =>
        get().sessions.filter((s) => s.status === 'pending_verification'),

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({ notifications: [...state.notifications, notification] }));
      },

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      addAuditLog: (logData) => {
        const log: AuditLog = {
          ...logData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ auditLogs: [...state.auditLogs, log] }));
      },

      addToOfflineQueue: (actionData) => {
        const action: OfflineAction = {
          ...actionData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          isSynced: false,
        };
        set((state) => ({ offlineQueue: [...state.offlineQueue, action] }));
      },

      syncOfflineQueue: () => {
        // Mark all queued actions as synced
        set((state) => ({
          offlineQueue: state.offlineQueue.map((a) => ({ ...a, isSynced: true })),
        }));
      },

      // Check if item already exists in current session (duplicate detection)
      checkDuplicateEntry: (sessionId, itemId, itemBarcode) => {
        const entries = get().entries;
        return entries.find(
          (e) => e.sessionId === sessionId && (e.itemId === itemId || e.itemBarcode === itemBarcode)
        ) ?? null;
      },

      // Get all entries for an item across all sessions (multi-location tracking)
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

export const useUserManagementStore = create<UserManagementState>()(
  persist(
    (set, get) => ({
      users: mockUsers,

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),

      deactivateUser: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, isActive: false } : u)),
        })),

      activateUser: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, isActive: true } : u)),
        })),

      getUsersByRole: (role) => get().users.filter((u) => u.role === role),
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to get items (from sync store if available, otherwise mock)
// Uses dynamic import to avoid circular dependency
export function getItems(): Item[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSyncStore } = require('./sync');
    const syncedItems = useSyncStore.getState().items;
    return syncedItems.length > 0 ? syncedItems : mockItems;
  } catch {
    return mockItems;
  }
}

// Helper function to search items with prefix routing
export function searchItems(query: string): Item[] {
  if (query.length < 3) return [];

  const items = getItems();
  const prefix = query.substring(0, 2);
  const lowerQuery = query.toLowerCase();

  // Prefix-based routing: 51/52/53 → Barcode search only, others → name search
  if (prefix === '51' || prefix === '52' || prefix === '53') {
    return items.filter((item) => item.barcode.includes(query));
  } else {
    return items.filter((item) => item.name.toLowerCase().includes(lowerQuery));
  }
}

export function getItemByBarcode(barcode: string): Item | undefined {
  const items = getItems();
  return items.find((item) => item.barcode === barcode);
}

export function getItemById(id: string): Item | undefined {
  const items = getItems();
  return items.find((item) => item.id === id);
}
