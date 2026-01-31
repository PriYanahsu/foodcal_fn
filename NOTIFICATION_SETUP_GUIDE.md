# Notification System Setup Guide - FIXED

## 🔧 Critical Fix Applied

The notification system has been fixed to **always send notifications at 11:15 PM (23:15)** regardless of diet completion status. Previously, notifications only sent if users were behind on their diet.

## ⚠️ IMPORTANT: The Function Must Be Called

**The edge function does NOT run automatically.** You must set up one of these methods:

### Option 1: Supabase Cron Job (Recommended for Production)

1. Go to **Supabase Dashboard** → **Database** → **Cron Jobs**
2. Create a new cron job with this SQL:

```sql
-- Run every 30 minutes to catch all time windows
SELECT cron.schedule(
  'check-notifications',
  '*/30 * * * *',  -- Every 30 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Or use pg_cron extension:**

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every 30 minutes
SELECT cron.schedule(
  'check-notifications-every-30min',
  '*/30 * * * *',  -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference ID
- `YOUR_SERVICE_ROLE_KEY` with your service role key (found in Settings → API)

### Option 2: External Cron Service

Use services like:
- **cron-job.org**
- **GitHub Actions**
- **Vercel Cron** (if deployed on Vercel)

Schedule to call:
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications
Headers:
  Authorization: Bearer YOUR_SERVICE_ROLE_KEY
  Content-Type: application/json
```

### Option 3: Manual Testing

Call the API endpoint:
```bash
curl -X POST "http://localhost:3000/api/check-notifications?test=true"
```

Or call the edge function directly:
```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications?test=true" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 🕐 Notification Schedule

The system now sends notifications at these times:

| Time | Trigger | Notification Type |
|------|---------|-------------------|
| **1:00 AM** | System Check | System reminder |
| **8:00 AM** | Morning Kickoff | Goal reminder |
| **3:00 PM** | Afternoon Check | Coach advice (if behind) |
| **7:00 PM** | Evening Check | Coach advice (if behind) |
| **11:15 PM** | End of Day | **ALWAYS sends** - Summary/Reminder |

### 11:15 PM Notification Details

At 11:15 PM, the system **ALWAYS** sends a notification:

- **If user is behind:** "Final Push! 💪" - Encourages completion
- **If user completed goal (100%+):** "Goal Achieved! 🎉" - Celebration
- **If user is on track:** "End of Day Check-in 📊" - Summary reminder

## 🧪 Testing the Fix

### Test Immediately (Bypass Time Restrictions)

```bash
# Using the API endpoint
curl -X POST "http://localhost:3000/api/check-notifications?test=true"

# Or directly call edge function
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-notifications?test=true" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Test at Specific Time

1. Wait until 11:15 PM (or set your system time for testing)
2. Ensure the cron job is running
3. Check notifications table:
```sql
SELECT * FROM notifications 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;
```

## 🔍 Debugging

### Check Function Logs

```bash
npx supabase@latest functions logs check-notifications --follow
```

### Verify Time Matching

The function logs will show:
```
User [id]: Local Time 23:15 (timezone) | Calories: X/Y (Z%) | Behind: true/false
  Time Checks: SystemCheck=false, Morning=false, Afternoon=false, Evening=false, EndOfDay=true, TestWindow=false
  Should Evaluate: true, Should Check Diet: true/false
```

### Common Issues

1. **No notifications at 11:15 PM:**
   - ✅ Check if cron job is running
   - ✅ Verify function is deployed: `npx supabase@latest functions list`
   - ✅ Check logs for errors
   - ✅ Verify user has `daily_calorie_target` set

2. **Function not being called:**
   - ✅ Set up cron job (see Option 1 above)
   - ✅ Verify cron job is active in Supabase Dashboard
   - ✅ Check cron job logs

3. **Time zone issues:**
   - ✅ Verify user's `timezone` field in profiles table
   - ✅ Function uses user's timezone, not server timezone

## 📋 Verification Checklist

- [ ] Edge function deployed: `npx supabase@latest functions deploy check-notifications`
- [ ] Cron job set up and active
- [ ] Environment variables set (API_BASE_URL if using AI coaching)
- [ ] Test user has `daily_calorie_target` set
- [ ] Test user has `timezone` set (or defaults to UTC)
- [ ] Function logs show execution at 11:15 PM
- [ ] Notifications appear in database
- [ ] Notifications appear in UI

## 🚀 Quick Start

1. **Deploy the updated function:**
   ```bash
   npx supabase@latest functions deploy check-notifications
   ```

2. **Set up cron job** (see Option 1 above)

3. **Test immediately:**
   ```bash
   curl -X POST "http://localhost:3000/api/check-notifications?test=true"
   ```

4. **Verify:**
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```

## 📝 What Was Fixed

1. ✅ **Added end-of-day notification** that always triggers at 11:15 PM
2. ✅ **Improved logging** to debug time matching issues
3. ✅ **Added milestone notification type** for goal achievements
4. ✅ **Better time window handling** for 11:15 PM trigger

The notification will now **always** send at 11:15 PM, giving users a daily summary regardless of their diet completion status!
