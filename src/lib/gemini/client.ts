/**
 * Shared Gemini access for the AI routes.
 *
 * Three things every call here gets:
 * 1. Structured output — `responseMimeType: application/json` plus a
 *    `responseSchema`, which is what makes the shape of the reply reliable.
 *    Google's guidance is to describe fields in the schema and NOT to repeat
 *    the schema in the prompt text, so the prompts carry method, not shape.
 * 2. Model discovery — the model line moves fast (2.5 -> 3.x), so the live
 *    ListModels response is ranked newest-first instead of hard-coding one id.
 *    The static list below is only the offline fallback.
 * 3. Sampling that matches the model generation — Gemini 3 is documented to
 *    degrade (looping, worse reasoning) when temperature drops below 1.0,
 *    while 2.x benefits from low temperature on extraction work.
 */
import {
  GoogleGenerativeAI,
  type GenerationConfig,
  type Part,
  type ResponseSchema,
} from '@google/generative-ai';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_CACHE_TTL_MS = 30 * 60 * 1000;

/** Used when ListModels is unreachable; ordered the same way rankModels would. */
const STATIC_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
];

/** Models that cannot answer a generateContent prompt with text. */
const EXCLUDED_MODEL_TOKENS = [
  'embedding',
  'embed-content',
  'aqa',
  'imagen',
  'veo',
  'tts',
  'audio',
  'live',
  'robotics',
  'computer-use',
];

export type GeminiTask = 'vision' | 'text';

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

const modelCache = new Map<GeminiTask, { models: string[]; fetchedAt: number }>();

export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }
  return key;
}

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const cause = (error as Error & { cause?: unknown }).cause;
  const causeErr = cause instanceof Error ? cause : undefined;
  const code =
    causeErr && 'code' in causeErr ? String((causeErr as NodeJS.ErrnoException).code) : undefined;

  const parts = [error.message];
  if (causeErr?.message && causeErr.message !== error.message) parts.push(causeErr.message);
  if (code) parts.push(code);

  return parts.join(': ');
}

export function isTlsCertError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('unable to verify the first certificate') ||
    message.includes('unable_to_verify_leaf_signature') ||
    (message.includes('cert') && message.includes('self-signed'))
  );
}

/** Errors that mean "this model won't work, try the next one". */
export function isRetryableModelError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const status =
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;

  return (
    status === 404 ||
    status === 429 ||
    status === 500 ||
    status === 503 ||
    message.includes('404') ||
    message.includes('429') ||
    message.includes('503') ||
    message.includes('not found') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted') ||
    message.includes('deprecated') ||
    message.includes('no longer available') ||
    message.includes('not supported') ||
    message.includes('overloaded') ||
    message.includes('unavailable')
  );
}

