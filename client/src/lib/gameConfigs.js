// Game configs for NEXUS.GG Game Arena and Coaching OS

export const GAME_CONFIGS = {
  valorant: {
    id: 'valorant',
    name: 'Valorant',
    accentColor: '#ff4655',
    glowColor: 'rgba(255, 70, 85, 0.45)',
    bgClass: 'theme-valorant',
    background: '/src/assets/backgrounds/valorant-bg.jpg',
    coachName: 'Ghost',
    coachPersonality: 'Tactical, analytical, and highly precise. Focuses on crosshair placement, economy management, and coordination.',
    coachAvatar: '👤',
    weaknessTemplates: [
      'Over-aggressive economic buys (forcing sub-optimal rounds)',
      'Inconsistent crosshair placement (aiming too low or lazy angles)',
      'Poor defensive rotations (leaving sites vulnerable)',
      'Misuse of ultimate abilities under pressure',
      'Inefficient team communication during retakes'
    ]
  },
  cs2: {
    id: 'cs2',
    name: 'CS2',
    accentColor: '#de9b35',
    glowColor: 'rgba(222, 155, 53, 0.45)',
    bgClass: 'theme-cs2',
    background: '/src/assets/backgrounds/cs2-bg.jpg',
    coachName: 'Vandal',
    coachPersonality: 'Veteran, direct, and pragmatic. Focuses heavily on utility efficiency, position holding, and team positioning.',
    coachAvatar: '💀',
    weaknessTemplates: [
      'Wasted smoke grenades in early rounds',
      'Poor spray control patterns during mid-range fights',
      'Failure to check common corner offsets (angle isolation)',
      'Bad trigger discipline (firing too early when flanking)',
      'Neglecting flashbang support on teammates entries'
    ]
  },
  lol: {
    id: 'lol',
    name: 'League of Legends',
    accentColor: '#c8aa6e',
    glowColor: 'rgba(200, 170, 110, 0.45)',
    bgClass: 'theme-lol',
    background: '/src/assets/backgrounds/lol-bg.jpg',
    coachName: 'Oracle',
    coachPersonality: 'Strategic, conceptual, and focused on macro-gameplay. Analyzes waves, objective timings, and team fight execution.',
    coachAvatar: '🔮',
    weaknessTemplates: [
      'Poor minion wave management (pushing when should freeze)',
      'Lacking vision placement near major objective pits',
      'Bad engage timings (tunneling during team fights)',
      'Inefficient farm pathing (falling behind in CS/min)',
      'Over-extending without map awareness'
    ]
  },
  fortnite: {
    id: 'fortnite',
    name: 'Fortnite',
    accentColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.45)',
    bgClass: 'theme-fortnite',
    background: '/src/assets/backgrounds/fortnite-bg.jpg',
    coachName: 'Skye',
    coachPersonality: 'Agile, creative, and mechanically focused. Evaluates build speed, edit edits, and high-ground retakes.',
    coachAvatar: '🦊',
    weaknessTemplates: [
      'Inefficient building material distribution',
      'Slow edit resets (exposing angles to opponents)',
      'Tunneling while box fighting',
      'Poor piece control during high-ground contests',
      'Incorrect targeting prioritization in end-game zones'
    ]
  },
  pubg: {
    id: 'pubg',
    name: 'PUBG',
    accentColor: '#f25c05',
    glowColor: 'rgba(242, 92, 5, 0.45)',
    bgClass: 'theme-pubg',
    background: '/src/assets/backgrounds/pubg-bg.jpg',
    coachName: 'Sniper',
    coachPersonality: 'Survivalist, cold, and calculation-based. Emphasizes rotation pathing, zone edge play, and utility usage.',
    coachAvatar: '🎯',
    weaknessTemplates: [
      'Greedy looting during early rotation windows',
      'Poor vehicle management (leaving vehicles exposed)',
      'Bad cover selection during final circle shifts',
      'Inaccurate long-range lead adjustments',
      'Wasting smokes during squad revives'
    ]
  }
};

export const DEFAULT_GAME = 'valorant';
