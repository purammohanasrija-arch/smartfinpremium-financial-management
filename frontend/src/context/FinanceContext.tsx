import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  Account,
  Budget,
  SavingsGoal,
  NotificationItem,
  INITIAL_TRANSACTIONS,
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
  SIX_MONTH_HISTORY,
  CATEGORIES,
  SmtpConfig,
  DEFAULT_SMTP_CONFIG,
} from '../data/mockData';
import { calculateFinancialHealthScore } from '../utils/financeCalculations';
import { mernApi } from '../services/api';
import {
  CurrencyInfo,
  SUPPORTED_CURRENCIES,
  getCurrencyInfo,
  formatCurrencyValue,
} from '../utils/currencies';

export interface MernStackInfo {
  status: string;
  stack: string;
  version: string;
  technologies: {
    mongoDB: { status: string; engine: string; collections: Record<string, number> };
    express: { version: string; environment: string };
    react: { version: string };
    node: { version: string; uptimeSeconds: number };
  };
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}


interface FinanceContextType {
  // Theme & Profile
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: typeof INITIAL_USER_PROFILE;
  updateUser: (fields: Partial<typeof INITIAL_USER_PROFILE>) => void;
  currency: string;
  currencySymbol: string;
  conversionMode: 'symbol_only' | 'convert_fx';
  activeCurrency: CurrencyInfo;
  setCurrency: (code: string) => void;
  setConversionMode: (mode: 'symbol_only' | 'convert_fx') => void;
  formatCurrency: (amount: number, options?: { showCode?: boolean; decimals?: number; forceMode?: 'symbol_only' | 'convert_fx' }) => string;
  convertAmount: (amountInBase: number) => number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Accounts
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id'>) => void;
  editAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transferMoney: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => boolean;

  // Budgets
  budgets: Budget[];
  updateBudgetLimit: (category: string, newLimit: number) => void;
  addBudget: (budget: Budget) => void;

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  editSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, sourceAccountId?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;

  // Computed Summaries
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  healthScoreData: ReturnType<typeof calculateFinancialHealthScore>;
  historyChartData: Array<{ month: string; income: number; expenses: number; savings: number }>;

  // Authentication & Session
  isAuthenticated: boolean;
  authMethod: 'demo' | 'email' | 'smtp' | 'otp' | 'google' | null;
  smtpConfig: import('../data/mockData').SmtpConfig;
  login: (method: 'demo' | 'email' | 'smtp' | 'otp' | 'google', credentials?: any) => Promise<boolean>;
  logout: () => void;
  updateSmtpConfig: (config: Partial<import('../data/mockData').SmtpConfig>) => void;

  // MERN Stack Backend Status & Actions
  mernStackInfo: MernStackInfo | null;
  dbEngine: 'mongodb_atlas' | 'mongodb_embedded';
  isAtlasConnected: boolean;
  atlasDetails: {
    clusterHost?: string;
    pingMs?: number;
    databaseName?: string;
    uri?: string;
    collections?: Record<string, number>;
  } | null;
  refreshFromBackend: () => Promise<void>;
  testMongoUri: (uri: string) => Promise<{ success: boolean; message: string; pingMs?: number; clusterHost?: string }>;
  connectToAtlas: (uri: string) => Promise<{ success: boolean; message: string; pingMs?: number; clusterHost?: string }>;
  disconnectFromAtlas: () => Promise<void>;
  syncDataToAtlas: () => Promise<void>;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Demo Reset
  resetDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);


const STORAGE_KEYS = {
  TRANSACTIONS: 'smartfin_transactions',
  ACCOUNTS: 'smartfin_accounts',
  BUDGETS: 'smartfin_budgets',
  GOALS: 'smartfin_savings_goals',
  NOTIFICATIONS: 'smartfin_notifications',
  USER: 'smartfin_user_profile',
  THEME: 'smartfin_theme',
  AUTH: 'smartfin_auth_session',
  SMTP: 'smartfin_smtp_config',
};


