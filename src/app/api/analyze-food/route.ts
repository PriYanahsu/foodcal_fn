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

/**
 * Prefer models that advertise multimodal / image input.
 * Falls back to Gemini family models (multimodal by default) when
 * the API does not expose an explicit vision capability flag.
 */
function supportsVisionInput(model: GeminiModelInfo): boolean {
  const haystack = [model.name, model.displayName, model.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Exclude modalities / task-specific models that cannot take food photos
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
  if (excluded.some((token) => haystack.includes(token))) {
    return false;
  }

  if (
    haystack.includes('image') ||
    haystack.includes('vision') ||
    haystack.includes('multimodal') ||
    haystack.includes('native image')
  ) {
    return true;
  }

  // Most Gemini generative models accept image parts; Gemma / text-only usually don't advertise it
  const id = normalizeModelName(model.name).toLowerCase();
  return id.startsWith('gemini-');
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

/**
 * Rank models so faster / cheaper flash variants are tried first.
 */
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
 * Fetch all models available to the current API key from the Gemini ListModels API,
 * filter to generateContent + vision-capable models, and cache the result in memory.
 */
async function getAvailableModels(apiKey: string): Promise<string[]> {
  const now = Date.now();

  if (modelCache && now - modelCache.fetchedAt < MODEL_CACHE_TTL_MS) {
    console.log(
      `[analyze-food] Using cached model list (${modelCache.models.length} models, age ${Math.round((now - modelCache.fetchedAt) / 1000)}s)`
    );
    return modelCache.models;
  }

  console.log('[analyze-food] Fetching available models from Gemini ListModels API...');

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
    .filter((m) => supportsGenerateContent(m) && supportsVisionInput(m))
    .map((m) => normalizeModelName(m.name))
    .filter(Boolean)
    .sort(rankModels);

  // Deduplicate while preserving rank order
  const unique = [...new Set(compatible)];

  console.log(`[analyze-food] Available vision + generateContent models (${unique.length}):`, unique);

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
  parts: Array<string | { inlineData: { data: string; mimeType: string } }>
): Promise<GenerateContentResult> {
  const models = await getAvailableModels(apiKey);

  if (models.length === 0) {
    throw new Error('No compatible Gemini models found for image generateContent.');
  }

  const failures: string[] = [];

  for (const modelName of models) {
    console.log(`[analyze-food] Trying model: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      console.log(`[analyze-food] Success with model: ${modelName}`);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[analyze-food] Model failed (${modelName}): ${message}`);

      if (isRetryableModelError(error)) {
        failures.push(`${modelName}: ${message}`);
        console.log(`[analyze-food] Skipping ${modelName} (retryable) → next model`);
        continue;
      }

      // Unexpected non-retryable error still try remaining models so we exhaust the list
      failures.push(`${modelName}: ${message}`);
      console.log(`[analyze-food] Skipping ${modelName} (non-retryable but continuing fallback)`);
    }
  }

  throw new Error(
    `All compatible Gemini models failed (${failures.length}/${models.length}). Last errors: ${failures.slice(-3).join(' | ')}`
  );
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is missing in environment variables' },
      { status: 500 }
    );
  }

  try {
    const { image, additional_prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Clean base64 string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
        You are a professional nutritionist API. 
        Analyze the food in the image and return a JSON object with the following fields:
        - food_name: string (concise name of the dish)
        - quantity: string (estimated serving size or weight, e.g. "1 bowl", "200g")
        - health_info: string (20-30 words describing the health benefits of this food)
        - calories: number (estimated total calories)
        - protein: number (grams)
        - carbs: number (grams)
        - fats: number (grams)
        - confidence: number (0.0 to 1.0, how confident you are that this is food)
        - analysis_notes: string (brief explanation of the estimate)
        
        If the image is NOT food, set confidence to 0 and food_name to "Not Food".
        Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
        
        ${additional_prompt ? `User provided additional context: "${additional_prompt}". Take this into account when identifying the food or ingredients.` : ''}
        `;

    const apiKey = getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const result = await generateWithFallback(genAI, apiKey, [
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const responseText = result.response.text();

    // Clean up markdown if present
    const cleanContent = responseText.replace(/```json\n?|\n?```/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse JSON:', cleanContent);
      throw new Error('Failed to parse AI response');
    }

    if (analysis.confidence < 0.5 || analysis.food_name === 'Not Food') {
      return NextResponse.json(
        { error: 'No food detected in this image. Please try again.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ data: analysis });
  } catch (error: any) {
    console.error('Food Analysis Error (Gemini):', error);

    return NextResponse.json({ error: error.message || 'Failed to analyze food' }, { status: 500 });
  }
}
