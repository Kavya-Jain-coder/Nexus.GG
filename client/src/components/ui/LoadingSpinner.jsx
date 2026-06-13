import React from 'react';

export default function LoadingSpinner({
  size = 'md', // 'sm' | 'md' | 'lg'
  text = '',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-20 h-20 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`} {...props}>
      <div className="relative">
        {/* Glow halo */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            blur-md 
            opacity-70 
            animate-pulse 
            bg-[var(--game-accent)]
            ${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-12 h-12' : 'w-20 h-20'}
          `} 
        />
        {/* Rotating ring */}
        <div
          className={`
            rounded-full 
            border-t-transparent 
            border-r-transparent 
            border-l-[var(--game-accent)] 
            border-b-[var(--game-accent)] 
            animate-spin
            relative
            z-10
            ${sizeClasses[size]}
          `}
        />
      </div>
      {text && (
        <p className="text-slate-400 font-medium text-sm tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
