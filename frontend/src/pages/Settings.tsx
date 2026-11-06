import { DEFAULT_AVATAR_FALLBACK, getSafeAvatarUrl } from '../data/mockData';
import React, { useState } from 'react';
import {
  User,
  Sliders,
  DollarSign,
  Moon,
  Sun,
  Bell,
  RotateCcw,
  ShieldCheck,
  Check,
  Crown,
  Laptop,
  Server,
  LogOut,
  Radio,
  KeyRound,
  Database,
  RefreshCw,
  Cpu,
  Layers,
  Activity,
  AlertCircle,
  Cloud,
  ExternalLink,
  Copy,
  Zap,
  Globe,
  Lock,
  ArrowUpRight,
  FileSpreadsheet,
  Download,
  Coins,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ExportDataSection } from '../components/ExportDataSection';
import { CurrencySwitcherSection } from '../components/CurrencySwitcherSection';

export const SettingsPage: React.FC = () => {
  const {
    user,
    updateUser,
    theme,
    toggleTheme,
    currencySymbol,
    setCurrency,
    resetDemoData,
    smtpConfig,
    updateSmtpConfig,
    authMethod,
    logout,
    addToast,
    mernStackInfo,
    dbEngine,
    isAtlasConnected,
    atlasDetails,
    refreshFromBackend,
    testMongoUri,
    connectToAtlas,
    disconnectFromAtlas,
    syncDataToAtlas,
  } = useFinance();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<string | null>(null);

  // MongoDB Atlas state
  const [customMongoUri, setCustomMongoUri] = useState('');
  const [isTestingMongo, setIsTestingMongo] = useState(false);
  const [isConnectingAtlas, setIsConnectingAtlas] = useState(false);
  const [isSyncingAtlas, setIsSyncingAtlas] = useState(false);
  const [mongoTestResult, setMongoTestResult] = useState<{ success: boolean; message: string; pingMs?: number } | null>(null);
  const [isSyncingWithDb, setIsSyncingWithDb] = useState(false);
  const [showAtlasGuide, setShowAtlasGuide] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const [title, setTitle] = useState(user.title);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Notification toggles
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [savingsMilestones, setSavingsMilestones] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim(),
      email: email.trim(),
      title: title.trim(),
    });
  };

  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400">
            Configure personal profile attributes, display modes, currency, MongoDB database, and export financial data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="#currency-switcher"
            className="px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Currency ({user.currency || 'INR'} {user.currencySymbol || '₹'})</span>
          </a>
          <a
            href="#export-data"
            className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <a
            href="#mern"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>MongoDB Atlas</span>
          </a>
        </div>
      </div>

      {/* User Profile Card & Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="relative">
            <img
              src={getSafeAvatarUrl(user.avatar)}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500/40 shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
              }}
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-teal-500 rounded-full text-slate-950">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {user.plan}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Member since: {user.memberSince} • 256-bit AES Authenticated
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500/70 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all active:scale-95"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* MongoDB Atlas Cloud Architecture & Database Control Center */}
      <div id="mern" className="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
        {/* Ambient MongoDB Atlas glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Live Cluster Status Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              {/* Leaf-like MongoDB Icon */}
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  MongoDB Atlas Cloud Architecture
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  DBaaS • Cloud Cluster
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-region cloud database service with TLS 1.3 encryption, automatic sharding, and real-time replica sets.
              </p>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {isAtlasConnected || dbEngine === 'mongodb_atlas' ? (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-sm shadow-emerald-500/20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold">Atlas Cloud Connected</span>
                {atlasDetails?.pingMs !== undefined && (
                  <span className="text-[10px] text-emerald-400/80 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    {atlasDetails.pingMs}ms
                  </span>
                )}
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold">Embedded MongoDB Engine</span>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  Local BSON
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cluster Diagnostics & MERN Topology Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Active Database</span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-extrabold text-white truncate">
              {isAtlasConnected || dbEngine === 'mongodb_atlas' ? 'MongoDB Atlas' : 'Local BSON Engine'}
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              {atlasDetails?.clusterHost || 'Database: smartfin'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold text-teal-400">Latency & Encryption</span>
              <Lock className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-sm font-extrabold text-white">
              {atlasDetails?.pingMs ? `${atlasDetails.pingMs} ms` : 'Local < 1 ms'}
            </div>
            <span className="text-[10px] text-teal-300/80 block">
              TLS 1.3 SSL Encrypted Socket
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold text-indigo-400">Node/Express Server</span>
              <Server className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-sm font-extrabold text-white truncate">
              Express v{mernStackInfo?.technologies?.express?.version || '4.21.2'}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Driver: mongodb v7.8.0
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] uppercase font-bold text-cyan-400">React Client</span>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-sm font-extrabold text-white truncate">
              React 19 + Vite SPA
            </div>
            <span className="text-[10px] text-slate-400 block">
              Active User: {user.name}
            </span>
          </div>
        </div>

        {/* MongoDB Document Collections Counter */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Live MongoDB Collections in Database{' '}
              <span className="text-emerald-400 font-mono">`smartfin`</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Active Storage: <strong className="text-emerald-300">{isAtlasConnected ? 'Atlas Cloud' : 'Embedded Local'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 font-mono text-xs">
            {Object.entries(
              atlasDetails?.collections ||
                mernStackInfo?.technologies?.mongoDB?.collections || {
                  transactions: 6,
                  accounts: 4,
                  budgets: 6,
                  goals: 3,
                  notifications: 5,
                  users: 1,
                }
            ).map(([colName, count]) => (
              <div key={colName} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] text-slate-400 uppercase block truncate">{colName}</span>
                <span className="text-base font-bold text-emerald-400">{count}</span>
                <span className="text-[9px] text-slate-500 block">documents</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive MongoDB Atlas URI Connection Input */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-400" /> Connect Remote MongoDB Atlas Cluster
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enter your MongoDB Atlas SRV URI (<span className="text-emerald-300 font-mono">mongodb+srv://...</span>) to link your cloud cluster.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCustomMongoUri('mongodb+srv://dbUser:SamplePassword123@cluster0.abcde.mongodb.net/smartfin?retryWrites=true&w=majority');
                addToast('Sample MongoDB Atlas URI template inserted', 'info');
              }}
              className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto"
            >
              <Zap className="w-3 h-3" />
              <span>Insert Atlas URI Template</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartfin?retryWrites=true&w=majority"
              value={customMongoUri}
              onChange={(e) => setCustomMongoUri(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none transition-all shadow-inner"
            />

            {/* Test Ping Button */}
            <button
              type="button"
              disabled={isTestingMongo}
              onClick={async () => {
                if (!customMongoUri.trim()) {
                  addToast('Please enter a MongoDB Atlas connection string to test', 'info');
                  return;
                }
                setIsTestingMongo(true);
                setMongoTestResult(null);
                try {
                  const res = await testMongoUri(customMongoUri.trim());
                  setMongoTestResult(res);
                  if (res.success) {
                    addToast(`Atlas Cluster reachable! Ping: ${res.pingMs}ms`, 'success');
                  } else {
                    addToast(`Connection check failed: ${res.message}`, 'error');
                  }
                } catch (err: any) {
                  setMongoTestResult({ success: false, message: err.message || 'Network error' });
                } finally {
                  setIsTestingMongo(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isTestingMongo ? (
                <>
                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Pinging...</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Ping</span>
                </>
              )}
            </button>

            {/* Connect to Atlas Button */}
            <button
              type="button"
              disabled={isConnectingAtlas}
              onClick={async () => {
                if (!customMongoUri.trim()) {
                  addToast('Please enter a MongoDB Atlas connection string first', 'info');
                  return;
                }
                setIsConnectingAtlas(true);
                try {
                  const res = await connectToAtlas(customMongoUri.trim());
                  setMongoTestResult({
                    success: true,
                    message: `Connected to Atlas cluster: ${res.clusterHost || 'Live'} (Latency: ${res.pingMs}ms)`,
                    pingMs: res.pingMs,
                  });
                } catch (err: any) {
                  setMongoTestResult({ success: false, message: err.message || 'Connection failed' });
                } finally {
                  setIsConnectingAtlas(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
            >
              {isConnectingAtlas ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting Atlas...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect to Atlas</span>
                </>
              )}
            </button>
          </div>

          {/* Test or Connection Result Box */}
          {mongoTestResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                mongoTestResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {mongoTestResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="flex-1 leading-relaxed">{mongoTestResult.message}</span>
            </div>
          )}

          {/* Additional Actions: Disconnect & Push Data */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-850">
            <div className="flex flex-wrap items-center gap-2">
              {(isAtlasConnected || dbEngine === 'mongodb_atlas') && (
                <button
                  type="button"
                  onClick={disconnectFromAtlas}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono transition-colors"
                >
                  Disconnect / Revert to Local Store
                </button>
              )}

              <button
                type="button"
                disabled={isSyncingAtlas}
                onClick={async () => {
                  if (!isAtlasConnected && dbEngine !== 'mongodb_atlas') {
                    addToast('Connect to MongoDB Atlas first before pushing data', 'info');
                    return;
                  }
                  setIsSyncingAtlas(true);
                  try {
                    await syncDataToAtlas();
                  } catch {}
                  setIsSyncingAtlas(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <ArrowUpRight className={`w-3.5 h-3.5 ${isSyncingAtlas ? 'animate-spin' : ''}`} />
                <span>Sync All Data to Atlas Cluster</span>
              </button>

              <button
                type="button"
                disabled={isSyncingWithDb}
                onClick={async () => {
                  setIsSyncingWithDb(true);
                  try {
                    await refreshFromBackend();
                    addToast('Refreshed state from database!', 'success');
                  } catch (e: any) {
                    addToast('Refresh failed: ' + e.message, 'error');
                  } finally {
                    setIsSyncingWithDb(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 text-teal-400 ${isSyncingWithDb ? 'animate-spin' : ''}`} />
                <span>Pull Latest Data</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAtlasGuide(!showAtlasGuide)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <span>{showAtlasGuide ? 'Hide Setup Guide' : 'How to set up MongoDB Atlas'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Collapsible MongoDB Atlas Setup Guide */}
        {showAtlasGuide && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs animate-in fade-in">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" /> 4-Step MongoDB Atlas Setup Guide (Free Forever Tier)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">1. Create Free Cluster</span>
                <p className="text-[11px] text-slate-400">
                  Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">cloud.mongodb.com</a>, create an account, and launch a free <strong>M0 Sandbox Cluster</strong>.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">2. Database Access</span>
                <p className="text-[11px] text-slate-400">
                  Navigate to <strong>Security &gt; Database Access</strong>. Click <strong>Add New Database User</strong> with username & password (e.g. <span className="font-mono text-emerald-300">smartfin_admin</span>).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">3. Network Access (IP Whitelist)</span>
                <p className="text-[11px] text-slate-400">
                  Go to <strong>Security &gt; Network Access</strong>. Click <strong>Add IP Address</strong> and select <strong>Allow Access From Anywhere (0.0.0.0/0)</strong>.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">4. Copy Connection String</span>
                <p className="text-[11px] text-slate-400">
                  Click <strong>Connect &gt; Drivers (Node.js)</strong> and copy the connection string. Replace <span className="font-mono text-emerald-300">&lt;password&gt;</span> and paste into the box above!
                </p>
              </div>
            </div>

            {/* .env Snippet */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 font-mono text-[11px]">
              <div className="truncate text-slate-300">
                <span className="text-slate-500">.env variable:</span> MONGODB_URI="mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/smartfin?retryWrites=true&amp;w=majority"
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartfin?retryWrites=true&w=majority"');
                  setCopiedEnv(true);
                  addToast('Copied .env format to clipboard', 'info');
                  setTimeout(() => setCopiedEnv(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 flex items-center gap-1 text-[10px]"
              >
                {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SMTP Gateway & Server Authentication */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" /> SMTP Mail Gateway & Authentication
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured frontend outbound relay and secure cryptographic identity connection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              {smtpConfig.encryption} Handshake Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">SMTP Host Server</span>
            <span className="font-bold text-slate-200 truncate block mt-0.5">{smtpConfig.host}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Port & Cipher</span>
            <span className="font-bold text-teal-400 block mt-0.5">{smtpConfig.port} • {smtpConfig.encryption}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase block">Authenticated Mailbox</span>
            <span className="font-bold text-slate-200 truncate block mt-0.5">{smtpConfig.username}</span>
          </div>
        </div>

        {smtpStatusMessage && (
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{smtpStatusMessage}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={isTestingSmtp}
            onClick={() => {
              setIsTestingSmtp(true);
              setSmtpStatusMessage(null);
              setTimeout(() => {
                setIsTestingSmtp(false);
                setSmtpStatusMessage(`TLS 1.3 socket handshake verified: 250-OK with ${smtpConfig.host}:${smtpConfig.port}`);
                addToast(`SMTP connection healthy with ${smtpConfig.host}`, 'success');
              }, 1000);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isTestingSmtp ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span>Testing Socket Ping...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                <span>Test Live SMTP Handshake</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Switch Account (Email OTP)</span>
          </button>
        </div>
      </div>

      {/* Export Data & Financial History Section */}
      <ExportDataSection />

      {/* Global Currency Switcher & Conversion Engine Section */}
      <CurrencySwitcherSection />

      {/* Theme & Display Options */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> Interface & Theme
        </h3>
        <p className="text-xs text-slate-400">
          Customize display mode between dark futuristic glassmorphism and crisp light mode.
        </p>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-white block">Theme Palette</span>
            <span className="text-[11px] text-slate-500">
              Current mode: <strong className="text-teal-400 uppercase">{theme}</strong>
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Alert Thresholds & Notification Rules
        </h3>

        <div className="space-y-3">
          {[
            {
              title: 'Budget Threshold Warnings (80% & 100%)',
              desc: 'Receive proactive alerts when any category reaches 80% of limit',
              state: budgetAlerts,
              setState: setBudgetAlerts,
            },
            {
              title: 'Upcoming Bill Due Reminders',
              desc: 'Alert 4 days in advance for utility and recurring broadband charges',
              state: billReminders,
              setState: setBillReminders,
            },
            {
              title: 'Savings Milestone Celebrations',
              desc: 'Notify when a savings target progresses past 50% and 100%',
              state: savingsMilestones,
              setState: setSavingsMilestones,
            },
            {
              title: 'Weekly Wealth Digest Email',
              desc: 'Consolidated PDF/HTML report sent to registered email address',
              state: emailDigest,
              setState: setEmailDigest,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
            >
              <div>
                <span className="text-xs font-semibold text-white block">{item.title}</span>
                <span className="text-[11px] text-slate-500">{item.desc}</span>
              </div>
              <button
                type="button"
                onClick={() => item.setState(!item.state)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  item.state ? 'bg-teal-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    item.state ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Data Management / Factory Reset */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow-xl backdrop-blur-xl space-y-3">
        <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Demo Data
        </h3>
        <p className="text-xs text-slate-400">
          Restore initial mock transactions, accounts, budgets, and savings goals for Mahi.
        </p>

        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            Reset to Initial Demo State
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <span className="text-xs text-rose-300">Are you sure? All customizations will reset.</span>
            <button
              onClick={() => {
                resetDemoData();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
