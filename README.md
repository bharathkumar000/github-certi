# Certify – Workshop Certificate Generator

A complete, professional, responsive, full-stack website for generating and downloading authenticated certificates for workshops. Built with **Next.js (App Router)**, **Supabase PostgreSQL**, and **pdf-lib**.

---

## 🚀 Key Features

1. **Dual Portals:**
   - **Participant Portal (`/portal`):** Clean, rate-limited access-code verification leading directly to the live certificate generation workspace (`/portal/certificate`).
   - **Admin Portal (`/admin`):** Secure email & password authenticated portal with dashboard metrics, session management, access-code controls, template uploads, and visual layout configuration.

2. **Real-Time Live Certificate Preview:**
   - As participants type their name, it renders instantly on the certificate preview at the configured coordinates.
   - Dynamic font auto-scaling for long names ensures text never overflows certificate boundaries.
   - Exact 1:1 visual match between preview and downloaded PDF using the official certificate template (`gitopia-certificate.pdf`).

3. **Automatic Date Insertion:**
   - Automatically populates with current date (e.g. `13 October 2026`) in `Asia/Kolkata` timezone (default) avoiding UTC date skew.
   - Optional administrator setting for official fixed workshop dates.

4. **Secure Single-Use Participant Flow:**
   - Once a participant downloads their certificate, the session terminates and immediately redirects them back to the portal for security and attendance tracking.

5. **Visual Template & Layout Editor:**
   - Admins can upload custom PNG, JPEG, or PDF certificate templates.
   - Interactive canvas allows clicking anywhere on the certificate to place Name and Date coordinates.
   - Fine-tune controls for X (%), Y (%), font size, font family, color, alignment, and maximum name width.

6. **Secure Session Isolation & Rate Limiting:**
   - Each session maintains its own access code and hash.
   - Changing/regenerating an access code immediately invalidates the old code for all new access attempts.
   - Inactive sessions reject new participant entries.
   - Server-side sliding-window rate limiting prevents brute-force attempts.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router, Node.js runtime)
- **Language:** JavaScript
- **Styling:** Vanilla CSS (Modern aesthetic, responsive on mobile/tablet/desktop)
- **Database:** Supabase PostgreSQL (with automatic local file store fallback for out-of-the-box local development)
- **PDF Engine:** `pdf-lib` (vector-accurate PDF generation with custom page dimensions matching the certificate)
- **Icons:** `lucide-react`

---

## 📦 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Credentials (Local Development)

- **Login URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email:** `admin@githubworkshop.com`
- **Password:** `WorkshopAdmin2026!`

---

## 🔑 Default Participant Access Code

- **Participant URL:** [http://localhost:3000/portal](http://localhost:3000/portal)
- **Access Code:** `GH-OCT-2026`

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the SQL migration script located in:
   ```
   supabase/schema.sql
   ```
3. Copy your project URL, anon key, and service role key into your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. When Supabase keys are configured, the application automatically connects directly to Supabase PostgreSQL.

---

## 🚀 Deployment to Vercel

1. Push this repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Set Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `DEFAULT_TIMEZONE=Asia/Kolkata`
4. Click **Deploy**.
