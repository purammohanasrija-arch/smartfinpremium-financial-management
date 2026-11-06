import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  Plus,
  ArrowRightLeft,
  Target,
  SlidersHorizontal,
  ChevronDown,
  X,
  CheckCircle,
  LogOut,
  Server,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ThemeToggle } from './ThemeToggle';

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenAddTransaction: () => void;
  onOpenSetBudget: () => void;
  onOpenAddGoal: () => void;
  onOpenTransfer: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSidebar,
  onOpenAddTransaction,
  onOpenSetBudget,
  onOpenAddGoal,
  onOpenTransfer,
}) => {
  const { user, searchQuery, setSearchQuery, notifications, markNotificationAsRead, logout, authMethod, dbEngine, isAtlasConnected, atlasDetails, mernStackInfo, activeCurrency, currencySymbol } = useFinance();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 gap-4">

        {/* Left: Mobile hamburger & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search merchants, categories, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 dark:bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-teal-500/60 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Global Currency Badge */}
          <NavLink
            to="/settings"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-teal-500/35 hover:border-teal-400 text-slate-300 text-xs font-mono transition-all group shadow-sm hover:shadow-teal-500/15"
            title={`Active Global Currency: ${activeCurrency?.name || 'Indian Rupee'} (${activeCurrency?.code || 'INR'}) — Click to open Currency Switcher`}
          >
            <span className="text-xs">{activeCurrency?.flag || '🇮🇳'}</span>
            <span className="font-bold text-teal-400 tracking-wider">
              {activeCurrency?.code || 'INR'}
            </span>
            <span className="text-[10px] text-teal-300 font-extrabold px-1 rounded bg-teal-500/20">
              {currencySymbol}
            </span>
          </NavLink>

          {/* MongoDB Atlas Cloud Live Status Badge */}
          <NavLink
            to="/settings"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/35 hover:border-emerald-400 text-slate-300 text-xs font-mono transition-all group shadow-sm hover:shadow-emerald-500/15"
            title={
              isAtlasConnected
                ? `Connected to MongoDB Atlas: ${atlasDetails?.clusterHost || 'Cloud Cluster'} (${atlasDetails?.pingMs || 0}ms)`
                : 'MongoDB: Local BSON Engine Active — Click to Connect MongoDB Atlas'
            }
          >
            <span className={`w-2 h-2 rounded-full ${isAtlasConnected ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'}`} />
            <span className="font-bold text-emerald-400 tracking-wider">
              {isAtlasConnected ? '🍃 Atlas Cloud' : '🍃 MongoDB'}
            </span>
            <span className="text-[10px] text-slate-400 hidden xl:inline">
              {isAtlasConnected && atlasDetails?.pingMs ? `${atlasDetails.pingMs}ms` : 'Database'}
            </span>
          </NavLink>

          {/* Quick Action: Add Transaction */}
          <button
            onClick={onOpenAddTransaction}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <NavLink
                    to="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    View All
                  </NavLink>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 mt-3 pr-1">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                        n.read
                          ? 'bg-slate-800/30 border-slate-800 text-slate-400'
                          : 'bg-slate-800/80 border-teal-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium mb-1">
                        <span className={n.read ? 'text-slate-300' : 'text-teal-300 font-semibold'}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{n.date}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications at this time
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-left"
            >
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-teal-400/40"
              />
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-teal-400 font-medium leading-none">
                  {user.plan}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <NavLink
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
                  Account Settings
                </NavLink>
                <NavLink
                  to="/assistant"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  AI Advisor
                </NavLink>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {authMethod === 'otp' ? 'Email OTP' : 'MERN Stack'}
                    </span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Scenic Gradient Banner */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-3 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-purple-500/10 dark:from-teal-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border-t border-slate-200 dark:border-slate-800/60 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">

          <div className="flex items-center gap-2.5">
            <span className="text-base sm:text-lg">🌸</span>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Good Morning, {user.name}!
              </h2>
              <p className="text-xs text-teal-300/80 italic font-medium">
                “Small steps today lead to big financial freedom tomorrow.”
              </p>
            </div>
          </div>

          {/* Quick Action Buttons Strip */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={onOpenAddTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={onOpenSetBudget}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Set Budget</span>
            </button>
            <button
              onClick={onOpenAddGoal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
            >
              <Target className="w-3 h-3" />
              <span>Add Goal</span>
            </button>
            <button
              onClick={onOpenTransfer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Transfer Money</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
