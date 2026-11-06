# SmartFin+ – Premium Financial Management

> **Next-Generation AI-Powered Wealth Intelligence & Financial Tracking Platform**

---

## 🏛️ Project Architecture (Frontend & Backend Separated)

The project is structured into two completely independent, decoupled services:

```
smartfin+-—-premium-financial-management (1)/
├── frontend/                  # React 19 + Vite + Tailwind CSS (Port 5173)
│   ├── src/                   # Components, Pages, Context, Hooks
│   │   ├── pages/             # LandingPage, Dashboard, Transactions, Budgets, etc.
│   │   ├── components/        # LoginView, Sidebar, Topbar, Modals
│   │   ├── context/           # FinanceContext.tsx
│   │   └── services/          # api.ts (Proxies to backend)
│   ├── vite.config.ts         # Vite dev server + proxy to http://localhost:5000
│   └── package.json           # Frontend dependencies
│
└── backend/                   # Node.js + Express.js + MongoDB Engine (Port 5000)
    ├── server.ts              # Standalone Express Server with CORS
    ├── routes/                # API Endpoints (/health, /auth, /transactions, etc.)
    ├── db/                    # MongoDB Atlas & Embedded Document Engine
    ├── data/                  # Default ledger seed & demo records
    └── package.json           # Backend dependencies
```

---

## 🚀 How to Run Locally

### Fast 1-Command Startup (Runs Frontend & Backend Together)
```bash
npm run dev
```

---

### Or Run in Decoupled Terminals

#### 1. Start the Backend API Server (Port 5000)
```bash
cd backend
npm run dev
```
- **Backend URL**: [http://localhost:5000](http://localhost:5000)
- **API Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

#### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
```
- **Local Application Link**: **[http://localhost:5173](http://localhost:5173)**

---

## 🍃 MongoDB Atlas Cloud Database Configuration

SmartFin+ supports both **MongoDB Atlas Cloud** and an embedded local document engine fallback.

### Option A: Live UI Configuration (Zero Downtime)
1. Launch the app and visit **Settings** (`/settings`).
2. Scroll to **MongoDB Atlas Cloud Architecture**.
3. Paste your Atlas URI string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartfin?retryWrites=true&w=majority`
4. Click **Test Connection** (checks latency & TLS handshake) &rarr; **Connect to Cluster**.
5. Click **Sync All Data to Atlas Cluster** to push local accounts, transactions, budgets, and goals to Atlas.

### Option B: Environment Variable (.env)
Add your MongoDB Atlas URI to `.env` or `backend/.env`:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/smartfin?retryWrites=true&w=majority"
```

> **Note:** Ensure your Atlas cluster allows Network Access from `0.0.0.0/0` (anywhere). If `MONGODB_URI` is empty, the app automatically falls back to its embedded local engine.

---

## 🔗 Quick Navigation & Flow

1. **Cover Page**: `http://localhost:5173/`
   - Hero section with live 3D preview and 4 floating metric cards
   - Features, How It Works, Interactive Wealth Planner, About Us, Contact
2. **Registration**: `http://localhost:5173/register`
   - Passwordless email OTP verification or 1-click Google authentication
3. **Login**: `http://localhost:5173/login`
   - Quick login, OTP, or instant demo entry
4. **Financial Dashboard**: `http://localhost:5173/dashboard`
   - Real-time cashflow analytics, budgets, savings goals, multi-currency switcher, AI assistant
