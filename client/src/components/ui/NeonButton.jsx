import React from 'react';

export default function NeonButton({
  children,
  className = '',
  variant = 'solid', // 'solid' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-95 focus:outline-none select-none';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantStyles = {
    solid: 'bg-[var(--game-accent)] text-black border border-transparent shadow-[0_0_15px_rgba(var(--game-accent),0.3)] hover:shadow-[0_0_25px_var(--game-glow)] hover:brightness-110',
    outline: 'bg-transparent text-[var(--game-accent)] border border-[var(--game-accent)] hover:bg-[var(--game-accent)]/10 hover:shadow-[0_0_20px_var(--game-glow)]',
    ghost: 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles} 
        ${sizeStyles[size]} 
        ${variantStyles[variant]} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer'} 
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
}
