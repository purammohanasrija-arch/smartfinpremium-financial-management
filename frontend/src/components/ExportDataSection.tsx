import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Check,
  Copy,
  Table,
  Eye,
  EyeOff,
  Server,
  Zap,
  HardDriveDownload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  generateTransactionsCsv,
  generateAccountsCsv,
  generateBudgetsCsv,
  generateSavingsGoalsCsv,
  generateFullFinancialLedgerCsv,
  filterTransactionsByDateRange,
  downloadCsvFile,
} from '../utils/csvExport';

type ExportDatasetType = 'all' | 'transactions' | 'accounts' | 'budgets' | 'goals';
type DateRangeFilter = 'all' | '30d' | 'month' | '3m' | 'ytd';

export const ExportDataSection: React.FC = () => {
  const {
    user,
    currencySymbol,
    formatCurrency,
    transactions,
    accounts,
    budgets,
    savingsGoals,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    addToast,
    isAtlasConnected,
  } = useFinance();

  // Export configuration state
  const [selectedDataset, setSelectedDataset] = useState<ExportDatasetType>('all');
  const [selectedRange, setSelectedRange] = useState<DateRangeFilter>('all');
  const [includeBom, setIncludeBom] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isStreamingBackend, setIsStreamingBackend] = useState<boolean>(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filtered transactions based on selected date range
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(transactions, selectedRange);
  }, [transactions, selectedRange]);

  // Income / Expense totals for filtered transactions
  const summaryTotals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Compute suggested filename based on settings
  const targetFilename = useMemo(() => {
    const datasetLabels: Record<ExportDatasetType, string> = {
      all: 'SmartFin_Complete_Financial_Ledger',
      transactions: `SmartFin_Transactions_${selectedRange}`,
      accounts: 'SmartFin_Accounts_Balances',
      budgets: 'SmartFin_Budgets_Allocations',
      goals: 'SmartFin_Savings_Goals',
    };
    return `${datasetLabels[selectedDataset]}_${todayStr}.csv`;
  }, [selectedDataset, selectedRange, todayStr]);

  // Generate current CSV content based on active selections
  const activeCsvContent = useMemo(() => {
    switch (selectedDataset) {
      case 'transactions':
        return generateTransactionsCsv(filteredTransactions, currencySymbol);
      case 'accounts':
        return generateAccountsCsv(accounts, currencySymbol);
      case 'budgets':
        return generateBudgetsCsv(budgets, currencySymbol);
      case 'goals':
        return generateSavingsGoalsCsv(savingsGoals, currencySymbol);
      case 'all':
      default:
        return generateFullFinancialLedgerCsv({
          user: { name: user.name, email: user.email, plan: user.plan },
          currencySymbol,
          transactions: filteredTransactions,
          accounts,
          budgets,
          goals: savingsGoals,
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          totalSavings,
        });
    }
  }, [
    selectedDataset,
    filteredTransactions,
    accounts,
    budgets,
    savingsGoals,
    currencySymbol,
    user,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
  ]);

  // Approximate file size
  const approximateSizeBytes = useMemo(() => {
    return new Blob([includeBom ? '\uFEFF' : '', activeCsvContent]).size;
  }, [activeCsvContent, includeBom]);

  // Quick 1-click export handler
  const handleQuickExport = (type: ExportDatasetType, label: string) => {
    try {
      let content = '';
      let filename = '';
      const date = todayStr;

      if (type === 'transactions') {
        content = generateTransactionsCsv(transactions, currencySymbol);
        filename = `SmartFin_All_Transactions_${date}.csv`;
      } else if (type === 'accounts') {
        content = generateAccountsCsv(accounts, currencySymbol);
        filename = `SmartFin_Accounts_${date}.csv`;
      } else if (type === 'budgets') {
        content = generateBudgetsCsv(budgets, currencySymbol);
        filename = `SmartFin_Budgets_${date}.csv`;
      } else if (type === 'goals') {
        content = generateSavingsGoalsCsv(savingsGoals, currencySymbol);
        filename = `SmartFin_Savings_Goals_${date}.csv`;
      } else {
        content = generateFullFinancialLedgerCsv({
          user: { name: user.name, email: user.email, plan: user.plan },
          currencySymbol,
          transactions,
          accounts,
          budgets,
          goals: savingsGoals,
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          totalSavings,
        });
        filename = `SmartFin_Financial_Archive_${date}.csv`;
      }

      downloadCsvFile(content, filename, true);
      addToast(`Exported ${label} (${filename})`, 'success');
    } catch (err: any) {
      addToast(`Export failed: ${err.message}`, 'error');
    }
  };

  // Main custom export trigger
  const handleDownloadCustomCsv = () => {
    setIsExporting(true);
    try {
      const result = downloadCsvFile(activeCsvContent, targetFilename, includeBom);
      addToast(`Downloaded ${result.filename} (${(result.bytes / 1024).toFixed(1)} KB)`, 'success');
    } catch (err: any) {
      addToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setTimeout(() => setIsExporting(false), 400);
    }
  };

  // Backend stream download trigger via Express /api/export/csv
  const handleDownloadServerStream = async () => {
    setIsStreamingBackend(true);
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      const url = `${apiBase}/api/export/csv?type=${selectedDataset}&range=${selectedRange}&currency=${encodeURIComponent(
        currencySymbol
      )}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = targetFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

      addToast(`Server stream export completed (${targetFilename})`, 'success');
    } catch (err: any) {
      addToast(`Server export fallback to client: ${err.message}`, 'info');
      handleDownloadCustomCsv();
    } finally {
      setIsStreamingBackend(false);
    }
  };

  // Copy CSV to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeCsvContent);
      setCopiedToClipboard(true);
      addToast('CSV data copied to clipboard! You can paste directly into Excel or Sheets.', 'success');
      setTimeout(() => setCopiedToClipboard(false), 2500);
    } catch (err) {
      addToast('Unable to copy to clipboard', 'error');
    }
  };

  return (
    <div
      id="export-data"
      className="p-6 rounded-2xl bg-slate-900/90 border border-teal-500/40 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden"
    >
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/10">
            <FileSpreadsheet className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Export Data & Financial History
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase tracking-wider">
                RFC-4180 • CSV
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Excel & Sheets Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Download your complete financial records, transactions ledger, account balances, budgets, and savings goals as an industry-standard CSV file.
            </p>
          </div>
        </div>

        {/* Storage origin indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-[11px]">
              Source: <strong className="text-teal-300">{isAtlasConnected ? 'MongoDB Atlas' : 'Local BSON'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick 1-Click Export Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-teal-400" /> Quick 1-Click Financial Exports
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1: All Transactions */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 transition-all space-y-3 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  Transactions Ledger
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {transactions.length} rows
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete log with dates, merchants, categories, income/expense tags, and notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleQuickExport('transactions', 'All Transactions')}
              className="w-full py-2 px-3 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Transactions CSV</span>
            </button>
          </div>

          {/* Card 2: Full Master Archive */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Consolidated Master Audit
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Full Archive
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Executive summary header, accounts, budgets, savings goals, and transaction history in one file.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleQuickExport('all', 'Full Financial Master Archive')}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Download Master CSV</span>
            </button>
          </div>

          {/* Card 3: Accounts & Balances */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Accounts & Net Worth
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {accounts.length} accounts
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Bank accounts, digital wallets, cash reserves, masked account numbers, and live balances.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleQuickExport('accounts', 'Accounts Balances')}
              className="w-full py-2 px-3 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Accounts CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Export Studio */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-teal-400" /> Custom Export Studio & Filter Controls
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Est. Size: <strong className="text-teal-300">{(approximateSizeBytes / 1024).toFixed(1)} KB</strong>
          </span>
        </div>

        {/* Dataset Selector Tabs */}
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
            1. Select Dataset to Export
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'all' as ExportDatasetType, label: 'Master Ledger', count: 'All Data' },
              { id: 'transactions' as ExportDatasetType, label: 'Transactions', count: `${filteredTransactions.length} items` },
              { id: 'accounts' as ExportDatasetType, label: 'Accounts', count: `${accounts.length} accounts` },
              { id: 'budgets' as ExportDatasetType, label: 'Budgets', count: `${budgets.length} categories` },
              { id: 'goals' as ExportDatasetType, label: 'Savings Goals', count: `${savingsGoals.length} goals` },
            ].map((tab) => {
              const isSelected = selectedDataset === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedDataset(tab.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-500 text-white shadow-md shadow-teal-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{tab.label}</span>
                  <span className="text-[10px] font-mono text-teal-300/80 block mt-0.5">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selector (applicable to transactions & master ledger) */}
        {(selectedDataset === 'all' || selectedDataset === 'transactions') && (
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-teal-400" /> 2. Filter by Transaction Date Range
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Matching: <strong className="text-emerald-400">{filteredTransactions.length} transactions</strong>
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all' as DateRangeFilter, label: 'All Time' },
                { id: '30d' as DateRangeFilter, label: 'Last 30 Days' },
                { id: 'month' as DateRangeFilter, label: 'This Month' },
                { id: '3m' as DateRangeFilter, label: 'Last 3 Months' },
                { id: 'ytd' as DateRangeFilter, label: 'Year to Date' },
              ].map((range) => {
                const isSelected = selectedRange === range.id;
                return (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setSelectedRange(range.id)}
                    className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Metrics Summary Strip for Current Export */}
        {(selectedDataset === 'all' || selectedDataset === 'transactions') && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Selected Records</span>
              <span className="text-sm font-extrabold text-white">{summaryTotals.count}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase block">Total Credits (+)</span>
              <span className="text-sm font-extrabold text-emerald-400">
                +{formatCurrency(summaryTotals.income)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 uppercase block">Total Debits (-)</span>
              <span className="text-sm font-extrabold text-rose-400">
                -{formatCurrency(summaryTotals.expense)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 uppercase block">Net Cashflow</span>
              <span className={`text-sm font-extrabold ${summaryTotals.net >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {summaryTotals.net >= 0 ? '+' : ''}
                {formatCurrency(summaryTotals.net)}
              </span>
            </div>
          </div>
        )}

        {/* Options & Configuration Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeBom}
              onChange={(e) => setIncludeBom(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-300">
              Include UTF-8 BOM <span className="text-[10px] text-slate-500">(Ensures currency symbols like {currencySymbol} render cleanly in Microsoft Excel)</span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1.5 self-start sm:self-auto"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showPreview ? 'Hide CSV Preview' : 'Preview CSV Rows'}</span>
          </button>
        </div>

        {/* Collapsible CSV Preview Drawer */}
        {showPreview && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-teal-400" /> Target File: <span className="text-slate-200">{targetFilename}</span>
              </span>
              <span>Showing preview of first 5 rows</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed selection:bg-teal-500/30">
              {activeCsvContent.split('\r\n').slice(0, 8).join('\r\n')}
              {activeCsvContent.split('\r\n').length > 8 && '\r\n... [more rows]'}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              {copiedToClipboard ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copied CSV</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isStreamingBackend}
              onClick={handleDownloadServerStream}
              title="Stream CSV from Node/Express server endpoint (/api/export/csv)"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isStreamingBackend ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Streaming...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Stream via Express Route</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Download Button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadCustomCsv}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Generating CSV...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedDataset === 'all' ? 'Financial History' : 'Dataset'} (CSV)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
