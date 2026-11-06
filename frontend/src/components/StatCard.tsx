import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface StatCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  change: string;
  isPositive: boolean;
  accent: 'teal' | 'emerald' | 'rose' | 'purple';
  sparklineData: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  icon: Icon,
  change,
  isPositive,
  accent,
  sparklineData,
}) => {
  const { formatCurrency } = useFinance();

  const accentStyles = {
    teal: {
      border: 'border-teal-500/20 hover:border-teal-500/40',
      iconBg: 'bg-teal-500/15 text-teal-400',
      gradient: 'from-teal-500/10 to-transparent',
      lineColor: '#14b8a6',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      gradient: 'from-emerald-500/10 to-transparent',
      lineColor: '#10b981',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      gradient: 'from-rose-500/10 to-transparent',
      lineColor: '#f43f5e',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/15 text-purple-400',
      gradient: 'from-purple-500/10 to-transparent',
      lineColor: '#8b5cf6',
    },
  }[accent];

  // Generate SVG path for sparkline
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const pathD = `M ${points}`;
  const areaD = `M 0,${height} L ${points} L ${width},${height} Z`;

  return (
    <div
      className={`relative p-5 rounded-2xl bg-slate-900/80 border ${accentStyles.border} shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${accentStyles.gradient} opacity-50 pointer-events-none`}
      />

      <div className="relative z-10 flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase font-sans">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${accentStyles.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline justify-between mb-2">
        <div className="text-2xl font-extrabold tracking-tight text-white font-mono tabular-nums">
          {formatCurrency(amount)}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-xs">
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span
            className={`font-semibold font-mono ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {change}
          </span>
          <span className="text-slate-500 ml-1 text-[11px]">vs last month</span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-20 h-7 shrink-0">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${accent}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={accentStyles.lineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={accentStyles.lineColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${accent})`} />
            <path
              d={pathD}
              fill="none"
              stroke={accentStyles.lineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
