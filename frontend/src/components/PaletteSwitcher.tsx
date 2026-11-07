import React, { useState, useRef, useEffect } from 'react';
import { useFinance, AVAILABLE_PALETTES, ColorPalette } from '../context/FinanceContext';
import { Palette, Check, Sparkles } from 'lucide-react';

interface PaletteSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'grid';
  showLabel?: boolean;
}

export const PaletteSwitcher: React.FC<PaletteSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  showLabel = false,
}) => {
  const { palette, setPalette, activePaletteInfo } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // If grid variant (for Settings page)
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 ${className}`}>
        {AVAILABLE_PALETTES.map((pal) => {
          const isSelected = pal.id === palette;
          return (
            <button
              key={pal.id}
              type="button"
              onClick={() => setPalette(pal.id)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 border relative group overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 dark:bg-slate-900/90 border-slate-700 shadow-lg ring-2 ring-offset-2 ring-offset-slate-950 ' +
                    pal.previewRing
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${pal.primary}, ${pal.secondary}, ${pal.accent})`,
                }}
              />

              <div className="space-y-3 pt-1">
                {/* Header with Title and Selected Checkmark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.primary }} />
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {pal.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-1 shadow-sm"
                      style={{ backgroundColor: pal.primary }}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> Active
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-medium">
                  {pal.tagline}
                </p>

                {/* Color Swatch Triad */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="w-5 h-5 rounded-lg shadow-sm border border-black/10"
                    style={{ backgroundColor: pal.primary }}
                    title={`Primary: ${pal.primary}`}
                  />
                  <div
                    className="w-5 h-5 rounded-lg shadow-sm border border-black/10"
                    style={{ backgroundColor: pal.secondary }}
                    title={`Secondary: ${pal.secondary}`}
                  />
                  <div
                    className="w-5 h-5 rounded-lg shadow-sm border border-black/10"
                    style={{ backgroundColor: pal.accent }}
                    title={`Accent: ${pal.accent}`}
                  />
                </div>

                {/* Mini UI Simulation Mockup */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">Simulated Balance</span>
                    <span className="font-bold font-mono" style={{ color: pal.primary }}>
                      $24,850
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: '75%',
                        background: `linear-gradient(90deg, ${pal.primary}, ${pal.secondary})`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button at Bottom */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <span
                  className="font-semibold flex items-center gap-1"
                  style={{ color: isSelected ? pal.primary : undefined }}
                >
                  <Sparkles className="w-3 h-3" />
                  {isSelected ? 'Currently Applied' : 'Click to Apply'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Default Dropdown Trigger for Topbar / LandingPage
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="relative p-2 rounded-xl transition-all duration-200 border bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 shadow-sm"
        title={`Active Palette: ${activePaletteInfo.name} — Click to switch full-app color theme`}
        aria-label="Change color palette theme"
      >
        <Palette className="w-4 h-4" />

        {/* Live Swatch Dots */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
            style={{ backgroundColor: activePaletteInfo.primary }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 shadow-xs"
            style={{ backgroundColor: activePaletteInfo.secondary }}
          />
        </div>

        {showLabel && (
          <span className="text-xs font-semibold hidden md:inline ml-0.5">
            {activePaletteInfo.name}
          </span>
        )}
      </button>

      {/* Floating Palette Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-teal-400" />
                Color Theme Palettes
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Instant real-time app color transformation
              </p>
            </div>
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white shadow-xs"
              style={{ backgroundColor: activePaletteInfo.primary }}
            >
              5 Themes
            </span>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {AVAILABLE_PALETTES.map((pal) => {
              const isSelected = pal.id === palette;
              return (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => {
                    setPalette(pal.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch Pill */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center p-1 shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})`,
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white/90" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-400 transition-colors">
                        {pal.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                        {pal.tagline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* 3 color dots */}
                    <div className="flex items-center -space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800" style={{ backgroundColor: pal.primary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800" style={{ backgroundColor: pal.secondary }} />
                      <span className="w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800" style={{ backgroundColor: pal.accent }} />
                    </div>

                    {isSelected && (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 ml-1 shadow-xs"
                        style={{ backgroundColor: pal.primary }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 px-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Current: <strong className="text-slate-800 dark:text-slate-200">{activePaletteInfo.name}</strong></span>
            <span className="text-[9px] text-slate-400">Saved to profile</span>
          </div>
        </div>
      )}
    </div>
  );
};
