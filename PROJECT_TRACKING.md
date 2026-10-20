# 🌿 farmTrace — Project Tracking & Architecture Documentation

> **Project Name:** `farmTrace`  
> **Topic:** Organic Food & Agricultural Supply Chain Traceability Platform  
> **Database:** Supabase (`Farm Trace - rosp`)  
> **Status:** In Progress / Refactoring & Modernization  

---

## 📌 Executive Summary
`farmTrace` is an end-to-end decentralized food traceability platform connecting Farmers (producers), Logistics (transporters), Retailers, and Consumers. Through tamper-proof event logging, verifiable QR codes, and digital checkpoints, consumers and partners can verify food origin, quality, and transit history from farm to table.

---

## 🚀 Tasks & Progress Tracker

| Task ID | Component | Description | Status |
| :--- | :--- | :--- | :--- |
| **SEC-01** | Security | Setup root & subfolder `.gitignore` to block `.env`, `id.txt`, and credentials | ✅ Completed |
| **SEC-02** | Security | Provide `.env.example` templates for frontend & backend | ✅ Completed |
| **REB-01** | Branding | Rebrand project to `farmTrace` across config, headers, page titles | 🔄 In Progress |
| **REB-02** | Branding | Strip all personal references & author identifiers (e.g., Shreyas in Topbar) | 🔄 In Progress |
| **UI-01** | Design System | Transition UI to modern neutral palette (Slate/Zinc with refined Emerald accents) | 🔄 In Progress |
| **UI-02** | UI Overhaul | Redesign Topbar with dynamic user profile & clean search | 🔄 In Progress |
| **UI-03** | UI Overhaul | Modernize Sidebar with clean active states & navigation icons | 🔄 In Progress |
| **UI-04** | UI Overhaul | Modernize Landing page (Hero, Cards, How it Works, Stats) without breaking logic | 🔄 In Progress |
| **UI-05** | UI Overhaul | Upgrade Auth screens (Login, Signup, Role selector) with sleek neutral card design | 🔄 In Progress |
| **UI-06** | UI Overhaul | Refine Layout header & footer for clean SaaS presentation | 🔄 In Progress |
| **DB-01** | Database | Validate `schema.sql` compatibility with Supabase `Farm Trace - rosp` | ⏳ Pending user env |
| **GIT-01** | Collaboration | Initialize clean Git repository and verify status (Zero secret leaks) | 🔄 In Progress |

---

## 🏗️ Architecture & Technology Stack

### 1. Frontend
* **Framework:** React 18 + Vite
* **Styling:** Tailwind CSS (Modern Neutral theme: Slate / Zinc / Emerald)
* **Animation:** Framer Motion
* **Icons:** Lucide React & Heroicons
* **QR Tech:** HTML5-QRCode scanner + QRCode.react generator
* **Visuals & Charts:** Recharts & Chart.js

### 2. Backend
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js with Helmet & Rate Limiter
* **Client:** `@supabase/supabase-js`

### 3. Database & Cloud
* **Provider:** Supabase PostgreSQL
* **Auth:** Supabase Auth (Email/Password with user metadata triggers)
* **Schema Tables:**
  - `users` (linked to Supabase `auth.users`)
  - `farms` (farmer farm registry & organic certs)
  - `products` (produce types, category, harvest date)
  - `batches` (batch tracking, quantity, batch codes)
  - `traceability_events` (blockchain-style hash timeline: Harvest -> Transport -> Storage -> Retail)

---

## 🛡️ Security & Zero-Leak Protocol
1. **Never commit `.env` or `id.txt`**: `.gitignore` strictly protects all `.env*` files except `.env.example`.
2. **Clean Collaboration**: Team members copy `.env.example` to `.env` and paste their own project keys.
3. **No hardcoded credentials**: All Supabase connections consume `import.meta.env` (frontend) or `process.env` (backend).

---

## 👥 Roles & Workflows

1. **🌾 Farmer / Producer:**
   - Register farm details and certifications.
   - Create produce batches and generate unique verifiable QR codes.
2. **🚚 Logistics & Transport:**
   - Scan QR code at handover points.
   - Log transport checkpoints (temperature, humidity, GPS location, timestamp).
3. **🏬 Retailer / Store:**
   - Verify batch authenticity upon delivery.
   - Mark batch as ready for retail shelves.
4. **🧑‍🍳 Consumer / Public:**
   - Scan product QR code directly from home/store without logging in.
   - Inspect entire immutable timeline from origin farm to grocery shelf.
