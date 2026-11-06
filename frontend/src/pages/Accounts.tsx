import React, { useState } from 'react';
import {
  Wallet,
  Building,
  Smartphone,
  Banknote,
  Plus,
  ArrowRightLeft,
  Trash2,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  MoreVertical,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Account } from '../data/mockData';

interface AccountsPageProps {
  onOpenAddAccount: () => void;
  onOpenTransfer: () => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({
  onOpenAddAccount,
  onOpenTransfer,
}) => {
  const { accounts, transactions, deleteAccount, currencySymbol, totalBalance, formatCurrency } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  // Transactions linked to active account
  const accountTransactions = transactions.filter(
    (tx) => activeAccount && tx.account.toLowerCase().includes(activeAccount.name.toLowerCase().slice(0, 8))
  );

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'Bank':
        return Building;
      case 'Digital Wallet':
        return Smartphone;
      case 'Cash':
        return Banknote;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Accounts & Wallets</h1>
          <p className="text-xs text-slate-400">
            Manage your liquid assets, banking connections, and digital payment vaults.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTransfer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            <span>Transfer Funds</span>
          </button>
          <button
            onClick={onOpenAddAccount}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
            Consolidated Liquid Net Worth
          </span>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
            {formatCurrency(totalBalance)}
          </div>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Synchronized across {accounts.length} active demo accounts
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase">Institutions</span>
            <span className="font-bold text-slate-200">{accounts.length} Entities</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase">Primary Vault</span>
            <span className="font-bold text-teal-400">HDFC Bank</span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isSelected = activeAccount?.id === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-lg ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/95 border-teal-500/50 shadow-teal-500/10'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700/80 hover:-translate-y-0.5'
              }`}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
                style={{ backgroundColor: acc.color }}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${acc.color}20`, color: acc.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {acc.type}
                  </span>
                  {accounts.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAccount(acc.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h3 className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">
                  {acc.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">{acc.accountNumber}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400">Current Balance</span>
                <span className="text-base font-extrabold text-white font-mono tabular-nums">
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Details & Recent Transactions Preview */}
      {activeAccount && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Activity Preview: {activeAccount.name}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">
                  {activeAccount.institution}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audited transaction timeline associated with this ledger account.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Available Liquid Funds: </span>
              <span className="text-base font-bold font-mono text-teal-400">
                {formatCurrency(activeAccount.balance)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Transaction</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accountTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="py-3 pr-4 font-semibold text-white">{tx.merchant}</td>
                    <td className="py-3 pr-4 text-slate-300">{tx.category}</td>
                    <td className="py-3 pr-4 font-mono text-slate-400 text-[11px]">{tx.date}</td>
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={`font-mono font-bold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {accountTransactions.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent transactions logged directly under this account.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
