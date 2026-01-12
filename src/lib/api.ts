/**
 * API Service for SQL Database Connection
 *
 * Configure your database endpoint in the ENV tab:
 * - API_BASE_URL: Your local network API endpoint (e.g., http://192.168.1.100:3000/api)
 *
 * Expected API Endpoints:
 * - GET /items - Fetch all items
 * - GET /items/:id - Fetch single item
 * - GET /users - Fetch all users
 * - POST /sessions - Create session
 * - POST /entries - Create entry
 * - GET /sync/status - Get sync status
 * - POST /sync/upload - Upload offline changes
 */

import Constants from 'expo-constants';
import type { Item, User, Session, CountedEntry } from './types';

// Get API URL from environment or use default
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

interface SyncPayload {
  entries: CountedEntry[];
  sessions: Session[];
  lastSyncAt: string;
}

interface SyncResult {
  uploaded: number;
  downloaded: number;
  conflicts: number;
  lastSyncAt: string;
}

class ApiService {
  private baseUrl: string;
  private timeout: number = 10000; // 10 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (error) {
      clearTimeout(timeoutId);
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`API Error [${endpoint}]:`, message);
      return { success: false, error: message };
    }
  }

  // Items
  async getItems(): Promise<ApiResponse<Item[]>> {
    return this.request<Item[]>('/items');
  }

  async getItem(id: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}`);
  }

  async searchItems(query: string): Promise<ApiResponse<Item[]>> {
    return this.request<Item[]>(`/items/search?q=${encodeURIComponent(query)}`);
  }

  async getItemByBarcode(barcode: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/barcode/${barcode}`);
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  async authenticateUser(username: string, pin: string): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, pin }),
    });
  }

  // Sessions
  async getSessions(userId?: string): Promise<ApiResponse<Session[]>> {
    const endpoint = userId ? `/sessions?userId=${userId}` : '/sessions';
    return this.request<Session[]>(endpoint);
  }

  async createSession(session: Omit<Session, 'id' | 'createdAt'>): Promise<ApiResponse<Session>> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Entries
  async getEntries(sessionId: string): Promise<ApiResponse<CountedEntry[]>> {
    return this.request<CountedEntry[]>(`/entries?sessionId=${sessionId}`);
  }

  async createEntry(entry: Omit<CountedEntry, 'id' | 'createdAt'>): Promise<ApiResponse<CountedEntry>> {
    return this.request<CountedEntry>('/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(id: string, updates: Partial<CountedEntry>): Promise<ApiResponse<CountedEntry>> {
    return this.request<CountedEntry>(`/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Sync
  async getSyncStatus(): Promise<ApiResponse<{ lastSync: string; pendingChanges: number }>> {
    return this.request('/sync/status');
  }

  async syncData(payload: SyncPayload): Promise<ApiResponse<SyncResult>> {
    return this.request<SyncResult>('/sync/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async downloadChanges(since: string): Promise<ApiResponse<{ items: Item[]; users: User[] }>> {
    return this.request(`/sync/download?since=${encodeURIComponent(since)}`);
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
