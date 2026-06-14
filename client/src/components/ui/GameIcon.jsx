import React from 'react';

export default function GameIcon({ gameId, className = "w-12 h-12" }) {
  switch (gameId) {
    case 'valorant':
      return (
        <svg 
          className={`${className} text-[#ff4655] filter drop-shadow-[0_0_10px_rgba(255,70,85,0.45)]`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <polygon points="12,7 16,12 12,17 8,12" fill="currentColor" fillOpacity="0.25" />
        </svg>
      );
    case 'cs2':
      return (
        <svg 
          className={`${className} text-[#de9b35] filter drop-shadow-[0_0_10px_rgba(222,155,53,0.45)]`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
          <path d="M12 1v22M1 12h22" />
          <path d="M8 8l8 8M16 8l-8 8" strokeDasharray="1 3" />
        </svg>
      );
    case 'lol':
      return (
        <svg 
          className={`${className} text-[#c8aa6e] filter drop-shadow-[0_0_10px_rgba(200,170,110,0.45)]`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L2 12l10 10 10-10L12 2z" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 6v12M6 12h12" />
          <circle cx="12" cy="12" r="4" strokeWidth="1" />
          <path d="M3 3l4 4M21 3l-4 4M3 21l4-4M21 21l-4-4" />
        </svg>
      );
    case 'fortnite':
      return (
        <svg 
          className={`${className} text-[#00f0ff] filter drop-shadow-[0_0_10px_rgba(0,240,255,0.45)]`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.2" />
          <path d="M8 9h8M8 13h8M12 9v8" strokeDasharray="2 2" />
        </svg>
      );
    case 'pubg':
      return (
        <svg 
          className={`${className} text-[#f25c05] filter drop-shadow-[0_0_10px_rgba(242,92,5,0.45)]`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity="0.25" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          <circle cx="12" cy="7" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
