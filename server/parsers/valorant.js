// server/parsers/valorant.js

export function parseValorant(rawData) {
  // Validate basic schema
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload format. Must be an object.');
  }

  // Expect game marker or typical Valorant keys
  const isVal = rawData.game === 'valorant' || rawData.agent || rawData.rounds_played;
  if (!isVal) {
    throw new Error('Match log telemetry does not match Valorant JSON schema guidelines.');
  }

  const agent = rawData.agent || 'Unknown Agent';
  const mapName = rawData.map || 'Unknown Map';
  const roundsWon = rawData.rounds_won || 0;
  const roundsLost = rawData.rounds_lost || 0;
  const roundsPlayed = roundsWon + roundsLost || 13;

  const kills = rawData.kills !== undefined ? rawData.kills : 12;
  const deaths = rawData.deaths !== undefined ? rawData.deaths : 12;
  const assists = rawData.assists !== undefined ? rawData.assists : 4;

  const headshotPct = rawData.headshot_percent || 0.15;
  const firstBloods = rawData.first_bloods || 0;
  const firstDeaths = rawData.first_deaths || 0;

  // Calculate normalized performance index rating (0-100 scale)
  // Higher weight on K/D, headshots, and first blood impact
  const kd = deaths > 0 ? kills / deaths : kills;
  let perfScore = (kd * 35) + (headshotPct * 100 * 1.5) + (firstBloods * 5) - (firstDeaths * 3);
  perfScore = Math.min(100, Math.max(10, perfScore));

  const isWin = roundsWon > roundsLost;

  return {
    match_id: rawData.match_id || `val_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    played_at: rawData.played_at || new Date().toISOString(),
    is_win: isWin,
    kills,
    deaths,
    assists,
    performance_score: perfScore,
    parsed_stats: {
      agent,
      map: mapName,
      rounds_won: roundsWon,
      rounds_lost: roundsLost,
      rounds_played: roundsPlayed,
      headshot_percent: headshotPct,
      first_bloods: firstBloods,
      first_deaths: firstDeaths,
      ability_casts: rawData.ability_casts || { q: 0, e: 0, c: 0, x: 0 },
      combat_score: rawData.combat_score || (kills * 150 + assists * 50) / Math.max(1, roundsPlayed)
    }
  };
}
