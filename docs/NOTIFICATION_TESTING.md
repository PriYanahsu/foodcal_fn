# Notification System Testing Guide

## Overview

This guide explains how to test the notification system that triggers when users haven't completed their daily diet goals.

## What Was Fixed

### 1. **Edge Function Updates** (`supabase/functions/check-notifications/index.ts`)

- ✅ Added diet completion checking by comparing `food_logs` with `daily_calorie_target`
- ✅ Implemented time-based progress thresholds (morning: 25%, afternoon: 60%, evening: 85%, night: 95%)
- ✅ Integrated with `/api/fitness-consultant` to generate personalized AI coaching advice
- ✅ Added logic to detect when users are behind schedule
- ✅ Enhanced notification messages with calorie deficits and progress percentages

### 2. **API Endpoint** (`src/app/api/check-notifications/route.ts`)

- ✅ Created endpoint to manually trigger notification checks
- ✅ Supports test mode via `?test=true` query parameter
- ✅ Can be called by cron jobs, webhooks, or manually for testing

### 3. **Test Suite** (`tests/notification-system.test.ts`)

- ✅ Comprehensive test coverage for notification triggering
- ✅ Verifies diet completion detection
- ✅ Tests duplicate prevention
- ✅ Validates notification content and structure

## How to Test

### Prerequisites

1. Ensure your Next.js server is running: `npm run dev`
2. Have a test user in your Supabase database with:
   - A `daily_calorie_target` set in the `profiles` table
   - Some `food_logs` entries (or create them via the test)

### Option 1: Manual API Call

```bash
# Trigger notification check in test mode
curl -X POST "http://localhost:3000/api/check-notifications?test=true" \
  -H "Content-Type: application/json"

# Trigger in production mode (respects time windows)
curl -X POST "http://localhost:3000/api/check-notifications" \
  -H "Content-Type: application/json"
```

### Option 2: Run Test Suite

1. Set up environment variables:

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export TEST_USER_ID="your-test-user-uuid"
export API_BASE_URL="http://localhost:3000"
```

2. Install test dependencies (if needed):

```bash
npm install --save-dev tsx @types/node
```

3. Run the test:

```bash
npx tsx tests/notification-system.test.ts
```

### Option 3: Direct Edge Function Call

If you have Supabase CLI set up:

```bash
# Call the edge function directly
supabase functions invoke check-notifications --data '{"test": true}'
```

## How It Works

### Diet Completion Detection

The system checks if users are behind on their diet by:

1. **Fetching today's food logs** for each user
2. **Calculating current calorie intake** vs. `daily_calorie_target`
3. **Comparing against time-based thresholds**:
   - Morning (6-12): Should have ~25% of daily calories
   - Afternoon (12-18): Should have ~60% of daily calories
   - Evening (18-22): Should have ~85% of daily calories
   - Night (22+): Should have ~95% of daily calories

4. **Triggering notifications** when progress is 10% below expected threshold

### Notification Types

- **`goal_reminder`**: Time-based reminders (morning kickoff, system checks)
- **`coach_advice`**: Diet completion notifications with AI-generated advice
- **`system`**: System-level notifications

### AI Coaching Integration

When a user is behind on their diet, the system:

1. Calls `/api/fitness-consultant` with user stats and goals
2. Receives personalized coaching advice
3. Includes the advice in the notification's `suggestion` field

## Expected Behavior

### When User is Behind Schedule

**Afternoon (3 PM):**

- Title: "Energy Boost Needed! ⚡"
- Message: "You're at X% of your daily goal. You need about Y more calories to stay on track."
- Includes AI coaching suggestion

**Evening (7 PM):**

- Title: "Almost There! 🌙"
- Message: "You're at X% of your daily goal. Just Y more calories to complete your day strong!"
- Includes AI coaching suggestion

**Night (11:55 PM):**

- Title: "Final Push! 💪"
- Message: "You're at X% of your daily goal. Don't give up now - you're so close!"
- Includes AI coaching suggestion

### Duplicate Prevention

The system prevents sending the same notification multiple times per day by:

- Checking if a notification with the same title was already sent today
- Skipping if duplicate found (unless in test mode)

## Troubleshooting

### Notifications Not Triggering

1. **Check user has calorie target**:

   ```sql
   SELECT id, daily_calorie_target FROM profiles WHERE id = 'user-id';
   ```

2. **Check food logs exist**:

   ```sql
   SELECT * FROM food_logs
   WHERE user_id = 'user-id'
   AND created_at >= CURRENT_DATE;
   ```

3. **Check time windows**: Notifications only trigger at specific times unless in test mode:
   - 1:00 AM (system check)
   - 8:00 AM (morning kickoff)
   - 3:00 PM (afternoon check)
   - 7:00 PM (evening check)
   - 11:55 PM (end of day)

4. **Use test mode**: Add `?test=true` to bypass time restrictions

### Edge Function Not Accessible

1. **Check environment variables** in Supabase:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `API_BASE_URL` (for fitness-consultant API calls)

2. **Verify edge function is deployed**:

   ```bash
   supabase functions list
   ```

3. **Check function logs**:
   ```bash
   supabase functions logs check-notifications
   ```

### Fitness Consultant API Not Working

1. **Verify API is accessible** from the edge function:
   - Edge functions run in Deno, not Node.js
   - Ensure `API_BASE_URL` is set correctly
   - Check if the API requires authentication

2. **Check GEMINI_API_KEY** is set in your Next.js environment

## Setting Up Cron Job (Production)

To automatically check notifications, set up a cron job:

### Using Supabase Cron (Recommended)

1. Go to Supabase Dashboard → Database → Cron Jobs
2. Create a new cron job:
   - Schedule: `*/30 * * * *` (every 30 minutes)
   - SQL:
   ```sql
   SELECT net.http_post(
     url := 'https://your-project.supabase.co/functions/v1/check-notifications',
     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
   );
   ```

### Using External Cron Service

Use a service like cron-job.org or GitHub Actions to call:

```
POST https://your-domain.com/api/check-notifications
```

## Next Steps

1. **Deploy the edge function**:

   ```bash
   supabase functions deploy check-notifications
   ```

2. **Set environment variables** in Supabase dashboard

3. **Test with a real user** who has incomplete diet data

4. **Monitor notifications** in the database:
   ```sql
   SELECT * FROM notifications
   WHERE created_at >= CURRENT_DATE
   ORDER BY created_at DESC;
   ```
