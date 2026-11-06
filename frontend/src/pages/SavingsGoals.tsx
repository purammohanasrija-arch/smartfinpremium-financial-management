import React, { useState } from 'react';
import { Target, Plus, Sparkles, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoalCard } from '../components/SavingsGoalCard';
import { SavingsGoal } from '../data/mockData';

interface SavingsGoalsPageProps {
  onOpenAddGoal: () => void;
  onOpenContributeGoal: (goal: SavingsGoal) => void;
}

export const SavingsGoalsPage: React.FC<SavingsGoalsPageProps> = ({
  onOpenAddGoal,
  onOpenContributeGoal,
}) => {
  const { savingsGoals, deleteSavingsGoal, currencySymbol, formatCurrency } = useFinance();

  const totalTarget = savingsGoals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Savings Goals</h1>
          <p className="text-xs text-slate-400">
            Track major milestones, vacations, and emergency funds with automated monthly quotas.
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Goals Progress Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Total Goals Target</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">
              {formatCurrency(totalTarget)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{savingsGoals.length} Active Targets</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Total Accumulated</span>
            <div className="text-2xl font-extrabold text-teal-400 font-mono mt-1">
              {formatCurrency(totalSaved)}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{overallPercentage}% aggregate fulfilled</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Remaining to Fund</span>
            <div className="text-2xl font-extrabold text-indigo-300 font-mono mt-1">
              {formatCurrency(Math.max(0, totalTarget - totalSaved))}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Estimated 8-12 months</span>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Portfolio Goal Completion</span>
            <span className="font-mono font-bold text-teal-300">{overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 transition-all duration-700"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => (
          <SavingsGoalCard
            key={goal.id}
            goal={goal}
            onContribute={onOpenContributeGoal}
            onDelete={deleteSavingsGoal}
          />
        ))}
      </div>

      {savingsGoals.length === 0 && (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Award className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-400">No active goals yet</p>
          <p className="text-xs">Create your first savings goal to begin milestone tracking.</p>
        </div>
      )}
    </div>
  );
};
