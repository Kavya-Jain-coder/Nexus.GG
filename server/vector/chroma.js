// server/vector/chroma.js
// Repurposed to use Supabase Postgres pgvector for production-grade vector telemetry search
import { supabase } from '../lib/supabase.js';
import { embedText } from '../ai/gemini.js';

export const vectorStore = {
  // Store match telemetry embedding in Supabase Postgres match_embeddings table
  async addMatchEmbedding(userId, gameType, matchId, matchStats) {
    try {
      const docString = `Game: ${gameType}. Match ID: ${matchId}. Stats: ${JSON.stringify(matchStats)}`;
      
      // 1. Generate embedding using Gemini text-embedding-004
      const embedding = await embedText(docString);

      // 2. Load match history row UUID matching the user_id and external match_id
      const { data: matchRow, error: matchErr } = await supabase
        .from('match_history')
        .select('id')
        .eq('user_id', userId)
        .eq('match_id', matchId)
        .single();

      if (matchErr || !matchRow) {
        console.error('Match history row not found for embedding reference:', matchErr);
        return false;
      }

      // 3. Write vector to Postgres match_embeddings table
      const { error: insertErr } = await supabase
        .from('match_embeddings')
        .insert({
          user_id: userId,
          match_id: matchRow.id,
          game_type: gameType,
          embedding: embedding,
          document: docString
        });

      if (insertErr) {
        console.error('Failed to save pgvector embedding in Supabase:', insertErr);
        return false;
      }

      console.log(`Successfully stored pgvector embedding for match ${matchId} in database.`);
      return true;
    } catch (err) {
      console.error('Vector database addMatchEmbedding failed:', err);
      return false;
    }
  },

  // Query similar matches from pgvector store using cosine similarity RPC
  async queryMatchTelemetry(userId, gameType, targetStats, limit = 5) {
    try {
      const docString = `Query game pattern stats: ${JSON.stringify(targetStats)}`;
      
      // 1. Generate embedding for query text
      const queryEmbedding = await embedText(docString);

      // 2. Call Supabase RPC function for cosine similarity matching
      const { data, error } = await supabase.rpc('match_matches', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3, // Match matches above 30% cosine similarity threshold
        match_count: limit,
        filter_user_id: userId,
        filter_game_type: gameType
      });

      if (error) {
        console.error('Supabase pgvector RPC call failed:', error);
        return [];
      }

      return data.map(item => ({
        id: item.match_id,
        similarity: item.similarity,
        document: item.document
      }));
    } catch (err) {
      console.error('Vector database queryMatchTelemetry failed:', err);
      return [];
    }
  }
};

export default vectorStore;
