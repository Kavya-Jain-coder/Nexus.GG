// Rank badge system for NEXUS.GG

export const RANKS = [
  { name: 'Bronze', minXp: 0, badge: '🟫' },
  { name: 'Silver', minXp: 1000, badge: '⬜' },
  { name: 'Gold', minXp: 3000, badge: '🟨' },
  { name: 'Platinum', minXp: 6000, badge: '🟦' },
  { name: 'Diamond', minXp: 10000, badge: '💎' },
  { name: 'Immortal', minXp: 15000, badge: '👑' },
  { name: 'NEXUS', minXp: 22000, badge: '🔮' }
];

export function getRankDetails(totalXp) {
  let activeRank = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (totalXp >= RANKS[i].minXp) {
      activeRank = RANKS[i];
      nextRank = RANKS[i + 1] || null;
    } else {
      break;
    }
  }

  return {
    currentRank: activeRank.name,
    badge: activeRank.badge,
    nextRank: nextRank ? nextRank.name : 'Max Level',
    nextBadge: nextRank ? nextRank.badge : '',
    xpRequired: nextRank ? nextRank.minXp : totalXp,
    progressPercent: nextRank 
      ? Math.round(((totalXp - activeRank.minXp) / (nextRank.minXp - activeRank.minXp)) * 100)
      : 100
  };
}
