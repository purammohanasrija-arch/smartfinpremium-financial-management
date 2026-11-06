import { DEFAULT_AVATAR_FALLBACK, getSafeAvatarUrl } from '../data/mockData';
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User,
  ArrowRight,
  TrendingDown,
  PieChart,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  metadata?: any;
}

export const AIAssistantPage: React.FC = () => {
  const {
    user,
    transactions,
    budgets,
    savingsGoals,
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    totalBalance,
    currencySymbol,
    formatCurrency,
  } = useFinance();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions from specification
  const suggestedQuestions = [
    'How much did I spend on food this month?',
    'Can I save more next month?',
    'Show my budget status.',
    'Detect unusual spending.',
    'Summarize my monthly expenses.',
  ];

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${user.name}! 🌸 I am your SmartFin+ Financial Intelligence Assistant. I monitor your cash flow, budget limits, and savings milestones in real time. How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Dynamic Rule-Based Mock AI Response Generator
  const generateAssistantResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Food spending inquiry
    if (q.includes('food') || q.includes('dining')) {
      const foodTx = transactions.filter(
        (t) => t.type === 'expense' && t.category.toLowerCase().includes('food')
      );
      const totalFood = foodTx.reduce((acc, t) => acc + t.amount, 0);
      const foodBudget = budgets.find((b) => b.category === 'Food & Dining');
      const percent = foodBudget ? Math.round((totalFood / foodBudget.limit) * 100) : 0;

      return `In October, you have spent **${formatCurrency(totalFood)}** on Food & Dining across ${foodTx.length} transactions (including Zomato, Swiggy, and Starbucks). This represents **${percent}%** of your ${formatCurrency(foodBudget?.limit || 2000)} monthly limit. 
💡 *Tip: Cooking dinner at home twice more per week could save an estimated ${formatCurrency(400)}–${formatCurrency(600)} this month!*`;
    }

    // 2. Can I save more next month?
    if (q.includes('save more') || q.includes('increase saving')) {
      const shoppingSpent =
        transactions
          .filter((t) => t.type === 'expense' && t.category === 'Shopping')
          .reduce((acc, t) => acc + t.amount, 0);

      return `Yes, absolutely! Based on your recent ledger, your current savings rate is **${Math.round(((monthlyIncome - monthlyExpenses) / (monthlyIncome || 1)) * 100)}%**. 

Here are 3 high-impact optimization areas:
1. **Shopping Optimization**: You spent ${formatCurrency(shoppingSpent)} in Shopping. Trimming non-essential discretionary items could recover ~${formatCurrency(400)}.
2. **Subscriptions & Utilities**: Consolidating streaming services saves approx ${formatCurrency(250)}/mo.
3. **Automated Sweep**: Moving ${formatCurrency(500)} into your **Dream Vacation** goal right on salary credit day guarantees higher discipline.`;
    }

    // 3. Show my budget status
    if (q.includes('budget') || q.includes('status')) {
      const budgetLines = budgets
        .map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const icon = pct > 100 ? '🚨' : pct >= 80 ? '⚠️' : '✅';
          return `• ${icon} **${b.category}**: ${formatCurrency(b.spent)} / ${formatCurrency(b.limit)} (${pct}%)`;
        })
        .join('\n');

      return `Here is your current October Budget Status Overview:\n\n${budgetLines}\n\n*Notice:* Food & Dining is at **80%** threshold. Consider curbing restaurant visits for the remainder of the month.`;
    }

    // 4. Detect unusual spending
    if (q.includes('unusual') || q.includes('anomaly') || q.includes('irregular')) {
      const expenseList = [...transactions]
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount);
      const topExpense = expenseList[0];

      return `🔍 **Spending Audit Scan Completed**:
1. Largest single outflow detected: **${topExpense?.merchant}** (${formatCurrency(topExpense?.amount || 0)}) on ${topExpense?.date}.
2. High weekend dining density: 2 delivery food orders recorded within 72 hours.
3. No duplicate charges or fraudulent transactions detected across your HDFC or ICICI accounts. All charges match typical activity patterns.`;
    }

    // 5. Summarize my monthly expenses
    if (q.includes('summarize') || q.includes('summary') || q.includes('expenses')) {
      const catSummary = budgets
        .map((b) => `• ${b.category}: ${formatCurrency(b.spent)}`)
        .join('\n');

      return `📊 **October Financial Summary for ${user.name}**:
• **Gross Inflow**: ${formatCurrency(monthlyIncome)}
• **Total Disbursements**: ${formatCurrency(monthlyExpenses)}
• **Net Monthly Savings**: ${formatCurrency(totalSavings)} (Surplus of ${Math.round(((monthlyIncome - monthlyExpenses) / (monthlyIncome || 1)) * 100)}%)

**Category Breakdown**:
${catSummary}

You are in good standing with an overall Financial Health Score of **82/100**!`;
    }

    // Generic fallback response with local insight
    return `I analyzed your portfolio data for "${query}". Your current liquid balance is **${formatCurrency(totalBalance)}** across your bank accounts, and you have **${savingsGoals.length} active goals** in progress. Feel free to ask about your food expenses, monthly budgets, or ways to boost your savings rate!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate realistic thought & typing delay
    setTimeout(() => {
      const responseText = generateAssistantResponse(text);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: `Conversation cleared. How can I assist your financial journey today, ${user.name}?`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl overflow-hidden animate-in fade-in duration-300">
      {/* Assistant Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 p-[1.5px] shadow-md shadow-teal-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">SmartFin+ AI Advisor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Mock AI • Local Data Only
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized intelligence for {user.name} based on active ledger
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              {isUser ? (
                <img
                  src={getSafeAvatarUrl(user.avatar)}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-teal-400/50 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR_FALLBACK;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 p-[1px] shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-2 font-mono text-right ${
                    isUser ? 'text-teal-950/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
              <Bot className="w-4 h-4 text-teal-400 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 flex items-center gap-1.5">
              <span>SmartFin is calculating</span>
              <span className="flex gap-1 items-center ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-teal-400" /> Suggested:
        </span>
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-teal-500/10 text-slate-300 hover:text-teal-300 border border-slate-700 hover:border-teal-500/40 text-xs whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Ask a financial question (e.g. food spending, budget limits, saving tips)..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-teal-500/70 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isTyping}
          className="p-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md active:scale-95 shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
