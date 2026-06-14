import React from 'react';

// Require the background images so webpack/vite bundles them
import valorantBg from '../../assets/backgrounds/valorant-bg.jpg';
import cs2Bg from '../../assets/backgrounds/cs2-bg.jpg';
import lolBg from '../../assets/backgrounds/lol-bg.jpg';
import fortniteBg from '../../assets/backgrounds/fortnite-bg.jpg';
import pubgBg from '../../assets/backgrounds/pubg-bg.jpg';
import defaultBg from '../../assets/backgrounds/dashboard-bg.jpg';

const BACKGROUNDS = {
  valorant: valorantBg,
  cs2: cs2Bg,
  lol: lolBg,
  fortnite: fortniteBg,
  pubg: pubgBg,
  default: defaultBg
};

export default function DashboardBackground3D({ activeGame }) {
  const bgImage = BACKGROUNDS[activeGame] || BACKGROUNDS.default;

  return (
    <div 
      className="fixed inset-0 transition-all duration-1000 ease-in-out pointer-events-none" 
      style={{ 
        zIndex: -5,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        opacity: 0.35 // Dim the background slightly so the UI stays readable
      }}
    >
      {/* Add a subtle dark overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
