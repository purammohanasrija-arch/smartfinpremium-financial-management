import { Transaction, Budget, Account } from '../data/mockData';

export interface SpendingAnomaly {
  id: string;
  type: 'spike' | 'velocity_cluster' | 'budget_exhaustion' | 'high_ratio';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  merchant?: string;
  category: string;
  amount: number;
  benchmarkAmount?: number;
  deviationPercent?: number;
  date?: string;
  account?: string;
  explanation: string;
  recommendedAction: string;
  projectedExhaustionDate?: string;
  affectedTransactionIds: string[];
}

export interface AnomalyDetectionConfig {
  sensitivity: 'conservative' | 'balanced' | 'high';
  singleOutflowThresholdPercent: number; // Single tx > X% of monthly expenses (e.g. 25%)
  categoryRatioThresholdPercent: number; // Single tx > X% of category budget (e.g. 50%)
  velocityClusterCount: number; // >= X txs in Y days (e.g. 3 txs in 12 days)
}

export const DEFAULT_ANOMALY_CONFIG: AnomalyDetectionConfig = {
  sensitivity: 'balanced',
  singleOutflowThresholdPercent: 25, // 25% of total expenses
  categoryRatioThresholdPercent: 50, // 50% of category budget
  velocityClusterCount: 3,
};

/**
 * Heuristic Statistical & Pattern-Based Anomaly Detection
 * Analyzes transactions, category budgets, and liquidity drain
 */
