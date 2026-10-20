# 🌿 farmTrace — Decentralized Food Traceability Platform

> **farmTrace** is an end-to-end food supply chain provenance and verification system connecting Farmers, Logistics Fleets, Retailers, and Consumers. Through tamper-proof event logging and cryptographic QR tags, consumers and auditing bodies can verify authentic farm origin, transit conditions, and shelf freshness.

---

## 🎯 Key Capabilities

* **🌾 Producer / Farm Management:** Log harvests, record batch metadata, specify organic certifications, and issue tamper-proof QR codes.
* **🚚 Cold-Chain & Fleet Tracking:** Checkpoint sign-offs with simulated temperature logs, location stamps, and transit handovers.
* **🏬 Retail & Provenance Hub:** Verify incoming batch authenticity prior to stocking and monitor shelf inventory.
* **🧑‍🍳 Public Consumer Transparency:** Zero-login instant QR code scanner to view full provenance from seed to retail shelf.
* **🔐 Enterprise Node Authentication:** Supabase Auth integration with automated role-based metadata access control.
* **🎨 Modern Neutral Interface:** Professional enterprise palette (Slate/Zinc with subtle Emerald accents) built with React and Tailwind CSS.

---

## 🏗️ Technical Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts |
| **Backend API** | Node.js (ESM), Express.js, Helmet, Rate Limiter |
| **Database & Auth** | Supabase (PostgreSQL with Auth Triggers & JSONB storage) |
| **QR & Scanning** | HTML5-QRCode scanner, qrcode.react generator |

---

## 📁 Repository Structure

```text
farmTrace/
├── backend/                # Express API & Supabase Admin service
│   ├── src/
│   │   ├── config/         # Supabase client setup
│   │   └── routes/         # Auth, farmers, products & journey endpoints
│   ├── .env.example        # Backend environment template (safe for git)
│   └── server.js           # API entrypoint (Port 5000)
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Layout, Topbar, Sidebar, QR Scanner, Cards, Tables
│   │   ├── contexts/       # Supabase AuthContext
│   │   ├── pages/          # Landing, Dashboard, Login, Signup, Journey
│   │   └── config/         # Client Supabase configuration
│   ├── .env.example        # Frontend environment template (safe for git)
│   └── vite.config.js
│
├── schema.sql              # Supabase PostgreSQL schema & triggers
├── PROJECT_TRACKING.md     # Engineering milestone tracking
└── README.md               # Project documentation
```

---

## ⚙️ Quick Start & Setup Guide

### 1. Database Setup (Supabase)
1. Open your Supabase Dashboard: [https://supabase.com](https://supabase.com)
2. Create or select your project (e.g. `Farm Trace - rosp`).
3. Open the **SQL Editor** tab from the left sidebar.
4. Copy the entire contents of [`schema.sql`](./schema.sql) and click **Run**.
5. Navigate to **Project Settings** -> **API** to copy:
   - `Project URL`
   - `anon public` key
   - `service_role secret` key

---

### 2. Backend Setup
```bash
cd backend
# 1. Create your local .env from template
cp .env.example .env

# 2. Add your Supabase credentials into backend/.env
# PORT=5000
# SUPABASE_URL=https://<your-project-id>.supabase.co
# SUPABASE_SERVICE_KEY=<your-service-role-key>

# 3. Install dependencies & start
npm install
npm run dev    # or: npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

---

### 3. Frontend Setup
```bash
cd frontend
# 1. Create your local .env from template
cp .env.example .env

# 2. Add your Supabase public credentials into frontend/.env
# VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
# VITE_SUPABASE_ANON_KEY=<your-anon-key>

# 3. Install dependencies & start
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🛡️ Security & Zero-Leak Commitment
* **No Secret Leaks:** `.env` and sensitive files are strictly excluded from git tracking via comprehensive `.gitignore` rules.
* **Safe Team Collaboration:** Collaborators simply configure their own `.env` files using `.env.example`.

---

## 📜 Academic & Research Attribution
Designed and built for agricultural supply chain transparency and academic review.  
Platform Version: `farmTrace v2.0`
