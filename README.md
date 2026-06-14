# 🎮 NEXUS.GG | AI Game Coaching OS

NEXUS.GG is a production-grade, AI-driven Game Coaching Operating System designed to help competitive players analyze matches, track streaks, execute checklists, and receive personalized coaching insights. It features a cinematic sci-fi interface, neon-themed glassmorphism, and custom vector game integrations.

---

## ⚡ Key Features

- **🚪 Cinematic Portal Auth Flow**: A highly immersive, multi-step portal entry experience featuring Web Audio API sci-fi synthesizer sounds, monospace typewriter effects, and gold particle burst animations.
- **⚙️ Multi-Game Coaching Integration**: Personalized training checklists and AI coaches for five major game arenas:
  - **VALORANT** (Coach Ghost — Tactical & Precise)
  - **CS2** (Coach Vandal — Direct & Pragmatic)
  - **League of Legends** (Coach Oracle — Strategic Macro-Gameplay)
  - **Fortnite** (Coach Skye — Mechanical Build & Edit Speed)
  - **PUBG** (Coach Sniper — Zone Survival & Rotations)
- **📋 Daily Checklist Tracker**: XP level progression system, current streaks, and daily tactical training tasks generated based on player statistics.
- **📊 Real-time Match Telemetry Syncing**: Direct JSON upload interface allowing users to synchronize their match logs for detailed AI analysis and weakness identification reports.
- **🎭 Responsive Dark Mode & Blur Effects**: Widescreen high-resolution character graphics with localized linear gradient backdrop blur overlays keeping the text side clean and the artwork side vibrant.

---

## 🛠️ Tech Stack

- **Frontend**: React (v18), Vite, Zustand (State Management), TailwindCSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express, Multer (File Uploads), CORS.
- **Database / Auth**: Supabase (PostgreSQL), Postgres triggers and security definer functions, Row-Level Security (RLS) policies.
- **AI Integrations**: Gemini API (Multimodal/Inference Routing) and Groq API (High-speed tactical feedback processing).

---

## 📂 Project Architecture

```
Nexus-GG/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── assets/         # 1080p Game Character backgrounds and logos
│   │   ├── components/     # UI elements (GlassCard, GameIcon, Buttons)
│   │   ├── hooks/          # React Custom Hooks (useAuth, useMatches)
│   │   ├── lib/            # Game configurations and state constants
│   │   ├── pages/          # Pages (Landing, Auth, Dashboard, GameArena, etc.)
│   │   ├── store/          # Zustand global state stores
│   │   ├── App.jsx         # Layout wrappers and router
│   │   └── index.css       # Core theme-tailored classes and scrollbars
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express API Server
│   ├── server.js           # API endpoints (checklists, matches, AI analysis)
│   ├── create_test_user.js # Admin seeder script
│   └── package.json
│
└── supabase/               # Database SQL Scripts
    ├── schema.sql          # Primary tables, RLS policies, indexes
    └── fix_triggers.sql    # Security definer function updates & permissions
```

---

## 🚀 Local Development Setup

Follow these steps to run NEXUS.GG on your local computer:

### 1. Database Setup (Supabase)
1. Sign in to your [Supabase Console](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open `supabase/schema.sql` from the repository, copy its contents, and run it. This creates the tables: `users`, `game_profiles`, `matches`, `xp_transactions`, and `streaks`.
4. Next, copy the contents of `supabase/fix_triggers.sql` and execute it. This configures schema-level permissions and creates the `handle_new_user()` security definer function triggers to link auth users automatically.

### 2. Backend Server Setup
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` directory and add the following keys (retrieved from your Supabase Settings -> API):
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   DATABASE_URL=postgresql://postgres.your-project:password@host:5432/postgres
   GROQ_API_KEY=your-groq-api-key
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-supabase-jwt-secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Client Setup
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client/` directory and configure the variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_API_URL=http://localhost:3001
   ```
4. Start the frontend Vite server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

---

## 🌐 Production Deployment Guide

Follow this step-by-step guide to deploy NEXUS.GG to production:

### Step 1: Prepare Your Production Supabase Database
1. Go to your **Supabase Console** -> **Authentication** -> **Providers** -> **Email**.
2. **Disable "Confirm Email"** (optional, but recommended if you want users to log in immediately without checking their inbox).
3. Confirm that all tables, triggers, and Row Level Security (RLS) policies are active by verifying the **Database** schema view.

### Step 2: Deploy the Backend API Server (Render / Railway)
We will use **Render** in this example:
1. Log in to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add the following **Environment Variables** in the Render settings:
   - `PORT`: `10000` (or leave empty; Render assigns one)
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: *Your Supabase URL*
   - `SUPABASE_SERVICE_ROLE_KEY`: *Your Supabase Service Role Key*
   - `GROQ_API_KEY`: *Your Groq API Key*
   - `GEMINI_API_KEY`: *Your Gemini API Key*
   - `JWT_SECRET`: *Your Supabase JWT Secret*
5. Deploy the web service and copy the provided URL (e.g., `https://nexus-gg-api.onrender.com`).

### Step 3: Deploy the Frontend Client (Vercel / Netlify)
We will use **Vercel** in this example:
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. In the project settings, configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** section and add:
   - `VITE_SUPABASE_URL`: *Your Supabase URL*
   - `VITE_SUPABASE_ANON_KEY`: *Your Supabase Anon Public Key*
   - `VITE_API_URL`: *Your deployed backend service URL* (e.g., `https://nexus-gg-api.onrender.com`)
5. Click **Deploy**. Vercel will build the React bundle and host it on a public domain.

### Step 4: Configure CORS (Optional)
If your frontend and backend run on different domains, ensure your backend allows requests from your frontend production domain. The server's CORS config (`server/server.js`) is preset to allow all origins in development, but you can lock it to your Vercel URL in production:
```javascript
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*'
}));
```
Add `CLIENT_ORIGIN` to your backend environment variables with your Vercel URL.