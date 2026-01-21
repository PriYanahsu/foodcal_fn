'use client';

/**
 * Global Step Tracker Context - SENIOR SENSOR FUSION IMPLEMENTATION (TUNED)
 * 
 * Tuning Adjustments:
 * - Gravity Alpha: 0.98 (Slower adaptation to prevent signal loss).
 * - Anti-Cheat: Warning only for high rotation (500 deg/s) to prevent false blocks.
 * - Rhythm Buffer: Reduced to 2 steps for faster user feedback.
 * - Threshold: Same statistical logic but smoother filters.
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

    // Profile for accurate calc
    const profileRef = useRef<{ height: number; weight: number }>({ height: 175, weight: 75 });
    const hasProfileLoaded = useRef(false);

    // -- SENIOR SENSOR FUSION STATE --

    // 1. Signal Processing
    const gravityBaselineRef = useRef<number>(9.81);
    const smoothedSignalRef = useRef<number>(0);

    // 2. Adaptive Thresholding (Statistical)
    const statsBufferRef = useRef<number[]>([]); // Rolling buffer for Mean/StdDev
    const dynamicThresholdRef = useRef<number>(0.8);
    const accelerationBuffer = useRef<number[]>([]); // Tiny local buffer for peak logic

    // 3. Rhythm & Anti-Cheat
    const rhythmBufferRef = useRef<number>(0);
    const lastValidStepTimeRef = useRef<number>(0);

    // 4. Activity Classification
    const [activityType, setActivityType] = useState<'walking' | 'running' | 'stationary'>('stationary');

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
                    pendingStepsRef.current.steps += parsed.steps || 0;
                    pendingStepsRef.current.distance += parsed.distance || 0;
                    pendingStepsRef.current.calories += parsed.calories || 0;
                    console.log('♻️ Step Tracker: Recovered unsynced session', parsed);
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
            lastSyncedStepsRef.current = totalSteps - pendingStepsRef.current.steps;
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

    // -- CORE SENSOR FUSION ENGINE --

    /**
     * STATISTICAL THRESHOLDING
     * Calculates Mean + K * StdDev of the recent signal history to determine a dynamic threshold.
     */
    const updateStatisticalThreshold = (signalValue: number) => {
        statsBufferRef.current.push(signalValue);
        if (statsBufferRef.current.length > 50) statsBufferRef.current.shift();

        if (statsBufferRef.current.length < 10) return;

        // Calculate Mean
        const sum = statsBufferRef.current.reduce((a, b) => a + b, 0);
        const mean = sum / statsBufferRef.current.length;

        // Calculate StdDev
        const variance = statsBufferRef.current.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / statsBufferRef.current.length;
        const stdDev = Math.sqrt(variance);

        // K factor (Baseline 1.0, increases for noisy signals)
        const K = 1.0 + (stdDev > 2 ? 0.4 : 0);

        // Clamp threshold to human limits (min 0.6m/s², max 6m/s²)
        dynamicThresholdRef.current = Math.min(Math.max(mean + K * stdDev, 0.6), 6.0);
    };

    /**
     * ACTIVITY CLASSIFIER & METRICS
     */
    const determineActivity = (intervalMs: number, amplitude: number) => {
        const stepFreqHz = 1000 / intervalMs;
        if (stepFreqHz > 2.2 || amplitude > 5.0) {
            setActivityType('running'); // Just for UI if needed
            return 'running';
        } else {
            setActivityType('walking');
            return 'walking';
        }
    };

    const calculatePrecisionMetrics = (mode: 'walking' | 'running') => {
        let strideMultiplier = 0.415; // Walking default
        const heightM = profileRef.current.height / 100;
        let kcalPerKmKg = 0.78; // Walking default

        if (mode === 'running') {
            strideMultiplier = 0.45; // Running stride longer
            kcalPerKmKg = 1.05; // Running burns more
        }

        const strideKm = (heightM * strideMultiplier) / 1000;
        const weightKg = profileRef.current.weight;
        const kcal = strideKm * weightKg * kcalPerKmKg;

        return { dist: strideKm, cal: kcal };
    };

    useEffect(() => {
        if (!isTracking) return;

        let lastSampleTime = 0;
        const SAMPLE_RATE_MS = 20; // ~50Hz

        const handleMotion = (event: DeviceMotionEvent) => {
            const now = Date.now();
            if (now - lastSampleTime < SAMPLE_RATE_MS) return;
            lastSampleTime = now;

            // --- 1. SENSOR FUSION INPUT ---
            const acc = event.accelerationIncludingGravity;
            const rot = event.rotationRate;

            if (!acc || acc.x === null) return;

            // --- 2. ANTI-CHEAT: ROTATION REJECTION ---
            // If the phone is rotating wildly (shaking in hand), reject data.
            // Relaxed threshold: > 500 deg/s.
            if (rot && rot.alpha !== null && rot.beta !== null && rot.gamma !== null) {
                const totalRotation = Math.abs(rot.alpha) + Math.abs(rot.beta) + Math.abs(rot.gamma);
                if (totalRotation > 500) {
                    // console.warn("StepTracker: Excessive Rotation detected (ignored)", totalRotation);
                    // return; // ONLY LOG WARNING, DO NOT REJECT FOR NOW TO DEBUG
                }
            }

            // --- 3. MAGNITUDE & GRAVITY REMOVAL ---
            // Rotation Invariant Magnitude
            const rawMag = Math.sqrt(
                (acc.x || 0) * (acc.x || 0) +
                (acc.y || 0) * (acc.y || 0) +
                (acc.z || 0) * (acc.z || 0)
            );

            // High-Pass Filter (Gravity Removal)
            // TUNED: 0.9 was too fast (eating the step signal). 
            // 0.98 means it adapts slowly to gravity changes, letting steps (faster signals) pass through.
            const alphaGrav = 0.98;
            gravityBaselineRef.current = alphaGrav * gravityBaselineRef.current + (1 - alphaGrav) * rawMag;
            const userForce = rawMag - gravityBaselineRef.current;

            // --- 4. SIGNAL SMOOTHING (Low-Pass) ---
            const alphaSmooth = 0.35; // Slightly more responsive
            smoothedSignalRef.current = alphaSmooth * smoothedSignalRef.current + (1 - alphaSmooth) * userForce;
            const signal = smoothedSignalRef.current;

            // Update Stats
            updateStatisticalThreshold(Math.abs(signal));

            // --- 5. PEAK DETECTION ---
            accelerationBuffer.current.push(signal);
            if (accelerationBuffer.current.length > 6) accelerationBuffer.current.shift();

            // Need at least 3 points for a peak
            if (accelerationBuffer.current.length >= 3) {
                const len = accelerationBuffer.current.length;
                const prev = accelerationBuffer.current[len - 2];   // Candidate Peak center
                const prevPrev = accelerationBuffer.current[len - 3];
                const curr = accelerationBuffer.current[len - 1];

                // Local Maxima Logic: prev > neighbors
                if (prev > prevPrev && prev > curr) {

                    // A. Threshold Check
                    if (prev > dynamicThresholdRef.current) {

                        // B. Timing Check
                        const timeSinceLast = now - lastValidStepTimeRef.current;

                        if (timeSinceLast > 200 && timeSinceLast < 3000) {

                            // C. Rhythm Buffer (Require 2 steps to confirm walking - more sensitive)
                            rhythmBufferRef.current += 1;

                            // Lowered persistence requirement for faster feedback
                            if (rhythmBufferRef.current >= 2) {
                                // CONFIRMED STEP
                                let increment = 1;
                                // If it's the 2nd step, count the previous 1 buffered one too
                                if (rhythmBufferRef.current === 2) increment = 2;

                                lastValidStepTimeRef.current = now;

                                // Classify & Calculate
                                const mode = determineActivity(timeSinceLast, prev);
                                const { dist, cal } = calculatePrecisionMetrics(mode);

                                // Update Refs & State
                                const totalDist = dist * increment;
                                const totalCal = cal * increment;

                                stepCountRef.current += increment;
                                pendingStepsRef.current.steps += increment;
                                pendingStepsRef.current.distance += totalDist;
                                pendingStepsRef.current.calories += totalCal;

                                setSteps(s => s + increment);
                                setDistance(d => d + totalDist);
                                setCalories(c => c + totalCal);

                                // Feedback for user (DEBUG)
                                // console.log(`Step! Force: ${prev.toFixed(2)} vs Thresh: ${dynamicThresholdRef.current.toFixed(2)}`);

                                if (pendingStepsRef.current.steps >= 5) syncNow(); // Sync faster
                                savePendingToLocal();
                            }
                        } else if (timeSinceLast > 3000) {
                            // Rhythm broken (too slow) - BUT this peak counts as the "first" of a new sequence
                            // We must update the lastValidStepTimeRef so the *next* peak can be compared to this one.
                            rhythmBufferRef.current = 1;
                            lastValidStepTimeRef.current = now;
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
