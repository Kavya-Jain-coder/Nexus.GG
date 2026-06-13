// server/ai/groq.js
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
let groq = null;

if (apiKey && apiKey !== 'your-groq-api-key') {
  groq = new Groq({ apiKey });
} else {
  console.warn('Groq API Key is missing or default template. Mock responses will be used.');
}

export async function callGroq(prompt, systemPrompt = 'You are a professional esports analyst.', jsonMode = false) {
  if (!groq) {
    console.log('[GROQ MOCK] Mocking completions due to missing API Key.');
    return mockGroqCompletion(prompt, jsonMode);
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama3-8b-8192', // Use Llama 3.3 70B if available, else Llama 3 8B
      temperature: 0.2,
      response_format: jsonMode ? { type: 'json_object' } : undefined
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq API Call Failed:', err);
    return mockGroqCompletion(prompt, jsonMode);
  }
}

// Fallback Mock responses for Llama 3.3 tasks
function mockGroqCompletion(prompt, jsonMode) {
  if (jsonMode) {
    return JSON.stringify({
      score: 78.5,
      delta: 6.2,
      analysis: 'Match logs showing general improvement in recoil mitigation and trigger timing compared to prior uploads.',
      categories: {
        aim: 80,
        positioning: 74,
        utility: 82
      }
    });
  }
  return 'Esports telemetry metrics delta comparison shows aim index gains +5.4% while rotation positioning lags.';
}
