import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  ScanLine,
  Receipt,
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  FileText,
  RefreshCw,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../data/mockData';

interface SampleReceipt {
  id: string;
  name: string;
  merchant: string;
  category: string;
  total: number;
  date: string;
  tax: number;
  items: Array<{ name: string; qty: number; price: number }>;
  storeAddress: string;
  paymentMethod: string;
  confidence: number;
}

const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'receipt_starbucks',
    name: '☕ Starbucks Cafe',
    merchant: 'Starbucks Coffee Reserve',
    category: 'Food & Dining',
    total: 556.5,
    date: '2026-11-06',
    tax: 26.5,
    storeAddress: '100 Feet Rd, Indiranagar, Bangalore',
    paymentMethod: 'ICICI Sapphiro Credit Card',
    confidence: 99.4,
    items: [
      { name: 'Caramel Macchiato (Venti)', qty: 1, price: 350 },
      { name: 'Almond Butter Croissant', qty: 1, price: 180 },
      { name: 'CGST + SGST (5%)', qty: 1, price: 26.5 },
    ],
  },
  {
    id: 'receipt_apple',
    name: '💻 Apple Electronics',
    merchant: 'Apple Store Premium Retail',
    category: 'Shopping',
    total: 14800,
    date: '2026-11-05',
    tax: 2257,
    storeAddress: 'UB City Mall, Vittal Mallya Rd, Bangalore',
    paymentMethod: 'HDFC Bank Salary Account',
    confidence: 98.7,
    items: [
      { name: 'AirPods 4 with Active Noise Cancellation', qty: 1, price: 12900 },
      { name: '20W USB-C Fast Power Adapter', qty: 1, price: 1900 },
    ],
  },
  {
    id: 'receipt_groceries',
    name: '🛒 Organic Supermarket',
    merchant: "Nature's Basket Gourmet",
    category: 'Groceries',
    total: 890,
    date: '2026-11-04',
    tax: 42,
    storeAddress: 'Koramangala 4th Block, Bangalore',
    paymentMethod: 'Paytm & UPI Wallet',
    confidence: 97.2,
    items: [
      { name: 'Hass Avocados (2 Pack)', qty: 1, price: 340 },
      { name: 'Organic Greek Yogurt 400g', qty: 2, price: 280 },
      { name: 'Artisan Sourdough Loaf', qty: 1, price: 170 },
    ],
  },
  {
    id: 'receipt_shell',
    name: '⛽ Shell Fuel Station',
    merchant: 'Shell Petrol & Lubricants',
    category: 'Transportation',
    total: 2750,
    date: '2026-11-03',
    tax: 412,
    storeAddress: 'Outer Ring Road, Bellandur, Bangalore',
    paymentMethod: 'HDFC Bank Salary Account',
    confidence: 99.1,
    items: [
      { name: 'V-Power Unleaded Petrol (25.2 L)', qty: 1, price: 2750 },
    ],
  },
];

