'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getAccessToken } from '@/lib/springboot/auth-tokens';
import { FitnessDetails, ProfileFeedback } from '../type';
import { EMPTY_FITNESS_DETAILS } from '../utils/Constants';
import { getFitness, updateFitness } from '../service/fitness.api';

export function useFitnessProfile(options?: { autoFetch?: boolean }) {
  const autoFetch = options?.autoFetch ?? true;
  const { user } = useAuth();
  const [loading, setLoading] = useState(autoFetch);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedFitness, setSavedFitness] = useState<FitnessDetails | null>(null);
  const [fitness, setFitness] = useState<FitnessDetails>(EMPTY_FITNESS_DETAILS);
  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);
  const [offerConsult, setOfferConsult] = useState(false);

  const fetchFitness = useCallback(
    async (silent = false) => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        const next = await getFitness();
        setFitness(next);
        setSavedFitness(next);
      } catch (error) {
        console.error('Error loading fitness profile:', error);
        setFitness(EMPTY_FITNESS_DETAILS);
        setSavedFitness(EMPTY_FITNESS_DETAILS);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!autoFetch) return;
    if (user?.id) {
      void fetchFitness();
      return;
    }
    if (!getAccessToken()) setLoading(false);
  }, [autoFetch, fetchFitness, user?.id]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

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

  const handleUpdate = async () => {
    if (!user?.id) {
      setFeedback({ type: 'error', message: 'You need to be signed in to save fitness details.' });
      return false;
    }

    try {
      setSaving(true);
      setFeedback(null);

      const { data, status } = await updateFitness(fitness);

      if (status !== 200) {
        setFeedback({
          type: 'error',
          message: 'Failed to save fitness details. Please try again.',
        });
        return false;
      }

      setFitness(data);
      setSavedFitness(data);
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
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    loading,
    saving,
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
