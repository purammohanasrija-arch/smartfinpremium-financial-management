import React from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Receipt,
  Sparkles,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { NotificationItem } from '../data/mockData';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
  } = useFinance();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget':
        return AlertTriangle;
      case 'bill':
        return Receipt;
      case 'savings':
        return Sparkles;
      case 'transaction':
        return ArrowRightLeft;
      default:
        return Bell;
    }
  };

  const getTypeStyles = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'bill':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'savings':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
      case 'transaction':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry, bill reminders, threshold warnings, and savings milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={clearAllNotifications}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = getNotificationIcon(n.type);
          const typeStyle = getTypeStyles(n.type);

          return (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 shadow-md ${
                n.read
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/95 border-teal-500/40 text-slate-200 shadow-teal-500/5'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${typeStyle}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        n.read ? 'text-slate-300' : 'text-white'
                      }`}
                    >
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {n.date}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{n.message}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(n.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-teal-400 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(n.id);
                  }}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">All caught up!</p>
            <p className="text-xs">No active alerts, warnings, or notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
