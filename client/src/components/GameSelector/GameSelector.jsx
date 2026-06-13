import React from 'react';
import GlassCard from '../ui/GlassCard';
import { GAME_CONFIGS } from '../../lib/gameConfigs';
import { useGameStore } from '../../store/useGameStore';

export default function GameSelector() {
  const { activeGame, setActiveGame, gameProfiles } = useGameStore();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {Object.values(GAME_CONFIGS).map((game) => {
        const isActive = activeGame === game.id;
        const profile = gameProfiles[game.id] || { current_rank: 'Bronze I', total_xp: 0 };
        
        return (
          <GlassCard
            key={game.id}
            hoverGlow={true}
            onClick={() => setActiveGame(game.id)}
            glowColor={game.glowColor}
            borderColor={isActive ? game.accentColor : 'rgba(255,255,255,0.06)'}
            className={`
              relative 
              flex 
              flex-col 
              items-center 
              justify-center 
              text-center 
              py-8 
              px-4
              overflow-hidden
              transition-all
              duration-300
              ${isActive ? 'scale-[1.03] shadow-[0_0_20px_var(--card-glow)] border' : 'opacity-70 hover:opacity-100'}
            `}
          >
            {/* Visual game background vignette overlay */}
            <div className="absolute inset-0 bg-cover bg-center opacity-5 filter blur-sm -z-10" style={{ backgroundImage: `url(${game.background})` }} />

            {/* Coach Persona Icon */}
            <span className="text-4xl mb-4 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-float">
              {game.coachAvatar}
            </span>

            {/* Game Title */}
            <h3 className="font-display font-bold text-base tracking-wide text-white mb-2">
              {game.name}
            </h3>

            {/* Coach Label */}
            <p className="text-[10px] font-bold text-[var(--game-accent)] uppercase tracking-widest mb-4">
              Coach: {game.coachName}
            </p>

            {/* Rank Status */}
            <div className="mt-auto pt-3 border-t border-white/5 w-full">
              <p className="text-xs text-slate-400">Current Rank</p>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">{profile.current_rank}</p>
            </div>

            {/* Active Indicator bar */}
            {isActive && (
              <div
                style={{ backgroundColor: game.accentColor }}
                className="absolute bottom-0 left-0 right-0 h-1.5 shadow-[0_0_10px_var(--card-glow)]"
              />
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
