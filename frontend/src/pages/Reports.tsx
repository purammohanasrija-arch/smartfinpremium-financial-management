import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportTransactionsToCSV } from '../utils/financeCalculations';
import { CATEGORIES } from '../data/mockData';

export const ReportsPage: React.FC = () => {
  const {
    user,
    transactions,
    budgets,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    currencySymbol,
    formatCurrency,
    healthScoreData,
  } = useFinance();

  const [reportPeriod, setReportPeriod] = useState('October 2026');

  // Category breakdown for current period
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    exportTransactionsToCSV(transactions, `SmartFin_Financial_Report_${reportPeriod.replace(' ', '_')}.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 print:p-0 print:space-y-4">
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Reports</h1>
          <p className="text-xs text-slate-400">
            Generate printable financial statements and export audited ledger records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
            </select>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-slate-100 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 print:border-slate-300 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white print:text-slate-900">
                SmartFin<span className="text-teal-400">+</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 print:bg-slate-100 print:text-slate-700">
                CONFIDENTIAL
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Personal Wealth & Cash Flow Statement
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <p className="font-semibold text-white print:text-slate-900">Account: {user.name}</p>
            <p className="text-slate-400 print:text-slate-600">Period: {reportPeriod}</p>
            <p className="text-slate-400 print:text-slate-600">Generated: 18 Oct 2026</p>
          </div>
        </div>

        {/* Financial KPI Summary Table */}
        <div className="my-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 print:text-teal-700 mb-3">
            1. Executive Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-xs text-slate-400 print:text-slate-600">Gross Inflow</span>
              <div className="text-xl font-extrabold text-emerald-400 print:text-emerald-700 font-mono mt-1">
                {formatCurrency(monthlyIncome)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-xs text-slate-400 print:text-slate-600">Total Disbursements</span>
              <div className="text-xl font-extrabold text-rose-400 print:text-rose-700 font-mono mt-1">
                {formatCurrency(monthlyExpenses)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-xs text-slate-400 print:text-slate-600">Net Surplus / Savings</span>
              <div className="text-xl font-extrabold text-teal-400 print:text-teal-700 font-mono mt-1">
                {formatCurrency(totalSavings)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-xs text-slate-400 print:text-slate-600">Health Score</span>
              <div className="text-xl font-extrabold text-white print:text-slate-900 font-mono mt-1">
                {healthScoreData.score} / 100
              </div>
            </div>
          </div>
        </div>

        {/* Category-Wise Breakdown Table */}
        <div className="my-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 print:text-teal-700 mb-3">
            2. Category Disbursements & Budget Utilization
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600">
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold text-right">Actual Spent</th>
                  <th className="pb-2 font-semibold text-right">Monthly Limit</th>
                  <th className="pb-2 font-semibold text-right">Utilization</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {budgets.map((b) => {
                  const util = Math.round((b.spent / b.limit) * 100);
                  const isOver = b.spent > b.limit;
                  const isWarn = util >= 80 && !isOver;

                  return (
                    <tr key={b.category} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                      <td className="py-2.5 font-medium text-white print:text-slate-900">
                        {b.category}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-200 print:text-slate-800">
                        {formatCurrency(b.spent)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400 print:text-slate-600">
                        {formatCurrency(b.limit)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-teal-400 print:text-teal-700">
                        {util}%
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`font-semibold ${
                            isOver
                              ? 'text-rose-400 print:text-rose-700'
                              : isWarn
                              ? 'text-amber-400 print:text-amber-700'
                              : 'text-emerald-400 print:text-emerald-700'
                          }`}
                        >
                          {isOver ? 'Exceeded' : isWarn ? 'Near Limit' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Transactions Sample */}
        <div className="my-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400 print:text-teal-700 mb-3">
            3. Audited Itemized Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Merchant / Description</th>
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold">Account</th>
                  <th className="pb-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {transactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-2 font-mono text-slate-400 print:text-slate-600">{tx.date}</td>
                    <td className="py-2 font-medium text-white print:text-slate-900">{tx.merchant}</td>
                    <td className="py-2 text-slate-300 print:text-slate-700">{tx.category}</td>
                    <td className="py-2 text-slate-400 print:text-slate-600">{tx.account}</td>
                    <td className="py-2 text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === 'income'
                            ? 'text-emerald-400 print:text-emerald-700'
                            : 'text-slate-100 print:text-slate-900'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Footer Sign-off */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-[11px] text-slate-500">
          <span>SmartFin+ Cryptographic Ledger Verification • Hash: #SF-9042-MHI</span>
          <span>Approved for {user.name}</span>
        </div>
      </div>
    </div>
  );
};
