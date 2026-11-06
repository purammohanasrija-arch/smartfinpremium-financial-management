import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Zap,
  TrendingUp,
  Sliders,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Bot,
  SlidersHorizontal,
  ArrowRightLeft,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  detectSpendingAnomalies,
  SpendingAnomaly,
  AnomalyDetectionConfig,
  DEFAULT_ANOMALY_CONFIG,
} from '../utils/anomalyDetection';

interface SpendingAnomalySentinelProps {
  onOpenSetBudget?: (category?: string) => void;
  onOpenTransfer?: () => void;
  className?: string;
}

const STORAGE_DISMISSED_KEY = 'smartfin_dismissed_anomalies';

export const SpendingAnomalySentinel: React.FC<SpendingAnomalySentinelProps> = ({
  onOpenSetBudget,
  onOpenTransfer,
  className = '',
}) => {
  const { transactions, budgets, accounts, formatCurrency, currencySymbol } = useFinance();
  const navigate = useNavigate();

  // Detection sensitivity state
  const [sensitivity, setSensitivity] = useState<'conservative' | 'balanced' | 'high'>('balanced');
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'velocity'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Dismissed anomalies state
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DISMISSED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_DISMISSED_KEY, JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  // Run anomaly detection engine
  const allDetected = useMemo(() => {
    const config: AnomalyDetectionConfig = {
      ...DEFAULT_ANOMALY_CONFIG,
      sensitivity,
    };
    return detectSpendingAnomalies(transactions, budgets, accounts, config);
  }, [transactions, budgets, accounts, sensitivity]);

  // Active (non-dismissed) anomalies
  const activeAnomalies = useMemo(() => {
    return allDetected.filter((a) => !dismissedIds.includes(a.id));
  }, [allDetected, dismissedIds]);

  // Filtered by user tab
  const displayedAnomalies = useMemo(() => {
    if (activeFilter === 'critical') {
      return activeAnomalies.filter((a) => a.severity === 'critical');
    }
    if (activeFilter === 'velocity') {
      return activeAnomalies.filter((a) => a.type === 'velocity_cluster');
    }
    return activeAnomalies;
  }, [activeAnomalies, activeFilter]);

  // Dismiss / Ignore specific anomaly
  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, id]);
  };

  // Restore all dismissed
  const handleRestoreDismissed = () => {
    setDismissedIds([]);
  };

  // Ask AI Advisor about specific anomaly
  const handleAskAI = (anomaly: SpendingAnomaly) => {
    navigate('/assistant');
  };

  // Total affected outflow
  const totalAnomalyOutflow = useMemo(() => {
    return activeAnomalies.reduce((sum, a) => sum + a.amount, 0);
  }, [activeAnomalies]);

  const criticalCount = activeAnomalies.filter((a) => a.severity === 'critical').length;
  const velocityCount = activeAnomalies.filter((a) => a.type === 'velocity_cluster').length;

  if (activeAnomalies.length === 0) {
    return (
      <div
        className={`p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Spending Anomaly Sentinel
              <span className="text-xs text-emerald-400 font-mono font-medium">All Clear</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero irregular outflows or burn-rate velocity spikes detected across your recent ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestoreDismissed}
              className="text-slate-400 hover:text-teal-400 flex items-center gap-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore {dismissedIds.length} dismissed</span>
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono">
            {(['conservative', 'balanced', 'high'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSensitivity(s)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  sensitivity === s ? 'bg-slate-800 text-teal-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xl backdrop-blur-xl space-y-4 relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Decorative ambient warning glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Sentinel Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Spending Anomalies & Unusual Outflow Alerts
              </h3>
              <span className="text-xs font-mono font-bold text-rose-400">
                {activeAnomalies.length} Flagged
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Heuristic velocity engine detected out-of-pattern spending that could impact your October savings rate.
            </p>
          </div>
        </div>

        {/* Controls: Minimize & Sensitivity */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Sensitivity Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-500 px-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span className="hidden xl:inline">Engine:</span>
            </span>
            {(['conservative', 'balanced', 'high'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSensitivity(s)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-colors ${
                  sensitivity === s
                    ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Sensitivity mode: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expand anomaly alerts' : 'Collapse alerts'}
            aria-label={isMinimized ? 'Expand anomaly alerts' : 'Collapse alerts'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Metrics Bar & Filter Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Filter Buttons (Zero-Pill interactive controls) */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto font-mono">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  activeFilter === 'all'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Anomalies ({activeAnomalies.length})
              </button>
              {criticalCount > 0 && (
                <button
                  onClick={() => setActiveFilter('critical')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                    activeFilter === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 shadow-sm'
                      : 'text-rose-400/80 hover:text-rose-300'
                  }`}
                >
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  <span>Critical ({criticalCount})</span>
                </button>
              )}
              {velocityCount > 0 && (
                <button
                  onClick={() => setActiveFilter('velocity')}
                  className={`px-3 py-1 rounded-lg transition-colors font-medium flex items-center gap-1.5 ${
                    activeFilter === 'velocity'
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                      : 'text-amber-400/80 hover:text-amber-300'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span>Velocity Clusters ({velocityCount})</span>
                </button>
              )}
            </div>

            {/* Impact Metric Summary */}
            <div className="flex items-center gap-3 text-slate-400 font-mono">
              <span>
                Flagged Outflow Volume:{' '}
                <strong className="text-white font-bold">{formatCurrency(totalAnomalyOutflow)}</strong>
              </span>
              {dismissedIds.length > 0 && (
                <button
                  onClick={handleRestoreDismissed}
                  className="text-slate-400 hover:text-teal-400 flex items-center gap-1 transition-colors text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset {dismissedIds.length} dismissed</span>
                </button>
              )}
            </div>
          </div>

          {/* Anomaly Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedAnomalies.map((anomaly) => {
              const isExpanded = expandedId === anomaly.id;
              const isCritical = anomaly.severity === 'critical';

              return (
                <div
                  key={anomaly.id}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/20'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header with Type & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {isCritical ? (
                          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : anomaly.type === 'velocity_cluster' ? (
                          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">
                          {anomaly.title}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => handleDismiss(anomaly.id, e)}
                        className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                        title="Dismiss alert / Expected outlay"
                        aria-label="Dismiss alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata line with typographic separators (Zero-Pill Compliance) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2.5">
                      <span className="font-medium text-slate-300">{anomaly.category}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      {anomaly.date && (
                        <>
                          <span className="font-mono text-slate-400">{anomaly.date.split(' ')[0]}</span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                        </>
                      )}
                      {anomaly.account && (
                        <span className="truncate max-w-[100px] text-slate-400">{anomaly.account}</span>
                      )}
                      {anomaly.deviationPercent !== undefined && (
                        <span className="font-mono text-rose-400 font-bold ml-auto">
                          +{anomaly.deviationPercent}% dev
                        </span>
                      )}
                    </div>

                    {/* Amount & Benchmark Strip */}
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 mb-3 flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-sans">
                          Outflow Value
                        </span>
                        <span className="text-base font-extrabold text-white">
                          {formatCurrency(anomaly.amount)}
                        </span>
                      </div>
                      {anomaly.benchmarkAmount && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">
                            {anomaly.type === 'spike' ? 'Baseline Avg' : 'Category Cap'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatCurrency(anomaly.benchmarkAmount)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {anomaly.explanation}
                    </p>

                    {/* Projected Exhaustion or Deep Insight if expanded */}
                    {anomaly.projectedExhaustionDate && (
                      <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Projected exhaustion by: <strong>{anomaly.projectedExhaustionDate}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actionable Mitigation Controls */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (anomaly.type === 'high_ratio') {
                          onOpenTransfer?.();
                        } else {
                          onOpenSetBudget?.(anomaly.category);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {anomaly.type === 'high_ratio' ? (
                        <>
                          <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                          <span>Transfer Sweep</span>
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal className="w-3 h-3 text-teal-400" />
                          <span>Adjust Cap</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAskAI(anomaly)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3 text-indigo-400" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
