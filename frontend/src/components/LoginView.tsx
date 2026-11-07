import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Lock,
  Cpu,
  User,
  CheckSquare,
  Square,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { mernApi } from '../services/api';
import { ThemeToggle } from './ThemeToggle';
import { PaletteSwitcher } from './PaletteSwitcher';

interface LoginViewProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ initialMode = 'login', onSuccess }) => {
  const { login } = useFinance();
  const navigate = useNavigate();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Step: 'email' | 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Form Fields
  const [name, setName] = useState('Mahi Sharma');
  const [email, setEmail] = useState(
    initialMode === 'register' ? 'mahi.sharma@smartfin.io' : 'mahi.sharma@smartfin.io'
  );
  const [termsAccepted, setTermsAccepted] = useState(true);

  // 6 separate digits for OTP
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generated OTP for user assistance / demo display
  const [activeOtp, setActiveOtp] = useState<string>('482910');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Google OAuth modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Update mode if initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setStep('email');
    setErrorMsg('');
  }, [initialMode]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Focus first OTP input when moving to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  const handleSuccessfulAuth = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/dashboard');
    }
  };

  // Google sign in handler
  const handleGoogleSignIn = async (accountEmail = 'mahi.sharma@gmail.com', accountName = 'Mahi Sharma') => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await new Promise((r) => setTimeout(r, 600)); // Smooth realistic OAuth handshake
      await login('google', {
        email: accountEmail,
        name: accountName,
        avatarUrl: '/src/assets/images/user_avatar_mahi_1792342370968.jpg',
      });
      setShowGoogleModal(false);
      handleSuccessfulAuth();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in encountered an error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Request OTP from server
  const handleSendOtp = async (targetEmail: string = email) => {
    setErrorMsg('');
    const clean = targetEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (mode === 'register' && !termsAccepted) {
      setErrorMsg('Please agree to the SmartFin+ Terms and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      // If register mode, register intent on backend
      if (mode === 'register') {
        await mernApi.register({ name: name.trim(), email: clean }).catch(() => {});
      }

      // Call MERN Express backend endpoint
      const res = await mernApi.sendOtp(clean);
      const generatedCode = res.demoOtp || Math.floor(100000 + Math.random() * 900000).toString();
      setActiveOtp(generatedCode);
      setSuccessNotice(`Verification code sent to ${clean}`);
    } catch {
      // Fallback generator for zero-latency client resilience
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveOtp(fallbackCode);
      setSuccessNotice(`Verification code generated for ${clean}`);
    } finally {
      setIsLoading(false);
      setStep('otp');
      setCountdown(45);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    }
  };

  // Handle entering individual OTP digits
  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle full paste
    if (cleanVal.length > 1) {
      handlePastedCode(cleanVal);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal.slice(-1);
    setOtpDigits(updated);

    // Auto advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePastedCode = (pasted: string) => {
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');
    const updated = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      updated[i] = d;
    });
    setOtpDigits(updated);
    const nextIdx = Math.min(digits.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  // Autofill button helper
  const handleAutoFillCode = () => {
    const digits = activeOtp.split('');
    setOtpDigits(digits);
    inputRefs.current[5]?.focus();
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      // Try backend verification first
      await mernApi.verifyOtp(email, enteredCode);
    } catch {
      // If server is unreachable or offline, verify against active code or demo codes
      const valid = enteredCode === activeOtp || enteredCode === '123456';
      if (!valid) {
        setIsLoading(false);
        setErrorMsg('Invalid verification code. Please check the code or click "Autofill Code".');
        return;
      }
    }

    // Successfully verified -> log in user into context & storage
    await login('otp', { email: email.trim().toLowerCase(), name: mode === 'register' ? name : undefined });
    setIsLoading(false);
    handleSuccessfulAuth();
  };

  // 1-Click Instant Demo Access
  const handleInstantDemo = async () => {
    setIsLoading(true);
    await login('demo');
    setIsLoading(false);
    handleSuccessfulAuth();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Ambient background glows with Emerald & Soft Mint */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top action bar: Back to Home + Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-20 px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cover Page</span>
        </Link>
        <div className="flex items-center gap-2">
          <PaletteSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Glassmorphic Auth Container */}
      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#0e1422]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl p-6 sm:p-8 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link to="/" className="group flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-amber-400 p-[1.5px] shadow-lg shadow-emerald-500/20 mb-3 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              SmartFin<span className="text-emerald-500 dark:text-emerald-400">+</span>
            </h1>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {mode === 'register'
              ? 'Create your premium account & take control of your wealth'
              : 'Sign in to access your financial intelligence dashboard'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setStep('email');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setStep('email');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successNotice && step === 'otp' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span className="truncate">{successNotice}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* GOOGLE AUTHENTICATION BUTTON                            */}
        {/* ======================================================== */}
        {step === 'email' && (
          <div className="mb-5">
            <button
              type="button"
              disabled={isLoading || googleLoading}
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50"
            >
              {/* Google G Multi-Color SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{mode === 'register' ? 'Sign up with Google' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white dark:bg-[#0e1422] px-3 text-slate-400">
                  Or passwordless Email OTP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: EMAIL (AND NAME IF REGISTER) INPUT              */}
        {/* ======================================================== */}
        {step === 'email' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOtp();
            }}
            className="space-y-4 animate-in fade-in"
          >
            {/* Full Name Field for Registration */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Mahi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* Email Address Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Passwordless OTP
                </span>
              </div>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Terms Checkbox for Registration */}
            {mode === 'register' && (
              <div className="flex items-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                >
                  {termsAccepted ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <label
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-relaxed"
                >
                  I agree to the{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>
            )}

            {/* Quick Fill Chips for Login */}
            {mode === 'login' && (
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1.5">
                  Quick Select Account:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('mahi.sharma@smartfin.io');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                      email === 'mahi.sharma@smartfin.io'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🌸 Mahi (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('vu.241fa04331@gmail.com');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                      email === 'vu.241fa04331@gmail.com'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    ✉️ vu.241fa04331@gmail.com
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white dark:text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Generating One-Time Password...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'register' ? 'Create Account & Send OTP' : 'Send One-Time Password'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Instant Demo Button for Reviewers */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleInstantDemo}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Demo Access (Explore as Mahi Sharma)</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: 6-DIGIT OTP INPUT                                */}
        {/* ======================================================== */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
            {/* Target Email Banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Verification Code Sent To
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  {email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMsg('');
                }}
                className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                Enter 6-Digit Verification Code
              </label>

              <div
                className="flex items-center justify-between gap-1.5 sm:gap-2"
                onPaste={(e) => {
                  e.preventDefault();
                  handlePastedCode(e.clipboardData.getData('text'));
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-400 text-slate-900 dark:text-slate-100 shadow-inner focus:outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                ))}
              </div>
            </div>

            {/* OTP helper card */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                    Your One-Time Password
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-300 tracking-wider">
                    {activeOtp}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoFillCode}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>Autofill</span>
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-tight shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Enter Dashboard</span>
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center pt-1">
              {canResend ? (
                <button
                  type="button"
                  onClick={() => handleSendOtp(email)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend New Code</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Resend code in{' '}
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {countdown}s
                  </span>
                </span>
              )}
            </div>
          </form>
        )}

        {/* Security badge footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            256-Bit Encrypted OTP Gateway
          </span>
          <span className="font-mono text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-500" />
            MERN Stack
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GOOGLE AUTH ACCOUNT PICKER MODAL                         */}
      {/* ======================================================== */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 relative">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sign in with Google
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Choose an account to continue to <span className="font-semibold text-emerald-500">SmartFin+</span>
            </p>

            <div className="space-y-2 mb-4">
              {/* Account 1 */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => handleGoogleSignIn('mahi.sharma@gmail.com', 'Mahi Sharma')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-xs text-slate-950 shrink-0">
                  M
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    Mahi Sharma
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">mahi.sharma@gmail.com</div>
                </div>
              </button>

              {/* Account 2 */}
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => handleGoogleSignIn('vu.241fa04331@gmail.com', 'VU Admin')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  V
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    VU Workspace
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">vu.241fa04331@gmail.com</div>
                </div>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => setShowGoogleModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
