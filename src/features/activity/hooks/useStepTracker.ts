'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useStepTracker = () => {
    const { user } = useAuth();
    const supabase = createClient();

    const [steps, setSteps] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'not-supported'>('prompt');

    // Algorithm constants
    const THRESHOLD = 12.0; // Acceleration magnitude threshold
    const STEP_DELAY = 300; // Min ms between steps to avoid double counting

    const lastStepTime = useRef<number>(0);
    const stepCountRef = useRef<number>(0);

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
                // Initialize today's log with 0 steps
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
        console.log('DeviceMotionEvent available:', 'DeviceMotionEvent' in window);

        // iOS 13+ requires explicit permission for DeviceMotionEvent
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
            // Android and older iOS just work
            console.log('Step Tracker: Direct tracking (Android/Desktop)');
            startTracking();
        }
    };

    const startTracking = () => {
        if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
            console.error('Step Tracker: DeviceMotionEvent not supported');
            alert('Step tracking requires a mobile device with motion sensors. This feature is not available on desktop browsers.');
            setPermissionStatus('not-supported');
            return;
        }
        console.log('Step Tracker: Starting motion listener');
        setIsTracking(true);
    };

    useEffect(() => {
        if (!isTracking) return;

        const handleMotion = (event: DeviceMotionEvent) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

            // Calculate vector magnitude: sqrt(x^2 + y^2 + z^2)
            const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
            const now = Date.now();

            // Smart Peak Detection Logic
            if (magnitude > THRESHOLD && (now - lastStepTime.current) > STEP_DELAY) {
                stepCountRef.current += 1;
                lastStepTime.current = now;
                setSteps(stepCountRef.current);

                // Sync to local storage for persistence within the session
                if (user) {
                    localStorage.setItem(`steps_${user.id}_${new Date().toDateString()}`, stepCountRef.current.toString());
                }
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [isTracking, user]);

    // Sync to Supabase every 10 steps for better persistence
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

    return {
        steps,
        isTracking,
        requestPermission,
        permissionStatus
    };
};
