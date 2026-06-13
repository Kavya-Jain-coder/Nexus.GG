// server/parsers/cs2.js

export function parseCS2(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid telemetry payload format. Must be an object.');
  }

  const isCS = rawData.game === 'cs2' || rawData.adr || rawData.utility_thrown;
  if (!isCS) {
    throw new Error('Match log telemetry does not match CS2 JSON schema guidelines.');
  }

  const mapName = rawData.map || 'de_dust2';
  const roundsWon = rawData.rounds_won || 0;
  const roundsLost = rawData.rounds_lost || 0;
  const roundsPlayed = roundsWon + roundsLost || 24;

  const kills = rawData.kills !== undefined ? rawData.kills : 15;
  const deaths = rawData.deaths !== undefined ? rawData.deaths : 15;
  const assists = rawData.assists !== undefined ? rawData.assists : 5;

  const adr = rawData.adr || 75.0; // Average Damage per Round
  const utilityThrown = rawData.utility_thrown || 0;
  const flashbangFlashes = rawData.flash_duration_blinded || 0.0;

  // Calculate normalized performance index rating (0-100 scale)
  // Higher weight on ADR (Average Damage per Round), K/D, and utility blinds
  const kd = deaths > 0 ? kills / deaths : kills;
  let perfScore = (kd * 30) + (adr * 0.5) + (flashbangFlashes * 0.2);
  perfScore = Math.min(100, Math.max(10, perfScore));

  const isWin = roundsWon > roundsLost;

  return {
    match_id: rawData.match_id || `cs2_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    played_at: rawData.played_at || new Date().toISOString(),
    is_win: isWin,
    kills,
    deaths,
    assists,
    performance_score: perfScore,
    parsed_stats: {
      map: mapName,
      rounds_won: roundsWon,
      rounds_lost: roundsLost,
      rounds_played: roundsPlayed,
      adr,
      utility_thrown: utilityThrown,
      flash_duration_blinded: flashbangFlashes,
      first_kills: rawData.first_kills || 0,
      accuracy: rawData.accuracy || 0.40
    }
  };
}
