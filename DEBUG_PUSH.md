# Debugging Background Push Notifications

Since notifications are working _inside_ the website but not when it's closed, the issue is specifically with the **Web Push** delivery path.

## High-Level Flow

1. **Edge Function** fires → Inserts into DB (Works ✅)
2. **Edge Function** calls `https://your-app.com/api/send-push` (Check Logs 🔍)
3. **Next.js API** (`api/send-push`) uses `web-push` to notify Google/Apple (Check Logs 🔍)
4. **Google/Apple** sends packet to your device.
5. **Service Worker** (`sw.js`) receives `push` event and shows notification (Check `chrome://inspect`).

---

## 1. Check Supabase Edge Function logs

Go to **Supabase Dashboard** → **Edge Functions** → `check-notifications` → **Logs**.

- Do you see `Attempting to send push notification to user ...`?
- Do you see `Push notification successfully sent`?
- **If you see errors here**: Check your `API_BASE_URL` secret.

## 2. Check Next.js API logs (Vercel)

If you are deployed on Vercel, check the logs for your project.

- Look for `Processing push for user: ...`
- If you see `Web-push library not initialized`, you are missing `VAPID_PRIVATE_KEY` or `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

## 3. Check Service Worker on Chrome (Android/Desktop)

1. Connect your device or open the site on Desktop Chrome.
2. Go to `chrome://inspect/#service-workers`.
3. Find your site and click **inspect**.
4. This opens a dedicated console for the Service Worker.
5. In the "Main" tab of Chrome DevTools (not the SW one), use the **Push Test Tool** I added.
6. Look at the **Service Worker Console** to see if `[Service Worker] Push Received.` appears.

---

## 4. Common Fixes

### Missing Secrets

Make sure these are set in **Supabase** (for the edge function):

```bash
npx supabase secrets set API_BASE_URL=https://your-foodcal-app.vercel.app
```

Make sure these are set in **Vercel** (for the push API):

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

### iOS PWA

If testing on iPhone:

1. **Notifications ONLY work if you add the app to Home Screen.**
2. Open the app from the Home Screen icon.
3. Enable notifications again inside the PWA.

### Re-Subscribe

If you changed VAPID keys recently, you **MUST** unsubscribe and re-subscribe, because the old subscription token is tied to the old keys.

1. Open the app.
2. If the tool says "Subscribed: Yes", you might need to manually clear site data and re-enable to get a fresh subscription.
