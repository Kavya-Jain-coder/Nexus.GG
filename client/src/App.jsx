import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/useAuthStore';
import { useGameStore } from './store/useGameStore';
import { useUIStore } from './store/useUIStore';
import { GAME_CONFIGS } from './lib/gameConfigs';

// Pages
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import GameArena from './pages/GameArena/GameArena';
import CoachingOS from './pages/CoachingOS/CoachingOS';
import Profile from './pages/Profile/Profile';

// Layouts
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PageTransition from './components/layout/PageTransition';

// Private Route Guard
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// App Layout wrapper to handle active game backgrounds
function AppLayout({ children }) {
  const { activeGame } = useGameStore();
  const { sidebarOpen, isHoloFullscreen } = useUIStore();
  const location = useLocation();
  const config = GAME_CONFIGS[activeGame || 'valorant'];

  // Check if current route is public (landing or auth)
  const isPublicRoute = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className={!isPublicRoute ? config?.bgClass : 'theme-nexus'}>
      {/* Full-screen Fixed Parallax Background */}
      {!isPublicRoute && (
        <>
          <div 
            style={{ backgroundImage: `url(${config?.background})` }}
            className="parallax-bg" 
          />
          <div className="gradient-blur-overlay" />
        </>
      )}

      <div className="flex min-h-screen bg-transparent">
        {/* Sidebar Navigation */}
        {!isPublicRoute && !isHoloFullscreen && <Sidebar />}

        {/* Content Panel */}
        <div 
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            !isPublicRoute 
              ? (isHoloFullscreen ? 'pl-0' : (sidebarOpen ? 'pl-20 md:pl-64' : 'pl-20')) 
              : ''
          }`}
        >
          {/* Top Navbar */}
          {!isPublicRoute && <Navbar />}

          {/* Page Routing */}
          <main className={!isPublicRoute ? 'flex-1 pt-28 px-6 sm:px-10 overflow-x-hidden' : 'flex-1'}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Animated Routing Manager
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />

        {/* Private OS Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AppLayout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/arena" element={
          <PrivateRoute>
            <AppLayout>
              <PageTransition>
                <GameArena />
              </PageTransition>
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/coaching" element={
          <PrivateRoute>
            <AppLayout>
              <PageTransition>
                <CoachingOS />
              </PageTransition>
            </AppLayout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <AppLayout>
              <PageTransition>
                <Profile />
              </PageTransition>
            </AppLayout>
          </PrivateRoute>
        } />

        {/* Redirect Fallbacks */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  // Mount session listener
  useAuth();

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
