interface CompletionFields {
  gender?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  activity_level?: string | null;
  activityLevel?: string | null;
  target_weight?: number | null;
  target_weight_kg?: number | null;
  targetWeightKg?: number | null;
  target_date?: string | null;
  targetDate?: string | null;
}

interface CompletionProfile extends CompletionFields {
  full_name?: string | null;
  fullName?: string | null;
  avatar_url?: string | null;
  gender?: string | null;
  goal?: string | null;
  fitness_details?: CompletionFields;
}

export const calculateProfileCompletion = (profile: CompletionProfile | null | undefined) => {
  if (!profile) return 0;
  const fitness = profile.fitness_details ?? profile;

  // Fields that contribute to completion
  const fields = [
    profile.full_name ?? profile.fullName,
    profile.avatar_url,
    profile.gender ?? fitness.gender,
    fitness.age,
    fitness.height,
    fitness.weight,
    fitness.activity_level ?? fitness.activityLevel,
    profile.goal ??
      (fitness.weight && (fitness.target_weight_kg ?? fitness.targetWeightKg)
        ? fitness.weight === (fitness.target_weight_kg ?? fitness.targetWeightKg)
          ? 'Maintain Weight'
          : fitness.weight > (fitness.target_weight_kg ?? fitness.targetWeightKg)!
            ? 'Lose Weight'
            : 'Gain Muscle'
        : null),
    fitness.target_weight_kg ?? fitness.targetWeightKg ?? profile.target_weight,
    fitness.target_date ?? fitness.targetDate,
  ];

  // Filter out empty/null values
  const completedFields = fields.filter((val) => val !== null && val !== undefined && val !== '');

  return Math.round((completedFields.length / fields.length) * 100);
};
