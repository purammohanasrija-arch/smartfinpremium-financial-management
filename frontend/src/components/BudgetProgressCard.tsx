import React from 'react';
import { AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { Budget } from '../data/mockData';
import { useFinance } from '../context/FinanceContext';

interface BudgetProgressCardProps {
  budget: Budget;
  onEditLimit?: (budget: Budget) => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  budget,
  onEditLimit,
}) => {
  const { currencySymbol, formatCurrency } = useFinance();
  const percentage = Math.round((budget.spent / budget.limit) * 100);
  const remaining = Math.max(0, budget.limit - budget.spent);
  const isOver = budget.spent > budget.limit;
  const isNear = percentage >= 80 && !isOver;

  let statusColor = 'from-teal-500 to-cyan-500';
  let badgeColor = 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  let statusText = 'Normal';

  if (isOver) {
    statusColor = 'from-rose-500 to-red-600';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    statusText = 'Exceeded';
  } else if (isNear) {
    statusColor = 'from-amber-400 to-orange-500';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    statusText = 'Warning (80%+)';
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: budget.color }}
          />
          <h4 className="text-sm font-semibold text-slate-100">{budget.category}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${badgeColor}`}>
            {statusText}
          </span>
          {onEditLimit && (
            <button
              onClick={() => onEditLimit(budget)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Edit Limit"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between text-xs mb-1.5">
        <span className="text-slate-400">
          Spent:{' '}
          <span className="font-mono font-bold text-slate-200">
            {formatCurrency(budget.spent)}
          </span>{' '}
          / {formatCurrency(budget.limit)}
        </span>
        <span
          className={`font-mono font-bold ${
            isOver ? 'text-rose-400' : isNear ? 'text-amber-400' : 'text-teal-400'
          }`}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${statusColor} transition-all duration-500`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
        <span>
          {isOver ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Over by{' '}
              {formatCurrency(budget.spent - budget.limit)}
            </span>
          ) : (
            <span>
              Remaining:{' '}
              <span className="text-slate-200 font-mono">
                {formatCurrency(remaining)}
              </span>
            </span>
          )}
        </span>
        <span className="text-slate-500">{budget.period}</span>
      </div>
    </div>
  );
};
