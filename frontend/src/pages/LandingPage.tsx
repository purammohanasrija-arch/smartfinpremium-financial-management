import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Wallet,
  PieChart,
  Target,
  ArrowLeftRight,
  LineChart,
  Bot,
  Zap,
  CheckCircle2,
  Lock,
  Globe,
  Star,
  Users,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Layers,
  Award,
  DollarSign,
  Send,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Sliders,
  Clock,
  Cpu,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { LegalModal } from '../components/modals/LegalModal';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, login, logout, addToast } = useFinance();
  const navigate = useNavigate();

  // Mobile navigation drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Legal modal state
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Interactive Calculator State
  const [monthlySaving, setMonthlySaving] = useState(15000);
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(12);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Calculator computations
  // Compound Interest: FV = P * [((1 + r)^n - 1) / r] * (1 + r)
  const calculateWealth = () => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = years * 12;
    const totalInvested = monthlySaving * totalMonths;
    const futureValue =
      monthlySaving *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate);
    const wealthGain = Math.max(0, futureValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      wealthGain: Math.round(wealthGain),
    };
  };

  const wealthData = calculateWealth();

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleInstantDemo = async () => {
    await login('demo');
    navigate('/dashboard');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.email || !contactForm.message) {
      addToast('Please enter your email and message.', 'error');
      return;
    }
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
      addToast('Thank you! Your message has been routed to our fintech concierge.', 'success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200 overflow-x-hidden font-sans">
      {/* =========================================================================
          AMBIENT FINTECH BACKGROUND GLOWS & MESH
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-center Emerald glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[55rem] h-[35rem] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl opacity-75 dark:opacity-50" />
        {/* Subtle mint orb on right */}
        <div className="absolute top-1/4 -right-20 w-[32rem] h-[32rem] bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-3xl animate-pulse-glow" />
        {/* Subtle gold accent orb on bottom left */}
        <div className="absolute top-2/3 -left-20 w-[30rem] h-[30rem] bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl" />
        {/* Subtle fine tech grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] dark:opacity-[0.06]" />
      </div>

      {/* =========================================================================
          1. NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#070b13]/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-[1.5px] shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center">
                SmartFin<span className="text-emerald-500 dark:text-emerald-400">+</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Financial Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a
              href="#home"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#calculator"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Wealth Planner
            </a>
            <a
              href="#about"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Desktop Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs tracking-tight shadow-md shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 fintech-emerald-glow"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                How It Works
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                Wealth Planner
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                About
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-emerald-500 py-1"
              >
                Contact
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 text-xs font-semibold text-rose-500 text-center"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs text-center shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION & 3D DASHBOARD PREVIEW
          ========================================================================= */}
      <section id="home" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Header Content */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-14">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Next-Gen FinTech Intelligence 2.0</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-amber-600 dark:text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                MERN Stack
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.15] mb-6">
              Take Control of Your{' '}
              <span className="fintech-gradient-text inline-block">
                Financial Future.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mb-8">
              Manage your money smarter, track expenses effortlessly, and achieve your financial
              goals with automated intelligence and bank-grade security.
            </p>

            {/* Dual Hero CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-tight shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 fintech-emerald-glow"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight backdrop-blur-md shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Account</span>
              </Link>

              <button
                type="button"
                onClick={handleInstantDemo}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Demo (Mahi)</span>
              </button>
            </div>

            {/* Trust and Social Proof Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>256-Bit Bank Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Passwordless OTP Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>12+ Global Currencies</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>4.9/5 Rating (3,500+ Users)</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. 3D FINANCIAL DASHBOARD SHOWCASE & 4 FLOATING CARDS
              ========================================================================= */}
          <div className="relative max-w-5xl mx-auto mt-6">
            {/* Ambient Back Glow for Dashboard */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-amber-500/15 rounded-3xl blur-3xl -z-10 transform -translate-y-4" />

            {/* 3D Perspective Tilt Container */}
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-slate-200/90 via-slate-200/40 to-slate-200/10 dark:from-slate-700/80 dark:via-slate-800/40 dark:to-slate-900/20 shadow-2xl backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/80">
              {/* Window Header (macOS style) */}
              <div className="rounded-t-2xl bg-white dark:bg-[#0c1220] px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    https://app.smartfin.io/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    Live System Active
                  </span>
                </div>
              </div>

              {/* Window Body: Real Live Simulated Financial Dashboard UI */}
              <div className="rounded-b-2xl bg-white/95 dark:bg-[#090e1a]/95 p-4 sm:p-6 lg:p-7">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {/* Balance */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span className="font-medium">Total Balance</span>
                      <Wallet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ₹1,84,520
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+14.2% this month</span>
                    </div>
                  </div>

                  {/* Monthly Income */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span className="font-medium">Monthly Income</span>
                      <TrendingUp className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ₹85,000
                    </div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
                      Direct Deposit Verified
                    </div>
                  </div>

                  {/* Monthly Expenses */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span className="font-medium">Monthly Expenses</span>
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ₹32,450
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      62% under budget cap
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span className="font-medium">FinHealth Score</span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      88<span className="text-xs text-slate-400">/100</span>
                    </div>
                    <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                      Grade A • Prime
                    </div>
                  </div>
                </div>

                {/* Simulated Chart & Breakdown Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  {/* Financial Flow Simulated SVG Area Chart */}
                  <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Cashflow Trajectory (Last 6 Months)
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Income vs Expense Ratio
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-500">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                        </span>
                        <span className="flex items-center gap-1 text-rose-500">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Expenses
                        </span>
                      </div>
                    </div>

                    {/* SVG Graphic Curve */}
                    <div className="h-40 w-full relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                        <defs>
                          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Income Area & Line */}
                        <path
                          d="M 0 90 Q 80 80, 160 50 T 320 40 T 500 20 L 500 150 L 0 150 Z"
                          fill="url(#incomeGrad)"
                        />
                        <path
                          d="M 0 90 Q 80 80, 160 50 T 320 40 T 500 20"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Expense Area & Line */}
                        <path
                          d="M 0 110 Q 80 100, 160 85 T 320 80 T 500 65 L 500 150 L 0 150 Z"
                          fill="url(#expenseGrad)"
                        />
                        <path
                          d="M 0 110 Q 80 100, 160 85 T 320 80 T 500 65"
                          fill="none"
                          stroke="#f43f5e"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="4 4"
                        />

                        {/* Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="#94a3b8" strokeOpacity="0.1" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="#94a3b8" strokeOpacity="0.1" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#94a3b8" strokeOpacity="0.1" />
                      </svg>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>May 2026</span>
                      <span>Jun 2026</span>
                      <span>Jul 2026</span>
                      <span>Aug 2026</span>
                      <span>Sep 2026</span>
                      <span className="text-emerald-500 font-bold">Oct 2026</span>
                    </div>
                  </div>

                  {/* Recent Transactions List */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                        Recent Transactions
                      </h4>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center text-[10px] font-bold">
                              🍱
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Zomato Gourmet
                              </div>
                              <div className="text-[10px] text-slate-400">Food & Dining</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-rose-500">-₹640</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px] font-bold">
                              💼
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Salary Credit
                              </div>
                              <div className="text-[10px] text-slate-400">TechCorp base</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-emerald-500">+₹4,500</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-[10px] font-bold">
                              🛍️
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Amazon India
                              </div>
                              <div className="text-[10px] text-slate-400">Electronics</div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-rose-500">-₹1,200</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Automated categorization</span>
                      <span className="text-emerald-500 font-bold">100% Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                THE 4 FLOATING CARDS (Positioned with CSS Animations)
                ========================================================================= */}
            {/* 1. Total Balance Card (Top-Left) */}
            <div className="hidden lg:flex absolute -top-8 -left-12 p-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-float-1 z-20 w-60 fintech-emerald-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Balance
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    ₹1,84,520
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +14.2% Growth
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Monthly Income Card (Top-Right) */}
            <div className="hidden lg:flex absolute -top-8 -right-12 p-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-teal-500/30 shadow-2xl backdrop-blur-xl animate-float-2 z-20 w-60 fintech-mint-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Monthly Income
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    ₹85,000
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    Direct Corporate Deposit
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Monthly Expenses Card (Bottom-Left) */}
            <div className="hidden lg:flex absolute -bottom-8 -left-10 p-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-rose-500/30 shadow-2xl backdrop-blur-xl animate-float-3 z-20 w-64">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Monthly Expenses
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    ₹32,450
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    62% of Budget Cap
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Savings Growth Card (Bottom-Right) */}
            <div className="hidden lg:flex absolute -bottom-8 -right-10 p-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl animate-float-4 z-20 w-64 fintech-gold-glow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Savings Growth
                  </div>
                  <div className="text-lg font-black font-mono text-amber-500">
                    +28.5% Target
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    ₹52,550 Saved in Oct 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. FEATURES SECTION
          ========================================================================= */}
      <section id="features" className="py-20 lg:py-28 relative z-10 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
              Comprehensive Financial Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              Everything You Need to Master Your Wealth.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed with the analytical rigor of enterprise banking systems, paired with the
              effortless elegance of modern consumer technology.
            </p>
          </div>

          {/* Feature Cards Grid (6 Primary + 2 Advanced) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Expense Tracking */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Expense Tracking
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Automated multi-category expense categorization with intelligent merchant tagging,
                recurring subscription detection, and payment method mapping.
              </p>
              <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
                <span>Instant categorization</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Income Management */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Income Management
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Track diversified revenue streams from primary corporate salary, freelance
                retainers, dividend yields, and capital gains with timeline projections.
              </p>
              <div className="flex items-center text-xs font-bold text-teal-600 dark:text-teal-400 gap-1">
                <span>Multi-stream tracking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Budget Planning */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Budget Planning
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Dynamic envelope budgeting with automated threshold warnings at 80% and 100% capacity.
                Prevent overspending before it impacts your long-term goals.
              </p>
              <div className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1">
                <span>Threshold protection</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4. Financial Analytics */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Financial Analytics
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Deep visual insights featuring interactive Recharts, 6-month historical comparisons,
                spending distribution donuts, and cash flow velocity metrics.
              </p>
              <div className="flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 gap-1">
                <span>Deep visual analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5. Savings Goals */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Savings Goals
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Set milestones for Emergency Funds, Dream Vacations, or Asset Down Payments. Watch
                your progress bars update in real time with automated milestone celebrations.
              </p>
              <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1">
                <span>Milestone accelerators</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Transaction History */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Transaction History
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Instant search by merchant or note, multi-field filtering, audit logs, and 1-click
                clean CSV and Excel export formatted for tax compliance.
              </p>
              <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1">
                <span>Audit-grade logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW IT WORKS
          ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
              Simplicity Meets Power
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              Three Simple Steps to Financial Freedom
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Get started in under two minutes. No tedious paperwork or complex banking setup
              required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl mb-6 shadow-sm">
                01
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                Create your account.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Sign up in seconds using 1-click Google authentication or our passwordless email OTP
                gateway. Your credentials are fully protected with 256-bit encryption.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
                ⚡ Takes less than 15 seconds
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl relative group">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xl mb-6 shadow-sm">
                02
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                Track your income and expenses.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Consolidate bank accounts, UPI wallets, and cash reserves. Record transactions
                effortlessly with instant merchant identification and smart category tags.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
                🏷️ Automated category tagging
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl relative group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl mb-6 shadow-sm">
                03
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
                Analyze your finances and save smarter.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Leverage automated financial health diagnostics, monitor savings momentum, and make
                confident financial decisions backed by real-time predictive insights.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
                📈 Watch your wealth compound
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. INTERACTIVE WEALTH PLANNER / FINANCIAL FREEDOM CALCULATOR
          ========================================================================= */}
      <section id="calculator" className="py-20 lg:py-28 relative z-10 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
              Interactive Wealth Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              See How Fast Your Savings Can Grow.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Slide to test different monthly contributions and discover how compounding turns small
              daily habits into life-changing financial security.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Sliders Area */}
              <div className="space-y-6">
                {/* Monthly Saving Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">
                      Monthly Savings
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{monthlySaving.toLocaleString('en-IN')}/month
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="100000"
                    step="1000"
                    value={monthlySaving}
                    onChange={(e) => setMonthlySaving(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹2,000</span>
                    <span>₹50,000</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>

                {/* Investment Horizon Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">
                      Time Horizon
                    </span>
                    <span className="font-mono text-teal-600 dark:text-teal-400 text-sm">
                      {years} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-teal-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1 Year</span>
                    <span>10 Years</span>
                    <span>25 Years</span>
                  </div>
                </div>

                {/* Expected Annual Return */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">
                      Expected Annual Return
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 text-sm">
                      {interestRate}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>6% (FD/Bonds)</span>
                    <span>12% (Equity/Index)</span>
                    <span>18% (Growth)</span>
                  </div>
                </div>
              </div>

              {/* Projected Results Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Projected Future Wealth
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 mb-4">
                    {formatLakhs(wealthData.futureValue)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Total Invested
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {formatLakhs(wealthData.totalInvested)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-500 uppercase font-semibold block">
                        Wealth Gained
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        +{formatLakhs(wealthData.wealthGain)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Build This Portfolio in SmartFin+</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. ABOUT US & BANK-GRADE SECURITY
          ========================================================================= */}
      <section id="about" className="py-20 lg:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* About Text */}
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
                Our Mission & Standards
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4 mb-5">
                Engineered for Uncompromising Security and Privacy.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                SmartFin+ was born from a simple conviction: managing your personal wealth should be
                as intuitive, responsive, and secure as the trading terminals used by Wall Street. We
                combine high-performance MERN architecture with bank-grade encryption to safeguard
                every byte of your financial life.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Zero Data-Selling Guarantee
                    </h4>
                    <p className="text-xs text-slate-500">
                      Your transactional records and budgets are 100% private. We never sell data to
                      advertisers, brokers, or credit agencies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Hybrid MERN + MongoDB Cloud Sync
                    </h4>
                    <p className="text-xs text-slate-500">
                      Experience instant offline responsiveness with seamless automatic synchronization
                      to enterprise MongoDB Atlas clusters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      256-Bit Cryptographic Security
                    </h4>
                    <p className="text-xs text-slate-500">
                      End-to-end TLS 1.3 encryption with high-entropy One-Time Passwords for zero-compromise
                      account security.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-500 mb-1">
                  99.99%
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Platform Uptime
                </div>
                <div className="text-[11px] text-slate-500">Enterprise cloud availability</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-teal-500 mb-1">
                  &lt;15ms
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Instant Response
                </div>
                <div className="text-[11px] text-slate-500">Zero-latency state synchronization</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-500 mb-1">
                  25k+
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Active Users
                </div>
                <div className="text-[11px] text-slate-500">Smart professionals and investors</div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-500 mb-1">
                  100%
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Data Sovereignty
                </div>
                <div className="text-[11px] text-slate-500">Full export & delete rights anytime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CONTACT SECTION
          ========================================================================= */}
      <section id="contact" className="py-20 lg:py-28 relative z-10 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">
              24/7 FinTech Assistance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-4 mb-4">
              Get in Touch with Our Team.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Have questions about platform integration, custom currencies, or security standards?
              We are here to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Information Cards */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Support Email
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    support@smartfin.io
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Priority Desk
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    +91 (80) 4920-SMART
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    FinTech Headquarters
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Tech Park, Financial Dist, Bengaluru
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-xl">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mahi Sharma"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="General Inquiry / Feature Request"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us how we can help your financial journey..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {contactLoading ? (
                    <span>Sending your inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Direct Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER SECTION
          ========================================================================= */}
      <footer className="bg-white dark:bg-[#060a12] border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Branding Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  SmartFin<span className="text-emerald-500">+</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mb-4">
                SmartFin+ is the next-generation financial management platform empowering ambitious
                individuals to take control of their expenses, amplify their savings, and build lasting wealth.
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                {/* Social Media Icons */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  aria-label="Twitter / X"
                >
                  𝕏
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  aria-label="LinkedIn"
                >
                  in
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  aria-label="GitHub"
                >
                  GH
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center hover:text-emerald-500 hover:bg-emerald-500/10 transition-all text-xs font-bold"
                  aria-label="Discord"
                >
                  DC
                </a>
              </div>
            </div>

            {/* Navigation Column 1: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <a href="#features" className="hover:text-emerald-500 transition-colors">
                    Expense Tracking
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-emerald-500 transition-colors">
                    Budget Planning
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-emerald-500 transition-colors">
                    Savings Goals
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-emerald-500 transition-colors">
                    Wealth Calculator
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-emerald-500 transition-colors">
                    FinTech Terminal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Navigation Column 2: Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <a href="#about" className="hover:text-emerald-500 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-emerald-500 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleInstantDemo}
                    className="hover:text-emerald-500 transition-colors text-left"
                  >
                    Live Demo Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Navigation Column 3: Legal & Security */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Security & Legal
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <button
                    onClick={() => setLegalModalType('privacy')}
                    className="hover:text-emerald-500 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLegalModalType('terms')}
                    className="hover:text-emerald-500 transition-colors text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    256-Bit Encrypted
                  </span>
                </li>
                <li>
                  <span className="text-[11px] text-slate-400">SOC2 Type II Ready</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Operational Status */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>
              © 2026 SmartFin+ Technologies Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-400">
                MERN Production Architecture • v2.6.4
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          LEGAL MODAL (Privacy Policy / Terms and Conditions)
          ========================================================================= */}
      <LegalModal
        isOpen={Boolean(legalModalType)}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'privacy'}
      />
    </div>
  );
};
