'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FitnessDetails, ProfileFeedback } from '../type';
import { EMPTY_FITNESS_DETAILS } from '../utils/Constants';
import { getFitness, queryKeys, updateFitness } from '@/app/service';

export function useFitnessProfile(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [fitness, setFitness] = useState<FitnessDetails>(EMPTY_FITNESS_DETAILS);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);
  const [offerConsult, setOfferConsult] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.fitness(userId ?? ''),
    queryFn: getFitness,
    enabled: autoFetch && !!userId,
  });

  const savedFitness = data ?? null;

  useEffect(() => {
    if (data && !isEditing) setFitness(data);
  }, [data, isEditing]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const fetchFitness = async (_silent = false) => {
    if (!userId) return;
    await refetch();
  };

  const patchFitness = (patch: Partial<FitnessDetails>) => {
    setFitness((prev) => ({ ...prev, ...patch }));
  };

  const startEditing = () => {
    setFeedback(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (savedFitness) setFitness(savedFitness);
    setFeedback(null);
    setIsEditing(false);
  };

  const updateMutation = useMutation({
    mutationFn: (payload: FitnessDetails) => updateFitness(payload),
  });

  const handleUpdate = async () => {
    if (!userId) {
      setFeedback({ type: 'error', message: 'You need to be signed in to save fitness details.' });
      return false;
    }

    try {
      setFeedback(null);
      const { data: next, status } = await updateMutation.mutateAsync(fitness);

      if (status !== 200) {
        setFeedback({
          type: 'error',
          message: 'Failed to save fitness details. Please try again.',
        });
        return false;
      }

      setFitness(next);
      queryClient.setQueryData(queryKeys.fitness(userId), next);
      setIsEditing(false);
      setOfferConsult(true);
      setFeedback({
        type: 'success',
        message: 'Fitness details saved. Run AI Consult to refresh your calorie plan.',
      });
      return true;
    } catch (error) {
      console.error('Error updating fitness profile:', error);
      setFeedback({ type: 'error', message: 'Failed to save fitness details. Please try again.' });
      return false;
    }
  };

  return {
    user,
    loading: isLoading,
    saving: updateMutation.isPending,
    isEditing,
    fitness,
    feedback,
    offerConsult,
    setOfferConsult,
    fetchFitness,
    patchFitness,
    startEditing,
    cancelEditing,
    handleUpdate,
  };
}
