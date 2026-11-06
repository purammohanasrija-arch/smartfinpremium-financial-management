import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Coffee,
  Car,
  Briefcase,
  Home,
  Flame,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Zap,
  DollarSign,
  Calendar,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';

interface ScenarioPreset {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
  lumpSumCost: number; // immediate cash outflow (or inflow if negative)
  monthlyExpenseDelta: number; // +/- change in monthly expense
  monthlyIncomeDelta: number; // +/- change in monthly income
  expectedReturnRate: number; // annual return %
  inflationRate: number; // annual inflation %
  durationYears: number;
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'dining_savings',
    title: 'Cut Dining Out & Invest the Difference',
    subtitle: 'Reduce food delivery/cafes by ₹4,500/mo and invest in a 12% index fund.',
    icon: Coffee,
    accentColor: '#10b981', // emerald
    badge: 'Wealth Supercharger',
    lumpSumCost: 0,
    monthlyExpenseDelta: -4500,
    monthlyIncomeDelta: 0,
    expectedReturnRate: 12.0,
    inflationRate: 6.0,
    durationYears: 15,
  },
  {
    id: 'buy_car',
    title: 'Buy a New Car with Loan',
    subtitle: '₹2,50,000 down payment + ₹18,500/mo loan EMI + fuel & insurance for 5 years.',
    icon: Car,
    accentColor: '#f43f5e', // rose
    badge: 'Major Outflow Shock',
    lumpSumCost: 250000,
    monthlyExpenseDelta: 23500, // EMI + fuel/maintenance
    monthlyIncomeDelta: 0,
    expectedReturnRate: 10.0,
    inflationRate: 6.0,
    durationYears: 10,
  },
  {
    id: 'career_sabbatical',
    title: '6-Month Career Break / Sabbatical',
    subtitle: 'Zero income for 6 months while traveling or upskilling, living off liquid savings.',
    icon: Briefcase,
    accentColor: '#f59e0b', // amber
    badge: 'Runway Stress Test',
    lumpSumCost: 150000, // travel / course upfront
    monthlyExpenseDelta: 5000, // slightly higher leisure spend
    monthlyIncomeDelta: -65000, // loss of monthly salary for part of the period
    expectedReturnRate: 9.0,
    inflationRate: 6.0,
    durationYears: 5,
  },
  {
    id: 'salary_hike_50_50',
    title: 'Promotion & 30% Salary Hike (50/50 Rule)',
    subtitle: 'Earn +₹25,000/mo: invest half and enjoy the other half to defeat lifestyle creep.',
    icon: Flame,
    accentColor: '#6366f1', // indigo
    badge: 'Smart Career Level-Up',
    lumpSumCost: 0,
    monthlyExpenseDelta: 12500, // spend half
    monthlyIncomeDelta: 25000, // full raise
    expectedReturnRate: 12.0,
    inflationRate: 6.0,
    durationYears: 15,
  },
  {
    id: 'buy_dream_home',
    title: 'Purchase a 2BHK Home (Mortgage)',
    subtitle: '₹12 Lakh down payment + ₹38,000/mo mortgage, replacing your current rental expense.',
    icon: Home,
    accentColor: '#0ea5e9', // sky
    badge: 'Asset Building vs Cash Flow',
    lumpSumCost: 1200000,
    monthlyExpenseDelta: 15000, // EMI minus saved rent
    monthlyIncomeDelta: 0,
    expectedReturnRate: 9.5,
    inflationRate: 6.0,
    durationYears: 20,
  },
];

