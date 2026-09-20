import { AiPlan, Goals, Stats } from '@/features/fitnessProfile/type';

export const fitnessConsultantApi = async (
  stats: Stats,
  goals: Goals
): Promise<{ data: AiPlan }> => {
  const response = await fetch('/api/fitness-consultant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats, goals }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Failed to consult AI coach');
  }
  return result;
};
