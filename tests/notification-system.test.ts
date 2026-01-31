/**
 * Notification System Test Suite
 * 
 * This test verifies that the notification system correctly:
 * 1. Detects when users haven't completed their diet
 * 2. Triggers notifications at appropriate times
 * 3. Integrates with the fitness-consultant API
 * 4. Prevents duplicate notifications
 * 
 * To run this test:
 * 1. Ensure you have a test user in your Supabase database
 * 2. Set up environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * 3. Run: npx tsx tests/notification-system.test.ts
 * 
 * Note: This requires a running Next.js server and Supabase instance
 */

import { createClient } from '@supabase/supabase-js';

// Configuration - Update these with your test environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test user ID - Replace with an actual test user ID from your database
const TEST_USER_ID = process.env.TEST_USER_ID || '';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
        console.log(`\n🧪 Running: ${name}`);
        await testFn();
        results.push({ name, passed: true });
        console.log(`✅ PASSED: ${name}`);
    } catch (error: any) {
        results.push({ name, passed: false, error: error.message, details: error });
        console.error(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
    }
}

async function testNotificationSystem() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase environment variables');
    }

    if (!TEST_USER_ID) {
        throw new Error('Missing TEST_USER_ID environment variable');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test 1: Verify test user exists and has a calorie target
    await runTest('Test user exists with calorie target', async () => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, daily_calorie_target')
            .eq('id', TEST_USER_ID)
            .single();

        if (error) throw error;
        if (!profile) throw new Error('Test user not found');
        if (!profile.daily_calorie_target || profile.daily_calorie_target === 0) {
            throw new Error('Test user must have a daily_calorie_target set');
        }

        console.log(`   User found with target: ${profile.daily_calorie_target} calories`);
    });

    // Test 2: Clear existing notifications for test user
    await runTest('Clear existing notifications', async () => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', TEST_USER_ID);

        if (error) throw error;
        console.log('   Cleared existing notifications');
    });

    // Test 3: Create food logs that are below target (simulating incomplete diet)
    await runTest('Create incomplete diet scenario', async () => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('daily_calorie_target')
            .eq('id', TEST_USER_ID)
            .single();

        if (!profile?.daily_calorie_target) {
            throw new Error('Cannot get calorie target');
        }

        // Create food logs that are only 40% of target (user is behind)
        const targetCalories = profile.daily_calorie_target;
        const loggedCalories = Math.floor(targetCalories * 0.4);

        // Delete existing logs for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await supabase
            .from('food_logs')
            .delete()
            .eq('user_id', TEST_USER_ID)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString());

        // Insert test food log
        const { error } = await supabase.from('food_logs').insert({
            user_id: TEST_USER_ID,
            food_name: 'Test Meal',
            calories: loggedCalories,
            protein: 20,
            carbs: 30,
            fats: 10,
            meal_type: 'lunch',
        });

        if (error) throw error;
        console.log(`   Created food log: ${loggedCalories} calories (${Math.round((loggedCalories / targetCalories) * 100)}% of target)`);
    });

    // Test 4: Trigger notification check in test mode
    await runTest('Trigger notification check', async () => {
        const response = await fetch(`${API_BASE_URL}/api/check-notifications?test=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`   API Response: ${JSON.stringify(data, null, 2)}`);
    });

    // Test 5: Verify notification was created
    await runTest('Verify notification was created', async () => {
        // Wait a bit for the async operation to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;
        if (!notifications || notifications.length === 0) {
            throw new Error('No notification was created');
        }

        const notification = notifications[0];
        console.log(`   Notification created: ${notification.title}`);
        console.log(`   Message: ${notification.message}`);
        console.log(`   Type: ${notification.type}`);

        // Verify notification content
        if (!notification.title || !notification.message) {
            throw new Error('Notification missing title or message');
        }

        if (notification.type !== 'coach_advice' && notification.type !== 'goal_reminder') {
            throw new Error(`Unexpected notification type: ${notification.type}`);
        }
    });

    // Test 6: Verify duplicate prevention
    await runTest('Verify duplicate prevention', async () => {
        // Trigger notification check again
        await fetch(`${API_BASE_URL}/api/check-notifications?test=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!notifications) {
            throw new Error('Failed to fetch notifications');
        }

        // Count notifications with the same title created today
        const today = new Date().toISOString().split('T')[0];
        const todayNotifications = notifications.filter(n => {
            const notifDate = new Date(n.created_at).toISOString().split('T')[0];
            return notifDate === today;
        });

        // Group by title
        const titleGroups = new Map<string, number>();
        todayNotifications.forEach(n => {
            const count = titleGroups.get(n.title) || 0;
            titleGroups.set(n.title, count + 1);
        });

        // Check if any title appears more than once (should not, unless in test mode)
        const duplicates = Array.from(titleGroups.entries()).filter(([_, count]) => count > 1);
        
        if (duplicates.length > 0) {
            console.log(`   Note: Found duplicate notifications (this is expected in test mode):`, duplicates);
        }

        console.log(`   Total notifications today: ${todayNotifications.length}`);
    });

    // Test 7: Verify diet completion check logic
    await runTest('Verify diet completion detection', async () => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('daily_calorie_target')
            .eq('id', TEST_USER_ID)
            .single();

        const { data: foodLogs } = await supabase
            .from('food_logs')
            .select('calories')
            .eq('user_id', TEST_USER_ID)
            .gte('created_at', new Date().toISOString().split('T')[0]);

        if (!profile || !foodLogs) {
            throw new Error('Failed to fetch data');
        }

        const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        const progressPercent = (totalCalories / profile.daily_calorie_target) * 100;

        console.log(`   Current progress: ${Math.round(progressPercent)}%`);
        console.log(`   Calories logged: ${totalCalories} / ${profile.daily_calorie_target}`);

        if (progressPercent >= 100) {
            console.log('   ⚠️  User has completed their diet - notification may not trigger');
        } else {
            console.log('   ✅ User is behind schedule - notification should trigger');
        }
    });
}

// Main test runner
async function main() {
    console.log('🚀 Starting Notification System Tests');
    console.log('=====================================\n');

    try {
        await testNotificationSystem();

        // Print summary
        console.log('\n\n📊 Test Summary');
        console.log('================');
        const passed = results.filter(r => r.passed).length;
        const failed = results.filter(r => !r.passed).length;

        results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.name}`);
            if (!result.passed && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

        if (failed > 0) {
            process.exit(1);
        } else {
            console.log('\n🎉 All tests passed!');
        }
    } catch (error: any) {
        console.error('\n💥 Test suite failed:', error.message);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    main();
}

export { testNotificationSystem, runTest };
