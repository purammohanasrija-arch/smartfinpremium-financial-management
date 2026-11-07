# SmartFin+ – Complete Project Documentation & Engineering Manual

> **Enterprise-Grade MERN Stack Financial Intelligence, Multi-Asset Wealth Tracking & AI Decision Platform**
> 
> **Repository:** [https://github.com/purammohanasrija-arch/smartfinpremium-financial-management](https://github.com/purammohanasrija-arch/smartfinpremium-financial-management)
> 
> **Live Web Application (Vercel):** [https://smartfinpremium-financial-managemen.vercel.app/](https://smartfinpremium-financial-managemen.vercel.app/)
> 
> **Live Backend API (Render):** [https://smartfin-backend-5shw.onrender.com/api/health](https://smartfin-backend-5shw.onrender.com/api/health)

---

## 📑 Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Application Modules & Feature Guide](#4-application-modules--feature-guide)
   - [AI Financial Time Machine & What-If Simulator](#41-ai-financial-time-machine--what-if-simulator)
   - [Net Worth & Asset-Liability Balance Sheet](#42-net-worth--asset-liability-balance-sheet)
   - [AI Smart Receipt & Bill OCR Scanner Studio](#43-ai-smart-receipt--bill-ocr-scanner-studio)
   - [Recurring Subscriptions & Bills Hub](#44-recurring-subscriptions--bills-hub)
   - [Financial Tools & Calculators Hub](#45-financial-tools--calculators-hub)
   - [Core Banking, Budgets & Goals](#46-core-banking-budgets--goals)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
6. [Backend API Specifications](#6-backend-api-specifications)
7. [Step-by-Step Deployment Guide](#7-step-by-step-deployment-guide)
   - [Backend Deployment on Render](#71-backend-deployment-on-render)
   - [Frontend Deployment on Vercel](#72-frontend-deployment-on-vercel)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Offline-First Resiliency & Fallback Strategy](#9-offline-first-resiliency--fallback-strategy)
10. [Local Development Guide](#10-local-development-guide)

---

## 1. Executive Overview

**SmartFin+** is a full-stack, enterprise-grade personal wealth and financial intelligence management suite designed to replace multiple fragmented tools (budgeting spreadsheets, subscription trackers, loan calculators, and net worth dashboards). 

Built with **React 19**, **TypeScript 5.7**, **Express.js**, and **MongoDB Atlas**, it combines real-time transactional ledgers with forward-looking financial forecasting, predictive life-scenario simulations, automated spending anomaly detection, and interactive loan amortization modeling.

### Key Pillars
- **Forward-Looking Wealth Simulation:** Don't just analyze past spending; simulate alternate financial realities 5 to 25 years into the future with compounding math.
- **True Balance Sheet Equity:** Track gross assets (bank accounts, mutual funds, real estate, gold, retirement) against debt obligations (home loans, car loans, credit cards) for a real Net Worth figure.
- **Subscription Run-Rate Auditing:** Audit recurring fixed commitments, detect unused subscriptions, and calculate annual savings with 1-click pause toggles.
- **Cloud Database Resiliency:** Direct integration with MongoDB Atlas cluster with automatic failover to an embedded JSON document engine for uninterrupted zero-crash offline execution.

---

## 2. High-Level Architecture

The platform follows a decoupled client-server architecture with an intelligent proxy layer and cloud database synchronization:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER / CLIENT                           │
│                                                                        │
│   React 19 SPA (Vite) + Tailwind CSS + Recharts + Lucide Icons         │
│   ├── Interactive Time Machine Simulator (/simulator)                 │
│   ├── Net Worth & Asset Allocation (/networth)                         │
│   ├── Recurring Subscriptions Hub (/subscriptions)                     │
│   ├── Financial Planning Calculators (/tools)                          │
│   └── Real-time Dashboard, Transactions, Budgets & Analytics          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (VITE_API_URL)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js on Node.js)                  │
│                                                                        │
│   ├── REST Routing Layer (/api/health, /api/transactions, etc.)        │
│   ├── Financial Calculations & Anomaly Sentinel Utilities              │
│   ├── Live CSV & Ledger Export Engine                                  │
│   └── Database Abstraction Manager (db/mongo.ts)                       │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
      Connected?    │ Yes                            │ No / Offline
                    ▼                                ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   MongoDB Atlas Cloud Database  │   │  Embedded Local Document Engine  │
│      (Cluster0 / M0 Tier)       │   │   (.data/mongodb_store.json)     │
│   Collections:                  │   │   Full MongoDB BSON Semantics    │
│   users, transactions, accounts,│   │   Automatic Seeding & Fallback   │
│   budgets, goals, notifications │   └──────────────────────────────────┘
└─────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend Service (`/frontend`)
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19.0.0 | High-performance, concurrent UI rendering |
| **Language** | TypeScript 5.7.2 | End-to-end type safety and contract verification |
| **Build Tool** | Vite 8.3.6 | Sub-second HMR and optimized production bundling |
| **Styling** | Tailwind CSS v4 | Responsive, dark-mode first design system |
| **Visualizations** | Recharts 3.10.1 | Composable, accessible charts (Area, Donut, Bar, Line) |
| **Icons** | Lucide React 0.546.0 | Clean, unified SVG icon set |
| **Routing** | React Router DOM v7 | Declarative SPA route management with Route Guards |

### Backend Service (`/backend`)
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (ES Modules) | High-throughput asynchronous event-driven server |
| **Framework** | Express.js 4.21.2 | Lightweight REST API endpoint router with CORS |
| **Database Driver** | MongoDB Native Driver 7.8.0 | High-performance driver for Atlas cluster connections |
| **Execution** | tsx (TypeScript Execute) | Direct TypeScript server execution without build steps |
| **Configuration** | Dotenv 17.2.3 | Environment variable isolation per deploy context |

---

## 4. Application Modules & Feature Guide

### 4.1. AI Financial Time Machine & What-If Simulator (`/simulator`)
- **Dual-Trajectory Projection:** Plots the user's **Current Baseline** against an interactive **Simulated Scenario** over 3 to 25 years.
- **Preset Scenarios:**
  - *Coffee / Takeout Habit Trap:* Cutting ₹4,500/mo dining and compounding at 12% p.a.
  - *New Car Purchase Dilemma:* Down payment + loan EMI + maintenance for 5 years.
  - *6-Month Career Break:* Simulating 0 income while relying on liquid reserves.
  * *Promotion & 50/50 Raise Rule:* Spending half the raise and saving half to eliminate lifestyle inflation.
  - *Dream Home Purchase:* Down payment + mortgage payments replacing rental cost.
- **Custom Knobs & Levers:** Sliders for upfront lump sum, monthly expense delta, monthly income delta, compounding rate, and duration.
- **AI Verdict:** Calculates net wealth impact and years gained or lost toward financial independence.

### 4.2. Net Worth & Asset-Liability Balance Sheet (`/networth`)
- **Total Real Equity Telemetry:** Tracks `Net Worth = Gross Assets - Gross Liabilities`.
- **Debt Leverage Meter:** Monitors debt-to-asset leverage percentage with health thresholds.
- **Asset Allocation Portfolio Donut:** Visualizes distribution across Cash, Equities, Real Estate, Gold, and Retirement funds.
- **Live Bank Synchronization:** Automatically brings in accounts from `FinanceContext`.
- **Milestone Freedom Roadmap:** Tracks progression toward ₹10 Lakhs, ₹25 Lakhs, ₹50 Lakhs, and ₹1 Crore milestones with estimated completion dates.

### 4.3. AI Smart Receipt & Bill OCR Scanner Studio (`/scanner`)
- **Interactive OCR Parser:** Drag-and-drop or upload receipt images and PDF bills with animated scanning laser.
- **Automated Data Extraction:** Accurately parses Merchant Name, Transaction Date, Subtotal, Taxes, Payment Account, and Itemized line items.
- **AI Category Mapping:** Automatically categorizes parsed bills into SmartFin+ budget categories with confidence scores (e.g., 99.4% Food & Dining).
- **1-Click Ledger Commit:** Direct push into live ledger and MongoDB collections without manual typing.
- **Pre-Loaded Sample Bills:** Includes pre-configured digital receipts (Starbucks, Reliance Fresh, Apple Store, Shell Fuel, Amazon India) for instant zero-file testing.

### 4.4. Recurring Subscriptions & Bills Hub (`/subscriptions`)
- **Monthly Run-Rate Ticker:** Computes total monthly recurring spend across active subscriptions.
- **Annual Projection:** Forecasts 12-month fixed commitments.
- **1-Click Pause / Resume:** Toggle plans off without deleting records; instantly displays monthly and annual savings.
- **Due Soon Alerts:** Highlights bills renewing in the next 10 days with urgent alert badges.
- **Waste Optimization Audit:** Recommends annual billing discounts and flags overlapping streaming services.

### 4.5. Financial Tools & Calculators Hub (`/tools`)
- **Loan EMI & Prepayment Optimizer:**
  - Computes monthly EMI, total interest, and total cost.
  - Prepayment simulator: Displays how paying +₹5,000/mo cuts years off tenure and saves substantial interest.
  - Year-by-year amortization breakdown table.
- **SIP & Compound Wealth Forecaster:**
  - Simulates wealth accumulation with an optional annual step-up contribution (e.g. +10%/year).
  - Compares invested capital against compounding returns.
- **Emergency Runway Sentinel:**
  - Computes exact months of survival runway using live liquid checking/savings accounts vs. monthly burn.
  - Provides Fortress Defense (>6 mos), Healthy Baseline (3–6 mos), or Vulnerable (<3 mos) ratings.
- **Smart Group Bill Splitter:**
  - Split bills among custom named friends with adjustable tip (0–20%) and tax.
  - One-click copy formatted summary for WhatsApp/Telegram group chats.

### 4.6. Core Banking, Budgets & Goals
- **Multi-Account Manager (`/accounts`):** Checking, Savings, Investment, and Digital Wallets.
- **Budget Thresholds (`/budgets`):** Category-level limits with percentage progress meters.
- **Milestone Savings Goals (`/goals`):** Goal progress tracking with 1-click account contributions.
- **Multi-Currency Engine:** Instant conversion across INR (₹), USD ($), EUR (€), GBP (£), and AED (د.إ).

---

## 5. Database Architecture & Data Models

When connected to MongoDB Atlas, SmartFin+ operates on the `smartfin` database across 6 primary collections:

### 1. `users`
```json
{
  "_id": "usr_mahi_001",
  "name": "Mahi",
  "email": "mahi@smartfin.io",
  "title": "Premium User",
  "avatar": "...",
  "currency": "INR",
  "currencySymbol": "₹",
  "createdAt": "2026-10-01T00:00:00.000Z"
}
```

### 2. `transactions`
```json
{
  "_id": "tx-1",
  "date": "2026-10-24",
  "merchant": "Swiggy Food Delivery",
  "amount": 840,
  "category": "Food & Dining",
  "type": "expense",
  "account": "HDFC Bank Salary Account",
  "status": "completed",
  "notes": "Team dinner order"
}
```

### 3. `accounts`
```json
{
  "_id": "acc-1",
  "name": "HDFC Bank Salary Account",
  "type": "Bank",
  "accountNumber": "•••• 4892",
  "balance": 18450,
  "color": "#0ea5e9",
  "institution": "HDFC Bank Ltd."
}
```

### 4. `budgets`
```json
{
  "_id": "bgt_1",
  "category": "Food & Dining",
  "spent": 8400,
  "limit": 12000,
  "period": "monthly"
}
```

### 5. `goals`
```json
{
  "_id": "goal-1",
  "title": "Emergency Reserve Fund",
  "targetAmount": 300000,
  "currentAmount": 180000,
  "targetDate": "2027-06-30",
  "category": "Safety"
}
```

### 6. `notifications`
```json
{
  "_id": "notif-1",
  "title": "Unusual Spending Detected",
  "message": "Dining outflow exceeded weekly standard by 42%",
  "type": "warning",
  "read": false,
  "date": "2026-11-05T10:15:00.000Z"
}
```

---

## 6. Backend API Specifications

Base URL: `https://<YOUR_RENDER_BACKEND>.onrender.com/api` (or `http://localhost:5000/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Full stack health check (MongoDB Atlas status, ping, collections, Node version) |
| `GET` | `/db/status` | Live database telemetry, active engine, cluster host, and collection document counts |
| `POST` | `/db/atlas-test` | Tests connectivity and latency of an Atlas URI without switching |
| `POST` | `/db/atlas-connect` | Dynamically switches active cluster to the provided connection string |
| `POST` | `/db/atlas-sync` | Synchronizes all local documents to the connected MongoDB Atlas cluster |
| `POST` | `/db/disconnect` | Reverts database back to the local embedded JSON document engine |
| `GET` | `/transactions` | Retrieves all ledger transactions with date filtering |
| `POST` | `/transactions` | Creates a new transaction with automatic account balance deduction |
| `DELETE`| `/transactions/:id`| Removes a transaction and adjusts balance accordingly |
| `GET` | `/accounts` | Retrieves all bank, digital wallet, and investment accounts |
| `POST` | `/accounts/transfer`| Executes an atomic funds transfer between two accounts |
| `GET` | `/budgets` | Retrieves monthly category budget caps and current spent amounts |
| `PUT` | `/budgets/:category`| Updates spending threshold for a specific category |
| `GET` | `/goals` | Retrieves active savings goals and completion percentages |
| `POST` | `/goals/:id/contribute`| Adds funds to a goal from a selected bank account |
| `GET` | `/export/csv` | Streams a complete financial ledger CSV export |

---

## 7. Step-by-Step Deployment Guide

### 7.1. Backend Deployment on Render

1. Sign in to **[dashboard.render.com](https://dashboard.render.com)** with your GitHub account.
2. Click **New +** &rarr; **Web Service**.
3. Select the repository: `purammohanasrija-arch/smartfinpremium-financial-management`.
4. Configure the service settings:
   - **Name:** `smartfin-backend`
   - **Region:** Closest to your users (e.g., *Singapore*, *Frankfurt*, *Oregon*)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = `mongodb+srv://admin:Srija212006@cluster0.r1kjs29.mongodb.net/smartfin?retryWrites=true&w=majority`
   - `PORT` = `10000`
6. Click **Deploy Web Service**.
7. Once live, copy your assigned URL (e.g. `https://smartfin-backend-xxxx.onrender.com`).

---

### 7.2. Frontend Deployment on Vercel

1. Log in to **[vercel.com](https://vercel.com)** with your GitHub account.
2. Click **Add New…** &rarr; **Project**.
3. Import `purammohanasrija-arch/smartfinpremium-financial-management`.
4. Set the project parameters:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `vite build` (or leave default)
   - **Output Directory:** `dist` (or leave default)
5. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://smartfin-backend-xxxx.onrender.com` (Your live Render backend URL)
6. Click **Deploy**.
7. In ~30 seconds, your frontend will be live on a globally distributed CDN!

---

## 8. Environment Variables Reference

### Backend (`/backend/.env`)
```env
# Port for the Express API server (Default: 5000 locally, 10000 on Render)
PORT=5000

# MongoDB Atlas Connection String
# Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://admin:Srija212006@cluster0.r1kjs29.mongodb.net/smartfin?retryWrites=true&w=majority

# Optional: Google Gemini AI API Key for financial chat assistant
GEMINI_API_KEY=
```

### Frontend (`/frontend/.env`)
```env
# URL of the Express backend API (omit in local development to use Vite's proxy)
VITE_API_URL=https://smartfin-backend.onrender.com
```

---

## 9. Offline-First Resiliency & Fallback Strategy

SmartFin+ is engineered with a **zero-crash guarantee**:

1. **Missing or Invalid MongoDB URI:** If `MONGODB_URI` is omitted or credentials are unreachable, the server logs a notice and switches seamlessly to its **embedded local document engine** stored at `backend/.data/mongodb_store.json`.
2. **DNS SRV Resolution on Windows:** Includes automated fallback to Google Public DNS (`8.8.8.8`) to prevent `querySrv ECONNREFUSED` issues common on local ISPs.
3. **CORS Safe Mode:** The backend dynamically allows credentials and preflight checks from both local and deployed Vercel origins.
4. **Client-Side State Persistence:** The frontend's Subscriptions, Net Worth items, and Time Machine scenarios persist in browser local storage for instant responsiveness even under slow networks.

---

## 10. Local Development Guide

### Prerequisites
- Node.js version 18.x or higher
- npm 9.x or higher

### 1-Command Startup
```powershell
# From the project root, install and start both services concurrently:
npm run dev
```

### Manual Individual Commands
```powershell
# Run the Backend Server (Port 5000):
npm run dev:backend

# Run the Frontend App (Port 5173):
npm run dev:frontend
```

Access the application in your browser at: **`http://localhost:5173`**