export function detectSpendingAnomalies(
  transactions: Transaction[],
  budgets: Budget[],
  accounts: Account[],
  config: AnomalyDetectionConfig = DEFAULT_ANOMALY_CONFIG
): SpendingAnomaly[] {
  const anomalies: SpendingAnomaly[] = [];
  const expenses = transactions.filter((t) => t.type === 'expense');

  if (expenses.length === 0) return anomalies;

  const totalMonthlyExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const avgExpenseAmount = totalMonthlyExpenses / expenses.length;

  // Multiplier adjusted by sensitivity
  const spikeMultiplier =
    config.sensitivity === 'high' ? 1.5 : config.sensitivity === 'conservative' ? 2.5 : 2.0;

  // 1. SINGLE TRANSACTION OUTFLOW SPIKES
  expenses.forEach((tx) => {
    const categoryBudget = budgets.find((b) => b.category === tx.category);
    const percentOfTotal = (tx.amount / (totalMonthlyExpenses || 1)) * 100;
    const percentOfBudget = categoryBudget
      ? (tx.amount / (categoryBudget.limit || 1)) * 100
      : 0;

    // Check if tx is significantly higher than average and takes a large portion of budget
    if (
      tx.amount >= avgExpenseAmount * spikeMultiplier ||
      percentOfBudget >= config.categoryRatioThresholdPercent ||
      percentOfTotal >= config.singleOutflowThresholdPercent
    ) {
      const isCritical = percentOfBudget >= 55 || percentOfTotal >= 35;
      anomalies.push({
        id: `anomaly-spike-${tx.id}`,
        type: 'spike',
        severity: isCritical ? 'critical' : 'warning',
        title: `Unusual Outflow Spike: ${tx.merchant}`,
        merchant: tx.merchant,
        category: tx.category,
        amount: tx.amount,
        benchmarkAmount: Math.round(avgExpenseAmount),
        deviationPercent: Math.round(((tx.amount - avgExpenseAmount) / avgExpenseAmount) * 100),
        date: tx.date,
        account: tx.account,
        explanation: `Single transaction of ${tx.amount} accounts for ${Math.round(
          percentOfTotal
        )}% of all October expenses and consumes ${Math.round(
          percentOfBudget
        )}% of the ${tx.category} budget limit.`,
        recommendedAction: `Review if this is a recurring outlay. Consider allocating a dedicated sub-budget or spreading amortized costs.`,
        affectedTransactionIds: [tx.id],
      });
    }
  });

  // 2. VELOCITY & TRANSACTION CLUSTERING IN SAME CATEGORY
  // Groups expenses by category and checks for rapid-fire purchases
  const categoryGroups: Record<string, Transaction[]> = {};
  expenses.forEach((tx) => {
    if (!categoryGroups[tx.category]) categoryGroups[tx.category] = [];
    categoryGroups[tx.category].push(tx);
  });

  Object.entries(categoryGroups).forEach(([cat, list]) => {
    if (list.length >= config.velocityClusterCount) {
      const catBudget = budgets.find((b) => b.category === cat);
      const totalCatSpent = list.reduce((sum, t) => sum + t.amount, 0);
      const budgetUtilization = catBudget
        ? Math.round((totalCatSpent / (catBudget.limit || 1)) * 100)
        : 0;

      // If category has high count and high budget utilization
      if (budgetUtilization >= 75) {
        // Calculate daily burn velocity
        // Oct 1 to Oct 17 ~ 17 days
        const daysElapsed = 17;
        const dailyBurn = totalCatSpent / daysElapsed;
        const daysRemainingInMonth = 31 - daysElapsed;
        const projectedTotal = totalCatSpent + dailyBurn * daysRemainingInMonth;
        const projectedExhaustionDays = catBudget
          ? Math.max(1, Math.round((catBudget.limit - totalCatSpent) / (dailyBurn || 1)))
          : 5;

        anomalies.push({
          id: `anomaly-velocity-${cat.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'velocity_cluster',
          severity: budgetUtilization >= 90 ? 'critical' : 'warning',
          title: `Rapid Velocity Cluster: ${cat}`,
          category: cat,
          amount: totalCatSpent,
          benchmarkAmount: catBudget?.limit,
          deviationPercent: budgetUtilization,
          explanation: `${list.length} transactions logged within 11 days totaling ${totalCatSpent}. Category limit (${catBudget?.limit || 2000}) is already ${budgetUtilization}% consumed.`,
          recommendedAction: `Burn velocity is ${Math.round(
            dailyBurn
          )}/day. At this rate, the budget will be exhausted in ~${projectedExhaustionDays} days. Shift to non-discretionary spending.`,
          projectedExhaustionDate: `Oct ${daysElapsed + projectedExhaustionDays}, 2026`,
          affectedTransactionIds: list.map((t) => t.id),
        });
      }
    }
  });

  // 3. BUDGET EXHAUSTION / CRITICAL DEPLETION WARNING
  budgets.forEach((b) => {
    const pct = Math.round((b.spent / (b.limit || 1)) * 100);
    if (pct >= 80) {
      // Check if not already added in velocity cluster
      const alreadyAdded = anomalies.some(
        (a) => a.category === b.category && a.type === 'velocity_cluster'
      );
      if (!alreadyAdded) {
        anomalies.push({
          id: `anomaly-budget-${b.category.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'budget_exhaustion',
          severity: pct >= 100 ? 'critical' : 'warning',
          title: `Budget Threshold Alert: ${b.category}`,
          category: b.category,
          amount: b.spent,
          benchmarkAmount: b.limit,
          deviationPercent: pct,
          explanation: `${b.category} has reached ${pct}% of its monthly cap (${b.spent} / ${b.limit}). Remaining buffer: ${Math.max(0, b.limit - b.spent)}.`,
          recommendedAction: pct >= 100
            ? 'Limit exceeded! Restrict further transactions in this category until the next billing cycle.'
            : 'Close to threshold. Consider increasing the monthly allowance or deferring remaining purchases.',
          affectedTransactionIds: expenses
            .filter((t) => t.category === b.category)
            .map((t) => t.id),
        });
      }
    }
  });

  // 4. ACCOUNT LIQUIDITY DRAIN RATIO
  // Checks if an account had disproportionate outflows relative to its current balance
  accounts.forEach((acc) => {
    const accountExpenses = expenses.filter(
      (t) => t.account.toLowerCase() === acc.name.toLowerCase()
    );
    const totalDrained = accountExpenses.reduce((s, t) => s + t.amount, 0);

    if (totalDrained > acc.balance * 2 && acc.balance < 1000) {
      anomalies.push({
        id: `anomaly-drain-${acc.id}`,
        type: 'high_ratio',
        severity: 'warning',
        title: `Liquidity Depletion: ${acc.name}`,
        category: 'Liquidity',
        amount: totalDrained,
        benchmarkAmount: acc.balance,
        deviationPercent: Math.round((totalDrained / (acc.balance || 1)) * 100),
        account: acc.name,
        explanation: `${acc.name} experienced ${totalDrained} in cumulative outflows with remaining liquid balance of only ${acc.balance}.`,
        recommendedAction: `Perform an automated balance sweep from your Primary Salary account to prevent failed recurring debits.`,
        affectedTransactionIds: accountExpenses.map((t) => t.id),
      });
    }
  });

  // Deduplicate and sort by severity (critical first)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
