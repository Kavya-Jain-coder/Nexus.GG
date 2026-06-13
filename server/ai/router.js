// server/ai/router.js
import { callGemini } from './gemini.js';
import { callGroq } from './groq.js';

// Deep Coaching & Weakness Analysis: Routes to Gemini 2.5 Pro (via fallback or directly)
export async function generateCoachingReport(matchHistory, gameType) {
  const matchesSummary = matchHistory.map(m => ({
    win: m.is_win,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    score: m.performance_score,
    stats: m.parsed_stats
  }));

  const prompt = `
    You are the NEXUS gaming coach for ${gameType}.
    Analyze the following recent match history logs for the user. Identify their top weaknesses, key strengths, and write a coaching summary report.

    MATCH DATA TELEMETRY:
    ${JSON.stringify(matchesSummary, null, 2)}

    Format your output strictly as a JSON object with these EXACT keys:
    {
      "overallPerformanceScore": number (0-100),
      "coachFeedback": "A 2-3 sentence direct commentary speaking as the coach persona",
      "strengths": [
        { "strength": "Name of strength", "description": "Brief telemetry-based explanation" }
      ],
      "weaknesses": [
        {
          "weakness": "Name of weakness",
          "severity": "high" | "medium" | "low",
          "description": "Short explanation",
          "recommendations": ["Actionable checklist drill task to fix it"]
        }
      ],
      "metricsSummary": {
        "gamesAnalyzed": number,
        "winRate": number (0 to 1)
      }
    }
  `;

  try {
    // Invoke Gemini 2.5 Pro (simulated by genai using gemini-1.5-pro or gemini-2.5-pro naming)
    const rawResult = await callGemini(prompt, 'gemini-1.5-pro', true);
    return JSON.parse(rawResult);
  } catch (err) {
    console.error('Coaching report model router failed:', err);
    throw new Error('AI Coaching engine was unable to parse match weaknesses. Please retry.');
  }
}

// Daily Checklist Generation: Routes to Gemini 1.5 Flash (for fast structured items)
export async function generateDailyChecklist(weaknessProfiles) {
  const prompt = `
    Based on the following historical weakness profiles for the player:
    ${JSON.stringify(weaknessProfiles, null, 2)}

    Generate a custom daily training program consisting of 5 specific, actionable training tasks (drills) to complete.
    Each task should directly target one of the weaknesses mentioned.

    Format your output strictly as a JSON array of objects with these EXACT keys:
    [
      {
        "gameType": "valorant" | "cs2" | "lol" | "fortnite" | "pubg",
        "taskDescription": "Specific actionable training task description (e.g. Do 15 mins of Sheriff-only gridshot)",
        "category": "aim" | "positioning" | "utility" | "economy" | "mindset",
        "targetCount": number (usually 1 or 2 matches/reps)
      }
    ]
  `;

  try {
    const rawResult = await callGemini(prompt, 'gemini-1.5-flash', true);
    return JSON.parse(rawResult);
  } catch (err) {
    console.error('Checklist generation model router failed:', err);
    throw new Error('AI checklist generator failed. Check configuration.');
  }
}
