import React from 'react';
import { Target, Calendar, Plus, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { SavingsGoal } from '../data/mockData';
import { useFinance } from '../context/FinanceContext';
import { calculateEstimatedMonthlySavings } from '../utils/financeCalculations';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onContribute: (goal: SavingsGoal) => void;
  onEdit?: (goal: SavingsGoal) => void;
  onDelete?: (id: string) => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onContribute,
  onEdit,
  onDelete,
}) => {
  const { currencySymbol, formatCurrency } = useFinance();
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const monthlyRequired = calculateEstimatedMonthlySavings(goal);

  return (
    <div className="relative p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all duration-300 shadow-lg group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-teal-400">
            {goal.category}
          </span>
          <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
            {goal.name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Done
            </span>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors text-xs"
              title="Delete goal"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-xs text-slate-400">Current: </span>
          <span className="text-lg font-extrabold text-white font-mono tabular-nums">
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {' '}/ {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        <span className="text-sm font-bold font-mono text-teal-400">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 transition-all duration-700 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Due: {goal.targetDate}</span>
        </div>
        <div className="text-right">
          <span>Est. Req: </span>
          <span className="font-mono text-slate-200 font-semibold">
            {formatCurrency(monthlyRequired)}/mo
          </span>
        </div>
      </div>

      <button
        onClick={() => onContribute(goal)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-teal-500/20 text-slate-200 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 text-xs font-semibold transition-all active:scale-[0.98]"
      >
        <Plus className="w-3.5 h-3.5 text-teal-400" />
        Add Contribution
      </button>
    </div>
  );
};
