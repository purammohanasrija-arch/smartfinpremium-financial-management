export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  paymentMethod: string;
  notes?: string;
  account: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color: string;
  period: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'Digital Wallet' | 'Cash' | 'Investment';
  accountNumber: string;
  balance: number;
  color: string;
  institution: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'budget' | 'bill' | 'savings' | 'transaction';
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const CATEGORIES = [
  { name: 'Food & Dining', color: '#14b8a6', icon: 'Utensils' },
  { name: 'Transport', color: '#06b6d4', icon: 'Bus' },
  { name: 'Shopping', color: '#8b5cf6', icon: 'ShoppingBag' },
  { name: 'Bills & Utilities', color: '#f43f5e', icon: 'Zap' },
  { name: 'Education', color: '#3b82f6', icon: 'GraduationCap' },
  { name: 'Health', color: '#10b981', icon: 'HeartPulse' },
  { name: 'Others', color: '#f59e0b', icon: 'Layers' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    merchant: 'Zomato Gourmet',
    category: 'Food & Dining',
    amount: 640,
    type: 'expense',
    date: '2026-10-17 19:45',
    paymentMethod: 'UPI Wallet',
    account: 'Paytm & UPI Wallet',
    notes: 'Weekend dinner with colleagues',
  },
  {
    id: 'tx-2',
    merchant: 'Salary Credit - TechCorp',
    category: 'Others',
    amount: 4500,
    type: 'income',
    date: '2026-10-01 09:00',
    paymentMethod: 'Direct Deposit',
    account: 'HDFC Bank Salary Account',
    notes: 'Monthly corporate base salary',
  },
  {
    id: 'tx-3',
    merchant: 'Electricity Board (BESCOM)',
    category: 'Bills & Utilities',
    amount: 900,
    type: 'expense',
    date: '2026-10-15 11:20',
    paymentMethod: 'Net Banking',
    account: 'HDFC Bank Salary Account',
    notes: 'October billing cycle',
  },
  {
    id: 'tx-4',
    merchant: 'Amazon India',
    category: 'Shopping',
    amount: 1200,
    type: 'expense',
    date: '2026-10-12 16:30',
    paymentMethod: 'Debit Card',
    account: 'HDFC Bank Salary Account',
    notes: 'Ergonomic workspace accessories',
  },
  {
    id: 'tx-5',
    merchant: 'Metro Smart Pass',
    category: 'Transport',
    amount: 800,
    type: 'expense',
    date: '2026-10-03 08:30',
    paymentMethod: 'UPI Wallet',
    account: 'Paytm & UPI Wallet',
    notes: 'Monthly metro pass recharge',
  },
  {
    id: 'tx-6',
    merchant: 'Coursera Subscription',
    category: 'Education',
    amount: 500,
    type: 'expense',
    date: '2026-10-07 14:15',
    paymentMethod: 'Debit Card',
    account: 'ICICI Savings Account',
    notes: 'Data analytics certification module',
  },
  {
    id: 'tx-7',
    merchant: 'Apollo Pharmacy',
    category: 'Health',
    amount: 240,
    type: 'expense',
    date: '2026-10-14 18:10',
    paymentMethod: 'Cash',
    account: 'Cash Reserve',
    notes: 'Routine health vitamins',
  },
  {
    id: 'tx-8',
    merchant: 'Swiggy Instamart',
    category: 'Food & Dining',
    amount: 460,
    type: 'expense',
    date: '2026-10-10 20:05',
    paymentMethod: 'UPI Wallet',
    account: 'Paytm & UPI Wallet',
    notes: 'Weekly fresh groceries',
  },
  {
    id: 'tx-9',
    merchant: 'Starbucks Coffee',
    category: 'Food & Dining',
    amount: 500,
    type: 'expense',
    date: '2026-10-06 17:30',
    paymentMethod: 'UPI Wallet',
    account: 'Paytm & UPI Wallet',
    notes: 'Afternoon client session',
  },
  {
    id: 'tx-10',
    merchant: 'Freelance UI Design',
    category: 'Others',
    amount: 1200,
    type: 'income',
    date: '2026-10-11 13:00',
    paymentMethod: 'Bank Transfer',
    account: 'ICICI Savings Account',
    notes: 'Fintech dashboard icon set design',
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'HDFC Bank Salary Account',
    type: 'Bank',
    accountNumber: '•••• 4892',
    balance: 8450,
    color: '#0ea5e9',
    institution: 'HDFC Bank Ltd.',
  },
  {
    id: 'acc-2',
    name: 'ICICI Savings Account',
    type: 'Bank',
    accountNumber: '•••• 1039',
    balance: 2830,
    color: '#f97316',
    institution: 'ICICI Bank',
  },
  {
    id: 'acc-3',
    name: 'Paytm & UPI Wallet',
    type: 'Digital Wallet',
    accountNumber: 'mahi@hdfc',
    balance: 750,
    color: '#06b6d4',
    institution: 'One97 Communications',
  },
  {
    id: 'acc-4',
    name: 'Cash Reserve',
    type: 'Cash',
    accountNumber: 'Liquid Wallet',
    balance: 450,
    color: '#10b981',
    institution: 'Physical Vault',
  },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    category: 'Food & Dining',
    limit: 2000,
    spent: 1600,
    color: '#14b8a6',
    period: 'October 2026',
  },
  {
    category: 'Transport',
    limit: 1500,
    spent: 800,
    color: '#06b6d4',
    period: 'October 2026',
  },
  {
    category: 'Shopping',
    limit: 2000,
    spent: 1200,
    color: '#8b5cf6',
    period: 'October 2026',
  },
  {
    category: 'Bills & Utilities',
    limit: 1500,
    spent: 900,
    color: '#f43f5e',
    period: 'October 2026',
  },
  {
    category: 'Education',
    limit: 1000,
    spent: 500,
    color: '#3b82f6',
    period: 'October 2026',
  },
  {
    category: 'Health',
    limit: 800,
    spent: 240,
    color: '#10b981',
    period: 'October 2026',
  },
  {
    category: 'Others',
    limit: 500,
    spent: 150,
    color: '#f59e0b',
    period: 'October 2026',
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Dream Vacation',
    targetAmount: 50000,
    currentAmount: 34000,
    targetDate: '2026-12-31',
    category: 'Travel & Leisure',
    color: '#14b8a6',
  },
  {
    id: 'goal-2',
    name: 'New Laptop',
    targetAmount: 60000,
    currentAmount: 15000,
    targetDate: '2027-03-31',
    category: 'Technology',
    color: '#8b5cf6',
  },
  {
    id: 'goal-3',
    name: 'Emergency Fund',
    targetAmount: 100000,
    currentAmount: 20000,
    targetDate: '2027-08-31',
    category: 'Safety Net',
    color: '#3b82f6',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Budget Alert',
    message: 'Food & Dining has reached 80% of your monthly limit (₹1,600 / ₹2,000).',
    date: 'Today, 10:45 AM',
    type: 'budget',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-2',
    title: 'Upcoming Bill Due',
    message: 'Broadband Fiber internet bill of ₹799 due in 4 days.',
    date: 'Yesterday, 3:20 PM',
    type: 'bill',
    read: false,
    priority: 'medium',
  },
  {
    id: 'notif-3',
    title: 'Savings Milestone',
    message: 'Dream Vacation reached 68% milestone! You are on track to meet your target.',
    date: '15 Oct 2026',
    type: 'savings',
    read: true,
    priority: 'low',
  },
  {
    id: 'notif-4',
    title: 'Salary Deposit',
    message: 'TechCorp credited ₹4,500 monthly income to your HDFC account.',
    date: '01 Oct 2026',
    type: 'transaction',
    read: true,
    priority: 'medium',
  },
];

