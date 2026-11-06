import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  TrendingDown,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  Sparkles,
  Filter,
  DollarSign,
  Calendar,
  Zap,
  Clock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export interface SubscriptionItem {
  id: string;
  name: string;
  category: 'Entertainment' | 'Software' | 'Utilities' | 'Fitness' | 'Productivity';
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  nextBillingDate: string; // YYYY-MM-DD
  status: 'active' | 'paused' | 'trial';
  paymentMethod: string;
  description?: string;
  iconBg: string;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub_1',
    name: 'Netflix Premium 4K',
    category: 'Entertainment',
    amount: 649,
    billingCycle: 'monthly',
    nextBillingDate: '2026-11-12',
    status: 'active',
    paymentMethod: 'ICICI Sapphiro Credit Card',
    description: '4-Screen Family Plan',
    iconBg: '#e50914',
  },
  {
    id: 'sub_2',
    name: 'Spotify Duo',
    category: 'Entertainment',
    amount: 149,
    billingCycle: 'monthly',
    nextBillingDate: '2026-11-18',
    status: 'active',
    paymentMethod: 'HDFC Bank Checking',
    description: 'High-res audio streaming',
    iconBg: '#1db954',
  },
  {
    id: 'sub_3',
    name: 'AWS Cloud Hosting',
    category: 'Software',
    amount: 2850,
    billingCycle: 'monthly',
    nextBillingDate: '2026-11-28',
    status: 'active',
    paymentMethod: 'ICICI Sapphiro Credit Card',
    description: 'EC2 + RDS database servers',
    iconBg: '#ff9900',
  },
  {
    id: 'sub_4',
    name: 'GitHub Copilot Pro',
    category: 'Software',
    amount: 830,
    billingCycle: 'monthly',
    nextBillingDate: '2026-11-24',
    status: 'active',
    paymentMethod: 'HDFC Bank Checking',
    description: 'AI Code Autocomplete',
    iconBg: '#24292e',
  },
  {
    id: 'sub_5',
    name: 'Airtel Xstream Fiber (1Gbps)',
    category: 'Utilities',
    amount: 1768,
    billingCycle: 'monthly',
    nextBillingDate: '2026-11-15',
    status: 'active',
    paymentMethod: 'HDFC Bank Checking',
    description: 'Gigabit Home Broadband',
    iconBg: '#e40000',
  },
  {
    id: 'sub_6',
    name: 'Cult.fit Fitness All-Access',
    category: 'Fitness',
    amount: 12500,
    billingCycle: 'yearly',
    nextBillingDate: '2027-01-15',
    status: 'active',
    paymentMethod: 'SBI Savings Account',
    description: 'Unlimited Gym & Yoga Pass',
    iconBg: '#ff3278',
  },
  {
    id: 'sub_7',
    name: 'Google One 2TB Cloud',
    category: 'Productivity',
    amount: 650,
    billingCycle: 'monthly',
    nextBillingDate: '2026-12-05',
    status: 'active',
    paymentMethod: 'HDFC Bank Checking',
    description: 'Drive, Photos & Gemini Advanced',
    iconBg: '#4285f4',
  },
  {
    id: 'sub_8',
    name: 'Disney+ Hotstar Super',
    category: 'Entertainment',
    amount: 899,
    billingCycle: 'yearly',
    nextBillingDate: '2026-12-20',
    status: 'paused',
    paymentMethod: 'ICICI Sapphiro Credit Card',
    description: 'Paused during off-season',
    iconBg: '#0f172a',
  },
];

const STORAGE_KEY = 'smartfin_user_subscriptions_v1';

