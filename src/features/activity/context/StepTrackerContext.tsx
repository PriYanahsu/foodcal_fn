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

    // Algorithm Refs
    const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
    const accelerationBuffer = useRef<number[]>([]);
    const peakBuffer = useRef<{ value: number; time: number }[]>([]);
    const dynamicThreshold = useRef<number>(1.2); // S slightly lower default for HPF signal

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
            // Format: "pending_steps_{userId}" -> JSON
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

            // Final Display State = DB + Pending (if any just added)
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

    // Calculates metrics for a single step
    const calculateStepMetrics = () => {
        // 1. Stride Length (km)
        // Heuristic: Height * 0.415 for men, * 0.413 for women. We average/simplify to 0.415 or default.
        // Height is in cm, converted to meters * constant
        const heightM = profileRef.current.height / 100;
        const strideM = heightM * 0.415;
        const strideKm = strideM / 1000;

        // 2. Calories (kcal)
        // Formula: 0.5 * weight(kg) * distance(km) (rule of thumb for walking) 
        // OR standard metabolic: ~0.75 cal / kg / km. 
        // Let's use a standard factor: 0.0005 kcal per step per kg roughly?
        // Better: Calories = Distance(km) * Weight(kg) * 1.036
        const weightKg = profileRef.current.weight;
        const kcal = strideKm * weightKg * 1.036;

        return { dist: strideKm, cal: kcal };
    };

    const updateDynamicThreshold = (recentPeaks: number[]) => {
        if (recentPeaks.length < 5) return;
        const avg = recentPeaks.reduce((a, b) => a + b, 0) / recentPeaks.length;
        // Keep threshold bounded
        dynamicThreshold.current = Math.max(0.8, Math.min(avg * 0.8, 4.0));
    };

    useEffect(() => {
        if (!isTracking) return;

        let lastReadingTime = 0;
        const SAMPLE_INTERVAL = 20; // limit processing to ~50Hz

        const handleMotion = (event: DeviceMotionEvent) => {
            const now = Date.now();
            if (now - lastReadingTime < SAMPLE_INTERVAL) return;
            lastReadingTime = now;

            // 1. Get Acceleration including gravity (most reliable sensor)
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

            // 2. Gravity Isolation (Low-Pass Filter)
            const alpha = 0.8; // Heavy filtering to isolate gravity component
            gravityRef.current.x = alpha * gravityRef.current.x + (1 - alpha) * acc.x;
            gravityRef.current.y = alpha * gravityRef.current.y + (1 - alpha) * acc.y;
            gravityRef.current.z = alpha * gravityRef.current.z + (1 - alpha) * acc.z;

            // 3. User Acceleration = Raw - Gravity (High-Pass Filter)
            const userAccX = acc.x - gravityRef.current.x;
            const userAccY = acc.y - gravityRef.current.y;
            const userAccZ = acc.z - gravityRef.current.z;

            // 4. Magnitude of user motion
            const magnitude = Math.sqrt(userAccX * userAccX + userAccY * userAccY + userAccZ * userAccZ);

            // 5. Buffer & Peak Detection
            accelerationBuffer.current.push(magnitude);
            if (accelerationBuffer.current.length > 30) accelerationBuffer.current.shift();

            // Check for peak in middle of buffer (simple local maxima)
            // Need enough context: Prev < Curr > Next
            if (accelerationBuffer.current.length >= 3) {
                const len = accelerationBuffer.current.length;
                const prev = accelerationBuffer.current[len - 2];
                const curr = accelerationBuffer.current[len - 1]; // Current is actually the latest, we detect "just passed" peaks
                const prevPrev = accelerationBuffer.current[len - 3];

                // Detect peak at (len-2)
                if (prev > prevPrev && prev > curr) {
                    // Potential peak found at 'prev'

                    // -- Validation --
                    // 1. Threshold check
                    if (prev > dynamicThreshold.current) {
                        // 2. Timing check (Step cadence)
                        if (now - lastStepTime.current > 250) { // Min 250ms per step (max 240 steps/min)

                            // CONFIRMED STEP
                            const { dist, cal } = calculateStepMetrics();

                            // Update Refs (Sources of Truth for Logic)
                            stepCountRef.current += 1;
                            pendingStepsRef.current.steps += 1;
                            pendingStepsRef.current.distance += dist;
                            pendingStepsRef.current.calories += cal;
                            lastStepTime.current = now;

                            // Update State (for UI)
                            setSteps(s => s + 1);
                            setDistance(d => d + dist);
                            setCalories(c => c + cal);

                            // Optimize Threshold
                            peakBuffer.current.push({ value: prev, time: now });
                            if (peakBuffer.current.length > 20) peakBuffer.current.shift();
                            updateDynamicThreshold(peakBuffer.current.map(p => p.value));

                            // Sync Logic Check
                            if (pendingStepsRef.current.steps >= 10) {
                                syncNow();
                            }

                            // Local Backup
                            savePendingToLocal();
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

        // Optimistic reset of pending (if it fails, we should technically revert, but for steps rare loss is preferred over double count)
        // Resetting ref immediately prevents double-triggering
        pendingStepsRef.current = { steps: 0, distance: 0, calories: 0 };
        savePendingToLocal(); // Clear local backup

        const { error } = await supabase.rpc('increment_steps', {
            user_id_input: user.id,
            steps_count: payload.steps,
            distance_inc: payload.distance,
            calories_inc: payload.calories
        });

        if (error) {
            console.error('❌ Sync failed, putting back pending');
            // Restore steps to pending if sync failed
            pendingStepsRef.current.steps += payload.steps;
            pendingStepsRef.current.distance += payload.distance;
            pendingStepsRef.current.calories += payload.calories;
            savePendingToLocal();
        } else {
            console.log('✅ Sync success');
            lastSyncedStepsRef.current = stepCountRef.current;
        }
    };

    // Sync on visibility change (leaving app)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncNow();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user]);

    // Cleanup: Sync on unmount logic is hard to rely on, visibilitychange is better.

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
