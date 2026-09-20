export interface Stats {
  gender: string;
  age: number | '';
  height: number | '';
  weight: number | '';
  activity_level: string;
}

export interface Goals {
  objective: string;
  target_weight: number | '';
  target_date: string;
}

/** What `/api/fitness-consultant` returns: coach copy over engine-computed targets. */
export interface AiPlan {
  status: 'approved' | 'rejected' | string;
  reasoning: string;
  advice: string;
  targets: { calories: number; protein: number; carbs: number; fats: number };
  /** true when the numbers are real but the coaching copy is the offline fallback. */
  degraded?: boolean;
}