export const SubscriptionsPage: React.FC = () => {
  const { currencySymbol, formatCurrency, addToast, accounts } = useFinance();

  // Load from local storage or default
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SUBSCRIPTIONS;
  });

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch {}
  }, [subscriptions]);

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add/Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<SubscriptionItem['category']>('Entertainment');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');
  const [nextDate, setNextDate] = useState('2026-11-20');
  const [paymentMethod, setPaymentMethod] = useState(accounts[0]?.name || 'HDFC Bank Checking');
  const [description, setDescription] = useState('');

  // Calculations
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active');
    const paused = subscriptions.filter((s) => s.status === 'paused');

    let monthlyTotal = 0;
    active.forEach((s) => {
      if (s.billingCycle === 'monthly') monthlyTotal += s.amount;
      else if (s.billingCycle === 'yearly') monthlyTotal += s.amount / 12;
      else if (s.billingCycle === 'quarterly') monthlyTotal += s.amount / 3;
    });

    const yearlyTotal = monthlyTotal * 12;

    // Upcoming in next 10 days
    const today = new Date('2026-11-06').getTime();
    const tenDaysLater = today + 10 * 24 * 60 * 60 * 1000;
    const upcomingRenewals = active.filter((s) => {
      const d = new Date(s.nextBillingDate).getTime();
      return d >= today && d <= tenDaysLater;
    });

    return {
      activeCount: active.length,
      pausedCount: paused.length,
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      upcomingRenewals,
    };
  }, [subscriptions]);

  // Toggle status
  const togglePause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'active' ? 'paused' : 'active';
          addToast(
            `${s.name} is now ${newStatus === 'active' ? 'active' : 'paused'}`,
            'info'
          );
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  // Delete
  const handleDelete = (id: string, subName: string) => {
    if (confirm(`Remove subscription "${subName}"?`)) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      addToast(`Subscription removed: ${subName}`, 'info');
    }
  };

  // Create
  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Please enter a valid subscription name and amount', 'error');
      return;
    }

    const newSub: SubscriptionItem = {
      id: `sub_${Date.now()}`,
      name: name.trim(),
      amount: parsedAmount,
      category,
      billingCycle,
      nextBillingDate: nextDate || '2026-11-20',
      status: 'active',
      paymentMethod,
      description: description.trim() || undefined,
      iconBg: '#0d9488',
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setIsAddModalOpen(false);
    setName('');
    setAmount('');
    setDescription('');
    addToast(`Added subscription: ${newSub.name}`, 'success');
  };

  // Filtered List
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [subscriptions, filterCategory, filterStatus, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-teal-400" /> Subscriptions & Recurring Bills
          </h1>
          <p className="text-xs text-slate-400">
            Track, audit, and cancel recurring SaaS, streaming, cloud, and utility subscriptions in one central hub.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Cost */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Monthly Run-Rate</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
            {formatCurrency(stats.monthlyTotal)}
          </span>
          <span className="text-[10px] text-teal-400 block mt-0.5">
            Across {stats.activeCount} active subscriptions
          </span>
        </div>

        {/* Annual Projected Outflow */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Annual Projection</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono mt-1 block">
            {formatCurrency(stats.yearlyTotal)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Projected for 12 months</span>
        </div>

        {/* Active vs Paused */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Subscription Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {stats.activeCount}
            </span>
            <span className="text-xs text-slate-400">Active</span>
            <span className="text-slate-600">•</span>
            <span className="text-lg font-bold text-slate-400 font-mono">
              {stats.pausedCount}
            </span>
            <span className="text-xs text-slate-500">Paused</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Paused saves ~{formatCurrency(899)}/yr
          </span>
        </div>

        {/* Upcoming Renewals in 10 days */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-900 border border-rose-500/30 shadow-lg">
          <span className="text-[10px] text-rose-400 uppercase font-mono block flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Due in Next 10 Days
          </span>
          <span className="text-2xl font-extrabold text-rose-300 font-mono mt-1 block">
            {stats.upcomingRenewals.length} Bills
          </span>
          <span className="text-[10px] text-rose-300/80 block mt-0.5">
            Next: {stats.upcomingRenewals[0]?.name || 'None'}
          </span>
        </div>
      </div>

      {/* Proactive Audit & Waste Reduction Alert */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-teal-950/40 border border-indigo-500/30 flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-white block">SmartFin+ Subscription Optimization Audit</span>
            <p className="text-slate-300 mt-0.5">
              Switching <strong>Cult.fit</strong> and <strong>Airtel Broadband</strong> to annual advance billing could save you{' '}
              <strong className="text-teal-400 font-mono">~{formatCurrency(3400)}/year</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => addToast('Optimization report applied to savings goals!', 'success')}
          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-semibold transition-all shrink-0"
        >
          View Savings Potential
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriptions or streaming services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Status buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            {(['all', 'active', 'paused'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500 shrink-0"
          >
            <option value="All">All Categories</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Software">Software & Dev</option>
            <option value="Utilities">Utilities & Home</option>
            <option value="Fitness">Fitness & Health</option>
            <option value="Productivity">Productivity</option>
          </select>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubscriptions.map((sub) => {
          const daysToRenewal = Math.ceil(
            (new Date(sub.nextBillingDate).getTime() - new Date('2026-11-06').getTime()) /
              (1000 * 60 * 60 * 24)
          );

          const isUrgent = daysToRenewal >= 0 && daysToRenewal <= 7 && sub.status === 'active';

          return (
            <div
              key={sub.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                sub.status === 'paused'
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                  : isUrgent
                  ? 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-500/5'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: sub.iconBg }}
                  >
                    {sub.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{sub.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {sub.category} • {sub.billingCycle}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    sub.status === 'active'
                      ? isUrgent
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {sub.status === 'active' ? (isUrgent ? `Due in ${daysToRenewal}d` : 'Active') : 'Paused'}
                </span>
              </div>

              {/* Price & Plan Details */}
              <div className="pt-2 border-t border-slate-850 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-black text-white font-mono">
                    {formatCurrency(sub.amount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">/{sub.billingCycle}</span>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  Next: {new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Description & Account Note */}
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-850 space-y-0.5">
                <div className="truncate text-slate-300 font-medium">
                  {sub.description || 'Standard recurring plan'}
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sub.paymentMethod}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => togglePause(sub.id)}
                  className={`flex items-center gap-1 font-mono text-[11px] font-semibold transition-colors ${
                    sub.status === 'active'
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {sub.status === 'active' ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Pause Sub</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Resume Sub</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sub.id, sub.name)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <CalendarClock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold">No subscriptions match your search or filter</p>
          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="text-xs text-teal-400 underline font-mono"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-400" /> New Recurring Subscription
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Service / App Name</label>
                <input
                  type="text"
                  placeholder="e.g. Disney+ or GitHub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Price ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="499"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e: any) => setBillingCycle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Entertainment">Entertainment</option>
                    <option value="Software">Software & Dev</option>
                    <option value="Utilities">Utilities & Home</option>
                    <option value="Fitness">Fitness & Health</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Next Renewal Date</label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.name}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                  <option value="Other Card / UPI">Other Card / UPI</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Notes / Plan</label>
                <input
                  type="text"
                  placeholder="e.g. 4K Family plan with student discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs font-mono shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-400 transition-all"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
