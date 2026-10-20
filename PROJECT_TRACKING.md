# 🌿 farmTrace — Project Tracking & Architecture Documentation

> **Project Name:** `farmTrace`  
> **Topic:** Organic Food & Agricultural Supply Chain Traceability Platform  
> **Database:** Supabase (`Farm Trace - rosp`)  
> **Status:** UI Modernized & Git Initialized (Ready for GitHub Push & Supabase Sync)  

---

## 📌 Executive Summary
`farmTrace` is an end-to-end decentralized food traceability platform connecting Farmers (producers), Logistics (transporters), Retailers, and Consumers. Through tamper-proof event logging, verifiable QR codes, and digital checkpoints, consumers and partners can verify food origin, quality, and transit history from farm to table.

---

## 🚀 Tasks & Progress Tracker

| Task ID | Component | Description | Status |
| :--- | :--- | :--- | :--- |
| **SEC-01** | Security | Setup root & subfolder `.gitignore` to block `.env`, `id.txt`, and credentials | ✅ Completed |
| **SEC-02** | Security | Provide `.env.example` templates for frontend & backend | ✅ Completed |
| **REB-01** | Branding | Rebrand project to `farmTrace` across config, headers, page titles | ✅ Completed |
| **REB-02** | Branding | Strip all personal references & author identifiers (e.g., Shreyas in Topbar) | ✅ Completed |
| **UI-01** | Design System | Transition UI to modern neutral palette (Slate/Zinc with refined Emerald accents) | ✅ Completed |
| **UI-02** | UI Overhaul | Redesign Topbar with dynamic user profile & clean search | ✅ Completed |
| **UI-03** | UI Overhaul | Modernize Sidebar with clean active states & navigation icons | ✅ Completed |
| **UI-04** | UI Overhaul | Modernize Landing page (Hero, Cards, How it Works, Stats) without breaking logic | ✅ Completed |
| **UI-05** | UI Overhaul | Upgrade Auth screens (Login, Signup, Role selector) with sleek neutral card design | ✅ Completed |
| **UI-06** | UI Overhaul | Refine Layout header & footer for clean SaaS presentation | ✅ Completed |
| **BLD-01** | Validation | Reinstalled clean dependencies & verified production build compiles with 0 errors | ✅ Completed |
| **GIT-01** | Collaboration | Initialized fresh Git repository with root commit (Zero secret leaks) | ✅ Completed |
| **DEM-01** | Demo Access | Added 1-Click Instant Demo Login (Farmer, Logistics, Retailer) to Landing & Login | ✅ Completed |
| **DB-01** | Database | Execute `schema.sql` in Supabase (`Farm Trace - rosp`) & configure local `.env` | ⏳ Ready for Sync |

---

## 🛡️ Security & Zero-Leak Protocol
1. **Never commit `.env` or `id.txt`**: Verified with `git status --ignored` — `.env` files and `id.txt` are completely blocked.
2. **Clean Collaboration**: Team members copy `.env.example` to `.env` and paste their own project keys.
3. **No hardcoded credentials**: All Supabase connections consume `import.meta.env` (frontend) or `process.env` (backend).

---

## 🔗 How to Push to Your New GitHub Repository

To push this fresh codebase to your new GitHub repository for collaboration with your friend:

```bash
# 1. Rename current branch to main
git branch -M main

# 2. Add your GitHub repository remote URL (create an empty repo on GitHub first)
git remote add origin https://github.com/<your-username>/farmTrace.git

# 3. Push initial clean commit
git push -u origin main
```

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
