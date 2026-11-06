import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, Db } from 'mongodb';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_ACCOUNTS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
  Transaction,
  Account,
  Budget,
  SavingsGoal,
  NotificationItem,
} from '../data/mockData';

export interface DatabaseStatus {
  connected: boolean;
  engine: 'mongodb_atlas' | 'mongodb_embedded';
  isAtlas: boolean;
  uri?: string;
  clusterHost?: string;
  databaseName?: string;
  pingMs?: number;
  tls?: boolean;
  collections: {
    users: number;
    transactions: number;
    accounts: number;
    budgets: number;
    goals: number;
    notifications: number;
  };
  lastPing: string;
  error?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', '.data');
const DB_FILE = path.join(DATA_DIR, 'mongodb_store.json');

interface SchemaStore {
  users: Array<typeof INITIAL_USER_PROFILE & { _id: string; createdAt: string; updatedAt: string }>;
  transactions: Array<Transaction & { _id: string; createdAt: string; updatedAt: string }>;
  accounts: Array<Account & { _id: string; createdAt: string; updatedAt: string }>;
  budgets: Array<Budget & { _id: string; createdAt: string; updatedAt: string }>;
  goals: Array<SavingsGoal & { _id: string; createdAt: string; updatedAt: string }>;
  notifications: Array<NotificationItem & { _id: string; createdAt: string; updatedAt: string }>;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let activeEngine: 'mongodb_atlas' | 'mongodb_embedded' = 'mongodb_embedded';
let currentAtlasUri: string | undefined = process.env.MONGODB_URI;
let lastRecordedPingMs: number | undefined = undefined;

function maskUri(uri: string): string {
  try {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••@');
  } catch {
    return 'mongodb+srv://••••:••••@atlas-cluster.mongodb.net';
  }
}

function extractClusterHost(uri: string): string {
  try {
    const afterAt = uri.split('@')[1];
    if (afterAt) {
      return afterAt.split('/')[0].split('?')[0];
    }
  } catch {}
  return 'cluster0.mongodb.net';
}

function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureFileStore(): SchemaStore {
  ensureDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Re-seed if corrupted
    }
  }

