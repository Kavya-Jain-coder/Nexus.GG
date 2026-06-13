// server/parsers/index.js
import { parseValorant } from './valorant.js';
import { parseCS2 } from './cs2.js';
import { parseLol } from './lol.js';
import { parseFortnite } from './fortnite.js';
import { parsePUBG } from './pubg.js';

export function parseMatchTelemetry(rawData, specifiedGameType = null) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Match data telemetry must be a structured JSON object');
  }

  // Determine game type by either direct parameter, key in object, or heuristic
  const game = (specifiedGameType || rawData.game || '').toLowerCase();

  if (game === 'valorant') return parseValorant(rawData);
  if (game === 'cs2') return parseCS2(rawData);
  if (game === 'lol' || game === 'league' || game === 'league of legends') return parseLol(rawData);
  if (game === 'fortnite') return parseFortnite(rawData);
  if (game === 'pubg') return parsePUBG(rawData);

  // Heuristics detection
  if (rawData.agent || rawData.rounds_played || rawData.combat_score) {
    return parseValorant(rawData);
  }
  if (rawData.adr || rawData.utility_thrown || rawData.flash_duration_blinded) {
    return parseCS2(rawData);
  }
  if (rawData.champion || rawData.vision_score || rawData.cs_per_min || rawData.lane) {
    return parseLol(rawData);
  }
  if (rawData.materials_built || (rawData.placement && rawData.materials_gathered)) {
    return parseFortnite(rawData);
  }
  if (rawData.survival_seconds || rawData.distance_traveled || (rawData.placement && rawData.boosts_used)) {
    return parsePUBG(rawData);
  }

  throw new Error('Unrecognized match data telemetry schema. Unable to auto-detect game type.');
}
export { parseValorant, parseCS2, parseLol, parseFortnite, parsePUBG };
