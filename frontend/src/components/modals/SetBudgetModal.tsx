import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/mockData';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  isOpen,
  onClose,
  defaultCategory,
}) => {
  const { budgets, updateBudgetLimit, currencySymbol } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || CATEGORIES[0].name);
  const currentBudget = budgets.find((b) => b.category === selectedCategory);
  const [limit, setLimit] = useState(currentBudget ? currentBudget.limit.toString() : '2000');

  React.useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  React.useEffect(() => {
    const b = budgets.find((item) => item.category === selectedCategory);
    if (b) {
      setLimit(b.limit.toString());
    }
  }, [selectedCategory, budgets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) return;

    updateBudgetLimit(selectedCategory, parsedLimit);
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
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold tracking-tight text-white">Adjust Category Budget</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Establish monthly spending thresholds with automated early warning alerts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
            >
              {budgets.map((b) => (
                <option key={b.category} value={b.category}>
                  {b.category} (Spent: {currencySymbol}{b.spent})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Monthly Limit ({currencySymbol}) *
            </label>
            <input
              type="number"
              step="50"
              min="100"
              required
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>

          {currentBudget && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Current monthly spending:</span>
                <span className="font-mono text-slate-200">
                  {currencySymbol}{currentBudget.spent}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Utilization with new limit:</span>
                <span className="font-mono text-teal-400">
                  {Math.round((currentBudget.spent / (parseFloat(limit) || 1)) * 100)}%
                </span>
              </div>
            </div>
          )}

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
              className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs tracking-tight shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Update Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