function modelGeneration(name: string): number {
  const match = name.match(/gemini-(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Newest generation first, stable before preview, and Flash before Flash-Lite
 * before Pro: published benchmarks put Gemini 3 Flash at the top for food-image
 * nutrition estimation, and it is far cheaper and faster than Pro.
 */
function rankModels(a: string, b: string): number {
  const tier = (name: string) => {
    if (name.includes('flash-lite')) return 1;
    if (name.includes('flash')) return 0;
    if (name.includes('pro')) return 2;
    return 3;
  };
  const unstable = (name: string) =>
    /preview|exp|experimental|thinking|-\d{3,}$/.test(name) ? 1 : 0;

  return (
    unstable(a) - unstable(b) ||
    modelGeneration(b) - modelGeneration(a) ||
    tier(a) - tier(b) ||
    a.localeCompare(b)
  );
}

function supportsGenerateContent(model: GeminiModelInfo): boolean {
  return (model.supportedGenerationMethods ?? []).includes('generateContent');
}

/**
 * Gemini generative models are multimodal by default; anything task-specific
 * (embeddings, image/video/audio generation, robotics) is filtered out, and a
 * vision task additionally requires the gemini- family.
 */
function isUsable(model: GeminiModelInfo, task: GeminiTask): boolean {
  const haystack = [model.name, model.displayName, model.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (EXCLUDED_MODEL_TOKENS.some((token) => haystack.includes(token))) return false;

  const id = model.name.replace(/^models\//, '').toLowerCase();
  return task === 'vision' ? id.startsWith('gemini-') : true;
}

async function listModels(apiKey: string): Promise<GeminiModelInfo[]> {
  const models: GeminiModelInfo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${GEMINI_API_BASE}/models`);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('pageSize', '200');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to list Gemini models (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as ListModelsResponse;
    if (data.models?.length) models.push(...data.models);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return models;
}

/** Ranked model ids for a task, cached in memory; falls back to STATIC_MODELS. */
export async function getCandidateModels(apiKey: string, task: GeminiTask): Promise<string[]> {
  const cached = modelCache.get(task);
  if (cached && Date.now() - cached.fetchedAt < MODEL_CACHE_TTL_MS) {
    return cached.models;
  }

  let models: string[];
  try {
    models = [
      ...new Set(
        (await listModels(apiKey))
          .filter((m) => supportsGenerateContent(m) && isUsable(m, task))
          .map((m) => m.name.replace(/^models\//, ''))
          .filter(Boolean)
      ),
    ].sort(rankModels);
  } catch (error) {
    console.error(`[gemini] ListModels failed, using static list: ${getErrorMessage(error)}`);
    models = [...STATIC_MODELS];
  }

  if (models.length === 0) models = [...STATIC_MODELS];

  modelCache.set(task, { models, fetchedAt: Date.now() });
  return models;
}

/** Pull the JSON object out of a reply, tolerating fences or stray prose. */
function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error('Model reply was not valid JSON');
  }
}

export interface GenerateJsonOptions {
  /** Prompt label used in logs. */
  label: string;
  systemInstruction: string;
  parts: Array<string | Part>;
  schema: ResponseSchema;
  task?: GeminiTask;
  /** Applied to Gemini 2.x only; Gemini 3 is left at its default of 1.0. */
  legacyTemperature?: number;
  /** Stop after this many models instead of walking the whole list. */
  maxAttempts?: number;
}

export interface GenerateJsonResult<T> {
  data: T;
  model: string;
}

/**
 * Runs a schema-constrained JSON generation, walking the ranked model list until
 * one returns parseable output.
 */
export async function generateJson<T>(
  options: GenerateJsonOptions
): Promise<GenerateJsonResult<T>> {
  const {
    label,
    systemInstruction,
    parts,
    schema,
    task = 'text',
    legacyTemperature = 0.2,
    maxAttempts = 4,
  } = options;

  const apiKey = getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = (await getCandidateModels(apiKey, task)).slice(0, maxAttempts);
  const failures: string[] = [];

  for (const modelName of models) {
    const generationConfig: GenerationConfig = {
      responseMimeType: 'application/json',
      responseSchema: schema,
      ...(modelGeneration(modelName) >= 3 ? {} : { temperature: legacyTemperature }),
    };

    try {
      console.log(`[${label}] model=${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig,
      });

      const result = await model.generateContent(parts);
      const blockReason = result.response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new Error(`Request blocked by safety filters (${blockReason})`);
      }

      return { data: parseJsonResponse<T>(result.response.text()), model: modelName };
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error(`[${label}] model failed (${modelName}): ${message}`);
      failures.push(`${modelName}: ${message}`);

      // A local TLS problem will hit every model; surface it immediately.
      if (isTlsCertError(error)) throw error;
    }
  }

  throw new Error(
    `All Gemini models failed (${failures.length}/${models.length}). ${failures.join(' | ')}`
  );
}

export const TLS_HINT =
  'AI Service Error: TLS certificate verification failed (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Restart the Next server via npm run dev so Node uses --use-system-ca (antivirus HTTPS scanning).';
