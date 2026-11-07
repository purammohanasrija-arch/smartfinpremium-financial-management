# SmartFin+ – Premium Wealth Intelligence & Financial Tracking

[![React 19](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg?logo=express)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Cloud-green.svg?logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Next-Generation Personal Wealth Intelligence, Multi-Asset Net Worth Tracking & AI Decision Simulation Platform**

### 🌐 Live Production Deployments
* 💻 **Live Web App (Vercel):** **[smartfinpremium-financial-managemen.vercel.app](https://smartfinpremium-financial-managemen.vercel.app/)**
* 🔌 **Live Backend API (Render):** **[smartfin-backend-5shw.onrender.com](https://smartfin-backend-5shw.onrender.com/api/health)**
* 🍃 **Database:** **MongoDB Atlas Cloud (`smartfin`)**

---

## 🌟 What's Inside SmartFin+?

* ⏳ **AI Financial Time Machine & What-If Simulator (`/simulator`)**: Simulate real-life decisions (car purchases, career breaks, habit changes, salary raises) and see their compounding impact 5 to 25 years into the future.
* 🏛️ **Net Worth & Balance Sheet Hub (`/networth`)**: Track true equity (`Gross Assets − Liabilities`), debt leverage ratios, asset allocation donuts, and financial independence milestones.
* 🧾 **AI Smart Receipt & Bill OCR Scanner (`/scanner`)**: Drag-and-drop receipt images and invoices for instant scanning, itemized breakdown extraction, and 1-click ledger logging.
* 💳 **Subscriptions & Recurring Bills Hub (`/subscriptions`)**: Audit recurring SaaS, streaming, and utility run-rates with 1-click pause toggles, due-soon alerts, and waste optimization insights.
* 🧮 **Financial Tools & Calculators Hub (`/tools`)**: Loan EMI & prepayment optimizer, SIP compound wealth forecaster, emergency runway sentinel, and group bill splitter with WhatsApp export.
* 📊 **Live Ledger & Category Budgets**: Comprehensive transaction ledger with spending anomaly detection, multi-currency switcher (₹, $, €, £, د.إ), and category thresholds.
* 🍃 **MongoDB Atlas Cloud Synchronized**: Native MERN stack backend with live cluster connectivity, collection counters, and an embedded local document engine fallback for offline use.

---

## 🏛️ Project Structure

```
smartfinpremium-financial-management/
├── frontend/                  # React 19 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── pages/             # Time Machine, Net Worth, Subscriptions, Tools, Dashboard, etc.
│   │   ├── components/        # Modals, Sidebar, Topbar, StatCards
│   │   ├── context/           # FinanceContext.tsx (Global State & Live Sync)
│   │   └── services/          # api.ts (Backend communication)
│   ├── vite.config.ts         # Vite server + API proxy
│   └── vercel.json            # Vercel deployment rewrites
│
├── backend/                   # Node.js + Express + MongoDB Atlas
│   ├── server.ts              # Express API server with CORS
│   ├── routes/api.ts          # REST endpoints (/health, /transactions, /budgets, /db)
│   ├── db/mongo.ts            # MongoDB Atlas connection manager & seeder
│   └── tsconfig.json          # TypeScript server config
│
├── render.yaml                # Render cloud deployment blueprint
├── vercel.json                # Vercel root deployment configuration
├── PROJECT_DOCUMENTATION.md   # Complete technical & architecture manual
└── package.json               # Root monorepo scripts
```

---

## 🚀 Quick Start (Local Development)

### 1-Command Startup
```bash
# Starts both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## ☁️ Deployment Guide

### 1. Backend on Render
1. Go to **[dashboard.render.com](https://dashboard.render.com)** and create a new **Web Service**.
2. Link repository: `purammohanasrija-arch/smartfinpremium-financial-management`.
3. Set **Root Directory** to `backend`, **Build Command** to `npm install`, **Start Command** to `npm start`.
4. Add Environment Variables:
   * `MONGODB_URI` = `mongodb+srv://admin:Srija212006@cluster0.r1kjs29.mongodb.net/smartfin?retryWrites=true&w=majority`
   * `PORT` = `10000`
5. Deploy and copy your live backend URL (e.g. `https://smartfin-backend.onrender.com`).

### 2. Frontend on Vercel
1. Go to **[vercel.com](https://vercel.com)** &rarr; **Add New Project**.
2. Import repository: `purammohanasrija-arch/smartfinpremium-financial-management`.
3. Set **Root Directory** to `frontend`, **Preset** to `Vite`.
4. Add Environment Variable:
   * `VITE_API_URL` = `https://smartfin-backend.onrender.com`
5. Click **Deploy**!

---

## 📖 Complete Technical Manual

For the complete architectural diagrams, API endpoint specifications, MongoDB schemas, and security details, see:
👉 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

---

## 📄 License
Released under the [MIT License](./LICENSE).
