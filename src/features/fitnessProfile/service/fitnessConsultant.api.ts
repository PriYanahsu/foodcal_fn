import { Goals, Stats } from "../type";

export const fitnessConsultantApi = async (stats: Stats, goals: Goals) => {
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