import React, { useState, useMemo, useEffect } from 'react';
import {
  Landmark,
  Scale,
  TrendingUp,
  Plus,
  Trash2,
  PieChart as PieIcon,
  ShieldCheck,
  Award,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';

export interface AssetItem {
  id: string;
  name: string;
  category: 'Cash & Bank' | 'Equities & Mutual Funds' | 'Real Estate' | 'Gold & Commodities' | 'Retirement / EPF' | 'Crypto';
  value: number;
  growthRatePct?: number;
  notes?: string;
  isBankLinked?: boolean;
}

export interface LiabilityItem {
  id: string;
  name: string;
  category: 'Home Loan' | 'Auto Loan' | 'Personal Loan' | 'Credit Card Debt' | 'Education Loan';
  outstandingAmount: number;
  interestRatePct: number;
  monthlyEmi?: number;
  lender?: string;
}

const STORAGE_ASSETS_KEY = 'smartfin_networth_assets_v1';
const STORAGE_LIABILITIES_KEY = 'smartfin_networth_liabilities_v1';

const DEFAULT_EXTRA_ASSETS: AssetItem[] = [
  {
    id: 'asset_mf_1',
    name: 'Zerodha Index Mutual Funds & Stocks',
    category: 'Equities & Mutual Funds',
    value: 1450000,
    growthRatePct: 14.5,
    notes: 'Nifty 50 + MidCap 150 Index Funds',
  },
  {
    id: 'asset_epf_1',
    name: 'EPF & Public Provident Fund (PPF)',
    category: 'Retirement / EPF',
    value: 680000,
    growthRatePct: 8.1,
    notes: 'Government backed retirement corpus',
  },
  {
    id: 'asset_gold_1',
    name: 'Sovereign Gold Bonds (SGB) & Physical Gold',
    category: 'Gold & Commodities',
    value: 420000,
    growthRatePct: 11.2,
    notes: 'Inflation hedge holding',
  },
  {
    id: 'asset_realestate_1',
    name: 'Residential Apartment (Market Equity)',
    category: 'Real Estate',
    value: 3500000,
    growthRatePct: 7.0,
    notes: '3BHK Property in Bangalore',
  },
];

const DEFAULT_LIABILITIES: LiabilityItem[] = [
  {
    id: 'liab_1',
    name: 'HDFC Home Loan (Apartment)',
    category: 'Home Loan',
    outstandingAmount: 1850000,
    interestRatePct: 8.4,
    monthlyEmi: 21500,
    lender: 'HDFC Bank Ltd.',
  },
  {
    id: 'liab_2',
    name: 'ICICI Sapphiro Credit Card Statement',
    category: 'Credit Card Debt',
    outstandingAmount: 24500,
    interestRatePct: 36.0,
    lender: 'ICICI Bank',
  },
  {
    id: 'liab_3',
    name: 'Auto Loan (Hyundai Creta)',
    category: 'Auto Loan',
    outstandingAmount: 340000,
    interestRatePct: 9.1,
    monthlyEmi: 11200,
    lender: 'State Bank of India',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Cash & Bank': '#0d9488', // teal
  'Equities & Mutual Funds': '#10b981', // emerald
  'Real Estate': '#6366f1', // indigo
  'Gold & Commodities': '#f59e0b', // amber
  'Retirement / EPF': '#06b6d4', // cyan
  'Crypto': '#8b5cf6', // purple
};

export const NetWorthPage: React.FC = () => {
  const { accounts, monthlyIncome, monthlyExpenses, currencySymbol, formatCurrency, addToast } = useFinance();

  // Load / State
  const [extraAssets, setExtraAssets] = useState<AssetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ASSETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EXTRA_ASSETS;
  });

  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LIABILITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LIABILITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ASSETS_KEY, JSON.stringify(extraAssets));
    } catch {}
  }, [extraAssets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIABILITIES_KEY, JSON.stringify(liabilities));
    } catch {}
  }, [liabilities]);

  // Combine live bank accounts into Assets
  const allAssets: AssetItem[] = useMemo(() => {
    const bankAssets: AssetItem[] = accounts
      .filter((a) => a.balance > 0)
      .map((a) => ({
        id: `bank_${a.id}`,
        name: a.name,
        category: 'Cash & Bank',
        value: a.balance,
        notes: `Live balance from ${a.institution}`,
        isBankLinked: true,
      }));

    return [...bankAssets, ...extraAssets];
  }, [accounts, extraAssets]);

  // Calculations
  const totalAssets = useMemo(() => allAssets.reduce((sum, a) => sum + a.value, 0), [allAssets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;
  const debtToAssetRatio = totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0';

  // Allocation Data for Pie Chart
  const allocationData = useMemo(() => {
    const catTotals: Record<string, number> = {};
    allAssets.forEach((a) => {
      catTotals[a.category] = (catTotals[a.category] || 0) + a.value;
    });

    return Object.entries(catTotals).map(([cat, val]) => ({
      name: cat,
      value: val,
      color: CATEGORY_COLORS[cat] || '#64748b',
    })).sort((a, b) => b.value - a.value);
  }, [allAssets]);

  // Modals state
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'liabilities' | 'milestones'>('overview');
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isAddLiabOpen, setIsAddLiabOpen] = useState(false);

  // New Asset Form
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetVal, setNewAssetVal] = useState('');
  const [newAssetCat, setNewAssetCat] = useState<AssetItem['category']>('Equities & Mutual Funds');
  const [newAssetNotes, setNewAssetNotes] = useState('');

  // New Liability Form
  const [newLiabName, setNewLiabName] = useState('');
  const [newLiabAmount, setNewLiabAmount] = useState('');
  const [newLiabCat, setNewLiabCat] = useState<LiabilityItem['category']>('Personal Loan');
  const [newLiabRate, setNewLiabRate] = useState('10.5');
  const [newLiabEmi, setNewLiabEmi] = useState('');

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newAssetVal);
    if (!newAssetName.trim() || isNaN(val) || val <= 0) {
      addToast('Please enter a valid asset name and positive value', 'error');
      return;
    }
    const item: AssetItem = {
      id: `asset_${Date.now()}`,
      name: newAssetName.trim(),
      category: newAssetCat,
      value: val,
      notes: newAssetNotes.trim() || undefined,
    };
    setExtraAssets((prev) => [item, ...prev]);
    setIsAddAssetOpen(false);
    setNewAssetName('');
    setNewAssetVal('');
    setNewAssetNotes('');
    addToast(`Added asset: ${item.name}`, 'success');
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newLiabAmount);
    if (!newLiabName.trim() || isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid liability name and amount', 'error');
      return;
    }
    const item: LiabilityItem = {
      id: `liab_${Date.now()}`,
      name: newLiabName.trim(),
      category: newLiabCat,
      outstandingAmount: amount,
      interestRatePct: parseFloat(newLiabRate) || 0,
      monthlyEmi: newLiabEmi ? parseFloat(newLiabEmi) : undefined,
    };
    setLiabilities((prev) => [item, ...prev]);
    setIsAddLiabOpen(false);
    setNewLiabName('');
    setNewLiabAmount('');
    setNewLiabEmi('');
    addToast(`Added liability: ${item.name}`, 'success');
  };

  // Milestones roadmap
  const milestones = [
    { target: 1000000, label: '10 Lakhs (First Milestone)' },
    { target: 2500000, label: '25 Lakhs (Quarter Crore Club)' },
    { target: 5000000, label: '50 Lakhs (Half Crore Club)' },
    { target: 10000000, label: '1 Crore (Financial Independence Milestone)' },
  ];

  const monthlySavingsSurplus = Math.max(1, monthlyIncome - monthlyExpenses);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-teal-400" /> Net Worth & Balance Sheet
          </h1>
          <p className="text-xs text-slate-400">
            Comprehensive wealth ledger: live liquid assets, equities, real estate holdings, and debt obligations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddAssetOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>

          <button
            onClick={() => setIsAddLiabOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Liability</span>
          </button>
        </div>
      </div>

      {/* Hero Net Worth Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Net Worth Main Number */}
          <div className="md:col-span-2 space-y-1">
            <span className="text-xs font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-teal-400" /> Total Net Worth (Assets − Debts)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {formatCurrency(netWorth)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Your real financial equity after deducting all loans and card debts.
            </p>
          </div>

          {/* Total Assets KPI */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Gross Assets
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono block">
              {formatCurrency(totalAssets)}
            </span>
            <span className="text-[10px] text-slate-400 block">Across {allAssets.length} wealth holdings</span>
          </div>

          {/* Total Liabilities KPI */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
            <span className="text-[10px] text-rose-400 uppercase font-mono flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Total Liabilities
            </span>
            <span className="text-2xl font-black text-rose-400 font-mono block">
              {formatCurrency(totalLiabilities)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Debt Leverage: <strong className="text-white font-mono">{debtToAssetRatio}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-teal-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Allocation Overview
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeTab === 'assets'
              ? 'bg-teal-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Assets ({allAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('liabilities')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeTab === 'liabilities'
              ? 'bg-teal-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Debts & Liabilities ({liabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeTab === 'milestones'
              ? 'bg-teal-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Freedom Milestones
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Asset Allocation Donut */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-teal-400" /> Asset Allocation Portfolio
              </h3>
              <p className="text-xs text-slate-400">Distribution across asset classes</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              💡 Well diversified: Equities and Real Estate are balanced with stable Cash & Retirement holdings.
            </div>
          </div>

          {/* Quick Breakdown Table */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Asset Class Value Breakdown
            </h3>

            <div className="space-y-2">
              {allocationData.map((item) => {
                const pct = totalAssets > 0 ? ((item.value / totalAssets) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-white">{item.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-200 block">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{pct}% of wealth</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[asset.category] || '#0d9488' }}
                    />
                    <h4 className="text-sm font-bold text-white leading-tight">{asset.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded inline-block">
                    {asset.category} {asset.isBankLinked && '• Linked Bank'}
                  </span>
                  {asset.notes && <p className="text-[11px] text-slate-400 mt-1">{asset.notes}</p>}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-white font-mono block">
                    {formatCurrency(asset.value)}
                  </span>
                  {!asset.isBankLinked && (
                    <button
                      type="button"
                      onClick={() => {
                        setExtraAssets((prev) => prev.filter((a) => a.id !== asset.id));
                        addToast(`Removed ${asset.name}`, 'info');
                      }}
                      className="text-slate-500 hover:text-rose-400 text-xs mt-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIABILITIES TAB */}
      {activeTab === 'liabilities' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liabilities.map((liab) => (
              <div
                key={liab.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white leading-tight">{liab.name}</h4>
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded inline-block">
                    {liab.category} • {liab.interestRatePct}% p.a.
                  </span>
                  {liab.monthlyEmi && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Monthly EMI: <strong className="text-slate-200 font-mono">{formatCurrency(liab.monthlyEmi)}</strong>
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-black text-rose-400 font-mono block">
                    {formatCurrency(liab.outstandingAmount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLiabilities((prev) => prev.filter((l) => l.id !== liab.id));
                      addToast(`Removed liability: ${liab.name}`, 'info');
                    }}
                    className="text-slate-500 hover:text-rose-400 text-xs mt-1 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Wealth Independence Milestones
            </h3>
            <p className="text-xs text-slate-400">
              Track your trajectory towards key financial milestones based on your monthly surplus ({formatCurrency(monthlySavingsSurplus)}/month).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {milestones.map((m, idx) => {
              const progressPct = Math.min(100, Math.round((netWorth / m.target) * 100));
              const isAchieved = netWorth >= m.target;
              const gap = Math.max(0, m.target - netWorth);
              const monthsToReach = !isAchieved && monthlySavingsSurplus > 0 ? (gap / monthlySavingsSurplus).toFixed(1) : '0';

              return (
                <div
                  key={m.target}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isAchieved
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Milestone #{idx + 1}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{m.label}</h4>
                    </div>
                    {isAchieved ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Achieved! 🎉
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {progressPct}%
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full ${isAchieved ? 'bg-emerald-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Target: {formatCurrency(m.target)}</span>
                    {!isAchieved && <span>Est. in ~{monthsToReach} mos</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-400" /> Add Wealth Asset
            </h3>
            <form onSubmit={handleAddAsset} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. S&P 500 Index Fund, Gold ETF, Land"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Asset Value ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={newAssetVal}
                    onChange={(e) => setNewAssetVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Class</label>
                  <select
                    value={newAssetCat}
                    onChange={(e: any) => setNewAssetCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Equities & Mutual Funds">Equities & Mutual Funds</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Gold & Commodities">Gold & Commodities</option>
                    <option value="Retirement / EPF">Retirement / EPF</option>
                    <option value="Cash & Bank">Cash & Bank</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Brokerage account / physical holding"
                  value={newAssetNotes}
                  onChange={(e) => setNewAssetNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAssetOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs font-mono rounded-xl shadow"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Liability Modal */}
      {isAddLiabOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" /> Add Loan or Debt Liability
            </h3>
            <form onSubmit={handleAddLiability} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Debt / Loan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Car Loan, Credit Card Balance, Education Loan"
                  value={newLiabName}
                  onChange={(e) => setNewLiabName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Outstanding Balance ({currencySymbol})</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={newLiabAmount}
                    onChange={(e) => setNewLiabAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="9.5"
                    value={newLiabRate}
                    onChange={(e) => setNewLiabRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                  <select
                    value={newLiabCat}
                    onChange={(e: any) => setNewLiabCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Home Loan">Home Loan</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Credit Card Debt">Credit Card Debt</option>
                    <option value="Education Loan">Education Loan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Monthly EMI (Optional)</label>
                  <input
                    type="number"
                    placeholder="8500"
                    value={newLiabEmi}
                    onChange={(e) => setNewLiabEmi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddLiabOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs font-mono rounded-xl shadow"
                >
                  Save Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
