/**
 * API Service for STOCK_VERIFY Backend
 *
 * Connects to the Python FastAPI backend running on port 8001
 *
 * Configure your backend endpoint in the ENV tab:
 * - EXPO_PUBLIC_API_BASE_URL: Your local network API endpoint
 *   Example: http://192.168.1.109:8001/api
 *
 * The backend connects to SQL Server for ERP data (items, stock levels)
 * and uses MongoDB for session/count data storage.
 */

import Constants from 'expo-constants';
import type { Item, User, Session, CountedEntry } from './types';

// Get API URL from environment or use default
const API_BASE_URL =
  Constants.expoConfig?.extra?.API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://192.168.1.109:8001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// Batch sync types matching backend
interface SyncOperation {
  type: 'session' | 'count_line';
  offline_id: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface BatchSyncRequest {
  operations: SyncOperation[];
}

interface BatchSyncResult {
  offline_id: string;
  server_id?: string;
  success: boolean;
  message?: string;
}

interface BatchSyncResponse {
  results: BatchSyncResult[];
  total: number;
  successful: number;
  failed: number;
}

// Auth token storage
let authToken: string | null = null;

class ApiService {
  private baseUrl: string;
  private timeout: number = 15000; // 15 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setAuthToken(token: string | null) {
    authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data, timestamp: new Date().toISOString() };
    } catch (error) {
      clearTimeout(timeoutId);
      const isAbort = error instanceof Error && error.name === 'AbortError';
      const message = isAbort ? 'Request timeout' : (error instanceof Error ? error.message : 'Unknown error');
      // Silently return error response - no console logging to avoid RN error handler
      return { success: false, error: message };
    }
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success;
    } catch {
      return false;
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse<{ access_token: string; user: User }>> {
    const response = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.access_token) {
      this.setAuthToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.setAuthToken(null);
  }

  // ERP Items (from SQL Server)
  async getItems(params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Item[]>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    return this.request<Item[]>(`/erp/items${queryString ? `?${queryString}` : ''}`);
  }

  async getItemByBarcode(barcode: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/erp/items/barcode/${barcode}`);
  }

  async getItemById(id: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/erp/items/${id}`);
  }

  async searchItems(query: string): Promise<ApiResponse<Item[]>> {
    return this.request<Item[]>(`/erp/items/search?q=${encodeURIComponent(query)}`);
  }

  // Get stock levels from ERP
  async getStockLevels(itemIds?: string[]): Promise<ApiResponse<Record<string, number>>> {
    if (itemIds?.length) {
      return this.request<Record<string, number>>('/erp/stock', {
        method: 'POST',
        body: JSON.stringify({ item_ids: itemIds }),
      });
    }
    return this.request<Record<string, number>>('/erp/stock');
  }

  // Sessions
  async getSessions(params?: {
    status?: string;
    user_id?: string;
  }): Promise<ApiResponse<Session[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.user_id) queryParams.append('user_id', params.user_id);

    const queryString = queryParams.toString();
    return this.request<Session[]>(`/sessions${queryString ? `?${queryString}` : ''}`);
  }

  async getSession(id: string): Promise<ApiResponse<Session>> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(session: Partial<Session>): Promise<ApiResponse<Session>> {
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

  // Count lines / Entries
  async getEntries(sessionId: string): Promise<ApiResponse<CountedEntry[]>> {
    return this.request<CountedEntry[]>(`/sessions/${sessionId}/entries`);
  }

  async createEntry(entry: Partial<CountedEntry>): Promise<ApiResponse<CountedEntry>> {
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

  // Racks
  async getRacks(params?: { location?: string }): Promise<ApiResponse<Array<{ id: string; name: string; location: string }>>> {
    const queryString = params?.location ? `?location=${params.location}` : '';
    return this.request(`/racks${queryString}`);
  }

  // Variance reports
  async getVarianceReport(sessionId?: string): Promise<ApiResponse<{
    total_items: number;
    short_items: number;
    over_items: number;
    matched_items: number;
    total_variance_value: number;
  }>> {
    const queryString = sessionId ? `?session_id=${sessionId}` : '';
    return this.request(`/variance/report${queryString}`);
  }

  // Batch Sync (for offline data)
  async batchSync(operations: SyncOperation[]): Promise<ApiResponse<BatchSyncResponse>> {
    return this.request<BatchSyncResponse>('/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  }

  // Sync status
  async getSyncStatus(): Promise<ApiResponse<{
    last_sync: string;
    pending_count: number;
    erp_connected: boolean;
    mongodb_connected: boolean;
  }>> {
    return this.request('/sync/status');
  }

  // Users (for admin)
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/users');
  }

  async createUser(user: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Logs
  async getActivityLogs(params?: {
    user_id?: string;
    action?: string;
    limit?: number;
  }): Promise<ApiResponse<Array<{
    id: string;
    user_id: string;
    action: string;
    details: string;
    timestamp: string;
  }>>> {
    const queryParams = new URLSearchParams();
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.request(`/logs/activity${queryString ? `?${queryString}` : ''}`);
  }

  // Metrics
  async getMetrics(): Promise<ApiResponse<{
    total_sessions: number;
    active_sessions: number;
    total_items_counted: number;
    accuracy_rate: number;
  }>> {
    return this.request('/metrics');
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
