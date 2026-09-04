interface CompletionFields {
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  activity_level?: string | null;
  target_weight?: number | null;
  target_weight_kg?: number | null;
  target_date?: string | null;
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
    profile.gender,
    fitness.age,
    fitness.height,
    fitness.weight,
    fitness.activity_level,
    profile.goal ??
      (fitness.weight && fitness.target_weight_kg
        ? fitness.weight === fitness.target_weight_kg
          ? 'Maintain Weight'
          : fitness.weight > fitness.target_weight_kg
            ? 'Lose Weight'
            : 'Gain Muscle'
        : null),
    fitness.target_weight_kg ?? profile.target_weight,
    fitness.target_date,
  ];

  // Filter out empty/null values
  const completedFields = fields.filter((val) => val !== null && val !== undefined && val !== '');

  return Math.round((completedFields.length / fields.length) * 100);
};
