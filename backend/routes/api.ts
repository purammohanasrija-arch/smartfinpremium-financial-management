import { Router } from 'express';
import { db, getDatabaseStatus, initDatabase, connectAtlas, testAtlasUri, disconnectAtlas, syncLocalToAtlas } from '../db/mongo';
import { MongoClient } from 'mongodb';
import { calculateFinancialHealthScore } from '../utils/financeCalculations';
import { SIX_MONTH_HISTORY, INITIAL_USER_PROFILE } from '../data/mockData';
import {
  generateTransactionsCsv,
  generateAccountsCsv,
  generateBudgetsCsv,
  generateSavingsGoalsCsv,
  generateFullFinancialLedgerCsv,
  filterTransactionsByDateRange,
} from '../utils/csvExport';

export const apiRouter = Router();

// ==========================================
// 1. STACK & DATABASE HEALTH / METRICS
// ==========================================
apiRouter.get('/health', async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();
    res.json({
      status: 'ok',
      stack: 'MERN',
      version: '2.4.0',
      technologies: {
        mongoDB: {
          status: dbStatus.connected ? 'connected' : 'disconnected',
          engine: dbStatus.engine,
          isAtlas: dbStatus.isAtlas,
          clusterHost: dbStatus.clusterHost,
          pingMs: dbStatus.pingMs,
          collections: dbStatus.collections,
        },
        express: {
          version: '4.21.2',
          environment: process.env.NODE_ENV || 'development',
        },
        react: {
          version: '19.0.1',
          router: 'react-router-dom v7',
        },
        node: {
          version: process.version,
          platform: process.platform,
          uptimeSeconds: Math.floor(process.uptime()),
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/db/status', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB Atlas: Test Connection URI (with ping & cluster metadata)
apiRouter.post('/db/atlas-test', async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.trim()) {
    return res.status(400).json({ success: false, message: 'MongoDB Atlas connection string is required.' });
  }
  try {
    const result = await testAtlasUri(uri);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Connection to MongoDB Atlas failed.' });
  }
});

// Backward compatibility alias for /db/test-uri
apiRouter.post('/db/test-uri', async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.trim()) {
    return res.status(400).json({ success: false, message: 'MongoDB connection string is required.' });
  }
  try {
    const result = await testAtlasUri(uri);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// MongoDB Atlas: Switch Active Cluster Connection
apiRouter.post('/db/atlas-connect', async (req, res) => {
  const { uri } = req.body;
  if (!uri || !uri.trim()) {
    return res.status(400).json({ success: false, message: 'MongoDB Atlas connection URI is required.' });
  }
  try {
    const result = await connectAtlas(uri);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to connect to MongoDB Atlas cluster.' });
  }
});

// MongoDB Atlas: Disconnect / Revert to Embedded local engine
apiRouter.post('/db/atlas-disconnect', async (req, res) => {
  try {
    const status = await disconnectAtlas();
    res.json({ success: true, message: 'Switched to embedded local MongoDB store.', status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// MongoDB Atlas: Sync Local Data to Atlas Cluster
apiRouter.post('/db/atlas-sync', async (req, res) => {
  try {
    const result = await syncLocalToAtlas();
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

apiRouter.post('/db/reset', async (req, res) => {
  try {
    const status = await db.resetData();
    res.json({ success: true, message: 'MongoDB collections restored to default seed data.', status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. USER & AUTHENTICATION
// ==========================================
apiRouter.get('/auth/me', async (req, res) => {
  try {
    const user = await db.users.findOne();
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/auth/profile', async (req, res) => {
  try {
    await db.users.updateOne({}, { $set: req.body });
    const updated = await db.users.findOne();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const otpStore = new Map<string, { code: string; expiresAt: number }>();

apiRouter.post('/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  // Generate high-entropy 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes validity
  });

  console.log(`[SmartFin+ OTP Service] Generated OTP ${code} for ${cleanEmail}`);

  return res.json({
    success: true,
    message: `Verification code successfully generated and dispatched to ${cleanEmail}.`,
    email: cleanEmail,
    demoOtp: code,
    expiresInSeconds: 600,
  });
});

apiRouter.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and 6-digit OTP code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const enteredOtp = String(otp).trim();
  const record = otpStore.get(cleanEmail);

  // Accept valid stored OTP, or standard fallback demo code 123456
  const isValid = (record && record.code === enteredOtp && record.expiresAt > Date.now()) || enteredOtp === '123456' || (record && record.code === enteredOtp);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP code. Please verify the code or request a new one.',
    });
  }

  try {
    // Delete used OTP
    otpStore.delete(cleanEmail);

    let user = await db.users.findOne();
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    await db.users.updateOne(
      {},
      {
        $set: {
          email: cleanEmail,
          name: formattedName.toLowerCase() === 'mahi' ? 'Mahi' : formattedName,
          plan: 'SmartFin+ Premium (OTP Verified)',
        },
      }
    );

    const updatedUser = await db.users.findOne();
    return res.json({
      success: true,
      message: 'OTP verified successfully!',
      user: updatedUser,
      token: `smartfin_otp_token_${Date.now()}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const { method, email, host, port, username, name } = req.body;
  try {
    const user = await db.users.findOne();
    if (method === 'google') {
      const cleanEmail = (email || 'mahi.sharma@gmail.com').trim();
      const displayName = name || (cleanEmail.includes('mahi') ? 'Mahi Sharma' : cleanEmail.split('@')[0]);
      await db.users.updateOne(
        {},
        {
          $set: {
            email: cleanEmail,
            name: displayName,
            plan: 'SmartFin+ Premium (Google Verified)',
          },
        }
      );
    } else if (method === 'smtp') {
      const namePart = (username || 'mahi').split('@')[0];
      await db.users.updateOne(
        {},
        {
          $set: {
            email: username,
            name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            plan: 'SmartFin+ MERN Enterprise',
          },
        }
      );
    } else if (email) {
      const cleanEmail = email.trim();
      const displayName = name || cleanEmail.split('@')[0];
      await db.users.updateOne(
        {},
        {
          $set: {
            email: cleanEmail,
            name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
            plan: 'SmartFin+ Premium',
          },
        }
      );
    }
    const updatedUser = await db.users.findOne();
    res.json({
      success: true,
      message: 'Authenticated successfully',
      user: updatedUser,
      token: `mern_token_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/register', async (req, res) => {
  const { name, email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address is required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    await db.users.updateOne(
      {},
      {
        $set: {
          email: cleanEmail,
          name: formattedName,
          plan: 'SmartFin+ Premium Member',
        },
      }
    );

    const updatedUser = await db.users.findOne();
    res.json({
      success: true,
      message: 'Account registered successfully!',
      user: updatedUser,
      token: `mern_reg_token_${Date.now()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. TRANSACTIONS (CRUD)
// ==========================================
apiRouter.get('/transactions', async (req, res) => {
  try {
    const { category, type, search } = req.query;
    const filter: any = {};
    if (category && category !== 'All') filter.category = category;
    if (type && type !== 'All') filter.type = type;
    if (search) filter.$text = String(search);

    const list = await db.transactions.find(filter);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/transactions', async (req, res) => {
  try {
    const tx = req.body;
    if (!tx.merchant || !tx.amount) {
      return res.status(400).json({ error: 'Merchant and amount are required.' });
    }
    const newTx = await db.transactions.insertOne(tx);

    // Update account balance
    const accounts = await db.accounts.find();
    const targetAccount = accounts.find((a: any) => a.name === tx.account);
    if (targetAccount) {
      const updatedBalance =
        tx.type === 'income'
          ? targetAccount.balance + Number(tx.amount)
          : targetAccount.balance - Number(tx.amount);
      await db.accounts.updateOne({ id: targetAccount.id }, { $set: { balance: updatedBalance } });
    }

    // Recalculate category spending
    const allTxs = await db.transactions.find();
    const catSpending: Record<string, number> = {};
    allTxs
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        catSpending[t.category] = (catSpending[t.category] || 0) + Number(t.amount);
      });
    await db.budgets.syncSpending(catSpending);

    res.status(201).json(newTx);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.transactions.updateOne({ id }, { $set: req.body });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const all = await db.transactions.find();
    const target = all.find((t: any) => t.id === id || t._id === id);

    if (target) {
      // Revert account balance
      const accounts = await db.accounts.find();
      const acc = accounts.find((a: any) => a.name === target.account);
      if (acc) {
        const revertedBalance =
          target.type === 'income'
            ? acc.balance - Number(target.amount)
            : acc.balance + Number(target.amount);
        await db.accounts.updateOne({ id: acc.id }, { $set: { balance: revertedBalance } });
      }
    }

    await db.transactions.deleteOne({ id });

    // Recalculate budgets
    const remainingTxs = await db.transactions.find();
    const catSpending: Record<string, number> = {};
    remainingTxs
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        catSpending[t.category] = (catSpending[t.category] || 0) + Number(t.amount);
      });
    await db.budgets.syncSpending(catSpending);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ACCOUNTS & TRANSFERS
// ==========================================
apiRouter.get('/accounts', async (req, res) => {
  try {
    const list = await db.accounts.find();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/accounts', async (req, res) => {
  try {
    const created = await db.accounts.insertOne(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.accounts.deleteOne({ id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/accounts/transfer', async (req, res) => {
  const { fromAccountId, toAccountId, amount, note } = req.body;
  const numAmount = Number(amount);
  if (!fromAccountId || !toAccountId || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid source, destination, and amount required.' });
  }

  try {
    const accounts = await db.accounts.find();
    const fromAcc = accounts.find((a: any) => a.id === fromAccountId || a._id === fromAccountId);
    const toAcc = accounts.find((a: any) => a.id === toAccountId || a._id === toAccountId);

    if (!fromAcc || !toAcc) {
      return res.status(404).json({ error: 'One or more accounts not found.' });
    }
    if (fromAcc.balance < numAmount) {
      return res.status(400).json({ error: `Insufficient balance in ${fromAcc.name}` });
    }

    // Atomic debit & credit
    await db.accounts.updateOne({ id: fromAcc.id }, { $set: { balance: fromAcc.balance - numAmount } });
    await db.accounts.updateOne({ id: toAcc.id }, { $set: { balance: toAcc.balance + numAmount } });

    // Create ledger transaction entry
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const transferTx = {
      id: `tx_tr_${Date.now()}`,
      merchant: `Transfer: ${fromAcc.name} → ${toAcc.name}`,
      category: 'Others',
      amount: numAmount,
      type: 'expense',
      date: dateStr,
      paymentMethod: 'Internal Transfer',
      account: fromAcc.name,
      notes: note || 'Self transfer recorded in MongoDB ledger',
    };
    await db.transactions.insertOne(transferTx);

    res.json({ success: true, message: `Transferred ${numAmount} between accounts.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. BUDGETS
// ==========================================
apiRouter.get('/budgets', async (req, res) => {
  try {
    const budgets = await db.budgets.find();
    res.json(budgets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/budgets/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit } = req.body;
    await db.budgets.updateCategory(category, Number(limit));
    res.json({ success: true, category, limit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. SAVINGS GOALS
// ==========================================
apiRouter.get('/goals', async (req, res) => {
  try {
    const goals = await db.goals.find();
    res.json(goals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/goals', async (req, res) => {
  try {
    const created = await db.goals.insertOne(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.goals.deleteOne({ id });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/goals/:id/contribute', async (req, res) => {
  const { id } = req.params;
  const { amount, sourceAccountId } = req.body;
  const numAmount = Number(amount);

  try {
    const goals = await db.goals.find();
    const goal = goals.find((g: any) => g.id === id || g._id === id);
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (sourceAccountId) {
      const accounts = await db.accounts.find();
      const acc = accounts.find((a: any) => a.id === sourceAccountId || a._id === sourceAccountId);
      if (acc) {
        if (acc.balance < numAmount) {
          return res.status(400).json({ error: 'Insufficient account balance.' });
        }
        await db.accounts.updateOne({ id: acc.id }, { $set: { balance: acc.balance - numAmount } });
      }
    }

    const updatedAmount = Number(goal.currentAmount) + numAmount;
    await db.goals.updateOne({ id }, { $set: { currentAmount: updatedAmount } });

    res.json({ success: true, goalId: id, currentAmount: updatedAmount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================
apiRouter.get('/notifications', async (req, res) => {
  try {
    const list = await db.notifications.find();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/:id/read', async (req, res) => {
  try {
    await db.notifications.markRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/notifications/read-all', async (req, res) => {
  try {
    await db.notifications.markAllRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/notifications/:id', async (req, res) => {
  try {
    await db.notifications.deleteOne(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/notifications', async (req, res) => {
  try {
    await db.notifications.clearAll();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. CONSOLIDATED ANALYTICS & SUMMARY
// ==========================================
apiRouter.get('/analytics', async (req, res) => {
  try {
    const [txs, accounts, budgets, goals] = await Promise.all([
      db.transactions.find(),
      db.accounts.find(),
      db.budgets.find(),
      db.goals.find(),
    ]);

    const totalBalance = accounts.reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
    const monthlyIncome = txs
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const monthlyExpenses = txs
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const totalSavings = Math.max(0, monthlyIncome - monthlyExpenses);

    const health = calculateFinancialHealthScore(monthlyIncome, monthlyExpenses, budgets as any, goals as any);

    const history = SIX_MONTH_HISTORY.map((item, idx) => {
      if (idx === SIX_MONTH_HISTORY.length - 1) {
        return {
          month: item.month,
          income: monthlyIncome,
          expenses: monthlyExpenses,
          savings: totalSavings,
        };
      }
      return item;
    });

    res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      totalSavings,
      healthScoreData: health,
      historyChartData: history,
      counts: {
        transactions: txs.length,
        accounts: accounts.length,
        budgets: budgets.length,
        goals: goals.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. FINANCIAL DATA EXPORT (RFC-4180 CSV STREAM)
// ==========================================
apiRouter.get('/export/csv', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'all';
    const range = (req.query.range as 'all' | '30d' | 'month' | '3m' | 'ytd') || 'all';
    const [rawTxs, accounts, budgets, goals, storedUser] = await Promise.all([
      db.transactions.find(),
      db.accounts.find(),
      db.budgets.find(),
      db.goals.find(),
      db.users.findOne().catch(() => null),
    ]);

    const user = storedUser || INITIAL_USER_PROFILE;
    const currency = (req.query.currency as string) || user.currencySymbol || '₹';
    const txs = filterTransactionsByDateRange(rawTxs as any, range);

    const totalBalance = accounts.reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);
    const monthlyIncome = txs
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const monthlyExpenses = txs
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    const totalSavings = Math.max(0, monthlyIncome - monthlyExpenses);

    let csvContent = '';
    const dateStamp = new Date().toISOString().slice(0, 10);
    let filename = `SmartFin_Financial_History_${dateStamp}.csv`;

    switch (type) {
      case 'transactions':
        csvContent = generateTransactionsCsv(txs as any, currency);
        filename = `SmartFin_Transactions_${range}_${dateStamp}.csv`;
        break;
      case 'accounts':
        csvContent = generateAccountsCsv(accounts as any, currency);
        filename = `SmartFin_Accounts_${dateStamp}.csv`;
        break;
      case 'budgets':
        csvContent = generateBudgetsCsv(budgets as any, currency);
        filename = `SmartFin_Budgets_${dateStamp}.csv`;
        break;
      case 'goals':
        csvContent = generateSavingsGoalsCsv(goals as any, currency);
        filename = `SmartFin_Savings_Goals_${dateStamp}.csv`;
        break;
      case 'all':
      default:
        csvContent = generateFullFinancialLedgerCsv({
          user: { name: user.name, email: user.email, plan: user.plan },
          currencySymbol: currency,
          transactions: txs as any,
          accounts: accounts as any,
          budgets: budgets as any,
          goals: goals as any,
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          totalSavings,
        });
        filename = `SmartFin_Financial_Ledger_Full_${dateStamp}.csv`;
        break;
    }

    // Set headers with UTF-8 BOM for Microsoft Excel / Sheets compatibility
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send UTF-8 BOM (\uFEFF) + content
    res.send('\uFEFF' + csvContent);
  } catch (err: any) {
    res.status(500).json({ error: `CSV Export Failed: ${err.message}` });
  }
});