  const initialStore: SchemaStore = {
    users: [
      {
        ...INITIAL_USER_PROFILE,
        _id: 'usr_mahi_001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    transactions: INITIAL_TRANSACTIONS.map((t, idx) => ({
      ...t,
      _id: t.id || `tx_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    accounts: INITIAL_ACCOUNTS.map((a, idx) => ({
      ...a,
      _id: a.id || `acc_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    budgets: INITIAL_BUDGETS.map((b, idx) => ({
      ...b,
      _id: `bgt_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    goals: INITIAL_SAVINGS_GOALS.map((g, idx) => ({
      ...g,
      _id: g.id || `goal_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    notifications: INITIAL_NOTIFICATIONS.map((n, idx) => ({
      ...n,
      _id: n.id || `notif_${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
  return initialStore;
}

function saveFileStore(store: SchemaStore): void {
  ensureDirectory();
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * Seed MongoDB collections if they are empty
 */
async function seedMongoCollections(targetDb: Db) {
  const txCount = await targetDb.collection('transactions').countDocuments();
  if (txCount === 0) {
    console.log('[MongoDB Atlas] Seeding initial collections in MongoDB Atlas cloud...');
    const localStore = ensureFileStore();

    await targetDb.collection('users').insertOne({
      ...localStore.users[0],
      _id: (localStore.users[0]?._id || 'usr_mahi_001') as any,
    });

    if (localStore.transactions.length > 0) {
      await targetDb.collection('transactions').insertMany(
        localStore.transactions.map((t) => ({ ...t, _id: (t._id || t.id) as any }))
      );
    }

    if (localStore.accounts.length > 0) {
      await targetDb.collection('accounts').insertMany(
        localStore.accounts.map((a) => ({ ...a, _id: (a._id || a.id) as any }))
      );
    }

    if (localStore.budgets.length > 0) {
      await targetDb.collection('budgets').insertMany(
        localStore.budgets.map((b, i) => ({ ...b, _id: (b._id || `bgt_${i + 1}`) as any }))
      );
    }

    if (localStore.goals.length > 0) {
      await targetDb.collection('goals').insertMany(
        localStore.goals.map((g) => ({ ...g, _id: (g._id || g.id) as any }))
      );
    }

    if (localStore.notifications.length > 0) {
      await targetDb.collection('notifications').insertMany(
        localStore.notifications.map((n) => ({ ...n, _id: (n._id || n.id) as any }))
      );
    }

    console.log('[MongoDB Atlas] Seed completed successfully!');
  }
}

/**
 * Connect to a MongoDB Atlas cluster
 */
export async function connectAtlas(uri: string): Promise<{
  success: boolean;
  message: string;
  status: DatabaseStatus;
  pingMs?: number;
  clusterHost?: string;
}> {
  const cleanUri = uri.trim();
  if (!cleanUri || (!cleanUri.startsWith('mongodb+srv://') && !cleanUri.startsWith('mongodb://'))) {
    throw new Error('Invalid connection string. Atlas URIs typically start with mongodb+srv://');
  }

  const startTime = Date.now();
  console.log(`[MongoDB Atlas] Connecting to ${extractClusterHost(cleanUri)}...`);

  const client = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 6000,
    connectTimeoutMS: 6000,
  });

  await client.connect();
  const dbInstance = client.db('smartfin');
  await dbInstance.command({ ping: 1 });
  const latency = Date.now() - startTime;

  // Safely close previous client if any
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch {
      // Ignore close error
    }
  }

  mongoClient = client;
  mongoDb = dbInstance;
  activeEngine = 'mongodb_atlas';
  currentAtlasUri = cleanUri;
  lastRecordedPingMs = latency;

  console.log(`[MongoDB Atlas] Connected in ${latency}ms! Active database: smartfin`);

  // Seed or sync
  await seedMongoCollections(mongoDb);

  const status = await getDatabaseStatus();
  return {
    success: true,
    message: `Connected to MongoDB Atlas cluster (${extractClusterHost(cleanUri)}) with ${latency}ms latency.`,
    status,
    pingMs: latency,
    clusterHost: extractClusterHost(cleanUri),
  };
}

/**
 * Test connectivity and latency without replacing active database
 */
export async function testAtlasUri(uri: string): Promise<{
  success: boolean;
  message: string;
  pingMs: number;
  clusterHost: string;
  version?: string;
}> {
  const cleanUri = uri.trim();
  if (!cleanUri || (!cleanUri.startsWith('mongodb+srv://') && !cleanUri.startsWith('mongodb://'))) {
    throw new Error('Connection string must begin with mongodb+srv:// or mongodb://');
  }

  const startTime = Date.now();
  const testClient = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await testClient.connect();
    const testDb = testClient.db('smartfin');
    await testDb.command({ ping: 1 });
    const pingMs = Date.now() - startTime;

    let version = 'MongoDB Cloud';
    try {
      const buildInfo = await testDb.command({ buildInfo: 1 });
      if (buildInfo?.version) version = `v${buildInfo.version}`;
    } catch {
      // Optional info
    }

    await testClient.close();
    return {
      success: true,
      message: `Connection successful! Ping: ${pingMs}ms, TLS encrypted, ${version}`,
      pingMs,
      clusterHost: extractClusterHost(cleanUri),
      version,
    };
  } catch (err: any) {
    try {
      await testClient.close();
    } catch {}
    let errHint = err.message;
    if (err.message?.includes('whitelisted') || err.message?.includes('timed out') || err.message?.includes('serverSelection')) {
      errHint = `${err.message} (Make sure your Atlas Network Access has IP 0.0.0.0/0 allowed, and password is correct).`;
    }
    throw new Error(errHint);
  }
}

/**
 * Revert to local embedded store
 */
export async function disconnectAtlas(): Promise<DatabaseStatus> {
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch {}
    mongoClient = null;
    mongoDb = null;
  }
  activeEngine = 'mongodb_embedded';
  currentAtlasUri = undefined;
  lastRecordedPingMs = undefined;
  console.log('[MERN/MongoDB] Switched to local embedded MongoDB document engine.');
  return getDatabaseStatus();
}

/**
 * Push all local documents to MongoDB Atlas
 */
export async function syncLocalToAtlas(): Promise<{ success: boolean; message: string; count: number }> {
  if (activeEngine !== 'mongodb_atlas' || !mongoDb) {
    throw new Error('Cannot sync: Not currently connected to a MongoDB Atlas cluster.');
  }

  const localStore = ensureFileStore();
  let totalSynced = 0;

  // Clear and push fresh
  await Promise.all([
    mongoDb.collection('users').deleteMany({}),
    mongoDb.collection('transactions').deleteMany({}),
    mongoDb.collection('accounts').deleteMany({}),
    mongoDb.collection('budgets').deleteMany({}),
    mongoDb.collection('goals').deleteMany({}),
    mongoDb.collection('notifications').deleteMany({}),
  ]);

  if (localStore.users.length > 0) {
    await mongoDb.collection('users').insertMany(
      localStore.users.map((u) => ({ ...u, _id: (u._id || 'usr_mahi_001') as any }))
    );
    totalSynced += localStore.users.length;
  }

  if (localStore.transactions.length > 0) {
    await mongoDb.collection('transactions').insertMany(
      localStore.transactions.map((t) => ({ ...t, _id: (t._id || t.id) as any }))
    );
    totalSynced += localStore.transactions.length;
  }

  if (localStore.accounts.length > 0) {
    await mongoDb.collection('accounts').insertMany(
      localStore.accounts.map((a) => ({ ...a, _id: (a._id || a.id) as any }))
    );
    totalSynced += localStore.accounts.length;
  }

  if (localStore.budgets.length > 0) {
    await mongoDb.collection('budgets').insertMany(
      localStore.budgets.map((b, i) => ({ ...b, _id: (b._id || `bgt_${i + 1}`) as any }))
    );
    totalSynced += localStore.budgets.length;
  }

  if (localStore.goals.length > 0) {
    await mongoDb.collection('goals').insertMany(
      localStore.goals.map((g) => ({ ...g, _id: (g._id || g.id) as any }))
    );
    totalSynced += localStore.goals.length;
  }

  if (localStore.notifications.length > 0) {
    await mongoDb.collection('notifications').insertMany(
      localStore.notifications.map((n) => ({ ...n, _id: (n._id || n.id) as any }))
    );
    totalSynced += localStore.notifications.length;
  }

  return {
    success: true,
    message: `Successfully synchronized ${totalSynced} documents across 6 collections to MongoDB Atlas!`,
    count: totalSynced,
  };
}

export async function initDatabase(): Promise<DatabaseStatus> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim().startsWith('mongodb')) {
    if (uri.includes('<username>') || uri.includes('<password>')) {
      console.log('[MERN/MongoDB] Notice: MONGODB_URI contains placeholder credentials (<username>/<password>).');
      console.log('[MERN/MongoDB] Running on local embedded MongoDB Document Engine until actual credentials are configured.');
      activeEngine = 'mongodb_embedded';
    } else {
      try {
        console.log('[MERN/MongoDB] Attempting initial connection to MongoDB URI...');
        await connectAtlas(uri);
        return getDatabaseStatus();
      } catch (err: any) {
        console.warn('[MERN/MongoDB] Atlas URI connection warning:', err.message);
        console.log('[MERN/MongoDB] Falling back to embedded local MongoDB Document Engine.');
        activeEngine = 'mongodb_embedded';
      }
    }
  } else {
    activeEngine = 'mongodb_embedded';
    console.log('[MERN/MongoDB] Initialized Embedded MongoDB Document Engine (JSON Store with BSON semantics)');
  }

  ensureFileStore();
  return getDatabaseStatus();
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  if (activeEngine === 'mongodb_atlas' && mongoDb) {
    try {
      const pingStart = Date.now();
      await mongoDb.command({ ping: 1 });
      const currentPing = Date.now() - pingStart;
      lastRecordedPingMs = currentPing;

      const [u, t, a, b, g, n] = await Promise.all([
        mongoDb.collection('users').countDocuments(),
        mongoDb.collection('transactions').countDocuments(),
        mongoDb.collection('accounts').countDocuments(),
        mongoDb.collection('budgets').countDocuments(),
        mongoDb.collection('goals').countDocuments(),
        mongoDb.collection('notifications').countDocuments(),
      ]);

      return {
        connected: true,
        engine: 'mongodb_atlas',
        isAtlas: true,
        uri: currentAtlasUri ? maskUri(currentAtlasUri) : undefined,
        clusterHost: currentAtlasUri ? extractClusterHost(currentAtlasUri) : 'MongoDB Atlas Cluster',
        databaseName: 'smartfin',
        pingMs: currentPing,
        tls: true,
        collections: {
          users: u,
          transactions: t,
          accounts: a,
          budgets: b,
          goals: g,
          notifications: n,
        },
        lastPing: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('[MongoDB Atlas] Ping failed, temporarily reading from local store:', err.message);
    }
  }

  const store = ensureFileStore();
  return {
    connected: true,
    engine: 'mongodb_embedded',
    isAtlas: false,
    databaseName: 'smartfin (local)',
    collections: {
      users: store.users.length,
      transactions: store.transactions.length,
      accounts: store.accounts.length,
      budgets: store.budgets.length,
      goals: store.goals.length,
      notifications: store.notifications.length,
    },
    lastPing: new Date().toISOString(),
  };
}

// Collection-level MongoDB operations
export const db = {
  users: {
    async findOne(query: any = {}) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('users').findOne(query);
      }
      const store = ensureFileStore();
      return store.users[0] || null;
    },
    async updateOne(query: any, update: any) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('users').updateOne(query, update);
      }
      const store = ensureFileStore();
      if (store.users.length > 0) {
        store.users[0] = {
          ...store.users[0],
          ...(update.$set || update),
          updatedAt: new Date().toISOString(),
        };
        saveFileStore(store);
      }
      return { modifiedCount: 1 };
    },
  },

  transactions: {
    async find(filter: any = {}, sort: any = { date: -1 }) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('transactions').find(filter).sort(sort).toArray();
      }
      const store = ensureFileStore();
      let list = [...store.transactions];
      if (filter.category) {
        list = list.filter((t) => t.category === filter.category);
      }
      if (filter.type) {
        list = list.filter((t) => t.type === filter.type);
      }
      if (filter.$text) {
        const q = filter.$text.toLowerCase();
        list = list.filter(
          (t) =>
            t.merchant.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.notes && t.notes.toLowerCase().includes(q))
        );
      }
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return list;
    },
    async insertOne(doc: any) {
      const newDoc = {
        ...doc,
        _id: doc.id || `tx_${Date.now()}`,
        id: doc.id || `tx_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        await mongoDb.collection('transactions').insertOne(newDoc);
        return newDoc;
      }
      const store = ensureFileStore();
      store.transactions.unshift(newDoc);
      saveFileStore(store);
      return newDoc;
    },
    async updateOne(filter: any, update: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('transactions').updateOne({ $or: [{ _id: id }, { id }] }, update);
      }
      const store = ensureFileStore();
      const idx = store.transactions.findIndex((t) => t.id === id || t._id === id);
      if (idx !== -1) {
        store.transactions[idx] = {
          ...store.transactions[idx],
          ...(update.$set || update),
          updatedAt: new Date().toISOString(),
        };
        saveFileStore(store);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async deleteOne(filter: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('transactions').deleteOne({ $or: [{ _id: id }, { id }] });
      }
      const store = ensureFileStore();
      const initialLen = store.transactions.length;
      store.transactions = store.transactions.filter((t) => t.id !== id && t._id !== id);
      saveFileStore(store);
      return { deletedCount: initialLen - store.transactions.length };
    },
  },

  accounts: {
    async find() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('accounts').find().toArray();
      }
      return ensureFileStore().accounts;
    },
    async insertOne(doc: any) {
      const newDoc = {
        ...doc,
        _id: doc.id || `acc_${Date.now()}`,
        id: doc.id || `acc_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        await mongoDb.collection('accounts').insertOne(newDoc);
        return newDoc;
      }
      const store = ensureFileStore();
      store.accounts.push(newDoc);
      saveFileStore(store);
      return newDoc;
    },
    async updateOne(filter: any, update: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('accounts').updateOne({ $or: [{ _id: id }, { id }] }, update);
      }
      const store = ensureFileStore();
      const idx = store.accounts.findIndex((a) => a.id === id || a._id === id);
      if (idx !== -1) {
        store.accounts[idx] = {
          ...store.accounts[idx],
          ...(update.$set || update),
          updatedAt: new Date().toISOString(),
        };
        saveFileStore(store);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async deleteOne(filter: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('accounts').deleteOne({ $or: [{ _id: id }, { id }] });
      }
      const store = ensureFileStore();
      const prevLen = store.accounts.length;
      store.accounts = store.accounts.filter((a) => a.id !== id && a._id !== id);
      saveFileStore(store);
      return { deletedCount: prevLen - store.accounts.length };
    },
  },

  budgets: {
    async find() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('budgets').find().toArray();
      }
      return ensureFileStore().budgets;
    },
    async updateCategory(category: string, newLimit: number) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('budgets').updateOne(
          { category },
          { $set: { limit: newLimit, updatedAt: new Date().toISOString() } }
        );
      }
      const store = ensureFileStore();
      const item = store.budgets.find((b) => b.category === category);
      if (item) {
        item.limit = newLimit;
        item.updatedAt = new Date().toISOString();
        saveFileStore(store);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async syncSpending(categorySpending: Record<string, number>) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        for (const [cat, spent] of Object.entries(categorySpending)) {
          await mongoDb.collection('budgets').updateOne({ category: cat }, { $set: { spent } });
        }
        return;
      }
      const store = ensureFileStore();
      store.budgets.forEach((b) => {
        b.spent = categorySpending[b.category] || 0;
      });
      saveFileStore(store);
    },
  },

  goals: {
    async find() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('goals').find().toArray();
      }
      return ensureFileStore().goals;
    },
    async insertOne(doc: any) {
      const newDoc = {
        ...doc,
        _id: doc.id || `goal_${Date.now()}`,
        id: doc.id || `goal_${Date.now()}`,
        currentAmount: Number(doc.currentAmount) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        await mongoDb.collection('goals').insertOne(newDoc);
        return newDoc;
      }
      const store = ensureFileStore();
      store.goals.push(newDoc);
      saveFileStore(store);
      return newDoc;
    },
    async updateOne(filter: any, update: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('goals').updateOne({ $or: [{ _id: id }, { id }] }, update);
      }
      const store = ensureFileStore();
      const idx = store.goals.findIndex((g) => g.id === id || g._id === id);
      if (idx !== -1) {
        store.goals[idx] = {
          ...store.goals[idx],
          ...(update.$set || update),
          updatedAt: new Date().toISOString(),
        };
        saveFileStore(store);
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    },
    async deleteOne(filter: any) {
      const id = filter._id || filter.id;
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('goals').deleteOne({ $or: [{ _id: id }, { id }] });
      }
      const store = ensureFileStore();
      const len = store.goals.length;
      store.goals = store.goals.filter((g) => g.id !== id && g._id !== id);
      saveFileStore(store);
      return { deletedCount: len - store.goals.length };
    },
  },

  notifications: {
    async find() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('notifications').find().toArray();
      }
      return ensureFileStore().notifications;
    },
    async insertOne(doc: any) {
      const newDoc = {
        ...doc,
        _id: doc.id || `notif_${Date.now()}`,
        id: doc.id || `notif_${Date.now()}`,
        read: Boolean(doc.read),
        date: doc.date || 'Just now',
        createdAt: new Date().toISOString(),
      };
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        await mongoDb.collection('notifications').insertOne(newDoc);
        return newDoc;
      }
      const store = ensureFileStore();
      store.notifications.unshift(newDoc);
      saveFileStore(store);
      return newDoc;
    },
    async markRead(id: string) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('notifications').updateOne({ $or: [{ _id: id as any }, { id }] } as any, { $set: { read: true } });
      }
      const store = ensureFileStore();
      const item = store.notifications.find((n) => n.id === id || n._id === id);
      if (item) {
        item.read = true;
        saveFileStore(store);
      }
    },
    async markAllRead() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('notifications').updateMany({}, { $set: { read: true } });
      }
      const store = ensureFileStore();
      store.notifications.forEach((n) => (n.read = true));
      saveFileStore(store);
    },
    async deleteOne(id: string) {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('notifications').deleteOne({ $or: [{ _id: id as any }, { id }] } as any);
      }
      const store = ensureFileStore();
      store.notifications = store.notifications.filter((n) => n.id !== id && n._id !== id);
      saveFileStore(store);
    },
    async clearAll() {
      if (activeEngine === 'mongodb_atlas' && mongoDb) {
        return mongoDb.collection('notifications').deleteMany({});
      }
      const store = ensureFileStore();
      store.notifications = [];
      saveFileStore(store);
    },
  },

  async resetData() {
    if (activeEngine === 'mongodb_atlas' && mongoDb) {
      await Promise.all([
        mongoDb.collection('users').deleteMany({}),
        mongoDb.collection('transactions').deleteMany({}),
        mongoDb.collection('accounts').deleteMany({}),
        mongoDb.collection('budgets').deleteMany({}),
        mongoDb.collection('goals').deleteMany({}),
        mongoDb.collection('notifications').deleteMany({}),
      ]);
      await mongoDb.collection('users').insertOne({
        ...INITIAL_USER_PROFILE,
        _id: 'usr_mahi_001' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await mongoDb.collection('transactions').insertMany(
        INITIAL_TRANSACTIONS.map((t) => ({ ...t, _id: t.id as any }))
      );
      await mongoDb.collection('accounts').insertMany(
        INITIAL_ACCOUNTS.map((a) => ({ ...a, _id: a.id as any }))
      );
      await mongoDb.collection('budgets').insertMany(
        INITIAL_BUDGETS.map((b, i) => ({ ...b, _id: `bgt_${i + 1}` as any }))
      );
      await mongoDb.collection('goals').insertMany(
        INITIAL_SAVINGS_GOALS.map((g) => ({ ...g, _id: g.id as any }))
      );
      await mongoDb.collection('notifications').insertMany(
        INITIAL_NOTIFICATIONS.map((n) => ({ ...n, _id: n.id as any }))
      );
      return getDatabaseStatus();
    }

    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    ensureFileStore();
    return getDatabaseStatus();
  },
};
