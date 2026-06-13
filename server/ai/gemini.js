// server/ai/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'your-gemini-api-key') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('Gemini API Key is missing or default template. Mock responses will be used.');
}

export async function callGemini(prompt, modelName = 'gemini-1.5-flash', jsonMode = false) {
  if (!genAI) {
    console.log(`[GEMINI MOCK] Mocking ${modelName} due to missing API Key.`);
    return mockGeminiResponse(prompt, modelName, jsonMode);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
        temperature: 0.4
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (err) {
    console.error(`Gemini (${modelName}) Call Failed:`, err);
    return mockGeminiResponse(prompt, modelName, jsonMode);
  }
}

// Fallback Mock responses for Gemini 2.5 Pro / 1.5 Flash tasks
function mockGeminiResponse(prompt, modelName, jsonMode) {
  if (jsonMode) {
    // Return checklist structure
    return JSON.stringify([
      { gameType: 'valorant', taskDescription: 'Do 15 mins of gridshot training focusing on horizontal flicking', category: 'aim', targetCount: 1 },
      { gameType: 'valorant', taskDescription: 'Play 2 deathmatches using only Sheriff to force crosshair height discipline', category: 'aim', targetCount: 2 },
      { gameType: 'valorant', taskDescription: 'Review positioning guides for Ascent Site A defensive holds', category: 'positioning', targetCount: 1 },
      { gameType: 'valorant', taskDescription: 'Practice casting smoke placements in custom server for Haven Site B retakes', category: 'utility', targetCount: 1 },
      { gameType: 'valorant', taskDescription: 'Play 1 competitive match prioritizing communications and callouts', category: 'mindset', targetCount: 1 }
    ]);
  }

  // Return coaching report structure
  return JSON.stringify({
    overallPerformanceScore: 78,
    coachFeedback: "You are aiming too low when checking corner offsets, forcing you to adjust vertical position mid-combat which wastes 200ms. Improve crosshair alignment immediately. Your site rotations on defence are solid, but you are buying sub-optimally during eco rounds.",
    strengths: [
      { strength: "Defensive Rotations", description: "Excellent rotations to support teammates on active site holds." },
      { strength: "Objective Focus", description: "Consistently prioritizes spike planting and spike defusals." }
    ],
    weaknesses: [
      {
        weakness: "Corner Crosshair Height",
        severity: "high",
        description: "Lazy vertical tracking while pathing around walls.",
        recommendations: [
          "Do 15 minutes of Sheriff-only custom drills.",
          "Keep crosshair pinned strictly at head-level guides."
        ]
      },
      {
        weakness: "Eco Round Forced Buys",
        severity: "medium",
        description: "Buying full rifles on eco rounds when team is saving.",
        recommendations: [
          "Keep economic thresholds above 3900 credits before buying rifles.",
          "Coordinate buy orders during planning phase."
        ]
      }
    ],
    metricsSummary: { gamesAnalyzed: 10, winRate: 0.55 }
  });
}

// Generate vector embedding of match text (768 dimensions)
export async function embedText(text) {
  if (!genAI) {
    console.log('[GEMINI MOCK] Mocking text embedding values.');
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error('Gemini text-embedding-004 failed, using fallback mock:', err);
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  }
}

