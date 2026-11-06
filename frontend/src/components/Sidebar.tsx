import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  LineChart,
  Bot,
  FileSpreadsheet,
  Bell,
  Settings,
  Sparkles,
  Crown,
  ChevronRight,
  ShieldCheck,
  X,
  LogOut,
  Globe,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, notifications, authMethod, logout, dbEngine } = useFinance();
  const unreadCount = notifications.filter((n) => !n.read).length;


  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Analytics', path: '/analytics', icon: LineChart },
    { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Smart' },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Cover Page', path: '/', icon: Globe },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col justify-between border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white/95 dark:bg-[#0c1220]/95 border-slate-200 dark:border-slate-800/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 shadow-xl lg:shadow-none`}
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-5">

          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                    SmartFin<span className="text-teal-400">+</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 tracking-wider uppercase">
                  Financial Intelligence
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 my-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500/15 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-teal-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                            {item.badge}
                          </span>
                        )}
                        {item.count !== undefined && item.count > 0 && (
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/90 text-white shadow-sm">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Premium Membership Card */}
          <div className="mt-6 mb-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-teal-500/20 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                <Crown className="w-3.5 h-3.5" />
                <span>{user.plan}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Unlimited automated spending audits & zero wire fees enabled.
            </p>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted
              </span>
              <span className="text-teal-400/90 flex items-center group-hover:translate-x-0.5 transition-transform">
                VIP Club <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* User Profile Card at Sidebar Footer */}
          <div className="mt-auto pt-3 border-t border-slate-800/80">
            <NavLink
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors group"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-teal-500/40 shadow-sm"
                  onError={(e) => {
                    // Fallback to avatar placeholder
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute bottom-0 right-0 ring-2 ring-slate-900" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white truncate font-sans">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-teal-400 font-medium font-mono px-1.5 py-0.5 rounded bg-teal-500/15 border border-teal-500/25">
                    {user.currency || 'INR'} {user.currencySymbol || '₹'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">
                  {user.title}
                </span>
              </div>
            </NavLink>

            {/* Switch Gateway / Logout Action */}
            <div className="flex items-center justify-between px-2 pt-2 mt-1 border-t border-slate-850 text-xs">
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {authMethod === 'smtp' ? 'SMTP Authenticated' : 'Active Session'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="text-[11px] text-slate-400 hover:text-rose-400 font-medium flex items-center gap-1 transition-colors p-1"
                title="Sign out or switch to SMTP Login"
              >
                <LogOut className="w-3 h-3" />
                <span>Switch / Sign Out</span>
              </button>
            </div>

            {/* MERN Stack Architecture Status */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">MERN</span>
                <span className="text-[10px] text-slate-500">Stack</span>
              </span>
              <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                {dbEngine === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Mongo + Express'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

