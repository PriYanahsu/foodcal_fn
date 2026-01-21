'use client';

/**
 * Global Step Tracker Context - IMPROVED PRODUCTION ALGORITHM
 * 
 * Improvements:
 * - Gravity Compensation: High-pass filter to separate user motion from gravity (works on all device orientations).
 * - Accurate Metrics: Uses user height/weight for precise distance and calorie calculations.
 * - Robust Syncing: "Pending" buffer ensures no steps are lost during network drops or backgrounding.
 * - Persistence: Recovers session steps from localStorage on reload.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface StepTrackerContextType {
    steps: number;
    distance: number;
    calories: number;
    isTracking: boolean;
    requestPermission: () => Promise<void>;
    stopTracking: () => void;
    permissionStatus: PermissionState | 'not-supported';
}

const StepTrackerContext = createContext<StepTrackerContextType | undefined>(undefined);

export const StepTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const supabase = createClient();

    // -- State --
    const [steps, setSteps] = useState(0);
    const [distance, setDistance] = useState(0); // in km
    const [calories, setCalories] = useState(0); // in kcal

    // We maintain "session" totals to add to the DB values
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'not-supported'>('prompt');

    // -- Refs for Logic --
    const stepCountRef = useRef<number>(0);
    const lastSyncedStepsRef = useRef<number>(0);

    // Pending accumulators (steps not yet synced to DB)
    const pendingStepsRef = useRef<{ steps: number; distance: number; calories: number }>({
        steps: 0,
        distance: 0,
        calories: 0
    });

    const lastStepTime = useRef<number>(0);

    // Profile for accurate calc
    const profileRef = useRef<{ height: number; weight: number }>({ height: 175, weight: 75 });
    const hasProfileLoaded = useRef(false);

    // -- Advanced Algorithm State --
    // We use the "Scalar Magnitude" approach which is rotation-invariant.
    // Instead of vector subtraction (which fails on rotation), we analyze the magnitude of the total force.
    const averageMagnitudeRef = useRef<number>(9.8); // Tracks the baseline gravity (usually ~9.8)
    const accelerationBuffer = useRef<number[]>([]);
    const peakBuffer = useRef<{ value: number; time: number }[]>([]);
    const dynamicThreshold = useRef<number>(1.2); // Default threshold
    const rhythmBufferRef = useRef<number>(0); // Counts candidate steps to verify rhythm
    const lastCandidateTimeRef = useRef<number>(0);

    // -- Initialization & Restoration --

    // 1. Load User Profile
    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('height, weight')
                .eq('id', user.id)
                .single();

            if (data) {
                profileRef.current = {
                    height: data.height || 175,
                    weight: data.weight || 75
                };
                hasProfileLoaded.current = true;
                console.log('👤 Step Tracker: Loaded Profile', profileRef.current);
            }
        };
        fetchProfile();
    }, [user, supabase]);

    // 2. Resume State & Load Initial Data
    useEffect(() => {
        if (!user) return;

        const initSession = async () => {
            // Check if we should be tracking
            const trackingKey = `step_tracking_active_${user.id}`;
            const shouldTrack = localStorage.getItem(trackingKey) === 'true';
            if (shouldTrack) {
                console.log('📱 Step Tracker: Auto-resuming tracking');
                setIsTracking(true);
            }

            // Fetch DB totals for today
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('step_logs')
                .select('steps, distance_km, calories_burned')
                .eq('user_id', user.id)
                .eq('log_date', today)
                .single();

            let dbSteps = 0;
            let dbDist = 0;
            let dbCals = 0;

            if (data && !error) {
                console.log('📊 Step Tracker: DB Loaded', data);
                dbSteps = data.steps;
                dbDist = data.distance_km;
                dbCals = data.calories_burned;
            } else {
                // Initialize today's log if missing
                await supabase.from('step_logs').insert({
                    user_id: user.id,
                    steps: 0,
                    log_date: today,
                    distance_km: 0,
                    calories_burned: 0
                });
            }

            // RECOVERY: Check for unsynced steps in localStorage
            try {
                const pendingKey = `pending_steps_${user.id}`;
                const storedPending = localStorage.getItem(pendingKey);
                if (storedPending) {
                    const parsed = JSON.parse(storedPending);
                    // Add recovered pending steps to our pending ref to be synced next cycle
                    pendingStepsRef.current.steps += parsed.steps || 0;
                    pendingStepsRef.current.distance += parsed.distance || 0;
                    pendingStepsRef.current.calories += parsed.calories || 0;
                    console.log('♻️ Step Tracker: Recovered unsynced session', parsed);

                    // Clear storage once consumed
                    localStorage.removeItem(pendingKey);
                }
            } catch (e) {
                console.error('Error parsing pending steps', e);
            }

            // Final Display State = DB + Pending
            const totalSteps = dbSteps + pendingStepsRef.current.steps;
            setSteps(totalSteps);
            setDistance(dbDist + pendingStepsRef.current.distance);
            setCalories(dbCals + pendingStepsRef.current.calories);

            stepCountRef.current = totalSteps;
            lastSyncedStepsRef.current = totalSteps - pendingStepsRef.current.steps; // Base is what's in DB
        };

        initSession();
    }, [user, supabase]);

    // -- Permission & Control --

    const requestPermission = async () => {
        if (typeof window === 'undefined') return;

        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceMotionEvent as any).requestPermission();
                if (response === 'granted') {
                    startTracking();
                } else {
                    setPermissionStatus('denied');
                }
            } catch (e) {
                console.error(e);
                alert('Permission request failed');
            }
        } else {
            startTracking();
        }
    };

    const startTracking = () => {
        if (!('DeviceMotionEvent' in window)) {
            setPermissionStatus('not-supported');
            return;
        }
        setIsTracking(true);
        if (user) localStorage.setItem(`step_tracking_active_${user.id}`, 'true');
    };

    const stopTracking = () => {
        setIsTracking(false);
        if (user) {
            localStorage.removeItem(`step_tracking_active_${user.id}`);
            syncNow(); // Sync one last time when stopping
        }
    };

    // -- Algorithmic Logic --

    const calculateStepMetrics = () => {
        // 1. Stride Length (km)
        const heightM = profileRef.current.height / 100;
        const strideM = heightM * 0.415;
        const strideKm = strideM / 1000;

        // 2. Calories (kcal)
        const weightKg = profileRef.current.weight;
        const kcal = strideKm * weightKg * 1.036;

        return { dist: strideKm, cal: kcal };
    };

    const updateDynamicThreshold = (recentPeaks: number[]) => {
        if (recentPeaks.length < 5) return;
        const avg = recentPeaks.reduce((a, b) => a + b, 0) / recentPeaks.length;
        dynamicThreshold.current = Math.max(1.2, Math.min(avg * 0.8, 5.0));
    };

    useEffect(() => {
        if (!isTracking) return;

        let lastReadingTime = 0;
        const SAMPLE_INTERVAL = 20; // 50 Hz

        const handleMotion = (event: DeviceMotionEvent) => {
            const now = Date.now();
            if (now - lastReadingTime < SAMPLE_INTERVAL) return;
            lastReadingTime = now;

            // 1. Get Acceleration including gravity (Universal support & most accurate total force)
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

            // 2. Calculate Scalar Magnitude (Total Absolute Force)
            // This is immune to phone rotation. x/y/z doesn't matter, only total force.
            const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

            // 3. Update Baseline Gravity (Low-pass filter on magnitude)
            // This finds the "center" of the wave (usually 9.8, but varies with calibration)
            const alpha = 0.95;
            averageMagnitudeRef.current = alpha * averageMagnitudeRef.current + (1 - alpha) * magnitude;

            // 4. User Motion Signal (High-pass equivalent)
            const userMotion = magnitude - averageMagnitudeRef.current;

            // 5. Buffer & Peak Detection
            accelerationBuffer.current.push(userMotion);
            if (accelerationBuffer.current.length > 30) accelerationBuffer.current.shift();

            // Detect PEAK (Local Maxima)
            if (accelerationBuffer.current.length >= 3) {
                const len = accelerationBuffer.current.length;
                const prev = accelerationBuffer.current[len - 2];
                const curr = accelerationBuffer.current[len - 1]; // "curr" is actually end of buffer
                const prevPrev = accelerationBuffer.current[len - 3];

                // Check for Peak at prev
                if (prev > prevPrev && prev > curr) {

                    // -- Validation 1: Amplitude Threshold --
                    if (prev > dynamicThreshold.current) {

                        // -- Validation 2: Timing / Rhythm --
                        const timeDelta = now - lastCandidateTimeRef.current;

                        // Valid Step Window: 250ms (Running) to 2000ms (Slow Walk)
                        if (timeDelta > 250 && timeDelta < 2000) {

                            // 🌟 Rhythm Buffer Logic 🌟
                            rhythmBufferRef.current += 1;
                            lastCandidateTimeRef.current = now;

                            // If we have 4+ consecutive rhythmic steps, we consider it valid walking.
                            const MIN_CONSECUTIVE_STEPS = 4;

                            if (rhythmBufferRef.current >= MIN_CONSECUTIVE_STEPS) {
                                // Steps are valid!

                                // On the exact 4th step, we apply the previous 3 held-back steps too
                                let increment = 1;
                                if (rhythmBufferRef.current === MIN_CONSECUTIVE_STEPS) {
                                    increment = MIN_CONSECUTIVE_STEPS;
                                }

                                // Apply Steps
                                const { dist, cal } = calculateStepMetrics();
                                const distInc = dist * increment;
                                const calInc = cal * increment;

                                stepCountRef.current += increment;
                                pendingStepsRef.current.steps += increment;
                                pendingStepsRef.current.distance += distInc;
                                pendingStepsRef.current.calories += calInc;
                                lastStepTime.current = now;

                                setSteps(s => s + increment);
                                setDistance(d => d + distInc);
                                setCalories(c => c + calInc);

                                // Update Adaptive Threshold
                                peakBuffer.current.push({ value: prev, time: now });
                                if (peakBuffer.current.length > 20) peakBuffer.current.shift();
                                updateDynamicThreshold(peakBuffer.current.map(p => p.value));

                                // Sync Check
                                if (pendingStepsRef.current.steps >= 10) {
                                    syncNow();
                                }
                                savePendingToLocal();
                            }
                        } else if (timeDelta > 2000) {
                            // Too slow! Rhythm broken. Reset buffer.
                            rhythmBufferRef.current = 1;
                            lastCandidateTimeRef.current = now;
                        }
                    }
                }
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [isTracking]);


    // -- Sync System --

    const savePendingToLocal = () => {
        if (!user) return;
        localStorage.setItem(
            `pending_steps_${user.id}`,
            JSON.stringify(pendingStepsRef.current)
        );
    };

    const syncNow = async () => {
        if (!user) return;

        const payload = { ...pendingStepsRef.current };
        if (payload.steps === 0) return;

        console.log('🔄 Syncing steps:', payload);

        // Optimistic reset
        pendingStepsRef.current = { steps: 0, distance: 0, calories: 0 };
        savePendingToLocal();

        const { error } = await supabase.rpc('increment_steps', {
            user_id_input: user.id,
            steps_count: payload.steps,
            distance_inc: payload.distance,
            calories_inc: payload.calories
        });

        if (error) {
            console.error('❌ Sync failed, putting back pending');
            pendingStepsRef.current.steps += payload.steps;
            pendingStepsRef.current.distance += payload.distance;
            pendingStepsRef.current.calories += payload.calories;
            savePendingToLocal();
        } else {
            console.log('✅ Sync success');
            lastSyncedStepsRef.current = stepCountRef.current;
        }
    };

    // Sync on visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncNow();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user]);

    return (
        <StepTrackerContext.Provider
            value={{
                steps,
                distance,
                calories,
                isTracking,
                requestPermission,
                stopTracking,
                permissionStatus
            }}
        >
            {children}
        </StepTrackerContext.Provider>
    );
};

export const useStepTrackerContext = () => {
    const context = useContext(StepTrackerContext);
    if (context === undefined) {
        throw new Error('useStepTrackerContext must be used within a StepTrackerProvider');
    }
    return context;
};
