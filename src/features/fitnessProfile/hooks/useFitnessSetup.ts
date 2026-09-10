"use client";
import { useCallback, useEffect, useState } from "react";
import { Goals, Stats } from "../type";
import { EMPTY_GOALS, EMPTY_STATS } from "../utils/Constant";
import { FitnessDetails } from "@/features/userProfile";
import { getFitness, updateFitness } from "@/features/userProfile/service/fitness.api";
import { useRouter } from "next/navigation";
import { fitnessConsultantApi } from "../service/fitnessConsultant-api";

export const useFitnessSetup = (userId: string, onComplete: () => void) => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [prefillLoading, setPrefillLoading] = useState(true);
    const [aiResult, setAiResult] = useState<any>(null);
    const [toast, setToast] = useState<{
        message: string;
        detail?: string;
        actionLabel?: string;
        actionHref?: string;
    } | null>(null);
    const clearToast = useCallback(() => setToast(null), []);

    const [stats, setStats] = useState<Stats>(EMPTY_STATS);
    const [goals, setGoals] = useState<Goals>(EMPTY_GOALS);

    // Prefill from existing profile so Modify Plan shows real data (not demo 70/65)
    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setPrefillLoading(true);
            const data: FitnessDetails = await getFitness();

            if (cancelled) return;

            if (data) {
                const weight = data.weight ?? '';
                const targetWeight = data.targetWeightKg ?? '';
                let objective = data.objective || '';
                if (weight !== 0 && targetWeight !== 0) {
                    if (weight > targetWeight) objective = 'Lose Weight';
                    else if (weight < targetWeight) objective = 'Gain Muscle';
                    else objective = 'Maintain Weight';
                }
                setStats({
                    gender: data.gender ?? '',
                    age: data.age ?? '',
                    height: data.height ?? '',
                    weight,
                    activity_level: data.activityLevel || '',
                });
                setGoals({
                    objective,
                    target_weight: targetWeight,
                    target_date: data.targetDate || '',
                });
            }
            setPrefillLoading(false);
        }

        if (userId) loadProfile();
        else setPrefillLoading(false);

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const canProceedStep1 =
        !!stats.gender &&
        stats.age !== '' &&
        stats.height !== '' &&
        stats.weight !== '' &&
        !!stats.activity_level;

    const canProceedStep2 =
        !!goals.objective && goals.target_weight !== '' && !!goals.target_date;

    const derivedObjective = ((): string | null => {
        if (stats.weight === '' || goals.target_weight === '') return null;
        if (stats.weight > goals.target_weight) return 'Lose Weight';
        if (stats.weight < goals.target_weight) return 'Gain Muscle';
        return 'Maintain Weight';
    })();

    const isObjectiveAllowed = (o: string) => !derivedObjective || o === derivedObjective;

    const setTargetWeight = (value: number | '') => {
        const next = {
            ...goals,
            target_weight: value,
        };
        if (stats.weight !== '' && value !== '') {
            if (stats.weight > value) next.objective = 'Lose Weight';
            else if (stats.weight < value) next.objective = 'Gain Muscle';
            else next.objective = 'Maintain Weight';
        }
        setGoals(next);
    };

    const nextStep = () => {
        if (step === 1 && stats.weight !== '' && goals.target_weight !== '') {
            const obj =
                stats.weight > goals.target_weight
                    ? 'Lose Weight'
                    : stats.weight < goals.target_weight
                        ? 'Gain Muscle'
                        : 'Maintain Weight';
            if (goals.objective !== obj) setGoals((g) => ({ ...g, objective: obj }));
        }
        setStep((s) => s + 1);
    };
    const prevStep = () => setStep((s) => s - 1);

    const handleConsultAI = async () => {
        setLoading(true);
        try {
            const res = await fitnessConsultantApi(stats, goals);

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to consult AI coach');
            }

            setAiResult(result.data);
            setStep(4);
        } catch (error: any) {
            console.error('AI Consultation failed:', error);
            alert(`AI Consultation Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        setLoading(true);
        try {
            const { data, status }: { data: FitnessDetails, status: number } = await updateFitness({
                ...stats,
                ...goals,
                ...aiResult,
            });
            if (status === 200 && data) {
                setToast({
                    message: 'Plan saved to Fitness Hub!',
                    detail:
                        'Your calorie, protein, carbs & fat targets are live. Check Fitness Hub & dashboard to track them.',
                    actionLabel: 'Open Fitness Hub',
                    actionHref: '/fitness',
                });
                onComplete();
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to save plan:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        setStep,
        loading,
        prefillLoading,
        aiResult,
        toast,
        clearToast,
        stats,
        goals,
        setStats,
        setGoals,
        nextStep,
        prevStep,
        canProceedStep1,
        canProceedStep2,
        isObjectiveAllowed,
        derivedObjective,
        setTargetWeight,
        handleConsultAI,
        handleSavePlan
    };
};