import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';

export const runtime = 'nodejs';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface GeminiModelInfo {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}

interface ListModelsResponse {
  models?: GeminiModelInfo[];
  nextPageToken?: string;
}

interface ModelCache {
  models: string[];
  fetchedAt: number;
}

let modelCache: ModelCache | null = null;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }
  return key;
}

/** Strip the `models/` prefix returned by the ListModels API. */
function normalizeModelName(name: string): string {
  return name.replace(/^models\//, '');
}

function supportsGenerateContent(model: GeminiModelInfo): boolean {
  return (model.supportedGenerationMethods ?? []).includes('generateContent');
}

/** Drop task-specific / non-text generative models. */
function isTextGenerativeModel(model: GeminiModelInfo): boolean {
  const haystack = [model.name, model.displayName, model.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const excluded = [
    'embedding',
    'embed-content',
    'aqa',
    'imagen',
    'veo',
    'tts',
    'robotics',
    'computer-use',
  ];

  return !excluded.some((token) => haystack.includes(token));
}

function isRetryableModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;

  const lower = message.toLowerCase();

  return (
    status === 404 ||
    status === 429 ||
    lower.includes('404') ||
    lower.includes('429') ||
    lower.includes('not found') ||
    lower.includes('is not found') ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('deprecated') ||
    lower.includes('no longer available') ||
    lower.includes('not supported') ||
    lower.includes('unavailable')
  );
}

/** Rank models so faster / cheaper flash variants are tried first. */
function rankModels(a: string, b: string): number {
  const score = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('flash-lite')) return 0;
    if (n.includes('flash')) return 1;
    if (n.includes('pro')) return 3;
    return 2;
  };
  return score(a) - score(b) || a.localeCompare(b);
}

/**
 * Fetch models available to the current API key, filter to generateContent
 * text models, and cache the result in memory.
 */
async function getAvailableModels(apiKey: string): Promise<string[]> {
  const now = Date.now();

  if (modelCache && now - modelCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    console.log(
      `[fitness-consultant] Using cached model list (${modelCache.models.length} models, age ${Math.round((now - modelCache.fetchedAt) / 1000)}s)`
    );
    return modelCache.models;
  }

  console.log('[fitness-consultant] Fetching available models from Gemini ListModels API...');

  const models: GeminiModelInfo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${GEMINI_API_BASE}/models`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('pageSize', '100');
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to list Gemini models (${res.status}): ${body}`);
    }

    const data = (await res.json()) as ListModelsResponse;
    if (data.models?.length) {
      models.push(...data.models);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  const compatible = models
    .filter((m) => supportsGenerateContent(m) && isTextGenerativeModel(m))
    .map((m) => normalizeModelName(m.name))
    .filter(Boolean)
    .sort(rankModels);

  const unique = [...new Set(compatible)];

  console.log(
    `[fitness-consultant] Available generateContent models (${unique.length}):`,
    unique
  );

  modelCache = { models: unique, fetchedAt: now };
  return unique;
}

/**
 * Try each compatible model until one successfully generates content.
 * Skips models that return 404 / 429 / deprecated / not-found style errors.
 */
async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  apiKey: string,
  prompt: string
): Promise<GenerateContentResult> {
  const models = await getAvailableModels(apiKey);

  if (models.length === 0) {
    throw new Error('No compatible Gemini models found for generateContent.');
  }

  const failures: string[] = [];

  for (const modelName of models) {
    console.log(`[fitness-consultant] Trying model: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`[fitness-consultant] Success with model: ${modelName}`);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[fitness-consultant] Model failed (${modelName}): ${message}`);

      failures.push(`${modelName}: ${message}`);

      if (isRetryableModelError(error)) {
        console.log(`[fitness-consultant] Skipping ${modelName} (retryable) → next model`);
        continue;
      }

      console.log(
        `[fitness-consultant] Skipping ${modelName} (non-retryable but continuing fallback)`
      );
    }
  }

  throw new Error(
    `All compatible Gemini models failed (${failures.length}/${models.length}). Last errors: ${failures.slice(-3).join(' | ')}`
  );
}

export async function POST(req: Request) {
  console.log('--- Fitness Consultant API Started ---');
  try {
    const body = await req.json();
    console.log('Request Body:', JSON.stringify(body, null, 2));

    const { stats, goals } = body;

    if (!stats || !goals) {
      return NextResponse.json({ error: 'User stats and goals are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing');
      return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
    }

    console.log('API Key present (starts with):', process.env.GEMINI_API_KEY.substring(0, 10));

    let responseText = '';
    try {
      const apiKey = getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);

      const prompt = `
            You are a highly intelligent, world-class elite fitness coach and nutritionist who specializes in POSITIVE PSYCHOLOGY and MOTIVATIONAL INTERVIEWING.
            Your goal is to be a supportive, empathetic, and encouraging partner to the user.
            
            USER STATS:
            - Gender: ${stats.gender}
            - Age: ${stats.age}
            - Height: ${stats.height} cm
            - Current Weight: ${stats.weight} kg
            - Activity Level: ${stats.activity_level}
            
            USER GOALS:
            - Objective: ${goals.objective}
            - Target Weight: ${goals.target_weight} kg
            - Target Date: ${goals.target_date}
            
            INSTRUCTIONS:
            1. Feasibility Check: Is the goal realistic and safe?
            2. Calculations: TDEE, daily calories, and macro split (P/C/F in grams).
            3. Expert Advice (THE MOST IMPORTANT PART): 
               - Use human-like, warm, and highly encouraging language.
               - Instead of "You need to eat more," say "You're doing great! A small nutrient-dense addition to your next meal will help you stay perfectly fueled for your goals."
               - Focus on "WE" and "Partnership" (e.g., "Let's hit this target together!").
               - Use positive reinforcement (celebrate what they've already achieved).
               - Keep it to 3-4 powerful, motivational sentences.

            OUTPUT FORMAT:
            Return ONLY a JSON object:
            {
                "status": "approved" | "rejected",
                "reasoning": "Quick explanation here",
                "targets": { "calories": number, "protein": number, "carbs": number, "fats": number },
                "advice": "Empathetic and motivational coaching advice here"
            }
            Do not include any conversational filler outside the JSON.
            `;

      console.log('--- Calling Gemini ---');
      const result = await generateWithFallback(genAI, apiKey, prompt);
      responseText = result.response.text();
      console.log('--- Gemini Success ---');
    } catch (geminiError: any) {
      console.error('Gemini Error:', geminiError);
      return NextResponse.json(
        { error: `AI Service Error: ${geminiError.message}` },
        { status: 500 }
      );
    }

    // More robust JSON extraction
    let cleanContent = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    try {
      const analysis = JSON.parse(cleanContent);
      return NextResponse.json({ data: analysis });
    } catch (e) {
      console.error('JSON Parse Error. Raw content:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The coach was a bit too talkative.',
          raw: responseText,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Fitness Consultant Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to consult fitness coach', stack: error.stack },
      { status: 500 }
    );
  }
}
