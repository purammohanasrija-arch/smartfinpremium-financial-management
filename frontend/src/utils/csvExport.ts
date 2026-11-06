/**
 * SmartFin+ Financial Management System
 * CSV Export Utility - RFC 4180 Compliant with UTF-8 BOM Support
 */

import { Transaction, Account, Budget, SavingsGoal } from '../data/mockData';

/**
 * Escapes a field for CSV according to RFC 4180:
 * - If value contains commas, double quotes, or newlines, wrap in double quotes
 * - Any double quote inside the value must be doubled ("")
 */
export function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects to a CSV string given column definitions.
 */
export function objectsToCsv<T>(
  data: T[],
  columns: { header: string; accessor: (item: T, index: number) => unknown }[]
): string {
  const headerRow = columns.map((col) => escapeCsvField(col.header)).join(',');
  const dataRows = data.map((item, index) =>
    columns.map((col) => escapeCsvField(col.accessor(item, index))).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Filter transactions by predefined date range.
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  range: 'all' | '30d' | 'month' | '3m' | 'ytd'
): Transaction[] {
  if (range === 'all') return transactions;

  const now = new Date();
  const cutoff = new Date();

  switch (range) {
    case '30d':
      cutoff.setDate(now.getDate() - 30);
      break;
    case 'month':
      cutoff.setDate(1);
      cutoff.setHours(0, 0, 0, 0);
      break;
    case '3m':
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case 'ytd':
      cutoff.setMonth(0, 1);
      cutoff.setHours(0, 0, 0, 0);
      break;
  }

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return !isNaN(txDate.getTime()) ? txDate >= cutoff : true;
  });
}

/**
 * Generate CSV for Transactions
 */
export function generateTransactionsCsv(
  transactions: Transaction[],
  currencySymbol: string = '₹'
): string {
  const columns = [
    { header: 'Transaction ID', accessor: (tx: Transaction) => tx.id },
    { header: 'Date & Time', accessor: (tx: Transaction) => tx.date },
    { header: 'Merchant / Description', accessor: (tx: Transaction) => tx.merchant },
    { header: 'Category', accessor: (tx: Transaction) => tx.category },
    { header: 'Type', accessor: (tx: Transaction) => tx.type.toUpperCase() },
    {
      header: `Amount (${currencySymbol})`,
      accessor: (tx: Transaction) => `${tx.type === 'expense' ? '-' : '+'}${currencySymbol}${tx.amount.toLocaleString()}`,
    },
    { header: 'Raw Amount', accessor: (tx: Transaction) => tx.amount },
    { header: 'Account', accessor: (tx: Transaction) => tx.account },
    { header: 'Payment Method', accessor: (tx: Transaction) => tx.paymentMethod },
    { header: 'Notes', accessor: (tx: Transaction) => tx.notes || '' },
  ];

  return objectsToCsv(transactions, columns);
}

/**
 * Generate CSV for Accounts
 */
export function generateAccountsCsv(
  accounts: Account[],
  currencySymbol: string = '₹'
): string {
  const columns = [
    { header: 'Account ID', accessor: (acc: Account) => acc.id },
    { header: 'Account Name', accessor: (acc: Account) => acc.name },
    { header: 'Institution', accessor: (acc: Account) => acc.institution },
    { header: 'Account Type', accessor: (acc: Account) => acc.type },
    { header: 'Account Number Masked', accessor: (acc: Account) => acc.accountNumber },
    {
      header: `Balance (${currencySymbol})`,
      accessor: (acc: Account) => `${currencySymbol}${acc.balance.toLocaleString()}`,
    },
    { header: 'Raw Balance', accessor: (acc: Account) => acc.balance },
  ];

  return objectsToCsv(accounts, columns);
}

/**
 * Generate CSV for Budgets
 */
export function generateBudgetsCsv(
  budgets: Budget[],
  currencySymbol: string = '₹'
): string {
  const columns = [
    { header: 'Budget Category', accessor: (b: Budget) => b.category },
    { header: 'Period', accessor: (b: Budget) => b.period },
    {
      header: `Allocated Limit (${currencySymbol})`,
      accessor: (b: Budget) => `${currencySymbol}${b.limit.toLocaleString()}`,
    },
    {
      header: `Spent (${currencySymbol})`,
      accessor: (b: Budget) => `${currencySymbol}${b.spent.toLocaleString()}`,
    },
    {
      header: `Remaining (${currencySymbol})`,
      accessor: (b: Budget) => `${currencySymbol}${Math.max(0, b.limit - b.spent).toLocaleString()}`,
    },
    {
      header: 'Usage Percentage',
      accessor: (b: Budget) => `${Math.round((b.spent / b.limit) * 100)}%`,
    },
    {
      header: 'Status',
      accessor: (b: Budget) =>
        b.spent > b.limit ? 'EXCEEDED' : b.spent >= b.limit * 0.8 ? 'WARNING' : 'HEALTHY',
    },
  ];

  return objectsToCsv(budgets, columns);
}

