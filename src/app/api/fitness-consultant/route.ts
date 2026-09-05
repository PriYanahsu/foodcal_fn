import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';

export const runtime = 'nodejs';

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
];

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }
  return key;
}

function getErrorMessage(error: unknown): string {
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

function isTlsCertError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('unable to verify the first certificate') ||
    message.includes('unable_to_verify_leaf_signature') ||
    message.includes('cert') && message.includes('self-signed')
  );
}

function isRetryableModelError(error: unknown): boolean {
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
    message.includes('404') ||
    message.includes('429') ||
    message.includes('not found') ||
    message.includes('is not found') ||
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('resource_exhausted') ||
    message.includes('deprecated') ||
    message.includes('no longer available') ||
    message.includes('not supported') ||
    message.includes('unavailable')
  );
}

async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  prompt: string
): Promise<GenerateContentResult> {
  const failures: string[] = [];

  for (const modelName of FALLBACK_MODELS) {
    console.log(`[fitness-consultant] Trying model: ${modelName}`);

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      console.log(`[fitness-consultant] Success with model: ${modelName}`);
      return result;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error(`[fitness-consultant] Model failed (${modelName}): ${message}`);
      failures.push(`${modelName}: ${message}`);

      if (isTlsCertError(error)) {
        throw error;
      }

      if (isRetryableModelError(error)) {
        continue;
      }
    }
  }

  throw new Error(
    `All Gemini models failed (${failures.length}/${FALLBACK_MODELS.length}). ${failures.join(' | ')}`
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
      const result = await generateWithFallback(genAI, prompt);
      responseText = result.response.text();
      console.log('--- Gemini Success ---');
    } catch (geminiError: unknown) {
      console.error('Gemini Error:', geminiError);
      const message = getErrorMessage(geminiError);

      if (isTlsCertError(geminiError)) {
        return NextResponse.json(
          {
            error:
              'AI Service Error: TLS certificate verification failed (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Restart the Next server via npm run dev so Node uses --use-system-ca (Windows antivirus HTTPS scanning).',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: `AI Service Error: ${message}` }, { status: 500 });
    }

    let cleanContent = responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    try {
      const analysis = JSON.parse(cleanContent);
      return NextResponse.json({ data: analysis });
    } catch {
      console.error('JSON Parse Error. Raw content:', responseText);
      return NextResponse.json(
        {
          error: 'Failed to parse AI response. The coach was a bit too talkative.',
          raw: responseText,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Fitness Consultant Error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to consult fitness coach' },
      { status: 500 }
    );
  }
}
