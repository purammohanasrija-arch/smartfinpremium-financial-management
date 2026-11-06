import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface TransferMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferMoneyModal: React.FC<TransferMoneyModalProps> = ({ isOpen, onClose }) => {
  const { accounts, transferMoney, currencySymbol } = useFinance();
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Routine balance transfer');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (accounts.length > 0 && !fromAccountId) {
      setFromAccountId(accounts[0].id);
    }
    if (accounts.length > 1 && (!toAccountId || toAccountId === fromAccountId)) {
      const other = accounts.find((a) => a.id !== accounts[0]?.id);
      if (other) setToAccountId(other.id);
    }
  }, [accounts, fromAccountId, toAccountId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify a positive transfer amount');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source and Destination accounts must be different');
      return;
    }

    const success = transferMoney(fromAccountId, toAccountId, parsedAmount, note);
    if (success) {
      setAmount('');
      onClose();
    }
  };

  const fromAcc = accounts.find((a) => a.id === fromAccountId);

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
          <ArrowRightLeft className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold tracking-tight text-white">Transfer Money</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Move funds instantaneously across your banks and digital wallets.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">From Account</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Balance: {currencySymbol}{a.balance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">To Account</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Balance: {currencySymbol}{a.balance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                Amount ({currencySymbol}) *
              </label>
              {fromAcc && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Avail: {currencySymbol}{fromAcc.balance}
                </span>
              )}
            </div>
            <input
              type="number"
              step="10"
              min="1"
              required
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Replenish UPI wallet"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
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
              className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs tracking-tight shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
