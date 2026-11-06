import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  ShieldCheck,
  Users,
  PieChart as PieIcon,
  DollarSign,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Percent,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';

export const FinancialToolsPage: React.FC = () => {
  const {
    accounts,
    monthlyExpenses,
    monthlyIncome,
    currencySymbol,
    formatCurrency,
    addToast,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'emi' | 'sip' | 'runway' | 'splitter'>('emi');

  // ==========================================
  // 1. LOAN & EMI CALCULATOR STATE
  // ==========================================
  const [loanAmount, setLoanAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15);
  const [extraPrepayment, setExtraPrepayment] = useState<number>(5000);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // EMI Calculations
  const emiDetails = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = loanTenureYears * 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
        principalPercent: 100,
        interestPercent: 0,
        prepaymentSavings: { monthsSaved: 0, interestSaved: 0 },
        yearlySchedule: [],
      };
    }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Simulation with extra prepayment per month
    let balanceWithPrepay = P;
    let totalInterestWithPrepay = 0;
    let monthsWithPrepay = 0;
    const acceleratedEmi = emi + extraPrepayment;

    while (balanceWithPrepay > 0 && monthsWithPrepay < n) {
      monthsWithPrepay++;
      const monthlyInt = balanceWithPrepay * r;
      totalInterestWithPrepay += monthlyInt;
      const principalPaid = Math.min(balanceWithPrepay, acceleratedEmi - monthlyInt);
      balanceWithPrepay -= principalPaid;
    }

    const monthsSaved = Math.max(0, n - monthsWithPrepay);
    const interestSaved = Math.max(0, Math.round(totalInterest - totalInterestWithPrepay));

    // Year-by-year schedule (standard)
    const yearlySchedule: Array<{
      year: number;
      principalPaid: number;
      interestPaid: number;
      balance: number;
    }> = [];

    let currentBalance = P;
    for (let yr = 1; yr <= loanTenureYears; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;
      for (let m = 0; m < 12; m++) {
        if (currentBalance <= 0) break;
        const mInterest = currentBalance * r;
        const mPrincipal = Math.min(currentBalance, emi - mInterest);
        yrInterest += mInterest;
        yrPrincipal += mPrincipal;
        currentBalance -= mPrincipal;
      }
      yearlySchedule.push({
        year: yr,
        principalPaid: Math.round(yrPrincipal),
        interestPaid: Math.round(yrInterest),
        balance: Math.max(0, Math.round(currentBalance)),
      });
    }

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent: Math.round((P / totalPayment) * 100),
      interestPercent: Math.round((totalInterest / totalPayment) * 100),
      prepaymentSavings: { monthsSaved, interestSaved },
      yearlySchedule,
    };
  }, [loanAmount, interestRate, loanTenureYears, extraPrepayment]);

  const emiPieData = useMemo(() => [
    { name: 'Principal Loan', value: loanAmount, color: '#0d9488' }, // teal
    { name: 'Total Interest', value: emiDetails.totalInterest, color: '#f59e0b' }, // amber
  ], [loanAmount, emiDetails.totalInterest]);

  // ==========================================
  // 2. SIP & COMPOUND WEALTH PLANNER STATE
  // ==========================================
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipExpectedReturn, setSipExpectedReturn] = useState<number>(12);
  const [sipTenureYears, setSipTenureYears] = useState<number>(15);
  const [sipStepUpPercent, setSipStepUpPercent] = useState<number>(10); // annual step up

  const sipDetails = useMemo(() => {
    let currentMonthly = sipMonthly;
    let totalInvested = 0;
    let corpus = 0;
    const monthlyRate = sipExpectedReturn / 12 / 100;
    const projectionData: Array<{
      year: string;
      invested: number;
      futureValue: number;
      wealthGain: number;
    }> = [];

    for (let yr = 1; yr <= sipTenureYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        corpus = (corpus + currentMonthly) * (1 + monthlyRate);
        totalInvested += currentMonthly;
      }
      projectionData.push({
        year: `Yr ${yr}`,
        invested: Math.round(totalInvested),
        futureValue: Math.round(corpus),
        wealthGain: Math.max(0, Math.round(corpus - totalInvested)),
      });

      // Step up monthly deposit by % every year
      if (sipStepUpPercent > 0) {
        currentMonthly += currentMonthly * (sipStepUpPercent / 100);
      }
    }

    const finalCorpus = Math.round(corpus);
    const finalInvested = Math.round(totalInvested);
    const wealthGain = Math.max(0, finalCorpus - finalInvested);

    return {
      totalInvested: finalInvested,
      wealthGain,
      maturityValue: finalCorpus,
      growthMultiple: (finalCorpus / (finalInvested || 1)).toFixed(1),
      projectionData,
    };
  }, [sipMonthly, sipExpectedReturn, sipTenureYears, sipStepUpPercent]);

  // ==========================================
  // 3. EMERGENCY RUNWAY SENTINEL
  // ==========================================
  const liquidSavings = useMemo(() => {
    return accounts
      .filter((acc) => ['checking', 'savings', 'cash'].includes(acc.type.toLowerCase()))
      .reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  }, [accounts]);

  const effectiveMonthlyBurn = monthlyExpenses > 0 ? monthlyExpenses : 45000;
  const currentRunwayMonths = (liquidSavings / effectiveMonthlyBurn).toFixed(1);

  const [targetRunwayMonths, setTargetRunwayMonths] = useState<number>(6);
  const targetRequiredFund = targetRunwayMonths * effectiveMonthlyBurn;
  const runwayDeficit = Math.max(0, targetRequiredFund - liquidSavings);
  const monthlySavingsRate = Math.max(1, monthlyIncome - monthlyExpenses);
  const monthsToTarget = monthlySavingsRate > 0 ? (runwayDeficit / monthlySavingsRate).toFixed(1) : '∞';

  // ==========================================
  // 4. SMART GROUP BILL SPLITTER STATE
  // ==========================================
  const [billAmount, setBillAmount] = useState<number>(4200);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [taxAmount, setTaxAmount] = useState<number>(210);
  const [friendsList, setFriendsList] = useState<string>('Mahi, Sarah, Alex, David');
  const [copiedSplit, setCopiedSplit] = useState(false);

  const splitResult = useMemo(() => {
    const friends = friendsList
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    const count = Math.max(1, friends.length);
    const tipVal = (billAmount * tipPercent) / 100;
    const grandTotal = billAmount + tipVal + taxAmount;
    const perPerson = Math.ceil((grandTotal / count) * 100) / 100;

    return {
      friends,
      count,
      tipVal,
      grandTotal,
      perPerson,
    };
  }, [billAmount, tipPercent, taxAmount, friendsList]);

  const handleCopySplitSummary = () => {
    const summary = [
      `🧾 SmartFin+ Bill Split Breakdown`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Total Bill: ${currencySymbol}${billAmount.toLocaleString()}`,
      `Tip (${tipPercent}%): ${currencySymbol}${splitResult.tipVal.toLocaleString()}`,
      `Tax / Fees: ${currencySymbol}${taxAmount.toLocaleString()}`,
      `Grand Total: ${currencySymbol}${splitResult.grandTotal.toLocaleString()}`,
      `Split Among: ${splitResult.count} people (${splitResult.friends.join(', ')})`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👉 Each Person Pays: ${currencySymbol}${splitResult.perPerson.toLocaleString()}`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Calculated with SmartFin+ Financial Intelligence`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedSplit(true);
    addToast('Bill split breakdown copied to clipboard!', 'success');
    setTimeout(() => setCopiedSplit(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-teal-400" /> Financial Tools & Calculators
          </h1>
          <p className="text-xs text-slate-400">
            Advanced decision intelligence engines: loan amortization, compounding wealth forecaster, emergency runway sentinel, and group expense splitter.
          </p>
        </div>

        {/* Currency Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 font-mono text-xs font-semibold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Active: {currencySymbol}</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('emi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
            activeTab === 'emi'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Loan EMI & Prepayment</span>
        </button>

        <button
          onClick={() => setActiveTab('sip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
            activeTab === 'sip'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>SIP & Compound Wealth</span>
        </button>

        <button
          onClick={() => setActiveTab('runway')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
            activeTab === 'runway'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Emergency Runway Sentinel</span>
        </button>

        <button
          onClick={() => setActiveTab('splitter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono transition-all whitespace-nowrap ${
            activeTab === 'splitter'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Smart Bill Splitter</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: LOAN EMI & PREPAYMENT CALCULATOR               */}
      {/* ==================================================== */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Controls Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-400" /> Loan Parameters
              </h3>
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded">
                Standard Amortization
              </span>
            </div>

            {/* Loan Principal Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Principal Amount</span>
                <span className="font-mono text-teal-300 font-bold">{formatCurrency(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50K</span>
                <span>50L</span>
                <span>1 Cr</span>
              </div>
            </div>

            {/* Interest Rate Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Interest Rate (% per year)</span>
                <span className="font-mono text-amber-300 font-bold">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5% (Home)</span>
                <span>10% (Auto)</span>
                <span>20% (Personal)</span>
              </div>
            </div>

            {/* Loan Tenure Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Tenure Duration</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {loanTenureYears} Years ({loanTenureYears * 12} Months)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Yr</span>
                <span>15 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>

            {/* Prepayment Optimizer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Extra Prepayment Simulator
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  +{formatCurrency(extraPrepayment)}/mo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={extraPrepayment}
                onChange={(e) => setExtraPrepayment(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                See how paying an extra sum each month cuts down your loan years and saves huge interest!
              </p>
            </div>
          </div>

          {/* EMI Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/15 via-slate-900 to-slate-900 border border-teal-500/30">
                <span className="text-[10px] text-teal-400 uppercase font-mono block">Monthly EMI</span>
                <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
                  {formatCurrency(emiDetails.monthlyEmi)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Due every month</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 uppercase font-mono block">Total Interest</span>
                <span className="text-2xl font-extrabold text-amber-300 font-mono mt-1 block">
                  {formatCurrency(emiDetails.totalInterest)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {emiDetails.interestPercent}% of total cost
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 via-slate-900 to-slate-900 border border-indigo-500/30">
                <span className="text-[10px] text-indigo-400 uppercase font-mono block">Total Payment</span>
                <span className="text-2xl font-extrabold text-slate-100 font-mono mt-1 block">
                  {formatCurrency(emiDetails.totalPayment)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Principal + Interest</span>
              </div>
            </div>

            {/* Prepayment Superpower Banner */}
            {extraPrepayment > 0 && emiDetails.prepaymentSavings.monthsSaved > 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-emerald-300 block text-sm">
                    Prepayment Savings Unlocked!
                  </span>
                  <p className="text-slate-300 mt-0.5">
                    By adding <strong className="text-emerald-400">{formatCurrency(extraPrepayment)}/month</strong>, you finish the loan{' '}
                    <strong className="text-white">{(emiDetails.prepaymentSavings.monthsSaved / 12).toFixed(1)} years earlier</strong> and save{' '}
                    <strong className="text-emerald-300 font-mono">{formatCurrency(emiDetails.prepaymentSavings.interestSaved)}</strong> in pure interest!
                  </p>
                </div>
              </div>
            )}

            {/* Principal vs Interest Pie Chart Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-teal-400" /> Payment Composition
                </span>
                <button
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-mono underline underline-offset-2 flex items-center gap-1"
                >
                  <span>{showAmortization ? 'Hide Amortization Table' : 'View Full Schedule'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emiPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {emiPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Principal: {emiDetails.principalPercent}%</span>
                  <span>Interest: {emiDetails.interestPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${emiDetails.principalPercent}%` }} className="bg-teal-500 h-full" />
                  <div style={{ width: `${emiDetails.interestPercent}%` }} className="bg-amber-500 h-full" />
                </div>
              </div>
            </div>

            {/* Amortization Schedule Table */}
            {showAmortization && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 overflow-x-auto max-h-60 scrollbar-thin">
                <h4 className="text-xs font-bold text-white">Year-by-Year Repayment Amortization</h4>
                <table className="w-full text-[11px] font-mono text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-2">Year</th>
                      <th className="p-2">Principal Paid</th>
                      <th className="p-2">Interest Paid</th>
                      <th className="p-2">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {emiDetails.yearlySchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-850">
                        <td className="p-2 text-teal-400 font-bold">Year {row.year}</td>
                        <td className="p-2 text-emerald-400">{formatCurrency(row.principalPaid)}</td>
                        <td className="p-2 text-amber-400">{formatCurrency(row.interestPaid)}</td>
                        <td className="p-2 text-slate-200">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: SIP & COMPOUND WEALTH PLANNER                 */}
      {/* ==================================================== */}
      {activeTab === 'sip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Controls Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Investment Growth Engine
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                Compounded Monthly
              </span>
            </div>

            {/* Monthly SIP Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Monthly Investment</span>
                <span className="font-mono text-emerald-300 font-bold">{formatCurrency(sipMonthly)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="1000"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1K</span>
                <span>50K</span>
                <span>2 Lakh</span>
              </div>
            </div>

            {/* Expected Return Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Expected Annual Return Rate</span>
                <span className="font-mono text-teal-300 font-bold">{sipExpectedReturn}% p.a.</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={sipExpectedReturn}
                onChange={(e) => setSipExpectedReturn(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>7% (FD/Debt)</span>
                <span>12% (Index/Equities)</span>
                <span>18% (Aggressive)</span>
              </div>
            </div>

            {/* Investment Tenure */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Time Horizon</span>
                <span className="font-mono text-indigo-300 font-bold">{sipTenureYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={sipTenureYears}
                onChange={(e) => setSipTenureYears(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>3 Yrs</span>
                <span>15 Yrs</span>
                <span>35 Yrs</span>
              </div>
            </div>

            {/* Step-Up % Input */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Annual Step-Up Bonus
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">+{sipStepUpPercent}% / year</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="5"
                value={sipStepUpPercent}
                onChange={(e) => setSipStepUpPercent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Increase your monthly contribution by {sipStepUpPercent}% each year as your salary increases.
              </p>
            </div>
          </div>

          {/* SIP Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Invested</span>
                <span className="text-xl font-extrabold text-white font-mono mt-1 block">
                  {formatCurrency(sipDetails.totalInvested)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Your capital contributions</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-mono block">Estimated Wealth Gain</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono mt-1 block">
                  +{formatCurrency(sipDetails.wealthGain)}
                </span>
                <span className="text-[10px] text-emerald-300 block mt-0.5">Compound interest earned</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500/20 via-slate-900 to-slate-900 border border-teal-500/30">
                <span className="text-[10px] text-teal-400 uppercase font-mono block">Maturity Value</span>
                <span className="text-2xl font-black text-teal-300 font-mono mt-1 block">
                  {formatCurrency(sipDetails.maturityValue)}
                </span>
                <span className="text-[10px] text-teal-400/90 font-bold block mt-0.5">
                  {sipDetails.growthMultiple}x Wealth Multiplier
                </span>
              </div>
            </div>

            {/* Growth Over Time Area Chart */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Corpus Progression (Invested vs Wealth Gain)
              </span>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sipDetails.projectionData}>
                    <defs>
                      <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="futureValue"
                      name="Total Wealth Corpus"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#wealthGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      name="Principal Invested"
                      stroke="#0284c7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#investedGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: EMERGENCY RUNWAY SENTINEL                     */}
      {/* ==================================================== */}
      {activeTab === 'runway' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Big Runway KPI Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Live Financial Runway Health
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                  {currentRunwayMonths}
                </span>
                <span className="text-xl font-bold text-slate-300">Months of Freedom</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Based on your actual liquid savings ({formatCurrency(liquidSavings)}) across Checking & Savings accounts, and your average monthly burn rate ({formatCurrency(effectiveMonthlyBurn)}/mo).
              </p>
            </div>

            {/* Status Rating Badge */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[200px]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Safety Rating</span>
              <span
                className={`text-lg font-bold block mt-1 ${
                  Number(currentRunwayMonths) >= 6
                    ? 'text-emerald-400'
                    : Number(currentRunwayMonths) >= 3
                    ? 'text-teal-400'
                    : 'text-amber-400'
                }`}
              >
                {Number(currentRunwayMonths) >= 6
                  ? '🏰 Fortress Defense'
                  : Number(currentRunwayMonths) >= 3
                  ? '🛡️ Healthy Baseline'
                  : '⚠️ Needs Fortifying'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Recommended: 6.0 Months
              </span>
            </div>
          </div>

          {/* Interactive Target Goal Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Target Runway Goal Simulator
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Desired Target Safety Buffer:</span>
                  <span className="font-mono text-indigo-400 font-bold">{targetRunwayMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={targetRunwayMonths}
                  onChange={(e) => setTargetRunwayMonths(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>3 Months (Standard)</span>
                  <span>6 Months (Recommended)</span>
                  <span>12 Months (Ironclad)</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Target Fund Needed:</span>
                  <span className="font-mono text-white font-bold">{formatCurrency(targetRequiredFund)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Liquid Reserve:</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatCurrency(liquidSavings)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Gap to Target:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {runwayDeficit > 0 ? formatCurrency(runwayDeficit) : 'Goal Achieved! 🎉'}
                  </span>
                </div>
                {runwayDeficit > 0 && (
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
                    💡 At your current monthly savings surplus ({formatCurrency(monthlySavingsRate)}/mo), you will reach this goal in{' '}
                    <strong className="text-white font-mono">{monthsToTarget} months</strong>.
                  </div>
                )}
              </div>
            </div>

            {/* Liquid Accounts Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400" /> Active Reserve Accounts
              </h3>
              <p className="text-xs text-slate-400">
                These liquid assets form your current safety runway:
              </p>
              <div className="space-y-2">
                {accounts
                  .filter((a) => ['checking', 'savings', 'cash'].includes(a.type.toLowerCase()))
                  .map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-semibold text-white block">{acc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono capitalize">{acc.type} • {acc.institution}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatCurrency(acc.balance)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: SMART GROUP BILL SPLITTER                     */}
      {/* ==================================================== */}
      {activeTab === 'splitter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Controls Column */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-teal-400" /> Group Expense Details
            </h3>

            {/* Bill Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Base Bill Amount ({currencySymbol})</label>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            {/* Tip Percentage Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Tip / Service Charge</label>
              <div className="grid grid-cols-5 gap-2">
                {[0, 5, 10, 15, 20].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipPercent(t)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      tipPercent === t
                        ? 'bg-teal-500 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tax or Extra fees */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Taxes / Delivery Fees ({currencySymbol})</label>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            {/* Friends list comma-separated */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Split With (Comma-separated names)
              </label>
              <input
                type="text"
                value={friendsList}
                onChange={(e) => setFriendsList(e.target.value)}
                placeholder="Mahi, Sarah, Alex, David"
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">
                Currently splitting equally among {splitResult.count} people.
              </span>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Shareable Split Summary
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {splitResult.count} participants
                </span>
              </div>

              {/* Big Per Person Highlight */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-teal-500/20 via-slate-950 to-slate-950 border border-teal-500/40 text-center space-y-1">
                <span className="text-[11px] font-mono text-teal-300 uppercase tracking-wider block">
                  Each Person Owes
                </span>
                <span className="text-4xl font-black text-white font-mono block">
                  {formatCurrency(splitResult.perPerson)}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Grand Total: {formatCurrency(splitResult.grandTotal)} (includes {formatCurrency(splitResult.tipVal)} tip & {formatCurrency(taxAmount)} tax)
                </span>
              </div>

              {/* Individual Breakdown List */}
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {splitResult.friends.map((name, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <span className="text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {name}
                    </span>
                    <span className="text-teal-400 font-bold">{formatCurrency(splitResult.perPerson)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopySplitSummary}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95"
            >
              {copiedSplit ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copy Summary for WhatsApp / Chat</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
