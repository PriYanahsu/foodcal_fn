import { NextResponse } from 'next/server';
import { SchemaType, type ResponseSchema } from '@google/generative-ai';
import { TLS_HINT, generateJson, getErrorMessage, isTlsCertError } from '@/lib/gemini/client';
import { computePlan, normalizePlanInput, type ComputedPlan } from '@/lib/nutrition/plan';

export const runtime = 'nodejs';

/**
 * Only the words come from the model. Status, calories and macros are computed
 * in `computePlan`, so the coach can never invent a number the app then stores.
 */
const COACH_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reasoning: {
      type: SchemaType.STRING,
      description:
        'Two sentences, max 45 words, plain language: why this calorie target fits this body and this deadline. If the plan was rejected, say what is unsafe and name the concrete fix (the realistic date or a gentler target weight) using only the numbers supplied.',
    },
    advice: {
      type: SchemaType.STRING,
      description:
        'Three to four warm, motivating sentences of coaching the user can act on tomorrow morning. Speak as a partner ("we", "let us"), name one or two concrete habits that fit their protein target and activity level, and end on encouragement.',
    },
  },
  required: ['reasoning', 'advice'],
};

const COACH_SYSTEM_INSTRUCTION = `You are an elite strength-and-nutrition coach writing the hand-off note for a client's new plan.

You are given a plan that has ALREADY been calculated by a validated engine (Mifflin-St Jeor BMR, activity multiplier, 7700 kcal per kg of body mass, safe-rate and calorie-floor guard rails). Your job is language, never arithmetic.

HARD RULES
- Never state a calorie, macro, weight, rate or date value that is not present in the plan data you are given. Never recalculate or "correct" the engine.
- Never contradict the status: if it is "approved", the plan is sound and you are encouraging; if it is "rejected", you are kind but clear that the deadline or target is unsafe, and you point to the realistic alternative given in the data.
- No medical claims, no diagnoses, no supplement or medication advice, no fasting or detox protocols, no body shaming, and never encourage eating below the calorie target.
- If a flag warns about age, BMI or a clinician, weave a single calm sentence about checking in with a doctor or dietitian. Do not make it the whole message.

VOICE
- Warm, specific, human. Positive psychology and motivational interviewing: affirm what they are already doing, frame the plan as a partnership, celebrate the first small win.
- No filler, no emoji, no markdown, no exclamation-mark spam. Plain sentences a tired person can read at night.
- Tie the advice to THIS person: their objective, their activity level, their protein target, the length of their runway.`;

function describeFlag(flag: string): string {
  switch (flag) {
    case 'activity_level_missing_assumed_sedentary':
      return 'Activity level was not provided, so the engine assumed sedentary (1.2).';
    case 'calorie_floor_applied':
      return 'The calorie floor was reached, so the deficit is smaller than the deadline would need.';
    case 'target_date_too_soon':
      return 'The target date is less than a week away.';
    case 'rate_too_aggressive_loss':
      return 'The requested weekly weight loss is faster than the safe limit.';
    case 'rate_too_aggressive_gain':
      return 'The requested weekly weight gain is faster than the safe limit.';
    case 'target_weight_below_healthy_bmi':
      return 'The target weight falls below a healthy BMI (17.5).';
    case 'target_weight_above_healthy_bmi':
      return 'The target weight sits above a healthy BMI for a gaining phase.';
    case 'minor_requires_clinician_guidance':
      return 'The user is under 18, so a clinician or dietitian should sign off on the plan.';
    case 'starting_bmi_obese_range':
      return 'Starting BMI is in the obese range; steady, sustainable change matters more than speed.';
    default:
      return flag;
  }
}

