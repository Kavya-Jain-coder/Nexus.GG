import React, { useState, useEffect, useRef } from 'react';
import { User, Keyboard, ShieldAlert, Award, Calendar, Image as ImageIcon, Maximize2, X, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import StreakCounter from '../../components/StreakSystem/StreakCounter';
import RankBadge from '../../components/StreakSystem/RankBadge';
import GlassCard from '../../components/ui/GlassCard';
import ThreeIdentityCore from '../../components/dashboard/ThreeIdentityCore';
import ThreeHardwareSetup from '../../components/dashboard/ThreeHardwareSetup';
import { useAuthStore } from '../../store/useAuthStore';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import { getRankDetails } from '../../lib/constants';
import { playSynthSound } from '../../lib/sound';
import { supabase } from '../../lib/supabase';

const BUILTIN_AVATARS = {
  valorant: [
    { name: 'Jett', url: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png' },
    { name: 'Phoenix', url: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png' },
    { name: 'Sage', url: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png' },
    { name: 'Omen', url: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png' }
  ],
  cs2: [
    { name: 'Bloody Darryl', url: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIa-2lmxU-LR0dnuNm6E8Vl45Iv181z1fgn8oYby8iRe_OGnZ6psLM-FD3WWlKAhtLhqHXDilxgm4z7dztesJH2SbgApCMchFrQNsRSxw4XhYeK0swbYlcsbmucxTysR' },
    { name: 'Mae Jamison', url: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIa-2lmxU-LR0dnuNm6E8Vl45Iv181z1fh7lk6nz6iNP0OSveq1sLuSWQDGVlbx34-Q8HC3nk012tWzTzY79JHiQOgYpW8B3EeYN40HtxtzlNuz8p1uJLMIs6sE' },
    { name: 'Miami Darryl', url: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIa-2lmxU-LR0dnuNm6E8Vl45Iv181z1fgn8oYby8iRe_OGnZ6psLM-FD3WWj-gn47Q-GH7qxkhwsWjWyN6pJynGZld0CJR3QOdbtRa4lIGxY7_g7wfAy9USZdxTISw' },
    { name: 'McCoy', url: 'https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIa-2lmxU-LR0dnuNm6E8Vl45Iv181z1fh7lk6nz6XRk-fO8YaVjNPzdCGbJxb1zs-JvGCrql0h3tm7cyov_JS-XblImDcAhQe8OtBK4k4bgZPSiuVIHzmbjrQ' }
  ],
  lol: [
    { name: 'Yasuo', url: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png' },
    { name: 'Ahri', url: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png' },
    { name: 'Jinx', url: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png' },
    { name: 'Lux', url: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Lux.png' }
  ],
  fortnite: [
    { name: 'Jonesy', url: 'https://fortnite-api.com/images/cosmetics/br/cid_883_athena_commando_m_chonejonesy/icon.png' },
    { name: 'Midas', url: 'https://fortnite-api.com/images/cosmetics/br/cid_694_athena_commando_m_catburglar/icon.png' },
    { name: 'Raven', url: 'https://fortnite-api.com/images/cosmetics/br/cid_102_athena_commando_m_raven/icon.png' },
    { name: 'Cuddle Team Leader', url: 'https://fortnite-api.com/images/cosmetics/br/cid_069_athena_commando_f_pinkbear/icon.png' }
  ],
  pubg: [
    { name: 'Golden Pharaoh', url: '/avatars/pubg-xsuit-pharaoh.png' },
    { name: 'Blood Raven', url: '/avatars/pubg-xsuit-raven.png' },
    { name: 'Poseidon', url: '/avatars/pubg-xsuit-poseidon.png' },
    { name: 'Avalanche', url: '/avatars/pubg-xsuit-avalanche.png' }
  ]
};

export default function Profile() {
  const { profile, setProfile } = useAuthStore();
  const { gameProfiles, activeGame } = useGameStore();
  const { setNavbarCollapsed, isHoloFullscreen, setIsHoloFullscreen } = useUIStore();
  const [activeTab, setActiveTab] = useState('valorant');
  const [updating, setUpdating] = useState(false);
  const [autoRotateHardware, setAutoRotateHardware] = useState(true);
  const [showModalControls, setShowModalControls] = useState(true);
  const modalControlsTimeoutRef = useRef(null);

  const resetModalControlsTimeout = () => {
    setShowModalControls(true);
    if (modalControlsTimeoutRef.current) {
      clearTimeout(modalControlsTimeoutRef.current);
    }
    modalControlsTimeoutRef.current = setTimeout(() => {
      setShowModalControls(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (modalControlsTimeoutRef.current) {
        clearTimeout(modalControlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setNavbarCollapsed(isHoloFullscreen);
    return () => setNavbarCollapsed(false);
  }, [isHoloFullscreen, setNavbarCollapsed]);

  const mockGamesList = [
    { id: 'valorant', name: 'Valorant', badge: '🟫' },
    { id: 'cs2', name: 'CS2', badge: '⬜' },
    { id: 'lol', name: 'League of Legends', badge: '🟨' },
    { id: 'fortnite', name: 'Fortnite', badge: '🟦' },
    { id: 'pubg', name: 'PUBG', badge: '💎' },
  ];

  const handleAvatarSelect = async (url) => {
    if (!profile || updating) return;
    setUpdating(true);
    playSynthSound('click');

    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: url })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        avatar_url: url
      });
      playSynthSound('success');
    } catch (err) {
      playSynthSound('error');
      console.error('Failed to update avatar:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-float-in">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-[var(--game-accent)] animate-neon-pulse" />
            <h1 className="font-display font-black text-2xl text-white tracking-wide uppercase">PLAYER PROFILE</h1>
          </div>
          <p className="text-xs text-slate-450">
            View your global gaming status, rankings, and hardware setups.
          </p>
        </div>
      </div>

      {/* Top split block: Rank/Streak on Left, Interactive 3D Emblem on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <RankBadge />
          <StreakCounter />
        </div>

        {/* Gyroscopic 3D Agent Core Card */}
        <div className="lg:col-span-1">
          <GlassCard className="flex flex-col gap-4 items-center justify-center p-6 h-full relative overflow-hidden border border-white/5">
            <div className="scanlines-overlay" />
            <div className="tech-corner-tl" />
            <div className="tech-corner-tr" />
            <div className="tech-corner-bl" />
            <div className="tech-corner-br" />
            <div className="hud-accent-bar" />
            
            <h3 className="font-display font-black text-xs text-slate-400 tracking-widest uppercase text-center border-b border-white/5 pb-3 w-full">
              Holographic Agent Core
            </h3>
            
            <div className="h-56 w-full relative">
              <ThreeIdentityCore activeGame={activeGame} />
            </div>

            <div className="text-center space-y-2 relative z-10 flex flex-col items-center">
              {profile?.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt="Agent Identity Avatar" 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-[var(--game-accent)] shadow-[0_0_10px_var(--game-glow)] select-none mb-1" 
                />
              )}
              <p className="font-display font-bold text-sm text-white uppercase tracking-wider">
                {profile?.display_name || 'Agent Player'}
              </p>
              <p className="font-mono text-[9px] text-emerald-400/80 uppercase tracking-widest">
                // SECURE_IDENTITY_VERIFIED
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Built-in Avatars Section */}
      <GlassCard className="w-full relative overflow-hidden flex flex-col gap-6">
        <div className="scanlines-overlay" />
        <div className="tech-corner-tl" />
        <div className="tech-corner-tr" />
        <div className="tech-corner-bl" />
        <div className="tech-corner-br" />
        <div className="hud-accent-bar" />

        <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-[var(--game-accent)]" />
            <div>
              <h2 className="font-display font-bold text-base text-white">Avatar Customization Terminal</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a game-themed avatar vector to verify your agent callsign</p>
            </div>
          </div>

          {/* Game Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 select-none w-fit shrink-0">
            {Object.keys(BUILTIN_AVATARS).map((gameKey) => (
              <button
                key={gameKey}
                onClick={() => {
                  playSynthSound('click');
                  setActiveTab(gameKey);
                }}
                onMouseEnter={() => playSynthSound('hover')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                  activeTab === gameKey
                    ? 'bg-[var(--game-accent)] text-black font-bold shadow-[0_0_10px_var(--game-glow)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {gameKey}
              </button>
            ))}
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-2">
          {BUILTIN_AVATARS[activeTab].map((avatar) => {
            const isSelected = profile?.avatar_url === avatar.url;
            return (
              <div
                key={avatar.name}
                onClick={() => handleAvatarSelect(avatar.url)}
                onMouseEnter={() => playSynthSound('hover')}
                className={`
                  relative 
                  flex 
                  flex-col 
                  items-center 
                  justify-center 
                  p-5 
                  rounded-2xl 
                  border 
                  cursor-pointer 
                  transition-all 
                  duration-300
                  bg-white/3
                  ${isSelected 
                    ? 'border-[var(--game-accent)] bg-[var(--game-accent)]/5 shadow-[0_0_15px_var(--game-glow)] scale-[1.05]' 
                    : 'border-white/5 hover:border-slate-500 hover:bg-white/5'}
                  ${updating ? 'opacity-40 pointer-events-none' : ''}
                `}
              >
                {/* SVG Image container */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center p-1.5 shadow-inner">
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-contain" />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-350 font-mono tracking-wide uppercase">
                  {avatar.name}
                </p>

                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--game-accent)] shadow-[0_0_8px_var(--game-accent)]" />
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Grid: Global stats summaries and setup cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game Stats overview */}
        <GlassCard className="md:col-span-2 flex flex-col gap-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-display font-bold text-base text-white">Universal Statistics</h3>
            <p className="text-xs text-slate-400 mt-1">Metrics aggregated across all game profiles</p>
          </div>

          <div className="space-y-4">
            {mockGamesList.map((game) => {
              const gameProf = gameProfiles[game.id] || { total_xp: 0, matches_played: 0 };
              const rank = getRankDetails(gameProf.total_xp);
              return (
                <div 
                  key={game.id} 
                  onMouseEnter={() => playSynthSound('hover')}
                  onClick={() => playSynthSound('click')}
                  className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--game-accent)] hover:bg-white/5 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{rank.badge}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{game.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rank.currentRank}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-sm font-bold text-slate-200">{gameProf.total_xp} XP</p>
                    <p className="text-xs text-slate-500 mt-0.5">{gameProf.matches_played} Matches parsed</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Keyboard Hardware Setup Card */}
        <GlassCard 
          onMouseEnter={() => playSynthSound('hover')}
          onClick={() => playSynthSound('click')}
          className="md:col-span-1 flex flex-col overflow-hidden relative border border-white/5 p-0 hover:border-[var(--game-accent)] cursor-pointer transition-all duration-200 group/holo"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.95)] via-[rgba(8,8,16,0.4)] to-transparent pointer-events-none z-10" />
          
          <div className="w-full h-60 relative overflow-hidden bg-black/20 border-b border-white/5 flex items-center justify-center">
            <ThreeHardwareSetup activeGame={activeGame} />
            
            {/* Maximize Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                playSynthSound('click');
                setIsHoloFullscreen(true);
                resetModalControlsTimeout();
              }}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/5 hover:border-[var(--game-accent)] hover:text-white rounded-lg text-slate-400 transition-all duration-300 opacity-0 group-hover/holo:opacity-100 z-20 shadow-lg backdrop-blur-sm flex items-center gap-1.5 text-[10px] font-mono tracking-wider"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>360° ORBIT</span>
            </button>
          </div>

          <div className="p-6 space-y-4 relative z-20 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 p-2 bg-[var(--game-accent)]/10 border border-[var(--game-accent)]/20 rounded-xl text-[var(--game-accent)] w-fit">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">HARDWARE SETUPS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify polling rates, mouse DPI bindings, and keyboard refresh timings inside your game configurations.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between text-[10px] font-mono text-slate-500">
              <span>MOUSE: 800 DPI | 1000HZ</span>
              <span>KEYS: RAPID TRIGGER</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3D Hardware Setup Fullscreen Modal */}
      {isHoloFullscreen && (
        <div 
          onMouseMove={resetModalControlsTimeout}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in"
        >
          {/* Top Dropdown / Collapse Toggle Tab */}
          <button
            onClick={() => {
              playSynthSound('click');
              setShowModalControls(!showModalControls);
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-[70] px-5 py-1.5 bg-black/80 border-b border-x border-white/10 rounded-b-xl text-slate-400 hover:text-[var(--game-accent)] hover:shadow-[0_0_10px_var(--game-glow)] transition-all flex items-center justify-center pointer-events-auto shadow-md"
            title={showModalControls ? "Hide controls" : "Show controls"}
          >
            {showModalControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 animate-bounce" />}
          </button>

          {/* Decals */}
          <div className={`absolute inset-10 border border-white/5 pointer-events-none rounded-2xl transition-all duration-500 ${showModalControls ? 'opacity-100' : 'opacity-0 scale-95'}`}>
            <div className="absolute top-4 left-6 font-mono text-[10px] text-white/50 tracking-[0.2em] uppercase">
              // TELEMETRY HARDWARE SETUP [360° MODEL ORBIT]
            </div>
            <div className="absolute bottom-4 left-6 font-mono text-[10px] text-[var(--game-accent)] tracking-[0.15em] uppercase">
              HARDWARE INSPECTION NODE // TYPE: DAMAGED HELMET
            </div>
            <div className="absolute bottom-4 right-6 font-mono text-[10px] text-emerald-400 tracking-[0.1em] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ORBIT_SYNC: COMPLETED
            </div>
          </div>

          {/* Controls Bar */}
          <div className={`absolute top-8 right-8 z-[60] flex items-center gap-4 transition-all duration-500 ${showModalControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <button
              onClick={() => {
                playSynthSound('click');
                setAutoRotateHardware(!autoRotateHardware);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                autoRotateHardware
                  ? 'bg-[var(--game-accent)]/10 border-[var(--game-accent)] text-[var(--game-accent)] shadow-[0_0_10px_var(--game-glow)]'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotateHardware ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{autoRotateHardware ? 'AUTO_ROTATION: ON' : 'AUTO_ROTATION: OFF'}</span>
            </button>

            <button
              onClick={() => {
                playSynthSound('click');
                setIsHoloFullscreen(false);
              }}
              className="p-2 bg-black/40 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Heavy Orbiting Model Viewer */}
          <div className="w-[85vw] h-[85vh] relative flex items-center justify-center">
            <ThreeHardwareSetup activeGame={activeGame} isFullscreen={true} autoRotate={autoRotateHardware} />
            
            {/* Interactive instructions */}
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 border border-white/5 rounded-xl text-center pointer-events-none select-none z-[60] backdrop-blur-sm transition-all duration-500 ${showModalControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">// CLICK AND DRAG MODEL TO INSPECT IN 360 DEGREES //</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
