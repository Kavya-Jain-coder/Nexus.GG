import React, { useState } from 'react';
import { Flame, Bell, ChevronDown, Gamepad2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import { GAME_CONFIGS } from '../../lib/gameConfigs';
import { getRankDetails } from '../../lib/constants';

export default function Navbar() {
  const { activeGame, setActiveGame, gameProfiles, streaks } = useGameStore();
  const { notifications, removeNotification } = useUIStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeProfile = gameProfiles[activeGame] || { total_xp: 0 };
  const rankInfo = getRankDetails(activeProfile.total_xp);

  const handleGameSelect = (gameId) => {
    setActiveGame(gameId);
    setDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-20 z-20 glass-panel border-b border-white/5 px-6 sm:px-8 flex items-center justify-between pointer-events-auto">
      {/* Spacer to push navbar elements to the right since sidebar is absolute/fixed */}
      <div className="w-0 md:w-20" />

      {/* Game Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--game-accent)] hover:shadow-[0_0_15px_var(--game-glow)] transition-all select-none"
        >
          <Gamepad2 className="w-5 h-5 text-[var(--game-accent)]" />
          <span className="font-semibold text-sm tracking-wide text-white">
            {GAME_CONFIGS[activeGame]?.name}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-14 left-0 w-64 glass-panel border border-white/10 rounded-2xl p-2 shadow-2xl z-50 animate-float-in">
            <p className="text-[10px] font-bold text-slate-500 tracking-wider px-3 py-2 uppercase">SELECT ARENA</p>
            {Object.values(GAME_CONFIGS).map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className={`
                  w-full 
                  flex 
                  items-center 
                  justify-between 
                  px-3 
                  py-2.5 
                  rounded-xl 
                  transition-all 
                  ${activeGame === game.id 
                    ? 'bg-white/5 text-white border-l-4 border-[var(--game-accent)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{game.coachAvatar}</span>
                  <span className="font-medium text-sm">{game.name}</span>
                </div>
                {activeGame === game.id && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--game-accent)] shadow-[0_0_8px_var(--game-accent)]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Side Info: Level, Streak, Notifications */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Rank & Level Badge */}
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{rankInfo.badge}</span>
            <span className="text-xs font-semibold tracking-wider text-slate-350">{rankInfo.currentRank}</span>
          </div>
          <span className="text-[10px] font-bold text-[var(--game-accent)] font-mono tracking-widest mt-0.5">
            LEVEL {Math.floor(activeProfile.total_xp / 1000) + 1}
          </span>
        </div>

        {/* Streak Counter */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 select-none"
          title="Daily checklist streak"
        >
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <span className="font-mono font-bold text-sm text-orange-400">
            {streaks?.current_streak || 0}
          </span>
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-slate-400 text-slate-300 hover:text-white transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border border-[#080810]">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 glass-panel border border-white/10 rounded-2xl p-3 shadow-2xl z-50">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-400 tracking-wider">NOTIFICATIONS</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full">
                    {notifications.length} New
                  </span>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => removeNotification(notif.id)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 cursor-pointer transition-colors"
                    >
                      <p className="text-xs text-slate-200">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
