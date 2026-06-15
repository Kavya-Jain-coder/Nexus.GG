import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sword, 
  BrainCircuit, 
  User, 
  Menu, 
  ChevronLeft,
  Settings,
  LogOut 
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { playSynthSound } from '../../lib/sound';
import logoImg from '../../assets/backgrounds/Removed-bg-NexusGG-Logo.png';

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, isHoloFullscreen } = useUIStore();
  const { profile } = useAuthStore();
  const location = useLocation();

  if (isHoloFullscreen) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Game Arena', path: '/arena', icon: Sword },
    { name: 'Coaching OS', path: '/coaching', icon: BrainCircuit },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    playSynthSound('transition');
    await supabase.auth.signOut();
  };

  const handleCollapseToggle = () => {
    playSynthSound('click');
    toggleSidebar();
  };

  return (
    <aside
      className={`
        fixed 
        top-0 
        left-0 
        h-screen 
        z-30 
        glass-panel 
        border-r 
        border-white/5 
        flex 
        flex-col 
        justify-between 
        transition-all 
        duration-350 
        ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Top Section - Brand logo & Collapse trigger */}
      <div>
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/5">
          <Link 
            to="/dashboard" 
            className="flex items-center select-none overflow-hidden pr-2"
            onClick={() => playSynthSound('click')}
            onMouseEnter={() => playSynthSound('hover')}
          >
            <img 
              src={logoImg} 
              alt="NEXUS.GG Logo" 
              className={`filter drop-shadow-[0_0_12px_var(--game-glow)] transition-all duration-300 transform-gpu ${
                sidebarOpen 
                  ? 'h-15 w-auto object-contain max-w-[170px] scale-110 -ml-2' 
                  : 'h-14 w-14 object-cover object-left rounded-lg pl-2 scale-125'
              }`}
            />
          </Link>
          {sidebarOpen && (
            <button 
              onClick={handleCollapseToggle}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
 
        {/* Navigation Items */}
        <nav className="mt-8 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={() => playSynthSound('hover')}
                onClick={() => playSynthSound('click')}
                className={`
                  flex 
                  items-center 
                  gap-4 
                  px-4 
                  py-3.5 
                  rounded-xl 
                  font-medium 
                  transition-all 
                  duration-200
                  ${isActive 
                    ? 'bg-[var(--game-accent)]/10 text-[var(--game-accent)] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)] border-l-4 border-[var(--game-accent)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-4 border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--game-accent)]' : 'text-slate-400'}`} />
                {sidebarOpen && <span className="text-sm tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - User details & Logout */}
      <div className="p-4 border-t border-white/5">
        {!sidebarOpen && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleCollapseToggle}
              className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        {sidebarOpen && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 text-lg">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.display_name || 'Player'}</p>
                <p className="text-xs text-slate-500 truncate">@{profile?.username || 'nexus_player'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold tracking-wider transition-colors"
            >
              <LogOut className="w-4 h-4" />
              LOG OUT
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