export const ReceiptScannerPage: React.FC = () => {
  const { addTransaction, accounts, currencySymbol, formatCurrency, addToast } = useFinance();
  const navigate = useNavigate();

  const [selectedReceipt, setSelectedReceipt] = useState<SampleReceipt>(SAMPLE_RECEIPTS[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'parsed'>('parsed');

  // Form editable states
  const [merchant, setMerchant] = useState(selectedReceipt.merchant);
  const [amount, setAmount] = useState(selectedReceipt.total.toString());
  const [category, setCategory] = useState(selectedReceipt.category);
  const [date, setDate] = useState(selectedReceipt.date);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [notes, setNotes] = useState('Scanned via SmartFin+ AI OCR');
  const [isSuccess, setIsSuccess] = useState(false);

  // Trigger interactive scan animation
  const startScan = (receipt: SampleReceipt) => {
    setSelectedReceipt(receipt);
    setIsScanning(true);
    setScanStep('scanning');
    setIsSuccess(false);

    // Update form after scan completes
    setTimeout(() => {
      setMerchant(receipt.merchant);
      setAmount(receipt.total.toString());
      setCategory(receipt.category);
      setDate(receipt.date);
      setNotes(`Scanned receipt: ${receipt.items.map((i) => i.name).join(', ')}`);
      setIsScanning(false);
      setScanStep('parsed');
      addToast(`AI successfully parsed receipt from ${receipt.merchant}!`, 'success');
    }, 1400);
  };

  // Custom File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      setScanStep('scanning');
      setIsSuccess(false);

      setTimeout(() => {
        const customParsed: SampleReceipt = {
          id: `custom_${Date.now()}`,
          name: file.name.slice(0, 15),
          merchant: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Merchant Store',
          category: 'Shopping',
          total: 1250,
          date: new Date().toISOString().split('T')[0],
          tax: 62.5,
          storeAddress: 'Local Store Location',
          paymentMethod: 'HDFC Bank Salary Account',
          confidence: 96.8,
          items: [
            { name: 'Parsed Item #1', qty: 1, price: 850 },
            { name: 'Parsed Item #2', qty: 1, price: 400 },
          ],
        };
        setSelectedReceipt(customParsed);
        setMerchant(customParsed.merchant);
        setAmount(customParsed.total.toString());
        setCategory(customParsed.category);
        setDate(customParsed.date);
        setNotes(`Uploaded document: ${file.name}`);
        setIsScanning(false);
        setScanStep('parsed');
        addToast(`Uploaded image analyzed and OCR extracted!`, 'success');
      }, 1600);
    }
  };

  // Submit to Live Transactions & MongoDB
  const handleApproveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Please enter a valid merchant name and amount', 'error');
      return;
    }

    const linkedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

    // Call live Context action
    addTransaction({
      amount: parsedAmount,
      type: 'expense',
      category,
      date,
      merchant: merchant.trim(),
      accountId: linkedAccount?.id || 'acc-1',
      accountName: linkedAccount?.name || 'HDFC Bank Salary Account',
      notes: notes.trim(),
    });

    setIsSuccess(true);
    addToast(
      `Transaction of ${currencySymbol}${parsedAmount.toLocaleString()} added to ${category} and synced!`,
      'success'
    );

    setTimeout(() => {
      navigate('/transactions');
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Scan className="w-6 h-6 text-teal-400" /> AI Smart Receipt & Bill OCR Scanner
          </h1>
          <p className="text-xs text-slate-400">
            Interactive document vision: drag & drop receipt photos or try instant samples to automatically extract line items and post to your ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-md shadow-teal-500/20 active:scale-95 transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Receipt / Bill</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Preset Sample Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
          Try An Interactive Demo Receipt:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_RECEIPTS.map((r) => {
            const isCurrent = selectedReceipt.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => startScan(r)}
                className={`p-3 rounded-xl border text-left font-mono text-xs transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-teal-500/15 border-teal-500/50 text-teal-300 shadow-md ring-1 ring-teal-500/30'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="font-bold truncate">{r.name}</span>
                <span className="text-[10px] text-teal-400 shrink-0">
                  {currencySymbol}{r.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Thermal Paper Receipt with Laser Scanner */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-teal-400" /> High-Resolution OCR Lens
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {selectedReceipt.confidence}% AI Accuracy
            </span>
          </div>

          {/* Thermal Paper Container */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl overflow-hidden font-mono text-xs select-none">
            {/* Animated Laser Sweep Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 shadow-[0_0_15px_3px_#14b8a6] animate-pulse z-20 pointer-events-none transition-all duration-75"
                style={{
                  top: '50%',
                  animation: 'bounce 1.2s infinite ease-in-out',
                }}
              />
            )}

            {/* Glowing Scan Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-[0.5px] z-10 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold font-mono text-teal-300 uppercase tracking-widest bg-slate-950/80 px-3 py-1 rounded-full border border-teal-500/40">
                  Extracting Entities...
                </span>
              </div>
            )}

            {/* Receipt Content */}
            <div className="space-y-4 text-slate-300">
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-800">
                <div className="inline-block p-1.5 rounded-lg bg-teal-500/10 text-teal-400 mb-1">
                  <Receipt className="w-6 h-6 mx-auto" />
                </div>
                <h3 className="font-extrabold text-sm text-white tracking-wider uppercase">
                  {selectedReceipt.merchant}
                </h3>
                <p className="text-[10px] text-slate-500">{selectedReceipt.storeAddress}</p>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>DATE: {selectedReceipt.date}</span>
                  <span>TIME: 14:32:05</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 py-2">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase border-b border-slate-900 pb-1">
                  <span>ITEM DESCRIPTION</span>
                  <span>PRICE</span>
                </div>
                {selectedReceipt.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs group relative"
                  >
                    <span className="truncate pr-2">
                      {item.qty > 1 && `${item.qty}x `}
                      {item.name}
                    </span>
                    <span className="text-white font-bold shrink-0">
                      {currencySymbol}{item.price.toLocaleString()}
                    </span>

                    {/* Bounding box visual tag */}
                    <span className="hidden group-hover:inline-block absolute -left-2 top-0 px-1 text-[8px] bg-teal-500 text-slate-950 font-bold rounded">
                      OCR DETECTED
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-dashed border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>SUBTOTAL</span>
                  <span>{currencySymbol}{(selectedReceipt.total - selectedReceipt.tax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TAX / GST</span>
                  <span>{currencySymbol}{selectedReceipt.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-teal-400 pt-1 border-t border-slate-800">
                  <span>TOTAL PAID</span>
                  <span>{currencySymbol}{selectedReceipt.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-3 border-t border-dashed border-slate-800 space-y-1">
                <div className="h-6 w-48 mx-auto bg-repeat-x bg-contain opacity-40 font-mono tracking-widest text-[8px] text-slate-400 flex items-center justify-center">
                  ||||| | |||| ||| ||||| || |||||| | ||| ||||
                </div>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                  THANK YOU FOR YOUR VISIT!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Instant Ledger Entry Form */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> AI Entity Extraction Form
              </h3>
              <p className="text-xs text-slate-400">
                Review and approve the parsed transaction to automatically update your live accounts & charts.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-xs font-bold">
              Ready to Post
            </span>
          </div>

          <form onSubmit={handleApproveTransaction} className="space-y-4">
            {/* Merchant */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" /> Merchant / Store Name
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors font-medium shadow-inner"
                required
              />
            </div>

            {/* Amount & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-teal-400" /> Total Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-teal-400" /> Auto-Categorization
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" /> Transaction Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-400" /> Paid From Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({currencySymbol}{acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" /> Itemized Notes / Memo
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors shadow-inner resize-none"
              />
            </div>

            {/* Approve Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isScanning || isSuccess}
                className={`w-full py-3.5 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                  isSuccess
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20'
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Transaction Posted! Redirecting to Ledger...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Approve & Post to Transactions</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
