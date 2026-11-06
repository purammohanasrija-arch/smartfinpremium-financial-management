import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              {type === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {type === 'privacy' ? 'SmartFin+ Privacy Policy' : 'Terms & Conditions of Service'}
              </h2>
              <p className="text-xs text-slate-500">Last updated: October 2026 • Fintech Regulatory Standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1. Zero Data-Selling Pledge
                </h3>
                <p>
                  At SmartFin+, your financial privacy is paramount. We do not sell, rent, or monetize your personal
                  data, transaction records, or banking activity to third-party ad networks, credit bureaus, or brokers.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  2. Bank-Grade 256-Bit TLS Encryption
                </h3>
                <p>
                  All credentials, API calls, and persistent storage are safeguarded with TLS 1.3 protocol and AES-256
                  bit encryption at rest and in transit. Your OTP verifications use one-way hashing with automated
                  expiry routines.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  3. Local & Cloud Sovereignty
                </h3>
                <p>
                  SmartFin+ utilizes hybrid MERN persistence. Data can be preserved locally within your private browser
                  sandbox or synchronized securely to your dedicated MongoDB Atlas cluster with strict authentication
                  checks.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  4. Right to Deletion & Export
                </h3>
                <p>
                  You retain complete ownership of your financial records. You can export complete CSV/JSON audits or
                  permanently purge your accounts and transaction history from the Settings dashboard at any time.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  1. Acceptance of Terms
                </h3>
                <p>
                  By creating an account or accessing SmartFin+, you agree to be bound by these Terms of Service.
                  SmartFin+ provides personal financial analytics, budgeting tools, and AI-powered insights for
                  educational and organizational purposes.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  2. Account Security & OTP Responsibilities
                </h3>
                <p>
                  Users are responsible for maintaining the confidentiality of their email access and OTP codes.
                  SmartFin+ will never ask for your passwords, PINs, or OTP tokens through unsolicited phone calls or
                  third-party channels.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  3. Financial Insights Disclaimer
                </h3>
                <p>
                  SmartFin+ algorithms and AI assistants deliver automated heuristic insights and budget forecasts based
                  on historical data. SmartFin+ does not provide certified legal, tax, or accredited fiduciary
                  investment counsel.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  4. Fair Use & Availability
                </h3>
                <p>
                  We strive for 99.99% system availability backed by our resilient Node.js / Express microservice
                  architecture. We reserve the right to suspend accounts engaged in abusive automated requests.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