/** The facts the coach is allowed to talk about, in a compact, unambiguous shape. */
function buildCoachContext(
  plan: ComputedPlan,
  input: ReturnType<typeof normalizePlanInput>['input']
) {
  const { metrics, targets } = plan;

  return {
    status: plan.status,
    direction: plan.direction,
    client: {
      gender: input.gender || 'unspecified',
      age_years: input.age,
      height_cm: input.heightCm,
      current_weight_kg: input.weightKg,
      target_weight_kg: input.targetWeightKg,
      activity_level: input.activityLevel || 'not provided',
      objective: input.objective || plan.direction,
      target_date: input.targetDate,
      today: new Date().toISOString().slice(0, 10),
    },
    energy: {
      bmr_kcal: metrics.bmr,
      tdee_kcal: metrics.tdee,
      activity_factor: metrics.activityFactor,
      daily_calorie_target: targets.calories,
      daily_delta_vs_tdee_kcal: metrics.dailyDeltaKcal,
    },
    macros_g_per_day: {
      protein: targets.protein,
      carbs: targets.carbs,
      fats: targets.fats,
      protein_g_per_kg_goal_weight: metrics.proteinPerKg,
    },
    timeline: {
      total_change_kg: metrics.totalChangeKg,
      weeks_until_target_date: metrics.weeksAvailable,
      required_weekly_change_kg: metrics.requiredWeeklyKg,
      safe_weekly_limit_kg: metrics.safeWeeklyLimitKg,
      planned_weekly_change_kg: metrics.plannedWeeklyKg,
      realistic_weeks_at_this_target: metrics.projectedWeeks,
      realistic_completion_date: metrics.projectedDate,
    },
    body_composition: { current_bmi: metrics.bmi, target_bmi: metrics.targetBmi },
    warnings: plan.flags.map(describeFlag),
  };
}

/** Used when Gemini is unreachable so the user still gets a usable, correct plan. */
function fallbackCopy(plan: ComputedPlan): { reasoning: string; advice: string } {
  const { metrics, targets } = plan;

  if (plan.status === 'rejected') {
    return {
      reasoning:
        `That pace asks for ${Math.abs(metrics.requiredWeeklyKg)} kg a week, and the safe ceiling for your body is ` +
        `${metrics.safeWeeklyLimitKg} kg. ${metrics.projectedDate ? `Moving the date to ${metrics.projectedDate} makes it work.` : 'Try a gentler target weight or a later date.'}`,
      advice:
        'Nothing here is a setback — the goal is right, the runway is just short. Pick a date a little further out and the same habits will get you there without wrecking your energy. Let us set it up so the plan survives a busy week.',
    };
  }

  return {
    reasoning:
      `Your maintenance sits near ${metrics.tdee} kcal, so ${targets.calories} kcal a day moves you about ` +
      `${Math.abs(metrics.plannedWeeklyKg)} kg per week — steady enough to hold on to muscle.`,
    advice:
      `Let us keep it simple: hit ${targets.protein} g of protein and stay close to ${targets.calories} kcal most days, and the rest takes care of itself. ` +
      'Build each meal around a protein source first, then fill in carbs around the parts of the day you move most. ' +
      'Consistency across the week beats a perfect day, so log the meal even when it is not the one you planned.',
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { stats, goals } = (body ?? {}) as {
      stats?: Record<string, unknown>;
      goals?: Record<string, unknown>;
    };

    if (!stats || !goals) {
      return NextResponse.json({ error: 'User stats and goals are required' }, { status: 400 });
    }

    const { input, errors } = normalizePlanInput(stats, goals);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.map((e) => e.message).join(' '), fields: errors },
        { status: 400 }
      );
    }

    // Calories, macros and feasibility are decided here, not by the model.
    const plan = computePlan(input);
    const context = buildCoachContext(plan, input);

    let copy = fallbackCopy(plan);
    let degraded = true;
    let model: string | null = null;

    try {
      const result = await generateJson<{ reasoning: string; advice: string }>({
        label: 'fitness-consultant',
        systemInstruction: COACH_SYSTEM_INSTRUCTION,
        parts: [
          'Write the hand-off note for this client. PLAN DATA (the only numbers you may use):',
          JSON.stringify(context, null, 2),
        ],
        schema: COACH_SCHEMA,
        task: 'text',
        legacyTemperature: 0.6,
      });

      if (result.data?.reasoning?.trim() && result.data?.advice?.trim()) {
        copy = { reasoning: result.data.reasoning.trim(), advice: result.data.advice.trim() };
        degraded = false;
        model = result.model;
      }
    } catch (aiError: unknown) {
      if (isTlsCertError(aiError)) {
        return NextResponse.json({ error: TLS_HINT }, { status: 500 });
      }
      // The plan itself is still valid, so ship it with the written fallback.
      console.error('[fitness-consultant] coaching copy failed:', getErrorMessage(aiError));
    }

    return NextResponse.json({
      data: {
        status: plan.status,
        reasoning: copy.reasoning,
        advice: copy.advice,
        targets: plan.targets,
        metrics: plan.metrics,
        flags: plan.flags,
        /** true when the numbers are real but the coaching copy is the offline fallback. */
        degraded,
        model,
      },
    });
  } catch (error: unknown) {
    console.error('[fitness-consultant] failed:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) || 'Failed to consult fitness coach' },
      { status: 500 }
    );
  }
}
