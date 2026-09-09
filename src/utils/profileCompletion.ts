import { FitnessDetails, ProfileData } from "@/features/userProfile";

export const calculateProfileCompletion = (
  fitness: FitnessDetails | null ,
  userProfile?: ProfileData | null
) => {
  if (!fitness && !userProfile) return 0;

  // UserProfile page nests fitness under fitness_details; fitness page passes it flat
  const fullName = userProfile?.fullName;
  const avatar = userProfile?.avatar_url;
  const targetWeight = fitness?.targetWeightKg;
  const targetDate = fitness?.targetDate;
  const goal =
    (fitness?.weight && targetWeight
      ? fitness.weight === targetWeight
        ? 'Maintain Weight'
        : fitness.weight > targetWeight
          ? 'Lose Weight'
          : 'Gain Muscle'
      : null);

  const fields = [
    fullName,
    avatar,
    fitness?.gender,
    fitness?.age,
    fitness?.height,
    fitness?.weight,
    fitness?.activityLevel,
    goal,
    targetWeight,
    targetDate,
  ];

  const completedFields = fields.filter((val) => val !== null && val !== undefined && val !== '');
  return Math.round((completedFields.length / fields.length) * 100);
};
