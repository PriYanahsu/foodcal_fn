'use client';

/**
 * Global Step Tracker Context
 * 
 * This context runs at the app level (wrapped in ClientLayout) and provides
 * step tracking functionality that persists across ALL pages and navigation.
 * 
 * Once tracking is started, it continues running in the background until:
 * - User explicitly stops tracking
 * - User logs out
 * 
 * The motion listener is attached globally and will track steps regardless
 * of which page the user is currently viewing.
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface StepTrackerContextType {
    steps: number;
    isTracking: boolean;
    requestPermission: () => Promise<void>;
    stopTracking: () => void;
    permissionStatus: PermissionState | 'not-supported';
}

const StepTrackerContext = createContext<StepTrackerContextType | undefined>(undefined);

export const StepTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const supabase = createClient();

    const [steps, setSteps] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'not-supported'>('prompt');

    // Algorithm constants
    const THRESHOLD = 12.0;
    const STEP_DELAY = 300;

    const lastStepTime = useRef<number>(0);
    const stepCountRef = useRef<number>(0);

    // Check if tracking was previously active and auto-resume
    useEffect(() => {
        if (!user) return;

        const trackingKey = `step_tracking_active_${user.id}`;
        const wasTracking = localStorage.getItem(trackingKey) === 'true';

        if (wasTracking) {
            console.log('Step Tracker: Auto-resuming tracking from previous session');
            setIsTracking(true);
        }
    }, [user]);

    // Load initial steps from Supabase for today
    useEffect(() => {
        if (!user) return;

        const fetchInitialSteps = async () => {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('step_logs')
                .select('steps')
                .eq('user_id', user.id)
                .eq('log_date', today)
                .single();

            if (data && !error) {
                console.log('Step Tracker: Loaded steps from DB:', data.steps);
                setSteps(data.steps);
                stepCountRef.current = data.steps;
            } else {
                console.log('Step Tracker: No existing steps for today, starting from 0');
                await supabase
                    .from('step_logs')
                    .insert({
                        user_id: user.id,
                        steps: 0,
                        log_date: today,
                        distance_km: 0,
                        calories_burned: 0
                    })
                    .select()
                    .single();
            }
        };

        fetchInitialSteps();
    }, [user, supabase]);

    const requestPermission = async () => {
        if (typeof window === 'undefined') return;

        console.log('Step Tracker: Permission requested');

        // iOS 13+ requires explicit permission
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            console.log('Step Tracker: iOS permission flow detected');
            try {
                const response = await (DeviceMotionEvent as any).requestPermission();
                console.log('Step Tracker: Permission response:', response);
                if (response === 'granted') {
                    startTracking();
                } else {
                    alert('Motion permission denied. Please enable in Settings > Safari > Motion & Orientation Access');
                    setPermissionStatus('denied');
                }
            } catch (e) {
                console.error('Permission request failed', e);
                alert('Failed to request motion permission: ' + e);
            }
        } else {
            console.log('Step Tracker: Direct tracking (Android/Desktop)');
            startTracking();
        }
    };

    const startTracking = () => {
        if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
            console.error('Step Tracker: DeviceMotionEvent not supported');
            alert('Step tracking requires a mobile device with motion sensors.');
            setPermissionStatus('not-supported');
            return;
        }
        console.log('Step Tracker: Starting motion listener');
        setIsTracking(true);

        if (user) {
            localStorage.setItem(`step_tracking_active_${user.id}`, 'true');
        }
    };

    const stopTracking = () => {
        console.log('Step Tracker: Stopping motion listener');
        setIsTracking(false);

        if (user) {
            localStorage.removeItem(`step_tracking_active_${user.id}`);
        }
    };

    // Motion event listener - THIS RUNS GLOBALLY
    useEffect(() => {
        if (!isTracking) return;

        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

            const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            const now = Date.now();

            if (magnitude > THRESHOLD && (now - lastStepTime.current) > STEP_DELAY) {
                stepCountRef.current += 1;
                lastStepTime.current = now;
                setSteps(stepCountRef.current);

                if (user) {
                    localStorage.setItem(`steps_${user.id}_${new Date().toDateString()}`, stepCountRef.current.toString());
                }
            }
        };

        console.log('Step Tracker: Adding global motion listener');
        window.addEventListener('devicemotion', handleMotion);

        return () => {
            console.log('Step Tracker: Removing global motion listener');
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [isTracking, user]);

    // Sync to Supabase every 10 steps
    useEffect(() => {
        if (!user || steps === 0 || steps % 10 !== 0) return;

        const syncSteps = async () => {
            console.log('Step Tracker: Syncing', steps, 'steps to database');
            const { error } = await supabase.rpc('increment_steps', {
                user_id_input: user.id,
                steps_count: 10
            });

            if (error) {
                console.error('Step Tracker: Sync failed', error);
            } else {
                console.log('Step Tracker: Sync successful');
            }
        };

        syncSteps();
    }, [steps, user, supabase]);

    // Cleanup: Stop tracking when user logs out
    useEffect(() => {
        if (!user && isTracking) {
            console.log('Step Tracker: User logged out, stopping tracking');
            stopTracking();
        }
    }, [user, isTracking]);

    return (
        <StepTrackerContext.Provider
            value={{
                steps,
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