export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  // User Profile
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // Authentication & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return parsed.isAuthenticated === true;
    } catch {
      return false;
    }
  });

  const [authMethod, setAuthMethod] = useState<'demo' | 'email' | 'smtp' | 'otp' | 'google' | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!saved) return null;
    try {
      return JSON.parse(saved).method || null;
    } catch {
      return null;
    }
  });

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SMTP);
    return saved ? JSON.parse(saved) : DEFAULT_SMTP_CONFIG;
  });

  const updateSmtpConfig = (newConfig: Partial<SmtpConfig>) => {
    setSmtpConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem(STORAGE_KEYS.SMTP, JSON.stringify(updated));
      return updated;
    });
  };

  // MERN Stack Backend State & MongoDB Atlas
  const [mernStackInfo, setMernStackInfo] = useState<MernStackInfo | null>(null);
  const [dbEngine, setDbEngine] = useState<'mongodb_atlas' | 'mongodb_embedded'>('mongodb_embedded');
  const [isAtlasConnected, setIsAtlasConnected] = useState<boolean>(false);
  const [atlasDetails, setAtlasDetails] = useState<{
    clusterHost?: string;
    pingMs?: number;
    databaseName?: string;
    uri?: string;
    collections?: Record<string, number>;
  } | null>(null);

  const refreshFromBackend = async () => {
    try {
      const [health, status, txs, accs, bdgts, gls, notifs, usr] = await Promise.all([
        mernApi.getHealth().catch(() => null),
        mernApi.getDbStatus().catch(() => null),
        mernApi.getTransactions().catch(() => null),
        mernApi.getAccounts().catch(() => null),
        mernApi.getBudgets().catch(() => null),
        mernApi.getGoals().catch(() => null),
        mernApi.getNotifications().catch(() => null),
        mernApi.getUser().catch(() => null),
      ]);

      if (health) {
        setMernStackInfo(health);
      }

      if (status) {
        setDbEngine(status.engine);
        setIsAtlasConnected(status.isAtlas || status.engine === 'mongodb_atlas');
        setAtlasDetails({
          clusterHost: status.clusterHost,
          pingMs: status.pingMs,
          databaseName: status.databaseName || 'smartfin',
          uri: status.uri,
          collections: status.collections,
        });
      }

      if (txs && Array.isArray(txs)) setTransactions(txs);
      if (accs && Array.isArray(accs)) setAccounts(accs);
      if (bdgts && Array.isArray(bdgts)) setBudgets(bdgts);
      if (gls && Array.isArray(gls)) setSavingsGoals(gls);
      if (notifs && Array.isArray(notifs)) setNotifications(notifs);
      if (usr && usr.name) setUser(usr);
    } catch (err) {
      console.warn('[MERN Client] Background sync warning:', err);
    }
  };

  useEffect(() => {
    refreshFromBackend();
  }, []);

  const testMongoUri = async (uri: string) => {
    try {
      const res = await mernApi.testAtlas(uri);
      if (res.success) {
        addToast(`MongoDB Atlas verified! Ping: ${res.pingMs}ms`, 'success');
      }
      return res;
    } catch (err: any) {
      addToast(err.message || 'Connection test failed', 'error');
      return { success: false, message: err.message };
    }
  };

  const connectToAtlas = async (uri: string) => {
    try {
      const res = await mernApi.connectAtlas(uri);
      if (res.success) {
        setIsAtlasConnected(true);
        setDbEngine('mongodb_atlas');
        addToast(`Connected to MongoDB Atlas: ${res.clusterHost || 'Cluster'}`, 'success');
        await refreshFromBackend();
      }
      return res;
    } catch (err: any) {
      addToast(err.message || 'Failed to connect to MongoDB Atlas', 'error');
      throw err;
    }
  };

  const disconnectFromAtlas = async () => {
    try {
      const res = await mernApi.disconnectAtlas();
      setIsAtlasConnected(false);
      setDbEngine('mongodb_embedded');
      addToast('Reverted to embedded local MongoDB document store', 'info');
      await refreshFromBackend();
    } catch (err: any) {
      addToast('Disconnect error: ' + err.message, 'error');
    }
  };

  const syncDataToAtlas = async () => {
    try {
      const res = await mernApi.syncToAtlas();
      addToast(res.message || 'Synced local data to MongoDB Atlas cluster!', 'success');
      await refreshFromBackend();
    } catch (err: any) {
      addToast(err.message || 'Sync to Atlas failed', 'error');
      throw err;
    }
  };

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');



  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Accounts
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // Budgets
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  // Savings Goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme to HTML class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  // Recalculate budget spent dynamically based on transactions in October 2026
  useEffect(() => {
    const categorySpending: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
      });

    setBudgets((prev) =>
      prev.map((b) => ({
        ...b,
        spent: categorySpending[b.category] || 0,
      }))
    );
  }, [transactions]);

  // Global Currency State & Calculations
  const [conversionMode, setConversionModeState] = useState<'symbol_only' | 'convert_fx'>(() => {
    const saved = localStorage.getItem('smartfin_conversion_mode');
    if (saved === 'convert_fx' || saved === 'symbol_only') return saved;
    return user.conversionMode || 'symbol_only';
  });

  const activeCurrency = getCurrencyInfo(user.currency || 'INR');

  const setCurrency = (code: string) => {
    const info = getCurrencyInfo(code);
    setUser((prev: typeof INITIAL_USER_PROFILE) => {
      const updated = {
        ...prev,
        currency: info.code,
        currencySymbol: info.symbol,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });

    mernApi.updateUser({
      currency: info.code,
      currencySymbol: info.symbol,
    }).catch(() => {});

    addToast(`Global currency updated to ${info.flag} ${info.code} (${info.symbol}) across all displays!`, 'success');
  };

  const setConversionMode = (mode: 'symbol_only' | 'convert_fx') => {
    setConversionModeState(mode);
    localStorage.setItem('smartfin_conversion_mode', mode);
    setUser((prev: typeof INITIAL_USER_PROFILE) => {
      const updated = {
        ...prev,
        conversionMode: mode,
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
    mernApi.updateUser({ conversionMode: mode }).catch(() => {});
    addToast(
      mode === 'convert_fx'
        ? `Exchange rate conversion enabled (${activeCurrency.code} FX rates applied)`
        : 'Standard display mode enabled (values preserved in selected currency)',
      'info'
    );
  };

  const convertAmount = (amountInBase: number): number => {
    if (conversionMode === 'convert_fx') {
      return amountInBase * activeCurrency.rateFromInr;
    }
    return amountInBase;
  };

  const formatCurrency = (
    amount: number,
    options?: { showCode?: boolean; decimals?: number; forceMode?: 'symbol_only' | 'convert_fx' }
  ): string => {
    const mode = options?.forceMode || conversionMode;
    return formatCurrencyValue(amount, user.currency || 'INR', mode, user.currencySymbol);
  };

  const updateUser = (fields: Partial<typeof INITIAL_USER_PROFILE>) => {
    setUser((prev: typeof INITIAL_USER_PROFILE) => ({ ...prev, ...fields }));
    mernApi.updateUser(fields).catch(() => {});
    addToast('Profile preferences updated successfully', 'success');
  };

  // Transactions management
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newId = `tx-${Date.now()}`;
    const newTx: Transaction = { ...tx, id: newId };
    setTransactions((prev) => [newTx, ...prev]);

    // Persist to MongoDB backend
    mernApi.createTransaction(tx).catch((err) => {
      console.warn('[MERN] MongoDB sync fallback:', err);
    });

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === tx.account) {
          return {
            ...acc,
            balance: tx.type === 'income' ? acc.balance + tx.amount : acc.balance - tx.amount,
          };
        }
        return acc;
      })
    );

    // Check budget threshold
    if (tx.type === 'expense') {
      const budget = budgets.find((b) => b.category === tx.category);
      if (budget) {
        const projectedSpent = budget.spent + tx.amount;
        if (projectedSpent >= budget.limit) {
          addNotification({
            title: 'Budget Limit Exceeded',
            message: `Warning: Spending in ${tx.category} has reached ${user.currencySymbol}${projectedSpent} (Limit: ${user.currencySymbol}${budget.limit})!`,
            type: 'budget',
            priority: 'high',
          });
        } else if (projectedSpent >= budget.limit * 0.8) {
          addNotification({
            title: 'Budget Alert (80%)',
            message: `${tx.category} is at ${Math.round((projectedSpent / budget.limit) * 100)}% of monthly limit.`,
            type: 'budget',
            priority: 'medium',
          });
        }
      }
    }

    addToast(`Added ${tx.type === 'income' ? 'income' : 'expense'}: ${tx.merchant} (${user.currencySymbol}${tx.amount})`, 'success');
  };

  const editTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedFields } : tx))
    );
    mernApi.updateTransaction(id, updatedFields).catch(() => {});
    addToast('Transaction updated successfully', 'success');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    mernApi.deleteTransaction(id).catch(() => {});

    // Revert account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === tx.account) {
          return {
            ...acc,
            balance: tx.type === 'income' ? acc.balance - tx.amount : acc.balance + tx.amount,
          };
        }
        return acc;
      })
    );
    addToast('Transaction removed', 'info');
  };

  // Accounts management
  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = { ...acc, id: `acc-${Date.now()}` };
    setAccounts((prev) => [...prev, newAcc]);
    mernApi.createAccount(acc).catch(() => {});
    addToast(`Account "${acc.name}" added successfully`, 'success');
  };

  const editAccount = (id: string, updatedFields: Partial<Account>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    addToast('Account updated successfully', 'success');
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) {
      addToast('Cannot delete the last remaining account', 'error');
      return;
    }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    mernApi.deleteAccount(id).catch(() => {});
    addToast('Account deleted', 'info');
  };

  const transferMoney = (fromAccountId: string, toAccountId: string, amount: number, note?: string): boolean => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);

    const toAcc = accounts.find((a) => a.id === toAccountId);

    if (!fromAcc || !toAcc || fromAccountId === toAccountId) {
      addToast('Please select two distinct valid accounts', 'error');
      return false;
    }

    if (fromAcc.balance < amount) {
      addToast(`Insufficient funds in ${fromAcc.name} (Balance: ${user.currencySymbol}${fromAcc.balance})`, 'error');
      return false;
    }

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccountId) return { ...a, balance: a.balance - amount };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
        return a;
      })
    );

    // Record internal transfer transactions
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const transferTx: Transaction = {
      id: `tx-tr-${Date.now()}`,
      merchant: `Transfer: ${fromAcc.name} → ${toAcc.name}`,
      category: 'Others',
      amount: amount,
      type: 'expense',
      date: dateStr,
      paymentMethod: 'Internal Transfer',
      account: fromAcc.name,
      notes: note || 'Self transfer between internal accounts',
    };
    setTransactions((prev) => [transferTx, ...prev]);

    // Persist transfer to MongoDB backend
    mernApi.transferMoney(fromAccountId, toAccountId, amount, note).catch(() => {});

    addToast(`Transferred ${user.currencySymbol}${amount} from ${fromAcc.name} to ${toAcc.name}`, 'success');
    return true;
  };

  // Budgets
  const updateBudgetLimit = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
    mernApi.updateBudget(category, newLimit).catch(() => {});
    addToast(`Budget for ${category} updated to ${user.currencySymbol}${newLimit}`, 'success');
  };

  const addBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.category === budget.category);
      if (exists) {
        return prev.map((b) => (b.category === budget.category ? budget : b));
      }
      return [...prev, budget];
    });
    mernApi.updateBudget(budget.category, budget.limit).catch(() => {});
    addToast(`Budget set for ${budget.category}`, 'success');
  };

  // Savings Goals
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    mernApi.createGoal(goal).catch(() => {});
    addToast(`Goal "${goal.name}" created!`, 'success');
  };

  const editSavingsGoal = (id: string, fields: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...fields } : g))
    );
    addToast('Savings goal updated', 'success');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    mernApi.deleteGoal(id).catch(() => {});
    addToast('Savings goal removed', 'info');
  };

  const contributeToGoal = (id: string, amount: number, sourceAccountId?: string) => {
    const goal = savingsGoals.find((g) => g.id === id);
    if (!goal) return;

    if (sourceAccountId) {
      const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
      if (sourceAcc && sourceAcc.balance < amount) {
        addToast(`Insufficient funds in ${sourceAcc.name}`, 'error');
        return;
      }
      if (sourceAcc) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === sourceAccountId ? { ...a, balance: a.balance - amount } : a))
        );
      }
    }

    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
    mernApi.contributeGoal(id, amount, sourceAccountId).catch(() => {});

    const updatedTotal = goal.currentAmount + amount;
    if (updatedTotal >= goal.targetAmount) {
      addNotification({
        title: '🎉 Goal Reached!',
        message: `Congratulations Mahi! You have reached 100% of your target for "${goal.name}".`,
        type: 'savings',
        priority: 'high',
      });
    }

    addToast(`Added ${user.currencySymbol}${amount} to ${goal.name}!`, 'success');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    mernApi.markNotificationRead(id).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    mernApi.markAllNotificationsRead().catch(() => {});
    addToast('All notifications marked as read', 'info');
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    mernApi.deleteNotification(id).catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    mernApi.clearAllNotifications().catch(() => {});
    addToast('All notifications cleared', 'info');
  };


  const addNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Computed Summaries
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSavings = Math.max(0, monthlyIncome - monthlyExpenses);

  const healthScoreData = calculateFinancialHealthScore(
    monthlyIncome,
    monthlyExpenses,
    budgets,
    savingsGoals
  );

  // Dynamic 6 month history with latest month mirroring current state
  const historyChartData = SIX_MONTH_HISTORY.map((item, idx) => {
    if (idx === SIX_MONTH_HISTORY.length - 1) {
      return {
        month: item.month,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings: totalSavings,
      };
    }
    return item;
  });

  // Login & Authentication handler
  const login = async (method: 'demo' | 'email' | 'smtp' | 'otp' | 'google', credentials?: any): Promise<boolean> => {
    if (method === 'google') {
      const email = credentials?.email || 'mahi.sharma@gmail.com';
      const cleanEmail = email.trim().toLowerCase();
      const displayName = credentials?.name || (cleanEmail.includes('mahi') ? 'Mahi Sharma' : cleanEmail.split('@')[0]);
      const updatedUser = {
        ...user,
        email: cleanEmail,
        name: displayName,
        plan: 'SmartFin+ Premium (Google Verified)',
        avatarUrl: credentials?.avatarUrl || user.avatarUrl,
      };
      setUser(updatedUser);
      setIsAuthenticated(true);
      setAuthMethod('google');
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, method: 'google' }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      mernApi.login({ method: 'google', email: cleanEmail, name: displayName }).catch(() => {});
      addToast(`Welcome ${displayName}! Authenticated securely with Google.`, 'success');
      return true;
    }

    if (method === 'otp') {
      const email = credentials?.email || 'mahi.sharma@smartfin.io';
      const cleanEmail = email.trim().toLowerCase();
      const isMahi = cleanEmail.includes('mahi');
      const namePart = isMahi ? 'Mahi' : cleanEmail.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const updatedUser = {
        ...user,
        email: cleanEmail,
        name: formattedName,
        plan: 'SmartFin+ Premium (OTP Verified)',
      };
      setUser(updatedUser);
      setIsAuthenticated(true);
      setAuthMethod('otp');
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, method: 'otp' }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      addToast(`Welcome ${formattedName}! Authenticated via Email OTP.`, 'success');
      return true;
    }

    if (method === 'demo') {
      setUser(INITIAL_USER_PROFILE);
      setIsAuthenticated(true);
      setAuthMethod('demo');
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, method: 'demo' }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_USER_PROFILE));
      addToast('Welcome back, Mahi! Accessing premium fintech dashboard.', 'success');
      return true;
    }

    if (method === 'email') {
      const email = credentials?.email || 'mahi@smartfin.io';
      const name = credentials?.name || email.split('@')[0];
      const updatedUser = {
        ...user,
        email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
      };
      setUser(updatedUser);
      setIsAuthenticated(true);
      setAuthMethod('email');
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, method: 'email' }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      addToast(`Authenticated as ${email}`, 'success');
      return true;
    }

    if (method === 'smtp') {
      const { host, port, encryption, username } = credentials || {};
      const newConfig: SmtpConfig = {
        host: host || 'smtp.smartfin.io',
        port: Number(port) || 587,
        encryption: encryption || 'STARTTLS',
        username: username || 'mahi.sharma@smartfin.io',
        authStatus: 'connected',
        lastHandshake: `TLSv1.3 AES-256 Auth Verified (${host}:${port})`,
      };
      setSmtpConfig(newConfig);
      localStorage.setItem(STORAGE_KEYS.SMTP, JSON.stringify(newConfig));

      const namePart = newConfig.username.split('@')[0];
      const updatedUser = {
        ...user,
        email: newConfig.username,
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        plan: 'SmartFin+ SMTP Gateway',
      };
      setUser(updatedUser);
      setIsAuthenticated(true);
      setAuthMethod('smtp');
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, method: 'smtp' }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      addToast(`SMTP Gateway connected: ${newConfig.username} via ${newConfig.host}`, 'success');
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthMethod(null);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: false }));
    addToast('Logged out of SmartFin+ session', 'info');
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.SMTP);

    setTransactions(INITIAL_TRANSACTIONS);
    setAccounts(INITIAL_ACCOUNTS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUser(INITIAL_USER_PROFILE);
    setIsAuthenticated(true);
    setAuthMethod('demo');
    setSmtpConfig(DEFAULT_SMTP_CONFIG);
    mernApi.resetDb().catch(() => {});
    addToast('SmartFin+ demo data restored to initial state', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        updateUser,
        currency: user.currency || 'INR',
        currencySymbol: user.currencySymbol || '₹',
        conversionMode,
        activeCurrency,
        setCurrency,
        setConversionMode,
        formatCurrency,
        convertAmount,
        searchQuery,
        setSearchQuery,
        transactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        accounts,
        addAccount,
        editAccount,
        deleteAccount,
        transferMoney,
        budgets,
        updateBudgetLimit,
        addBudget,
        savingsGoals,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        addNotification,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        totalSavings,
        healthScoreData,
        historyChartData,
        isAuthenticated,
        authMethod,
        smtpConfig,
        login,
        logout,
        updateSmtpConfig,
        mernStackInfo,
        dbEngine,
        isAtlasConnected,
        atlasDetails,
        refreshFromBackend,
        testMongoUri,
        connectToAtlas,
        disconnectFromAtlas,
        syncDataToAtlas,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};



export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
