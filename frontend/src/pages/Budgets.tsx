import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BudgetProgressCard } from '../components/BudgetProgressCard';
import { Budget, CATEGORIES } from '../data/mockData';

interface BudgetsPageProps {
  onOpenSetBudget: (category?: string) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ onOpenSetBudget }) => {
  const { budgets, currencySymbol, monthlyExpenses, formatCurrency } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  const totalBudgetLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalBudgetRemaining = Math.max(0, totalBudgetLimit - totalBudgetSpent);
  const overallUtilization = Math.round((totalBudgetSpent / (totalBudgetLimit || 1)) * 100);

  const exceededBudgets = budgets.filter((b) => b.spent > b.limit);
  const warningBudgets = budgets.filter(
    (b) => b.spent <= b.limit && (b.spent / b.limit) * 100 >= 80
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Budgets & Limits</h1>
          <p className="text-xs text-slate-400">
            Set intelligent category spending thresholds to stay ahead of your financial targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="October 2026">October 2026 (Active)</option>
              <option value="November 2026">November 2026 (Upcoming)</option>
              <option value="September 2026">September 2026</option>
            </select>
          </div>

          <button
            onClick={() => onOpenSetBudget()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adjust Budget</span>
          </button>
        </div>
      </div>

      {/* Aggregate Budget Status Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400">Total Monthly Limit</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">
              {formatCurrency(totalBudgetLimit)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Allocated over 7 categories</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400">Total Spent So Far</span>
            <div className="text-2xl font-extrabold text-teal-400 font-mono mt-1">
              {formatCurrency(totalBudgetSpent)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{overallUtilization}% overall utilization</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400">Remaining Budget</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {formatCurrency(totalBudgetRemaining)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Safe remaining allowance</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Overall Month Progress</span>
            <span className="font-mono text-teal-300">{overallUtilization}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                overallUtilization > 100
                  ? 'bg-rose-500'
                  : overallUtilization > 80
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, overallUtilization)}%` }}
            />
          </div>
        </div>

        {/* Alerts Callout */}
        {(exceededBudgets.length > 0 || warningBudgets.length > 0) && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="font-semibold">Budget Watch: </strong>
              {exceededBudgets.length > 0 && (
                <span>
                  {exceededBudgets.map((b) => b.category).join(', ')} exceeded monthly limit!{' '}
                </span>
              )}
              {warningBudgets.length > 0 && (
                <span>
                  {warningBudgets.map((b) => b.category).join(', ')} is past 80% threshold.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category-Wise Budgets Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">Category-Wise Spending Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetProgressCard
              key={b.category}
              budget={b}
              onEditLimit={() => onOpenSetBudget(b.category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
