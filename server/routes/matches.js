// server/routes/matches.js
import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { parseMatchTelemetry } from '../parsers/index.js';
import { vectorStore } from '../vector/chroma.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Upload and parse match logs
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const { gameType } = req.query;
    if (!req.file) {
      return res.status(400).json({ error: 'No match logs file provided' });
    }

    // Load file contents from buffer
    const fileContent = req.file.buffer.toString('utf-8');
    let rawData;

    try {
      rawData = JSON.parse(fileContent);
    } catch (_) {
      return res.status(400).json({ error: 'Failed to parse file. Ensure it is a valid JSON document.' });
    }

    // Run telemetry parser
    const parsed = parseMatchTelemetry(rawData, gameType);

    // Save to Supabase match_history table
    const { data: match, error } = await supabase
      .from('match_history')
      .insert({
        user_id: req.user.id,
        game_type: gameType || parsed.parsed_stats.game || 'valorant',
        match_id: parsed.match_id,
        played_at: parsed.played_at,
        raw_data: rawData,
        parsed_stats: parsed.parsed_stats,
        is_win: parsed.is_win,
        kills: parsed.kills,
        deaths: parsed.deaths,
        assists: parsed.assists,
        performance_score: parsed.performance_score
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This match log telemetry has already been synchronized' });
      }
      throw error;
    }

    // Generate and save vector embedding asynchronously in Postgres pgvector
    vectorStore.addMatchEmbedding(req.user.id, match.game_type, match.match_id, match.parsed_stats)
      .then(success => {
        if (success) console.log(`Asynchronously generated pgvector embedding for match: ${match.match_id}`);
      })
      .catch(err => console.error('Background pgvector save error:', err));

    // Reward +10 XP transaction for synchronizing logs
    const { error: xpError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: req.user.id,
        game_type: match.game_type,
        amount: 10,
        source: 'match_upload',
        reference_id: match.id
      });

    if (xpError) console.error('Failed to log XP transaction:', xpError);

    res.json({ success: true, match });
  } catch (err) {
    next(err);
  }
});


// Mock-sync game matches from API profile
router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    const { gameType, playerName } = req.body;
    const game = (gameType || 'valorant').toLowerCase();
    
    // Validate gameType
    const validGames = ['valorant', 'cs2', 'lol', 'fortnite', 'pubg'];
    if (!validGames.includes(game)) {
      return res.status(400).json({ error: `Invalid game type: ${game}` });
    }

    const nameToUse = playerName || req.user.email || 'Player';
    const rawData = generateMockTelemetry(game, nameToUse);
    const parsed = parseMatchTelemetry(rawData, game);

    // Save to Supabase match_history table
    const { data: match, error } = await supabase
      .from('match_history')
      .insert({
        user_id: req.user.id,
        game_type: game,
        match_id: parsed.match_id,
        played_at: parsed.played_at,
        raw_data: rawData,
        parsed_stats: parsed.parsed_stats,
        is_win: parsed.is_win,
        kills: parsed.kills,
        deaths: parsed.deaths,
        assists: parsed.assists,
        performance_score: parsed.performance_score
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This match log telemetry has already been synchronized' });
      }
      throw error;
    }

    // Generate and save vector embedding asynchronously in Postgres pgvector
    vectorStore.addMatchEmbedding(req.user.id, match.game_type, match.match_id, match.parsed_stats)
      .then(success => {
        if (success) console.log(`Asynchronously generated pgvector embedding for match: ${match.match_id}`);
      })
      .catch(err => console.error('Background pgvector save error:', err));

    // Reward +10 XP transaction for synchronizing logs
    const { error: xpError } = await supabase
      .from('xp_transactions')
      .insert({
        user_id: req.user.id,
        game_type: match.game_type,
        amount: 10,
        source: 'match_upload',
        reference_id: match.id
      });

    if (xpError) console.error('Failed to log XP transaction:', xpError);

    res.json({ success: true, match });
  } catch (err) {
    next(err);
  }
});

