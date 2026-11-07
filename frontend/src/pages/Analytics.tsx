import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Calendar,
  Filter,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../data/mockData';

export const AnalyticsPage: React.FC = () => {
  const {
    transactions,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    currencySymbol,
    formatCurrency,
    historyChartData,
    activePaletteInfo,
  } = useFinance();

  const [dateRange, setDateRange] = useState<'3M' | '6M' | '1Y'>('6M');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Savings rate
  const savingsRate =
    monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const categoryData = CATEGORIES.map((c) => ({
    name: c.name,
    amount: categoryTotals[c.name] || 0,
    color: c.color,
  })).sort((a, b) => b.amount - a.amount);

  const highestCategory = categoryData[0] || { name: 'Food & Dining', amount: 0 };

  // Weekly spending trend demo data
  const weeklyTrendData = [
    { week: 'Week 1', expenses: 650, income: 4500 },
    { week: 'Week 2', expenses: 840, income: 0 },
    { week: 'Week 3', expenses: 920, income: 1200 },
    { week: 'Week 4', expenses: 570, income: 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Analytics</h1>
          <p className="text-xs text-slate-400">
            Deep-dive metrics on spending trends, category distributions, and liquidity momentum.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {(['3M', '6M', '1Y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  dateRange === r
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400">Current Savings Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {savingsRate}%
          </div>
          <span className="text-[11px] text-slate-500">Benchmark target: 20-30%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400">Highest Outflow Category</span>
          <div className="text-lg font-bold text-white mt-1 truncate">
            {highestCategory.name}
          </div>
          <span className="text-[11px] text-teal-400 font-mono">
            {formatCurrency(highestCategory.amount)} ({Math.round((highestCategory.amount / (monthlyExpenses || 1)) * 100)}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400">Net Cash Flow</span>
          <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
            +{formatCurrency(totalSavings)}
          </div>
          <span className="text-[11px] text-emerald-400">Positive surplus</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400">Daily Average Outflow</span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {formatCurrency(Math.round(monthlyExpenses / 30))}
          </div>
          <span className="text-[11px] text-slate-500">30-day baseline</span>
        </div>
      </div>

      {/* Two Column Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Six Month Income, Expense & Savings Trend */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Income vs Expenses vs Savings</h3>
            <p className="text-xs text-slate-400">Historical performance across 6 months</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label} 2026</p>
                          {payload.map((entry: any, i: number) => (
                            <p key={i} style={{ color: entry.color }} className="font-mono">
                              {entry.name}: {formatCurrency(Number(entry.value) || 0)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="savings" name="Net Savings" stroke={activePaletteInfo.primary} strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Spending Cadence */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">October Weekly Cadence</h3>
            <p className="text-xs text-slate-400">Weekly disbursement distribution for current month</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-rose-400 font-mono mt-1">
                            Disbursed: {formatCurrency(Number(payload[0].value) || 0)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="expenses" name="Weekly Expenses" fill={activePaletteInfo.secondary} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Highest Spending Categories Ranking Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1">Ranked Spending Categories</h3>
        <p className="text-xs text-slate-400 mb-4">
          Hierarchical listing of October disbursements by volume and proportion
        </p>

        <div className="space-y-3">
          {categoryData.map((cat, idx) => {
            const percent =
              monthlyExpenses > 0 ? Math.round((cat.amount / monthlyExpenses) * 100) : 0;
            return (
              <div key={cat.name} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 font-semibold w-4">#{idx + 1}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-200">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="font-mono text-teal-400 w-10 text-right">{percent}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
