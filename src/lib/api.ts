// API client for Stock Verify Backend
import { config } from './config';

// Get API URL from configuration
const API_URL = config.apiUrl;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health');
  }

  // Authentication
  async login(credentials: { username?: string; password?: string; pin?: string }) {
    return this.request<{ success: boolean; user?: any; message?: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  // Items
  async getItems() {
    return this.request<any[]>('/api/items');
  }

  async searchItems(query: string) {
    return this.request<any[]>(`/api/items/search?q=${encodeURIComponent(query)}`);
  }

  async getItemByBarcode(barcode: string) {
    return this.request<any>(`/api/items/barcode/${barcode}`);
  }

  async getItemById(id: string) {
    return this.request<any>(`/api/items/${id}`);
  }

  // Sessions
  async getSessions(params?: { userId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/api/sessions${query ? `?${query}` : ''}`);
  }

  async createSession(session: any) {
    return this.request<any>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async updateSession(id: string, updates: any) {
    return this.request<any>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async submitSession(id: string) {
    return this.request<any>(`/api/sessions/${id}/submit`, {
      method: 'POST',
    });
  }

  // Entries
  async getEntries(params?: { sessionId?: string; verificationStatus?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/api/entries${query ? `?${query}` : ''}`);
  }

  async createEntry(entry: any) {
    return this.request<any>('/api/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(id: string, updates: any) {
    return this.request<any>(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async approveEntry(id: string, supervisorId: string, remarks?: string) {
    return this.request<any>(`/api/entries/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ supervisorId, remarks }),
    });
  }

  async rejectEntry(id: string, supervisorId: string, reason: string, remarks?: string) {
    return this.request<any>(`/api/entries/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ supervisorId, reason, remarks }),
    });
  }

  async requestRecount(id: string, supervisorId: string, reason: string, assignToUserId: string) {
    return this.request<any>(`/api/entries/${id}/recount`, {
      method: 'POST',
      body: JSON.stringify({ supervisorId, reason, assignToUserId }),
    });
  }

  // Dashboard
  async getDashboardStats(userId: string, userRole: string) {
    return this.request<any>(
      `/api/dashboard/stats?userId=${userId}&userRole=${userRole}`
    );
  }

  // Verifications
  async getPendingVerifications() {
    return this.request<any[]>('/api/verifications/pending');
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/api/users');
  }

  async getUserById(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