function generateMockTelemetry(gameType, playerName) {
  const now = new Date();
  const matchId = `${gameType.slice(0, 3)}_sync_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  if (gameType === 'valorant') {
    const agents = ['Jett', 'Reyna', 'Omen', 'Sova', 'Killjoy', 'Sage', 'Phoenix'];
    const maps = ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Fracture'];
    const roundsWon = Math.floor(Math.random() * 6) + 8; // 8-13
    const roundsLost = Math.floor(Math.random() * 14); // 0-13
    const won = roundsWon > roundsLost;
    const kills = Math.floor(Math.random() * 20) + 8; // 8-27
    const deaths = Math.floor(Math.random() * 15) + 5; // 5-19
    const assists = Math.floor(Math.random() * 10) + 2; // 2-11
    
    return {
      game: 'valorant',
      match_id: matchId,
      played_at: now.toISOString(),
      agent: agents[Math.floor(Math.random() * agents.length)],
      map: maps[Math.floor(Math.random() * maps.length)],
      rounds_won: won ? 13 : roundsWon,
      rounds_lost: won ? roundsLost : 13,
      kills,
      deaths,
      assists,
      headshot_percent: parseFloat((Math.random() * 0.2 + 0.1).toFixed(2)), // 10% - 30%
      first_bloods: Math.floor(Math.random() * 5),
      first_deaths: Math.floor(Math.random() * 4),
      combat_score: Math.floor(Math.random() * 180) + 120, // 120 - 300
      ability_casts: {
        q: Math.floor(Math.random() * 10),
        e: Math.floor(Math.random() * 8),
        c: Math.floor(Math.random() * 6),
        x: Math.floor(Math.random() * 3)
      }
    };
  } else if (gameType === 'cs2') {
    const maps = ['de_dust2', 'de_mirage', 'de_inferno', 'de_nuke', 'de_anubis', 'de_overpass'];
    const roundsWon = Math.floor(Math.random() * 6) + 8;
    const roundsLost = Math.floor(Math.random() * 14);
    const won = roundsWon > roundsLost;
    const kills = Math.floor(Math.random() * 22) + 6;
    const deaths = Math.floor(Math.random() * 15) + 5;
    const assists = Math.floor(Math.random() * 8) + 1;
    
    return {
      game: 'cs2',
      match_id: matchId,
      played_at: now.toISOString(),
      map: maps[Math.floor(Math.random() * maps.length)],
      rounds_won: won ? 13 : roundsWon,
      rounds_lost: won ? roundsLost : 13,
      kills,
      deaths,
      assists,
      adr: Math.floor(Math.random() * 70) + 50, // 50 - 120
      headshot_kills: Math.floor(Math.random() * (kills + 1)),
      utility_thrown: Math.floor(Math.random() * 15) + 5,
      flash_duration_blinded: parseFloat((Math.random() * 15 + 2).toFixed(1))
    };
  } else if (gameType === 'lol') {
    const champions = ['Yasuo', 'Lee Sin', 'Jinx', 'Ahri', 'Thresh', 'Garen', 'Zed'];
    const lanes = ['Top', 'Jungle', 'Mid', 'Bottom', 'Support'];
    const won = Math.random() > 0.45;
    const kills = Math.floor(Math.random() * 12) + 1;
    const deaths = Math.floor(Math.random() * 8) + 1;
    const assists = Math.floor(Math.random() * 15) + 2;
    const duration = Math.floor(Math.random() * 15) + 25; // 25-40 mins
    const cs = Math.floor(Math.random() * 150) + 100; // 100-250
    
    return {
      game: 'lol',
      match_id: matchId,
      played_at: now.toISOString(),
      champion: champions[Math.floor(Math.random() * champions.length)],
      lane: lanes[Math.floor(Math.random() * lanes.length)],
      kills,
      deaths,
      assists,
      cs,
      duration_minutes: duration,
      cs_per_min: parseFloat((cs / duration).toFixed(1)),
      vision_score: Math.floor(Math.random() * 30) + 10,
      teamfight_participation: parseFloat((Math.random() * 0.4 + 0.3).toFixed(2)),
      gold_earned: Math.floor(Math.random() * 8000) + 8000,
      is_win: won,
      objectives_participated: {
        barons: Math.random() > 0.7 ? 1 : 0,
        dragons: Math.floor(Math.random() * 3),
        towers: Math.floor(Math.random() * 6)
      }
    };
  } else if (gameType === 'fortnite') {
    const placement = Math.floor(Math.random() * 99) + 1;
    const kills = Math.floor(Math.random() * 10);
    const accuracy = parseFloat((Math.random() * 0.35 + 0.15).toFixed(2));
    
    return {
      game: 'fortnite',
      match_id: matchId,
      played_at: now.toISOString(),
      placement,
      kills,
      accuracy,
      damage_dealt: Math.floor(Math.random() * 1500) + 100,
      materials_built: Math.floor(Math.random() * 100) + 10,
      materials_gathered: Math.floor(Math.random() * 400) + 100,
      survival_minutes: parseFloat((Math.random() * 20 + 2).toFixed(1))
    };
  } else if (gameType === 'pubg') {
    const placement = Math.floor(Math.random() * 99) + 1;
    const kills = Math.floor(Math.random() * 8);
    
    return {
      game: 'pubg',
      match_id: matchId,
      played_at: now.toISOString(),
      placement,
      kills,
      damage_dealt: Math.floor(Math.random() * 800) + 50,
      survival_seconds: Math.floor(Math.random() * 1500) + 120,
      distance_traveled: Math.floor(Math.random() * 6000) + 500,
      boosts_used: Math.floor(Math.random() * 6)
    };
  }
  return {};
}


// Fetch match history list
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { gameType } = req.query;
    if (!gameType) {
      return res.status(400).json({ error: 'gameType query parameter required' });
    }

    const { data, error } = await supabase
      .from('match_history')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('game_type', gameType)
      .order('played_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
