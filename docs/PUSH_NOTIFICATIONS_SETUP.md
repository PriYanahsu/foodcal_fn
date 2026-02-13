# Push Notifications Setup Guide

This guide explains how to set up web push notifications for the FoodCal application.

## Overview

The push notification system allows users to receive notifications on their mobile devices and desktop browsers even when the website is not open. This is achieved through:

1. **Service Worker** - Handles push events and displays notifications
2. **Push Subscriptions** - Stored in the database for each user
3. **VAPID Keys** - Used to authenticate push notification requests
4. **Edge Function** - Sends push notifications when creating notifications

## Prerequisites

1. Generate VAPID keys
2. Set up database table for push subscriptions
3. Configure environment variables

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications. You can generate them using Node.js:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

This will output:

- Public Key (starts with `B...`)
- Private Key (starts with `...`)

## Step 2: Database Setup

Create a table to store push subscriptions:

```sql
-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
    ON push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id);
```

## Step 3: Environment Variables

Add the following environment variables:

### Next.js (.env.local)

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### Supabase Edge Function

Add these to your Supabase project settings:

- `VAPID_PUBLIC_KEY` - Your VAPID public key
- `VAPID_PRIVATE_KEY` - Your VAPID private key
- `API_BASE_URL` - Your Next.js application URL (for sending push notifications)

## Step 4: Install Dependencies (Optional)

If you want to send push notifications from the Next.js API (recommended for production), install the web-push library:

```bash
npm install web-push
npm install --save-dev @types/web-push
```

## Step 5: Update Push Notification Sender

Update `src/app/api/send-push/route.ts` to use the web-push library:

```typescript
import webpush from 'web-push';

// Set VAPID details
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Contact email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Then in the POST handler, send notifications:
for (const sub of subscriptions) {
  try {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({
        title,
        body,
        icon: icon || '/icons/icon-192x192.png',
        badge: badge || '/icons/icon-192x192.png',
      })
    );
  } catch (error) {
    // Handle errors (e.g., invalid subscription)
    console.error('Push notification failed:', error);
  }
}
```

## Step 6: Update Edge Function

The edge function should call the push notification API when creating notifications. Update `supabase/functions/check-notifications/index.ts` to send push notifications after inserting notifications.

## How It Works

1. **User Subscribes**: When a user grants notification permission, the app:
   - Creates a push subscription using the browser's Push API
   - Saves the subscription to the database via `/api/push-subscribe`

2. **Notification Created**: When the edge function creates a notification:
   - It inserts the notification into the database
   - Supabase realtime triggers update the UI (if user is on site)
   - The edge function calls `/api/send-push` to send push notifications

3. **Push Received**: When a push notification arrives:
   - The service worker receives the push event
   - It displays the notification to the user
   - Clicking the notification opens the app

## Testing

1. **Enable Notifications**: Click the "Enable Push" button in the notification panel
2. **Grant Permission**: Allow notifications when prompted
3. **Verify Subscription**: Check the database to see if subscription was saved
4. **Test Notification**: Create a test notification and verify it appears on your device

## Troubleshooting

### Notifications not appearing

- Check browser console for errors
- Verify VAPID keys are set correctly
- Ensure service worker is registered
- Check notification permissions in browser settings

### Subscription not saving

- Verify database table exists
- Check RLS policies allow user access
- Verify API endpoint is accessible

### Push notifications not sending

- Verify VAPID keys are correct
- Check API endpoint is working
- Ensure subscriptions are valid (they expire if not used)

## Security Notes

- Never expose the VAPID private key in client-side code
- Use HTTPS for production (required for push notifications)
- Validate user permissions before sending notifications
- Clean up expired/invalid subscriptions regularly

## Browser Support

Web push notifications are supported in:

- Chrome/Edge (Android & Desktop)
- Firefox (Android & Desktop)
- Safari (iOS 16.4+ & macOS)
- Opera (Desktop & Android)

Note: iOS Safari requires iOS 16.4+ and user must add the site to home screen.
