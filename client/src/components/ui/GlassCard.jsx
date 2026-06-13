import React from 'react';

export default function GlassCard({
  children,
  className = '',
  hoverGlow = false,
  glowColor = 'var(--game-glow)',
  borderColor = 'rgba(255, 255, 255, 0.06)',
  onClick,
  ...props
}) {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      style={{
        '--card-glow': glowColor,
        borderColor: borderColor,
        cursor: isClickable ? 'pointer' : 'default',
      }}
      className={`
        glass-panel 
        rounded-2xl 
        p-6 
        transition-all 
        duration-300 
        ${hoverGlow ? 'glass-panel-hover hover:border-[var(--game-accent)]' : ''} 
        ${isClickable ? 'active:scale-[0.98]' : ''} 
        ${className}
      `}
      {...props}
    >
      {/* Light sweep animation on hover */}
      {hoverGlow && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[200%]" />
        </div>
      )}
      {children}
    </div>
  );
}
