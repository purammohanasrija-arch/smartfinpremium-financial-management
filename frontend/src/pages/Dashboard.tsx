import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Calendar,
  Calculator,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { StatCard } from '../components/StatCard';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { SavingsGoalCard } from '../components/SavingsGoalCard';
import { SpendingAnomalySentinel } from '../components/SpendingAnomalySentinel';
import { CATEGORIES, SavingsGoal, Transaction, Budget } from '../data/mockData';

interface DashboardProps {
  onOpenAddTransaction: () => void;
  onOpenSetBudget: (category?: string) => void;
  onOpenAddGoal: () => void;
  onOpenContributeGoal: (goal: SavingsGoal) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenTransfer?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAddTransaction,
  onOpenSetBudget,
  onOpenAddGoal,
  onOpenContributeGoal,
  onEditTransaction,
  onOpenTransfer,
}) => {
  const {
    user,
    currencySymbol,
    formatCurrency,
    activePaletteInfo,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    healthScoreData,
    historyChartData,
    transactions,
    deleteTransaction,
    budgets,
    savingsGoals,
    searchQuery,
  } = useFinance();

  // Filters & sorting state for recent transactions
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [chartRange, setChartRange] = useState<'3M' | '6M' | '1Y'>('6M');

  // Filtered transactions for recent list
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch =
        searchQuery === '' ||
        tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'All' || tx.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // Category spending aggregation for donut chart
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    });

  const donutChartData = CATEGORIES.map((cat) => ({
    name: cat.name,
    value: categoryExpenses[cat.name] || 0,
    color: cat.color,
  })).filter((item) => item.value > 0);

  // Time slice for Bar chart
  const activeHistory =
    chartRange === '3M'
      ? historyChartData.slice(-3)
      : historyChartData;

  // Custom Recharts Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-white mb-1.5">{label} 2026</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-white">
                {formatCurrency(Number(entry.value) || 0)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent =
        monthlyExpenses > 0 ? Math.round((data.value / monthlyExpenses) * 100) : 0;
      return (
        <div className="p-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.color }} />
            {data.name}
          </p>
          <p className="text-teal-400 font-mono font-bold mt-1">
            {formatCurrency(Number(data.value) || 0)} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Four Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          amount={totalBalance}
          icon={Wallet}
          change="+8.2%"
          isPositive={true}
          accent="teal"
          sparklineData={[11200, 11500, 11800, 11950, 12200, totalBalance]}
        />
        <StatCard
          title="Monthly Income"
          amount={monthlyIncome}
          icon={TrendingUp}
          change="+12.5%"
          isPositive={true}
          accent="emerald"
          sparklineData={[4000, 4200, 4100, 4400, 4300, monthlyIncome]}
        />
        <StatCard
          title="Monthly Expenses"
          amount={monthlyExpenses}
          icon={CreditCard}
          change="-2.8%"
          isPositive={false}
          accent="rose"
          sparklineData={[2600, 2800, 2750, 3100, 2900, monthlyExpenses]}
        />
        <StatCard
          title="Total Savings"
          amount={totalSavings}
          icon={PiggyBank}
          change="+18.4%"
          isPositive={true}
          accent="purple"
          sparklineData={[1400, 1400, 1350, 1300, 1400, totalSavings]}
        />
      </div>

      {/* Proactive Intelligence: Spending Anomalies & Unusual Outflow Sentinel */}
      <SpendingAnomalySentinel
        onOpenSetBudget={onOpenSetBudget}
        onOpenTransfer={onOpenTransfer}
      />

      {/* Financial Tools & Intelligence Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
            <Calculator className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Financial Planning & Calculators Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                New Feature
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate loan EMI amortizations, forecast compound wealth (SIP), assess emergency runway, and split group bills.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <NavLink
            to="/tools"
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <span>Launch Calculators</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* 2. Charts Row: Income vs Expenses & Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-400">
                Comparative analysis over consecutive billing periods
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto">
              {(['3M', '6M', '1Y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                    chartRange === r
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencySymbol}${val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Donut Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">Expenses by Category</h3>
            <p className="text-xs text-slate-400">Total spending breakdown for October</p>
          </div>

          <div className="relative h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total Spending Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-xl font-extrabold text-white font-mono tabular-nums">
                {formatCurrency(monthlyExpenses)}
              </span>
              <span className="text-[10px] text-teal-400 font-medium">October</span>
            </div>
          </div>

          {/* Category mini legend pills */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
            {donutChartData.slice(0, 6).map((cat) => {
              const percent =
                monthlyExpenses > 0 ? Math.round((cat.value / monthlyExpenses) * 100) : 0;
              return (
                <div key={cat.name} className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="font-mono text-slate-400 ml-1 text-[11px]">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Monthly Spending Trend & Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Trend Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-400">
                Smooth trajectory of total outflows vs historical baseline
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Avg: {formatCurrency(2855)}/mo
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activePaletteInfo.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={activePaletteInfo.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                        <div className="p-2.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-xl backdrop-blur-md text-xs">
                          <p className="font-bold text-white">{label} 2026</p>
                          <p className="text-teal-400 font-mono font-semibold mt-1">
                            Spent: {formatCurrency(Number(payload[0].value) || 0)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke={activePaletteInfo.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#spendingTrendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score (82/100 circular gauge) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                Financial Health Score
              </h3>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                Rule-Based Demo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Demonstration score computed from mock income, budget limits, and goals.
            </p>
          </div>

          {/* Circular SVG Gauge */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Score Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="url(#healthGrad)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * healthScoreData.score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={activePaletteInfo.primary} />
                    <stop offset="50%" stopColor={activePaletteInfo.secondary} />
                    <stop offset="100%" stopColor={activePaletteInfo.accent} />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {healthScoreData.score}
                </span>
                <span className="text-[11px] font-medium text-slate-400">/ 100</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-emerald-400 font-mono">
              Grade: {healthScoreData.grade}
            </span>
          </div>

          {/* Insights list */}
          <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
            {healthScoreData.insights.map((insight) => (
              <div key={insight.label} className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  {insight.label}:
                </span>
                <span className="font-semibold text-slate-200">{insight.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Recent Transactions & Budget Progress & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2 columns on large screen) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recent Transactions</h3>
              <p className="text-xs text-slate-400">
                Real-time activity across linked bank accounts and wallets
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-teal-500/50"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title={`Sort ${sortOrder === 'desc' ? 'Oldest first' : 'Newest first'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              <NavLink
                to="/transactions"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center ml-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </NavLink>
            </div>
          </div>

          {/* Transactions Table / List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Merchant / Details</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Account</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.slice(0, 6).map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100 block">
                              {tx.merchant}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-3">
                        <span className="text-slate-300 font-medium">{tx.category}</span>
                      </td>

                      <td className="py-3 pr-3 text-slate-400 font-mono text-[11px]">
                        {tx.date}
                      </td>

                      <td className="py-3 pr-3 text-slate-400 truncate max-w-[120px]">
                        {tx.account}
                      </td>

                      <td className="py-3 pr-3 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="text-slate-400 hover:text-teal-400 px-1 py-0.5 rounded text-[11px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="text-slate-500 hover:text-rose-400 px-1 py-0.5 rounded text-[11px]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No transactions match the selected filters or search query.
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress & Savings Goals Column */}
        <div className="space-y-6">
          {/* Budget Progress */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Budget Progress</h3>
                <p className="text-xs text-slate-400">Monthly category thresholds</p>
              </div>
              <NavLink
                to="/budgets"
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center"
              >
                Manage <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </NavLink>
            </div>

            <div className="space-y-3">
              {budgets.slice(0, 4).map((b) => (
                <BudgetProgressCard
                  key={b.category}
                  budget={b}
                  onEditLimit={() => onOpenSetBudget(b.category)}
                />
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Savings Goals</h3>
                <p className="text-xs text-slate-400">Milestone targets for Mahi</p>
              </div>
              <button
                onClick={onOpenAddGoal}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center"
              >
                + New Goal
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.slice(0, 2).map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={onOpenContributeGoal}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
