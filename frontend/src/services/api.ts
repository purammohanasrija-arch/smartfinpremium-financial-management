import { Transaction, Account, Budget, SavingsGoal, NotificationItem } from '../data/mockData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api`;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        if (data.error || data.message) errorMsg = data.error || data.message;
      } catch {
        // Ignore parse failure
      }
    }
    throw new Error(errorMsg);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON from API but received ${contentType || 'HTML'}. Make sure VITE_API_URL is configured.`);
  }

  return response.json();
}

export const mernApi = {
  // Stack Health
  async getHealth() {
    return request<{
      status: string;
      stack: string;
      version: string;
      technologies: {
        mongoDB: { status: string; engine: string; collections: any };
        express: { version: string; environment: string };
        react: { version: string };
        node: { version: string; uptimeSeconds: number };
      };
      timestamp: string;
    }>('/health');
  },

  // Database Management & MongoDB Atlas
  async getDbStatus() {
    return request<{
      connected: boolean;
      engine: 'mongodb_atlas' | 'mongodb_embedded';
      isAtlas: boolean;
      uri?: string;
      clusterHost?: string;
      databaseName?: string;
      pingMs?: number;
      tls?: boolean;
      collections: Record<string, number>;
      lastPing: string;
    }>('/db/status');
  },

  async testAtlas(uri: string) {
    return request<{
      success: boolean;
      message: string;
      pingMs: number;
      clusterHost: string;
      version?: string;
    }>('/db/atlas-test', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    });
  },

  async testDbUri(uri: string) {
    return this.testAtlas(uri);
  },

  async connectAtlas(uri: string) {
    return request<{
      success: boolean;
      message: string;
      status: any;
      pingMs?: number;
      clusterHost?: string;
    }>('/db/atlas-connect', {
      method: 'POST',
      body: JSON.stringify({ uri }),
    });
  },

  async disconnectAtlas() {
    return request<{
      success: boolean;
      message: string;
      status: any;
    }>('/db/atlas-disconnect', {
      method: 'POST',
    });
  },

  async syncToAtlas() {
    return request<{
      success: boolean;
      message: string;
      count: number;
    }>('/db/atlas-sync', {
      method: 'POST',
    });
  },

  async resetDb() {
    return request<{ success: boolean; message: string; status: any }>('/db/reset', {
      method: 'POST',
    });
  },

  // Auth & Profile
  async getUser() {
    return request<any>('/auth/me');
  },

  async updateUser(data: any) {
    return request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async sendOtp(email: string) {
    return request<{ success: boolean; message: string; email: string; demoOtp: string; expiresInSeconds: number }>(
      '/auth/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  },

  async verifyOtp(email: string, otp: string) {
    return request<{ success: boolean; message: string; user: any; token: string }>(
      '/auth/verify-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }
    );
  },

  async login(credentials: any) {
    return request<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: { name: string; email: string }) {
    return request<{ success: boolean; message: string; user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Transactions
  async getTransactions(query?: { category?: string; type?: string; search?: string }) {
    const params = new URLSearchParams();
    if (query?.category && query.category !== 'All') params.set('category', query.category);
    if (query?.type && query.type !== 'All') params.set('type', query.type);
    if (query?.search) params.set('search', query.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Transaction[]>(`/transactions${qs}`);
  },

  async createTransaction(tx: Omit<Transaction, 'id'>) {
    return request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  async updateTransaction(id: string, tx: Partial<Transaction>) {
    return request<{ success: boolean; id: string }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    });
  },

  async deleteTransaction(id: string) {
    return request<{ success: boolean; id: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Accounts
  async getAccounts() {
    return request<Account[]>('/accounts');
  },

  async createAccount(acc: Omit<Account, 'id'>) {
    return request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(acc),
    });
  },

  async deleteAccount(id: string) {
    return request<{ success: boolean; id: string }>(`/accounts/${id}`, {
      method: 'DELETE',
    });
  },

  async transferMoney(fromAccountId: string, toAccountId: string, amount: number, note?: string) {
    return request<{ success: boolean; message: string }>('/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify({ fromAccountId, toAccountId, amount, note }),
    });
  },

  // Budgets
  async getBudgets() {
    return request<Budget[]>('/budgets');
  },

  async updateBudget(category: string, limit: number) {
    return request<{ success: boolean; category: string; limit: number }>(`/budgets/${encodeURIComponent(category)}`, {
      method: 'PUT',
      body: JSON.stringify({ limit }),
    });
  },

  // Goals
  async getGoals() {
    return request<SavingsGoal[]>('/goals');
  },

  async createGoal(goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) {
    return request<SavingsGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  async deleteGoal(id: string) {
    return request<{ success: boolean; id: string }>(`/goals/${id}`, {
      method: 'DELETE',
    });
  },

  async contributeGoal(id: string, amount: number, sourceAccountId?: string) {
    return request<{ success: boolean; goalId: string; currentAmount: number }>(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount, sourceAccountId }),
    });
  },

  // Notifications
  async getNotifications() {
    return request<NotificationItem[]>('/notifications');
  },

  async markNotificationRead(id: string) {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead() {
    return request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  async deleteNotification(id: string) {
    return request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  async clearAllNotifications() {
    return request<{ success: boolean }>('/notifications', {
      method: 'DELETE',
    });
  },

  // Consolidated Analytics
  async getAnalytics() {
    return request<{
      totalBalance: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      totalSavings: number;
      healthScoreData: any;
      historyChartData: any[];
      counts: Record<string, number>;
    }>('/analytics');
  },
};