export const FinancialTimeMachinePage: React.FC = () => {
  const {
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
    currencySymbol,
    formatCurrency,
    addToast,
  } = useFinance();

  // Active or custom scenario
  const [selectedPreset, setSelectedPreset] = useState<string>('dining_savings');

  // Custom simulation inputs
  const [lumpSumCost, setLumpSumCost] = useState<number>(0);
  const [monthlyExpenseDelta, setMonthlyExpenseDelta] = useState<number>(-4500);
  const [monthlyIncomeDelta, setMonthlyIncomeDelta] = useState<number>(0);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [durationYears, setDurationYears] = useState<number>(15);

  // Apply preset
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPreset(preset.id);
    setLumpSumCost(preset.lumpSumCost);
    setMonthlyExpenseDelta(preset.monthlyExpenseDelta);
    setMonthlyIncomeDelta(preset.monthlyIncomeDelta);
    setExpectedReturnRate(preset.expectedReturnRate);
    setInflationRate(preset.inflationRate);
    setDurationYears(preset.durationYears);
  };

  // Base monthly surplus
  const baseMonthlySurplus = Math.max(1, monthlyIncome - monthlyExpenses);
  const startingCorpus = totalBalance > 0 ? totalBalance : 250000;

  // Run the Dual-Trajectory Math Engine
  const simulationResults = useMemo(() => {
    const monthlyRate = expectedReturnRate / 12 / 100;

    let baselineCorpus = startingCorpus;
    let simulatedCorpus = Math.max(0, startingCorpus - lumpSumCost);

    const chartData: Array<{
      year: string;
      baselineWealth: number;
      simulatedWealth: number;
      delta: number;
    }> = [];

    // Push Year 0
    chartData.push({
      year: 'Now',
      baselineWealth: Math.round(baselineCorpus),
      simulatedWealth: Math.round(simulatedCorpus),
      delta: Math.round(simulatedCorpus - baselineCorpus),
    });

    const simulatedMonthlySurplus = baseMonthlySurplus + monthlyIncomeDelta - monthlyExpenseDelta;

    for (let yr = 1; yr <= durationYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        // Compound baseline
        baselineCorpus = (baselineCorpus + baseMonthlySurplus) * (1 + monthlyRate);
        // Compound simulated
        simulatedCorpus = (simulatedCorpus + Math.max(0, simulatedMonthlySurplus)) * (1 + monthlyRate);
      }

      const diff = simulatedCorpus - baselineCorpus;
      chartData.push({
        year: `Yr ${yr}`,
        baselineWealth: Math.round(baselineCorpus),
        simulatedWealth: Math.round(simulatedCorpus),
        delta: Math.round(diff),
      });
    }

    const finalBaseline = Math.round(baselineCorpus);
    const finalSimulated = Math.round(simulatedCorpus);
    const totalDelta = finalSimulated - finalBaseline;
    const isGain = totalDelta >= 0;

    // Financial Freedom Impact
    const yearsSavedOrDelayed = Math.abs(totalDelta / (baseMonthlySurplus * 12 * 1.5)).toFixed(1);

    return {
      chartData,
      finalBaseline,
      finalSimulated,
      totalDelta,
      isGain,
      yearsSavedOrDelayed,
      simulatedMonthlySurplus,
    };
  }, [
    startingCorpus,
    baseMonthlySurplus,
    lumpSumCost,
    monthlyExpenseDelta,
    monthlyIncomeDelta,
    expectedReturnRate,
    durationYears,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-400" /> AI Financial Time Machine & What-If Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Simulate life shocks, career moves, and lifestyle changes. Test how everyday choices compound 5 to 25 years into the future.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-teal-300 font-mono text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Smart Compounder Engine</span>
          </span>
        </div>
      </div>

      {/* Preset Scenario Selector Cards */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
          Select a Life Scenario or Build Your Own:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_SCENARIOS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${preset.accentColor}25`, color: preset.accentColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold truncate max-w-[110px]"
                    style={{ backgroundColor: `${preset.accentColor}15`, color: preset.accentColor }}
                  >
                    {preset.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{preset.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{preset.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation View: Sliders & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders / Parameter Controls */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" /> Scenario Knobs & Levers
            </h3>
            <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-500/10 px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          {/* Upfront Lump Sum Outflow */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Upfront Lump-Sum Cost</span>
              <span className="font-mono text-white font-bold">{formatCurrency(lumpSumCost)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2500000"
              step="25000"
              value={lumpSumCost}
              onChange={(e) => {
                setLumpSumCost(Number(e.target.value));
                setSelectedPreset('custom');
              }}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹0</span>
              <span>₹10 Lakhs</span>
              <span>₹25 Lakhs</span>
            </div>
          </div>

          {/* Monthly Expense Change */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Monthly Expense Change</span>
              <span
                className={`font-mono font-bold ${
                  monthlyExpenseDelta < 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {monthlyExpenseDelta > 0 ? `+${formatCurrency(monthlyExpenseDelta)}` : formatCurrency(monthlyExpenseDelta)}/mo
              </span>
            </div>
            <input
              type="range"
              min="-25000"
              max="50000"
              step="1000"
              value={monthlyExpenseDelta}
              onChange={(e) => {
                setMonthlyExpenseDelta(Number(e.target.value));
                setSelectedPreset('custom');
              }}
              className="w-full accent-rose-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span className="text-emerald-400">-₹25K (Save)</span>
              <span>₹0</span>
              <span className="text-rose-400">+₹50K (Spend)</span>
            </div>
          </div>

          {/* Monthly Income Change */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Monthly Salary / Income Change</span>
              <span
                className={`font-mono font-bold ${
                  monthlyIncomeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {monthlyIncomeDelta >= 0 ? `+${formatCurrency(monthlyIncomeDelta)}` : formatCurrency(monthlyIncomeDelta)}/mo
              </span>
            </div>
            <input
              type="range"
              min="-50000"
              max="100000"
              step="5000"
              value={monthlyIncomeDelta}
              onChange={(e) => {
                setMonthlyIncomeDelta(Number(e.target.value));
                setSelectedPreset('custom');
              }}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-₹50K</span>
              <span>₹0</span>
              <span>+₹1 Lakh</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Investment Return Rate (% p.a.)</span>
              <span className="font-mono text-amber-300 font-bold">{expectedReturnRate}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="20"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => {
                setExpectedReturnRate(Number(e.target.value));
                setSelectedPreset('custom');
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Horizon Duration */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Time Horizon Forward</span>
              <span className="font-mono text-indigo-300 font-bold">{durationYears} Years</span>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={durationYears}
              onChange={(e) => {
                setDurationYears(Number(e.target.value));
                setSelectedPreset('custom');
              }}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3 Yrs</span>
              <span>15 Yrs</span>
              <span>25 Yrs</span>
            </div>
          </div>
        </div>

        {/* Results & Trajectory Graph */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Outcome Verdict Card */}
          <div
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              simulationResults.isGain
                ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-500/40 shadow-xl shadow-emerald-500/5'
                : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-500/5'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider block text-slate-400">
                Net Wealth Impact in {durationYears} Years
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                    simulationResults.isGain ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simulationResults.isGain ? '+' : ''}
                  {formatCurrency(simulationResults.totalDelta)}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md">
                {simulationResults.isGain ? (
                  <>
                    🎉 This scenario makes you{' '}
                    <strong className="text-emerald-300 font-mono">
                      {formatCurrency(simulationResults.totalDelta)} richer
                    </strong>{' '}
                    and accelerates your financial freedom date by ~{simulationResults.yearsSavedOrDelayed} years!
                  </>
                ) : (
                  <>
                    ⚠️ This decision costs you{' '}
                    <strong className="text-rose-300 font-mono">
                      {formatCurrency(Math.abs(simulationResults.totalDelta))} in compounding returns
                    </strong>{' '}
                    over {durationYears} years.
                  </>
                )}
              </p>
            </div>

            <button
              onClick={() => {
                addToast('Scenario saved to your custom financial plan!', 'success');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-semibold border border-slate-700 transition-all shrink-0 active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Adopt Scenario</span>
            </button>
          </div>

          {/* Dual-Curve Trajectory Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-400" /> Projected Wealth Trajectory Comparison
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Baseline Trajectory
                </span>
                <span className="flex items-center gap-1 text-teal-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> What-If Scenario
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="simulatedWealth"
                    name="Simulated Scenario"
                    stroke="#14b8a6"
                    strokeWidth={2.5}
                    fill="url(#simGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineWealth"
                    name="Current Baseline"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#baseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Insight Footer */}
            <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
              <div>
                Baseline at Year {durationYears}:{' '}
                <strong className="text-white">{formatCurrency(simulationResults.finalBaseline)}</strong>
              </div>
              <div>
                Simulated at Year {durationYears}:{' '}
                <strong className="text-teal-300">{formatCurrency(simulationResults.finalSimulated)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
