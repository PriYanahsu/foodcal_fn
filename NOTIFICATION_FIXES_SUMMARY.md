# Notification System - Bug Fixes Summary

## 🔍 Issues Found and Fixed

### 1. **Missing Diet Completion Logic**

- **Problem**: The edge function only checked time-based triggers, not actual diet completion
- **Fix**: Added logic to compare `food_logs` with `daily_calorie_target` and detect when users are behind schedule

### 2. **No Integration with Fitness Consultant API**

- **Problem**: Notifications didn't include personalized AI coaching advice
- **Fix**: Integrated with `/api/fitness-consultant` to generate personalized suggestions

### 3. **No Way to Trigger Notifications Manually**

- **Problem**: Could only trigger via scheduled cron jobs
- **Fix**: Created `/api/check-notifications` endpoint for manual triggering and testing

### 4. **Incomplete Time-Based Checks**

- **Problem**: Only checked morning and evening, missing afternoon checks
- **Fix**: Added afternoon (3 PM) check for better diet tracking throughout the day

## 📝 Files Modified

### 1. `supabase/functions/check-notifications/index.ts`

- ✅ Added `checkDietCompletion()` function to calculate progress vs. expected thresholds
- ✅ Added `getCoachingAdvice()` function to call fitness-consultant API
- ✅ Enhanced notification logic to detect incomplete diets
- ✅ Added time-based progress thresholds (25%, 60%, 85%, 95%)
- ✅ Improved error handling and logging

### 2. `src/app/api/check-notifications/route.ts` (NEW)

- ✅ Created API endpoint to trigger notification checks
- ✅ Supports test mode via query parameter
- ✅ Can be called by cron jobs, webhooks, or manually

### 3. `tests/notification-system.test.ts` (NEW)

- ✅ Comprehensive test suite
- ✅ Tests diet completion detection
- ✅ Tests notification creation
- ✅ Tests duplicate prevention

### 4. `docs/NOTIFICATION_TESTING.md` (NEW)

- ✅ Complete testing guide
- ✅ Troubleshooting steps
- ✅ Setup instructions

## 🚀 How to Use

### Quick Test

1. **Start your Next.js server**:

   ```bash
   npm run dev
   ```

2. **Trigger notification check**:

   ```bash
   curl -X POST "http://localhost:3000/api/check-notifications?test=true"
   ```

3. **Check notifications in database**:
   ```sql
   SELECT * FROM notifications
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Production Setup

1. **Deploy edge function**:

   ```bash
   supabase functions deploy check-notifications
   ```

2. **Set environment variables in Supabase**:
   - `SUPABASE_URL` (usually auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` (usually auto-set)
   - `API_BASE_URL` (your Next.js app URL, e.g., `https://your-app.vercel.app`)

3. **Set up cron job** (optional):
   - Use Supabase cron or external service
   - Call the edge function every 30 minutes

## 🎯 Key Features

### Diet Completion Detection

- Compares current calorie intake with daily target
- Uses time-based thresholds to determine if user is behind
- Sends notifications when progress is below expected

### AI Coaching Integration

- Automatically calls fitness-consultant API when user is behind
- Includes personalized advice in notification `suggestion` field
- Gracefully handles API failures (still sends notification without advice)

### Smart Notification Timing

- **Morning (8 AM)**: Kickoff reminder
- **Afternoon (3 PM)**: Check if user is behind schedule
- **Evening (7 PM)**: Reminder if still behind
- **Night (11:55 PM)**: Final push notification

### Duplicate Prevention

- Checks if same notification was sent today
- Prevents spam (unless in test mode)
- Uses notification title as duplicate key

## 🧪 Testing

Run the test suite:

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
export TEST_USER_ID="user-uuid"
export API_BASE_URL="http://localhost:3000"

npx tsx tests/notification-system.test.ts
```

## 📊 Expected Behavior

### When User Completes Diet

- No notification sent (user is on track)

### When User is Behind Schedule

**Afternoon (3 PM) - 40% progress:**

```
Title: "Energy Boost Needed! ⚡"
Message: "You're at 40% of your daily goal. You need about 1200 more calories to stay on track."
Suggestion: [AI-generated coaching advice]
```

**Evening (7 PM) - 60% progress:**

```
Title: "Almost There! 🌙"
Message: "You're at 60% of your daily goal. Just 800 more calories to complete your day strong!"
Suggestion: [AI-generated coaching advice]
```

## ⚠️ Important Notes

1. **Environment Variables**: Make sure `API_BASE_URL` is set correctly in Supabase edge function environment
2. **Test Mode**: Use `?test=true` to bypass time restrictions during testing
3. **User Requirements**: Users must have `daily_calorie_target` set in their profile
4. **API Availability**: The fitness-consultant API must be accessible from the edge function

## 🔧 Troubleshooting

See `docs/NOTIFICATION_TESTING.md` for detailed troubleshooting steps.

## ✅ Verification Checklist

- [ ] Edge function deployed to Supabase
- [ ] Environment variables set in Supabase
- [ ] Test user has `daily_calorie_target` set
- [ ] Test user has some `food_logs` entries
- [ ] Next.js API is accessible
- [ ] Fitness-consultant API is working
- [ ] Test notification check works
- [ ] Notifications appear in database
- [ ] Notifications appear in UI

## 📚 Additional Documentation

- `docs/NOTIFICATIONS.md` - Original notification system documentation
- `docs/NOTIFICATION_TESTING.md` - Testing guide
- `tests/notification-system.test.ts` - Test suite
