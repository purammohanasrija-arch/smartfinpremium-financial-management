import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { addSavingsGoal, currencySymbol } = useFinance();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [category, setCategory] = useState('Personal Growth');
  const [color, setColor] = useState('#14b8a6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount);
    if (!name.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    addSavingsGoal({
      name: name.trim(),
      targetAmount: parsedTarget,
      targetDate,
      category,
      color,
    });
    setName('');
    setTargetAmount('');
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
          <Target className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-bold tracking-tight text-white">Create Savings Goal</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Establish milestone targets and estimate monthly savings required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Goal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Electric Vehicle, Master's Degree"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Amount ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="100"
                min="500"
                required
                placeholder="50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Travel & Leisure">Travel & Leisure</option>
                <option value="Technology">Technology</option>
                <option value="Safety Net">Emergency / Safety Net</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Vehicles">Automobile</option>
                <option value="Personal Growth">Personal Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Accent Theme</label>
              <div className="flex items-center gap-2 pt-1.5">
                {['#14b8a6', '#8b5cf6', '#3b82f6', '#f43f5e', '#10b981', '#f59e0b'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
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
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
