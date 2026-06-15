# <img src="client/src/assets/backgrounds/Removed-bg-NexusGG-Logo.png" alt="NEXUS.GG Logo" width="220" /> 

# 🎮 NEXUS.GG | AI Game Coaching OS

NEXUS.GG is a production-grade, immersive AI-powered Game Coaching Operating System designed to help competitive esports players analyze match telemetry, track daily training checklists, monitor streaks, and receive personalized strategic feedback from game-themed AI coaches.

Featuring a cinematic sci-fi HUD dashboard with glassmorphism, responsive ambient backdrops, and interactive 3D WebGL (Three.js) model views, the platform bridges the gap between raw player performance logs and intelligent coaching.

---

## ⚡ Core Capabilities

- **🚪 Cinematic Portal Authentication**: Immersive portal landing experience utilizing the Web Audio API for synth sounds, typewriter visual telemetry logging, and golden particle burst feedback animations.
- **🛡️ Multi-Game AI Personas**: Dedicated AI coach engines with localized personality heuristics, optimized using the Gemini API & Groq API:
  - **VALORANT** (Coach Ghost — Tactical, precise, and objective-oriented)
  - **CS2** (Coach Vandal — Pragmatic, aggressive positioning and econ strategies)
  - **League of Legends** (Coach Oracle — High-level macro-analysis and rotation timings)
  - **Fortnite** (Coach Skye — Build mechanics, edit speed refinement, and retakes)
  - **PUBG** (Coach Sniper — Rotations, zone management, and micro-survival)
- **📊 Real-time Telemetry Synchronization**: Structured JSON match parsing. Uploaded match logs are processed via real-time triggers to instantly update player stats.
- **📋 Daily Checklists & Streaks**: Gamified level progression tracking. Players earn XP and maintain active streaks by checking off daily training tasks generated dynamically.
- **🦾 Interactive 3D Setup**: Dynamic 360° hardware inspection model viewer and gyroscopic holographic cards displaying active status.

---

## 📂 Project Architecture

```
Nexus-GG/
├── client/                     # React & Vite Frontend Application
│   ├── src/
│   │   ├── assets/             # Game assets (Characters, transparent backgrounds, logos)
│   │   ├── components/         # Reusable UI widgets & 3D visualizations
│   │   │   ├── layout/         # Navigation components (Dynamic Sidebar, Navbar)
│   │   │   ├── dashboard/      # Three.js Hologram, 3D setup, and Stat Ring Visualizer
│   │   │   └── DailyChecklist/ # Daily checklist interface
│   │   ├── hooks/              # Custom hooks for fetching telemetry and streaks
│   │   ├── store/              # Zustand global state managers (Auth, Game, UI)
│   │   ├── App.jsx             # App layout wrapper and page router
│   │   └── index.css           # Core styled classes, custom scrollbars, animations
│   ├── package.json
│   ├── vercel.json             # Vercel SPA routing rewrites
│   └── vite.config.js
│
├── server/                     # Node.js & Express API Backend
│   ├── routes/                 # Express sub-routers (Auth, Matches, Coaching, Progress)
│   ├── middleware/             # Request parsing, auth checkers, and error handlers
│   ├── server.js               # Express app instance and listeners
│   └── package.json
│
└── supabase/                   # Database SQL Scripts & Triggers
    ├── schema.sql              # Core database schema, constraints, and index lists
    ├── fix_triggers.sql        # Auth sync, security definer triggers, and table privileges
    └── update_stats_trigger.sql# Real-time win rate, KD ratio, and match-played trigger calculations
```

---

## ⚙️ Local Development Setup

Follow these instructions to run the stack on your local workspace:

### 1. Database Setup (Supabase)
1. Register/Login to your [Supabase Console](https://supabase.com) and create a new project.
2. In the left panel, navigate to the **SQL Editor**.
3. Copy the contents of `supabase/schema.sql` into the editor and click **Run**.
4. Next, copy and execute `supabase/fix_triggers.sql` to apply schema permissions and set up automatic user profile synchronizations.
5. Copy and execute `supabase/update_stats_trigger.sql` to install the real-time match statistic aggregate triggers.

### 2. Backend Server Configuration
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install standard node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file in the `server/` root:
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   DATABASE_URL=postgresql://postgres.your-project-id:your-password@host:5432/postgres
   GROQ_API_KEY=your-groq-api-key
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-supabase-jwt-secret
   ```
4. Start the backend developer server:
   ```bash
   npm run dev
   ```

### 3. Frontend Client Configuration
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install client-side packages:
   ```bash
   npm install
   ```
3. Create a `.env` configuration file in the `client/` root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=http://localhost:3001
   ```
4. Start the client dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and access: `http://localhost:3000`

---

## 🌐 Production Deployment

### Deploying the Backend API Server (Render)
1. Create a **Web Service** on [Render](https://render.com) and link your GitHub repository.
2. Configure the following project parameters:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
3. Add the following environment keys under **Settings -> Environment Variables**:
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: *Your Supabase Project URL*
   - `SUPABASE_SERVICE_ROLE_KEY`: *Your Service Role Key*
   - `DATABASE_URL`: *Your Supabase PostgreSQL Connection String*
   - `GROQ_API_KEY`: *Your Groq API Key*
   - `GEMINI_API_KEY`: *Your Gemini API Key*
   - `JWT_SECRET`: *Your Supabase JWT Secret*
4. Deploy the service and retrieve the public endpoint (e.g., `https://nexus-gg.onrender.com`).

### Deploying the Frontend React App (Vercel)
1. Import your repository into [Vercel](https://vercel.com).
2. Configure the project build options:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. In the **Environment Variables** panel, register:
   - `VITE_SUPABASE_URL`: *Your Supabase Project URL*
   - `VITE_SUPABASE_ANON_KEY`: *Your Supabase Public Anon Key*
   - `VITE_API_URL`: `https://nexus-gg.onrender.com` *(Point to your deployed Render URL)*
4. Click **Deploy**. Vercel will automatically build the SPA distribution.

### Post-Deployment: Configure Redirect URLs
To enable authentication redirects to work correctly in production:
1. Open your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Set the **Site URL** to:
   ```text
   https://your-app-name.vercel.app
   ```
3. Set the **Redirect URLs** to:
   ```text
   https://your-app-name.vercel.app/**
   ```

---

## 📈 Real-time Analytics Triggers
NEXUS.GG utilizes direct PostgreSQL triggers rather than slow REST routes to calculate profile metrics. When matches are added/updated/deleted in the `match_history` table, a `security definer` trigger function calculates player performance and upserts:
* `matches_played`
* `win_rate` (wins / total matches)
* `kd_ratio` (kills / deaths)

This ensures client dashboards reflect real-time telemetry instantly upon match synchronization.