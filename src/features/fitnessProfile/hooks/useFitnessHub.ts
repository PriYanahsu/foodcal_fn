import { AuthUser } from "@/features/auth";
import { FitnessDetails, ProfileData } from "@/features/userProfile";
import { getFitness } from "@/features/userProfile/service/fitness.api";
import { getUser } from "@/features/userProfile/service/user.api";
import { calculateProfileCompletion } from "@/utils/profileCompletion";
import { useCallback, useEffect, useState } from "react";

export const useFitnessHub = (user: AuthUser | null) => {
    const [fitnessProfile, setFitnessProfile] = useState<FitnessDetails | null>(null);
    const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showReminder, setShowReminder] = useState(false);

    const fetchFitnessProfile = useCallback(async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data: FitnessDetails = await getFitness();
      const profile = await getUser(user.id);
      setUserProfile(profile);
      if (data) {
        setFitnessProfile(data);
        setShowReminder(calculateProfileCompletion(data, profile) < 100);
      }
      setLoading(false);
    }, [user?.id]);

    const completionPercentage = calculateProfileCompletion(fitnessProfile, userProfile);
    const bmi = calcBmi(fitnessProfile?.weight ?? null, fitnessProfile?.height ?? null);
    const daysLeft = daysUntilTarget(fitnessProfile?.targetDate ?? null);
    const weightDelta =
      fitnessProfile?.weight && fitnessProfile?.targetWeightKg
        ? (fitnessProfile.weight - fitnessProfile.targetWeightKg).toFixed(1)
        : null;

    useEffect(() => {
      fetchFitnessProfile();
    }, [fetchFitnessProfile]);

    return {
      fitnessProfile,
      userProfile,
      showWizard,
      setShowWizard,
      loading,
      showReminder,
      setShowReminder,
      completionPercentage,
      bmi,
      daysLeft,
      weightDelta,
      fetchFitnessProfile,
    };
};

function calcBmi(weight: number | null, height: number | null): string {
  if (!weight || !height) return '--';
  return (weight / Math.pow(height / 100, 2)).toFixed(1);
}

function daysUntilTarget(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
