// server/parsers/pubg.js

export function parsePUBG(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload format. Must be an object.');
  }

  const isPUBG = rawData.game === 'pubg' || rawData.survival_seconds || rawData.distance_traveled;
  if (!isPUBG) {
    throw new Error('Match log telemetry does not match PUBG JSON schema guidelines.');
  }

  const placement = rawData.placement || 20; // 1 to 100
  const survivalSeconds = rawData.survival_seconds || 600;
  const distanceTraveled = rawData.distance_traveled || 2000; // meters

  const kills = rawData.kills !== undefined ? rawData.kills : 2;
  const deaths = rawData.deaths !== undefined ? rawData.deaths : 1;
  const assists = rawData.assists !== undefined ? rawData.assists : 1;

  const damageDealt = rawData.damage_dealt || 250;

  // Calculate normalized performance index rating (0-100 scale)
  // Weighted placement + survival time + kills + damage
  const placementScore = 101 - placement;
  const survivalMin = survivalSeconds / 60;
  let perfScore = (placementScore * 0.35) + (survivalMin * 1.5) + (kills * 8) + (damageDealt * 0.05);
  perfScore = Math.min(100, Math.max(10, perfScore));

  const isWin = placement === 1;

  return {
    match_id: rawData.match_id || `pubg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    played_at: rawData.played_at || new Date().toISOString(),
    is_win: isWin,
    kills,
    deaths,
    assists,
    performance_score: perfScore,
    parsed_stats: {
      placement,
      survival_seconds: survivalSeconds,
      distance_traveled: distanceTraveled,
      damage_dealt: damageDealt,
      heals_used: rawData.heals_used || 2,
      boosts_used: rawData.boosts_used || 1
    }
  };
}
