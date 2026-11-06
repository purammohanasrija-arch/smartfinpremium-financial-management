import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, currencySymbol } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<'Bank' | 'Digital Wallet' | 'Cash' | 'Investment'>('Bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [color, setColor] = useState('#0ea5e9');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBalance = parseFloat(balance);
    if (!name.trim() || isNaN(parsedBalance) || parsedBalance < 0) return;

    addAccount({
      name: name.trim(),
      type,
      balance: parsedBalance,
      accountNumber: accountNumber.trim() || '•••• 8821',
      institution: institution.trim() || name.trim(),
      color,
    });

    setName('');
    setBalance('');
    setAccountNumber('');
    setInstitution('');
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
          <Wallet className="w-5 h-5 text-teal-400" />
          <h3 className="text-lg font-bold tracking-tight text-white">Add New Account</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Connect your bank, credit card, e-wallet, or physical cash balance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Account Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Axis Bank Priority, Zerodha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Bank">Bank Account</option>
                <option value="Digital Wallet">Digital Wallet (UPI)</option>
                <option value="Cash">Cash Vault</option>
                <option value="Investment">Investment Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Current Balance ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="5000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Identifier / Masked No.</label>
              <input
                type="text"
                placeholder="•••• 4920"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Institution</label>
              <input
                type="text"
                placeholder="e.g. Axis Bank Ltd."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Card Hue</label>
            <div className="flex items-center gap-2 pt-1.5">
              {['#0ea5e9', '#f97316', '#06b6d4', '#10b981', '#8b5cf6', '#f43f5e'].map((c) => (
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
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
