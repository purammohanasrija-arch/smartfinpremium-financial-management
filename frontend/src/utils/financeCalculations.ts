import { Transaction, Budget, SavingsGoal } from '../data/mockData';
import { getCurrencyInfo, formatCurrencyValue } from './currencies';

export function formatCurrency(
  amount: number,
  symbol: string = '₹',
  currencyCode?: string
): string {
  if (currencyCode) {
    return formatCurrencyValue(amount, currencyCode, 'symbol_only', symbol);
  }
  const rounded = Math.round(amount);
  return `${symbol}${rounded.toLocaleString('en-IN')}`;
}

export function calculateFinancialHealthScore(
  income: number,
  expenses: number,
  budgets: Budget[],
  goals: SavingsGoal[]
): {
  score: number;
  grade: string;
  insights: { label: string; value: string; status: 'good' | 'warning' | 'neutral' }[];
} {
  // Savings rate score (target 20-30% savings)
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  let savingsPoints = Math.min(35, Math.max(10, Math.round(savingsRate * 1.05)));

  // Budget adherence score
  let overBudgetCount = 0;
  budgets.forEach((b) => {
    if (b.spent > b.limit) overBudgetCount++;
  });
  const budgetPoints = Math.max(15, 35 - overBudgetCount * 10);

  // Goal progress points
  let totalGoalTarget = 0;
  let totalGoalCurrent = 0;
  goals.forEach((g) => {
    totalGoalTarget += g.targetAmount;
    totalGoalCurrent += g.currentAmount;
  });
  const goalProgressRate = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;
  const goalPoints = Math.min(30, Math.round(goalProgressRate * 0.3) + 12);

  const rawScore = savingsPoints + budgetPoints + goalPoints;
  const score = Math.min(96, Math.max(45, rawScore));

  let grade = 'A- (Excellent)';
  if (score >= 90) grade = 'A+ (Optimal)';
  else if (score >= 80) grade = 'A (Very Healthy)';
  else if (score >= 70) grade = 'B (Good)';
  else grade = 'C (Needs Attention)';

  return {
    score,
    grade,
    insights: [
      {
        label: 'Savings Rate',
        value: `${Math.round(savingsRate)}% of monthly earnings`,
        status: savingsRate >= 25 ? 'good' : 'warning',
      },
      {
        label: 'Budget Adherence',
        value: `${budgets.length - overBudgetCount} of ${budgets.length} categories on track`,
        status: overBudgetCount === 0 ? 'good' : 'warning',
      },
      {
        label: 'Savings Goal Progress',
        value: `${Math.round(goalProgressRate)}% aggregate progress`,
        status: 'good',
      },
    ],
  };
}

export function calculateEstimatedMonthlySavings(goal: SavingsGoal): number {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remaining === 0) return 0;

  const target = new Date(goal.targetDate);
  const now = new Date(2026, 9, 18); // Reference time Oct 2026

  let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  if (months <= 0) months = 1;

  return Math.round(remaining / months);
}

export function exportTransactionsToCSV(transactions: Transaction[], filename = 'SmartFin_Transactions.csv'): void {
  const headers = ['ID', 'Merchant/Description', 'Category', 'Amount', 'Type', 'Date', 'Payment Method', 'Account', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    `"${(t.merchant || '').replace(/"/g, '""')}"`,
    `"${t.category || ''}"`,
    t.amount,
    t.type,
    `"${t.date || ''}"`,
    `"${t.paymentMethod || ''}"`,
    `"${t.account || ''}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvString = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF', csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