export const SIX_MONTH_HISTORY = [
  { month: 'May', income: 4000, expenses: 2600, savings: 1400 },
  { month: 'Jun', income: 4200, expenses: 2800, savings: 1400 },
  { month: 'Jul', income: 4100, expenses: 2750, savings: 1350 },
  { month: 'Aug', income: 4400, expenses: 3100, savings: 1300 },
  { month: 'Sep', income: 4300, expenses: 2900, savings: 1400 },
  { month: 'Oct', income: 4500, expenses: 2980, savings: 1520 },
];

export const DEFAULT_AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2314b8a6'/%3E%3Cstop offset='100%25' stop-color='%230f766e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='50' fill='url(%23g)'/%3E%3Ctext x='50' y='63' font-size='40' font-weight='bold' fill='%23ffffff' font-family='sans-serif' text-anchor='middle'%3EM%3C/text%3E%3C/svg%3E";

export function getSafeAvatarUrl(avatar?: string): string {
  if (!avatar || avatar.startsWith('/src/')) {
    return '/avatar.jpg';
  }
  return avatar;
}

export const INITIAL_USER_PROFILE = {
  name: 'Mahi',
  title: 'Premium User',
  email: 'mahi.sharma@smartfin.io',
  avatar: '/avatar.jpg',
  currency: 'INR',
  currencySymbol: '₹',
  conversionMode: 'symbol_only' as 'symbol_only' | 'convert_fx',
  memberSince: 'January 2024',
  plan: 'SmartFin+ Black Tier',
};

export interface SmtpConfig {
  host: string;
  port: number;
  encryption: 'STARTTLS' | 'SSL/TLS' | 'NONE';
  username: string;
  authStatus: 'connected' | 'disconnected' | 'testing';
  lastHandshake?: string;
}

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: 'smtp.smartfin.io',
  port: 587,
  encryption: 'STARTTLS',
  username: 'mahi.sharma@smartfin.io',
  authStatus: 'connected',
  lastHandshake: 'TLSv1.3 AES-256-GCM Handshake Verified',
};

