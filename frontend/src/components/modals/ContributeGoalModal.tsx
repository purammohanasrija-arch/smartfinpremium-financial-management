import React, { useState } from 'react';
import { X, Sparkles, TrendingUp } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../data/mockData';

interface ContributeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { contributeToGoal, accounts, currencySymbol } = useFinance();
  const [amount, setAmount] = useState('1000');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');

  React.useEffect(() => {
    if (accounts.length > 0 && !sourceAccountId) {
      setSourceAccountId(accounts[0].id);
    }
  }, [accounts, sourceAccountId]);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    contributeToGoal(goal.id, parsedAmount, sourceAccountId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-bold tracking-tight text-white">
            Contribute to {goal.name}
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Allocate funds directly toward your milestone target.
        </p>

        {/* Current status preview */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span>Saved so far:</span>
            <span className="font-mono text-white font-semibold">
              {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Remaining balance:</span>
            <span className="font-mono text-teal-400 font-semibold">
              {currencySymbol}{remaining.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%`,
              }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Contribution Amount ({currencySymbol}) *
            </label>
            <input
              type="number"
              step="50"
              min="10"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Deduct from Account
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Avail: {currencySymbol}{a.balance})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
            >
              Add Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
