/**
 * Sync Manager - Handles data synchronization with STOCK_VERIFY Backend
 *
 * Features:
 * - Interval-based sync (configurable)
 * - Offline queue processing with batch sync
 * - ERP data sync (items from SQL Server)
 * - Background sync with network monitoring
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from './api';
import type { Item, User } from './types';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

interface OfflineOperation {
  id: string;
  type: 'session' | 'count_line';
  offline_id: string;
  data: Record<string, unknown>;
  timestamp: string;
  synced: boolean;
}

interface SyncState {
  // Status
  status: SyncStatus;
  lastSyncAt: string | null;
  lastError: string | null;
  isSyncing: boolean;
  isConnected: boolean;

  // Backend connection status
  erpConnected: boolean;
  mongoConnected: boolean;

  // Sync settings
  syncInterval: number; // in milliseconds
  autoSync: boolean;

  // Synced data cache
  items: Item[];
  users: User[];

  // Offline operations queue
  offlineOperations: OfflineOperation[];

  // ID mappings (offline_id -> server_id)
  idMappings: Record<string, string>;

  // Actions
  setSyncInterval: (interval: number) => void;
  setAutoSync: (enabled: boolean) => void;
  setConnected: (connected: boolean) => void;
  syncNow: () => Promise<void>;
  downloadData: () => Promise<void>;
  uploadOfflineData: () => Promise<void>;
  updateItems: (items: Item[]) => void;
  updateUsers: (users: User[]) => void;
  addOfflineOperation: (op: Omit<OfflineOperation, 'id' | 'synced'>) => void;
  getServerIdForOfflineId: (offlineId: string) => string | undefined;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      status: 'idle',
      lastSyncAt: null,
      lastError: null,
      isSyncing: false,
      isConnected: true,
      erpConnected: false,
      mongoConnected: false,
      syncInterval: 5 * 60 * 1000, // 5 minutes default
      autoSync: false, // Disabled by default - enable when backend is configured
      items: [],
      users: [],
      offlineOperations: [],
      idMappings: {},

      setSyncInterval: (interval) => set({ syncInterval: interval }),
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setConnected: (connected) => set({ isConnected: connected }),

      syncNow: async () => {
        const state = get();
        if (state.isSyncing) return;

        set({ isSyncing: true, status: 'syncing', lastError: null });

        try {
          // Check connection
          const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected) {
            set({ status: 'offline', isSyncing: false, isConnected: false });
            return;
          }

          set({ isConnected: true });

          // Check backend health - silently fail if not available
          const isHealthy = await api.checkHealth();
          if (!isHealthy) {
            set({
              status: 'error',
              lastError: 'Backend server is not reachable',
              isSyncing: false
            });
            return;
          }

          // Get sync status from backend
          const syncStatus = await api.getSyncStatus();
          if (syncStatus.success && syncStatus.data) {
            set({
              erpConnected: syncStatus.data.erp_connected,
              mongoConnected: syncStatus.data.mongodb_connected,
            });
          }

          // Upload offline data first
          await get().uploadOfflineData();

          // Then download latest data
          await get().downloadData();

          set({
            status: 'success',
            lastSyncAt: new Date().toISOString(),
            lastError: null,
            isSyncing: false,
          });
        } catch {
          // Silently handle sync errors
          set({ status: 'error', lastError: 'Sync failed', isSyncing: false });
        }
      },

      downloadData: async () => {
        // Fetch items from ERP (SQL Server via backend)
        const itemsResponse = await api.getItems({ limit: 1000 });
        if (itemsResponse.success && itemsResponse.data) {
          set({ items: itemsResponse.data });
        }

        // Fetch users
        const usersResponse = await api.getUsers();
        if (usersResponse.success && usersResponse.data) {
          set({ users: usersResponse.data });
        }
      },

      uploadOfflineData: async () => {
        const state = get();
        const pendingOps = state.offlineOperations.filter((op) => !op.synced);

        if (pendingOps.length === 0) return;

        // Sort by timestamp to maintain order
        const sortedOps = [...pendingOps].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        // Convert to batch sync format
        const operations = sortedOps.map((op) => ({
          type: op.type,
          offline_id: op.offline_id,
          data: op.data,
          timestamp: op.timestamp,
        }));

        const response = await api.batchSync(operations);

        if (response.success && response.data) {
          const newMappings = { ...state.idMappings };
          const updatedOps = state.offlineOperations.map((op) => {
            const result = response.data?.results.find((r) => r.offline_id === op.offline_id);
            if (result?.success) {
              // Store ID mapping
              if (result.server_id) {
                newMappings[op.offline_id] = result.server_id;
              }
              return { ...op, synced: true };
            }
            return op;
          });

          set({
            offlineOperations: updatedOps,
            idMappings: newMappings,
          });

          // Clean up synced operations older than 24 hours
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          set({
            offlineOperations: updatedOps.filter(
              (op) => !op.synced || new Date(op.timestamp).getTime() > dayAgo
            ),
          });
        }
      },

      updateItems: (items) => set({ items }),
      updateUsers: (users) => set({ users }),

      addOfflineOperation: (op) => {
        set((state) => ({
          offlineOperations: [
            ...state.offlineOperations,
            {
              ...op,
              id: Date.now().toString(),
              synced: false,
            },
          ],
        }));
      },

      getServerIdForOfflineId: (offlineId) => {
        return get().idMappings[offlineId];
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastSyncAt: state.lastSyncAt,
        syncInterval: state.syncInterval,
        autoSync: state.autoSync,
        items: state.items,
        users: state.users,
        offlineOperations: state.offlineOperations,
        idMappings: state.idMappings,
      }),
    }
  )
);

// Sync interval manager
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

export function startAutoSync() {
  stopAutoSync();

  const { autoSync, syncInterval, syncNow } = useSyncStore.getState();

  if (!autoSync) return;

  // Delay initial sync to avoid startup errors
  setTimeout(() => {
    const state = useSyncStore.getState();
    if (state.autoSync && state.isConnected) {
      syncNow();
    }
  }, 3000);

  // Set up interval
  syncIntervalId = setInterval(() => {
    const state = useSyncStore.getState();
    if (state.autoSync && state.isConnected && !state.isSyncing) {
      syncNow();
    }
  }, syncInterval);
}

export function stopAutoSync() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

// Network listener
let netInfoUnsubscribe: (() => void) | null = null;

export function startNetworkListener() {
  netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    const syncState = useSyncStore.getState();
    const wasOffline = !syncState.isConnected;
    syncState.setConnected(state.isConnected ?? false);

    // Auto-sync when coming back online (only if autoSync is enabled)
    if (wasOffline && state.isConnected && syncState.autoSync) {
      syncState.syncNow();
    }
  });
}

export function stopNetworkListener() {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
}

// Initialize sync system
export function initializeSync() {
  startNetworkListener();
  startAutoSync();
}

// Cleanup
export function cleanupSync() {
  stopAutoSync();
  stopNetworkListener();
}