/**
 * Generate CSV for Savings Goals
 */
export function generateSavingsGoalsCsv(
  goals: SavingsGoal[],
  currencySymbol: string = '₹'
): string {
  const columns = [
    { header: 'Goal ID', accessor: (g: SavingsGoal) => g.id },
    { header: 'Goal Name', accessor: (g: SavingsGoal) => g.name },
    { header: 'Category', accessor: (g: SavingsGoal) => g.category },
    {
      header: `Target Amount (${currencySymbol})`,
      accessor: (g: SavingsGoal) => `${currencySymbol}${g.targetAmount.toLocaleString()}`,
    },
    {
      header: `Current Saved (${currencySymbol})`,
      accessor: (g: SavingsGoal) => `${currencySymbol}${g.currentAmount.toLocaleString()}`,
    },
    {
      header: `Remaining to Goal (${currencySymbol})`,
      accessor: (g: SavingsGoal) =>
        `${currencySymbol}${Math.max(0, g.targetAmount - g.currentAmount).toLocaleString()}`,
    },
    {
      header: 'Progress Percentage',
      accessor: (g: SavingsGoal) => `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
    },
    { header: 'Target Date', accessor: (g: SavingsGoal) => g.targetDate },
    {
      header: 'Status',
      accessor: (g: SavingsGoal) =>
        g.currentAmount >= g.targetAmount ? 'COMPLETED' : 'IN PROGRESS',
    },
  ];

  return objectsToCsv(goals, columns);
}

/**
 * Generates an All-in-One Comprehensive Financial History CSV report
 * with system audit header, account balances, budgets, goals, and complete transactions.
 */
export function generateFullFinancialLedgerCsv(params: {
  user: { name: string; email: string; plan: string };
  currencySymbol: string;
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
}): string {
  const {
    user,
    currencySymbol,
    transactions,
    accounts,
    budgets,
    goals,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
  } = params;

  const exportTimestamp = new Date().toISOString();
  const lines: string[] = [];

  // Metadata block
  lines.push('SMARTFIN+ PREMIUM FINANCIAL MANAGEMENT SYSTEM - FINANCIAL HISTORY EXPORT');
  lines.push(`Generated For,${escapeCsvField(user.name)} (${escapeCsvField(user.email)})`);
  lines.push(`Membership Plan,${escapeCsvField(user.plan)}`);
  lines.push(`Export Timestamp,${escapeCsvField(exportTimestamp)}`);
  lines.push(`Base Currency,${escapeCsvField(currencySymbol)}`);
  lines.push(`Total Net Balance,${escapeCsvField(`${currencySymbol}${totalBalance.toLocaleString()}`)}`);
  lines.push(`Monthly Income,${escapeCsvField(`${currencySymbol}${monthlyIncome.toLocaleString()}`)}`);
  lines.push(`Monthly Expenses,${escapeCsvField(`${currencySymbol}${monthlyExpenses.toLocaleString()}`)}`);
  lines.push(`Total Monthly Savings,${escapeCsvField(`${currencySymbol}${totalSavings.toLocaleString()}`)}`);
  lines.push('');

  // 1. Transactions Ledger
  lines.push('--- FINANCIAL TRANSACTIONS LEDGER ---');
  lines.push(generateTransactionsCsv(transactions, currencySymbol));
  lines.push('');

  // 2. Accounts Breakdown
  lines.push('--- LINKED ACCOUNTS & BALANCES ---');
  lines.push(generateAccountsCsv(accounts, currencySymbol));
  lines.push('');

  // 3. Budgets Allocation
  lines.push('--- CATEGORY BUDGET ALLOCATIONS ---');
  lines.push(generateBudgetsCsv(budgets, currencySymbol));
  lines.push('');

  // 4. Savings Goals
  lines.push('--- SAVINGS GOALS & MILESTONES ---');
  lines.push(generateSavingsGoalsCsv(goals, currencySymbol));

  return lines.join('\r\n');
}

/**
 * Initiates an in-browser download of the generated CSV file.
 * Includes UTF-8 Byte Order Mark (BOM) `\uFEFF` so that Microsoft Excel,
 * Google Sheets, and Numbers correctly recognize UTF-8 special characters (like ₹, €, £).
 */
export function downloadCsvFile(
  csvContent: string,
  filename: string,
  includeBom: boolean = true
): { success: boolean; filename: string; bytes: number } {
  // Prepend UTF-8 BOM (\uFEFF) if requested for Excel compatibility
  const blobData = includeBom ? ['\uFEFF', csvContent] : [csvContent];
  const blob = new Blob(blobData, { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke object URL after brief delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return {
    success: true,
    filename: filename.endsWith('.csv') ? filename : `${filename}.csv`,
    bytes: blob.size,
  };
}
