// server/parsers/lol.js

export function parseLol(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload format. Must be an object.');
  }

  const isLol = rawData.game === 'lol' || rawData.champion || rawData.cs_per_min || rawData.vision_score;
  if (!isLol) {
    throw new Error('Match log telemetry does not match League of Legends JSON schema guidelines.');
  }

  const champion = rawData.champion || 'Unknown Champion';
  const lane = rawData.lane || 'Mid';
  const cs = rawData.cs || 150;
  const matchDurationMinutes = rawData.duration_minutes || 30;
  const csPerMin = rawData.cs_per_min || (cs / matchDurationMinutes);

  const kills = rawData.kills !== undefined ? rawData.kills : 4;
  const deaths = rawData.deaths !== undefined ? rawData.deaths : 4;
  const assists = rawData.assists !== undefined ? rawData.assists : 8;

  const visionScore = rawData.vision_score || 20;
  const teamfightParticipation = rawData.teamfight_participation || 0.45; // 45%

  // Calculate normalized performance index rating (0-100 scale)
  // Higher weight on K/DA ratio, CS/min consistency, vision contribution, and team fights
  const kda = deaths > 0 ? (kills + assists) / deaths : (kills + assists);
  let perfScore = (kda * 12) + (csPerMin * 6) + (visionScore * 0.8) + (teamfightParticipation * 50);
  perfScore = Math.min(100, Math.max(10, perfScore));

  const isWin = rawData.is_win || false;

  return {
    match_id: rawData.match_id || `lol_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    played_at: rawData.played_at || new Date().toISOString(),
    is_win: isWin,
    kills,
    deaths,
    assists,
    performance_score: perfScore,
    parsed_stats: {
      champion,
      lane,
      cs,
      cs_per_min: csPerMin,
      vision_score: visionScore,
      teamfight_participation: teamfightParticipation,
      gold_earned: rawData.gold_earned || 10000,
      objectives_participated: rawData.objectives_participated || { barons: 0, dragons: 0, towers: 0 }
    }
  };
}
