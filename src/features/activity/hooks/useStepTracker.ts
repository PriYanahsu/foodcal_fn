'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useStepTracker = () => {
  const { user } = useAuth();

  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'not-supported'>(
    'prompt'
  );

  // Algorithm constants
  const THRESHOLD = 12.0; // Acceleration magnitude threshold
  const STEP_DELAY = 300; // Min ms between steps to avoid double counting

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
      const stored = localStorage.getItem(`steps_${user.id}_${today}`);
      const value = stored ? Number(stored) : 0;
      setSteps(value);
      stepCountRef.current = value;
    };

    fetchInitialSteps();
  }, [user]);

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
          alert(
            'Motion permission denied. Please enable in Settings > Safari > Motion & Orientation Access'
          );
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
      alert(
        'Step tracking requires a mobile device with motion sensors. This feature is not available on desktop browsers.'
      );
      setPermissionStatus('not-supported');
      return;
    }
    console.log('Step Tracker: Starting motion listener');
    setIsTracking(true);

    // Persist tracking state so it survives page navigation
    if (user) {
      localStorage.setItem(`step_tracking_active_${user.id}`, 'true');
    }
  };

  const stopTracking = () => {
    console.log('Step Tracker: Stopping motion listener');
    setIsTracking(false);

    // Clear persistent tracking state
    if (user) {
      localStorage.removeItem(`step_tracking_active_${user.id}`);
    }
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
      if (magnitude > THRESHOLD && now - lastStepTime.current > STEP_DELAY) {
        stepCountRef.current += 1;
        lastStepTime.current = now;
        setSteps(stepCountRef.current);

        // Sync to local storage for persistence within the session
        if (user) {
          localStorage.setItem(
            `steps_${user.id}_${new Date().toDateString()}`,
            stepCountRef.current.toString()
          );
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
      localStorage.setItem(
        `steps_${user.id}_${new Date().toISOString().split('T')[0]}`,
        String(steps)
      );
    };

    syncSteps();
  }, [steps, user]);

  // Cleanup: Stop tracking when user logs out
  useEffect(() => {
    if (!user && isTracking) {
      console.log('Step Tracker: User logged out, stopping tracking');
      stopTracking();
    }
  }, [user, isTracking]);

  return {
    steps,
    isTracking,
    requestPermission,
    stopTracking,
    permissionStatus,
  };
};
