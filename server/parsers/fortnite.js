// server/parsers/fortnite.js

export function parseFortnite(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload format. Must be an object.');
  }

  const isFortnite = rawData.game === 'fortnite' || rawData.placement || rawData.materials_built;
  if (!isFortnite) {
    throw new Error('Match log telemetry does not match Fortnite JSON schema guidelines.');
  }

  const placement = rawData.placement || 25; // 1 to 100
  const kills = rawData.kills !== undefined ? rawData.kills : 3;
  const deaths = rawData.deaths !== undefined ? rawData.deaths : 1; // Solos: max 1
  const assists = rawData.assists !== undefined ? rawData.assists : 0;

  const matsBuilt = rawData.materials_built || 120;
  const damageDealt = rawData.damage_dealt || 400;
  const accuracy = rawData.accuracy || 0.25;

  // Calculate normalized performance index rating (0-100 scale)
  // Placement weighting: higher placement is better (1 is best).
  // Formula: placement score = (101 - placement)
  const placementScore = 101 - placement;
  let perfScore = (placementScore * 0.4) + (kills * 8) + (accuracy * 100 * 0.2) + (matsBuilt * 0.05);
  perfScore = Math.min(100, Math.max(10, perfScore));

  const isWin = placement === 1;

  return {
    match_id: rawData.match_id || `fort_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    played_at: rawData.played_at || new Date().toISOString(),
    is_win: isWin,
    kills,
    deaths,
    assists,
    performance_score: perfScore,
    parsed_stats: {
      placement,
      materials_built: matsBuilt,
      damage_dealt: damageDealt,
      accuracy,
      materials_gathered: rawData.materials_gathered || 500,
      damage_taken: rawData.damage_taken || 200
    }
  };
}
