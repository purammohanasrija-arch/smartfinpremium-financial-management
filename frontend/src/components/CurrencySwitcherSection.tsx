import React, { useState, useMemo } from 'react';
import {
  Globe,
  Coins,
  Check,
  Search,
  ArrowRightLeft,
  Sparkles,
  TrendingUp,
  Sliders,
  Info,
  RotateCcw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SUPPORTED_CURRENCIES, CurrencyInfo } from '../utils/currencies';

export const CurrencySwitcherSection: React.FC = () => {
  const {
    currency,
    currencySymbol,
    conversionMode,
    activeCurrency,
    setCurrency,
    setConversionMode,
    formatCurrency,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
  } = useFinance();

  const [searchFilter, setSearchFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'popular' | 'americas' | 'europe' | 'asia_me'>('all');

  // Filter currencies based on search and region
  const filteredCurrencies = useMemo(() => {
    return SUPPORTED_CURRENCIES.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.country.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.symbol.includes(searchFilter);

      if (!matchesSearch) return false;

      if (regionFilter === 'popular') return c.popular;
      if (regionFilter === 'americas') return ['USD', 'CAD', 'BRL'].includes(c.code);
      if (regionFilter === 'europe') return ['EUR', 'GBP', 'CHF'].includes(c.code);
      if (regionFilter === 'asia_me') return ['INR', 'JPY', 'AED', 'SGD', 'CNY', 'SAR'].includes(c.code);

      return true;
    });
  }, [searchFilter, regionFilter]);

  const handleSelectCurrency = (code: string) => {
    setCurrency(code);
  };

  return (
    <div
      id="currency-switcher"
      className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6 relative overflow-hidden"
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/10">
            <Coins className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Global Currency Switcher
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold uppercase tracking-wider">
                Multi-Currency Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Change your active base currency to automatically update all charts, reports, account balances, and cards across SmartFin+.
            </p>
          </div>
        </div>

        {/* Active Currency Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-teal-500/40 text-teal-300 font-mono text-xs flex items-center gap-2 shadow-sm">
            <span className="text-base">{activeCurrency.flag}</span>
            <span className="font-bold text-white">{activeCurrency.code}</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-extrabold">
              {activeCurrency.symbol}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Live Financial Display Preview Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Live Display Preview ({activeCurrency.code} — {activeCurrency.name})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3 h-3 text-teal-400" />
            <span>FX Rate: 1 {activeCurrency.code} = ₹{activeCurrency.rateToInr.toFixed(2)} | 1 INR = {activeCurrency.rateFromInr < 0.01 ? activeCurrency.rateFromInr.toFixed(4) : activeCurrency.rateFromInr.toFixed(3)} {activeCurrency.code}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Balance</span>
            <div className="text-base font-extrabold text-white mt-0.5 truncate">
              {formatCurrency(totalBalance)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-emerald-400/80 uppercase block font-sans">Monthly Income</span>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5 truncate">
              +{formatCurrency(monthlyIncome)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-rose-400/80 uppercase block font-sans">Monthly Expenses</span>
            <div className="text-base font-extrabold text-rose-400 mt-0.5 truncate">
              -{formatCurrency(monthlyExpenses)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-purple-400/80 uppercase block font-sans">Net Savings</span>
            <div className="text-base font-extrabold text-purple-400 mt-0.5 truncate">
              {formatCurrency(totalSavings)}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Forex Conversion vs 1:1 Display */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            Conversion Calculation Mode
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Controls how amounts scale across the dashboard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConversionMode('convert_fx')}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              conversionMode === 'convert_fx'
                ? 'bg-teal-500/15 border-teal-500/60 text-white shadow-md shadow-teal-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                Live Forex FX Conversion (Dynamic)
              </span>
              {conversionMode === 'convert_fx' && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dynamically converts monetary amounts based on real-time foreign exchange reference rates. (e.g. ₹12,480 → {formatCurrency(12480, { forceMode: 'convert_fx' })})
            </p>
          </button>

          <button
            type="button"
            onClick={() => setConversionMode('symbol_only')}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              conversionMode === 'symbol_only'
                ? 'bg-indigo-500/15 border-indigo-500/60 text-white shadow-md shadow-indigo-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Symbol & Format Only (1:1 Ledger)
              </span>
              {conversionMode === 'symbol_only' && (
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintains raw account amounts and only updates currency symbols and decimal notation. (e.g. {activeCurrency.symbol}12,480)
            </p>
          </button>
        </div>
      </div>

      {/* Quick Select Popular Currencies */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Popular Currencies
        </span>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CURRENCIES.filter((c) => c.popular).map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelectCurrency(c.code)}
                className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/20 font-bold scale-[1.02]'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-sm">{c.flag}</span>
                <span>{c.code}</span>
                <span className={isSelected ? 'text-slate-950 font-extrabold' : 'text-teal-400'}>
                  {c.symbol}
                </span>
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by currency code, country, or symbol (e.g., USD, Yen, Euro, ₹)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700 focus:border-teal-500/60 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Currencies' },
                { id: 'popular', label: 'Popular' },
                { id: 'asia_me', label: 'Asia & ME' },
                { id: 'europe', label: 'Europe' },
                { id: 'americas', label: 'Americas' },
              ] as const
            ).map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => setRegionFilter(rf.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  regionFilter === rf.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-950/50 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCurrencies.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelectCurrency(c.code)}
                className={`p-3.5 rounded-xl border text-left transition-all relative group ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-white font-mono">{c.code}</span>
                        <span className="text-xs font-bold text-teal-400 font-mono px-1.5 py-0.2 rounded bg-teal-500/10">
                          {c.symbol}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                        {c.name}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="p-1 rounded-full bg-teal-500 text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{c.country}</span>
                  <span className="text-slate-300">
                    {c.code === 'INR' ? 'Base Currency (1.0x)' : `1 ${c.code} = ₹${c.rateToInr.toFixed(2)}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredCurrencies.length === 0 && (
          <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
            <Info className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-300 font-medium">No currencies found matching "{searchFilter}"</p>
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                setRegionFilter('all');
              }}
              className="text-xs text-teal-400 hover:underline font-mono"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Quick Action & Reset to Default */}
      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>
            Current selection: <strong className="text-white">{activeCurrency.name} ({activeCurrency.code})</strong> — Saved automatically to profile & database.
          </span>
        </div>

        {currency !== 'INR' && (
          <button
            type="button"
            onClick={() => handleSelectCurrency('INR')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3 text-teal-400" />
            <span>Reset to INR (₹)</span>
          </button>
        )}
      </div>
    </div>
  );
};
