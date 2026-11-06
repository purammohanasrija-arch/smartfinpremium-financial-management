import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES, Transaction } from '../data/mockData';
import { exportTransactionsToCSV } from '../utils/financeCalculations';

interface TransactionsPageProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, deleteTransaction, currencySymbol, formatCurrency } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'income' | 'expense'>('All');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete confirmation state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Filtered & Sorted list
  const filteredList = transactions
    .filter((tx) => {
      const matchSearch =
        !search ||
        tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase())) ||
        tx.account.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'All' || tx.category === selectedCategory;
      const matchType = selectedType === 'All' || tx.type === selectedType;

      return matchSearch && matchCategory && matchType;
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
      } else {
        return sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownloadCSV = () => {
    exportTransactionsToCSV(filteredList, 'SmartFin_Filtered_Transactions.csv');
  };

  const confirmDelete = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id);
      setTxToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-400">
            Audit, categorize, and export your personal cash flow and ledger records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by merchant, note..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Types (Income & Expense)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            <button
              onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={`Switch to ${sortDirection === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white">{filteredList.length}</strong> matching transactions
          </span>
          <span className="font-mono text-teal-400">
            Total Net:{' '}
            {formatCurrency(
              filteredList.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount), 0)
            )}
          </span>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3.5 font-semibold">Merchant / Details</th>
                <th className="pb-3.5 font-semibold">Category</th>
                <th className="pb-3.5 font-semibold">Payment / Account</th>
                <th className="pb-3.5 font-semibold">Timestamp</th>
                <th className="pb-3.5 font-semibold text-right">Amount</th>
                <th className="pb-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedList.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">
                            {tx.merchant}
                          </span>
                          {tx.notes && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-medium">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3.5 pr-4">
                      <div className="text-slate-300 font-medium">{tx.paymentMethod}</div>
                      <div className="text-[11px] text-slate-500">{tx.account}</div>
                    </td>

                    <td className="py-3.5 pr-4 font-mono text-slate-400 text-[11px]">
                      {tx.date}
                    </td>

                    <td className="py-3.5 pr-4 text-right">
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No transactions recorded yet</p>
              <p className="text-xs">Adjust your search parameters or log a new transaction.</p>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg font-mono font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Transaction?</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-white">"{txToDelete.merchant}"</strong> for{' '}
              <strong className="text-white">
                {formatCurrency(txToDelete.amount)}
              </strong>
              ? This action will adjust your account balance and category budgets.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs tracking-tight shadow-md shadow-rose-500/20 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
