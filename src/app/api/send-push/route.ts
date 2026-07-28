import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Initialize web-push
let webpush: any = null;
try {
  webpush = require('web-push');

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@foodcal.com';

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log('Push notification system initialized successfully');
  } else {
    console.warn('Push notification keys missing: VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY');
  }
} catch (e) {
  console.error('Failed to load web-push library:', e);
}

function getSiteOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (env) return env;
  try {
    return new URL(request.url).origin;
  } catch {
    return '';
  }
}

function toAbsoluteUrl(pathOrUrl: string | undefined, origin: string, fallbackPath: string): string {
  const value = pathOrUrl || fallbackPath;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (!origin) return value;
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`;
}

/**
 * Authorize:
 * 1) Logged-in user targeting themselves (test push from UI)
 * 2) Internal secret from edge function / cron (background delivery)
 */
async function authorizePushRequest(request: Request, userId: string): Promise<boolean> {
  const internalSecret = process.env.PUSH_INTERNAL_SECRET || process.env.CRON_SECRET;
  const headerSecret =
    request.headers.get('x-push-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (internalSecret && headerSecret && headerSecret === internalSecret) {
    return true;
  }

  // Allow unauthenticated internal calls when service role is configured
  // and no secret is set yet (backward compatible), but only if caller
  // looks like a server hop (no cookie session required).
  if (!internalSecret && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Still prefer user self-auth when available
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id && user.id === userId) return true;
  } catch {
    // ignore
  }

  // If service role exists and no secret configured, allow for edge→next hop
  // (edge already authenticates with service role to create the notification).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && !internalSecret) {
    return true;
  }

  return false;
}

/**
 * POST endpoint to send push notifications (works with site closed).
 */
export async function POST(request: Request) {
  console.log('Push notification request received');
  try {
    const payloadJson = await request.json();
    const { userId, title, body, icon, badge, data } = payloadJson;

    console.log(`Processing push for user: ${userId}, title: ${title}`);

    if (!userId || !title || !body) {
      console.warn('Missing required fields for push notification');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowed = await authorizePushRequest(request, userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!webpush) {
      console.error('Web-push library not initialized - check VAPID keys');
      return NextResponse.json(
        {
          success: false,
          sent: 0,
          message:
            'Web-push library not initialized. Check server environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).',
        },
        { status: 500 }
      );
    }

    // MUST use service role — edge/cron has no user cookies, so RLS would return 0 rows
    let admin;
    try {
      admin = createAdminClient();
    } catch (e: any) {
      console.error(e.message);
      // Fallback: try cookie client (works for logged-in test push only)
      admin = await createClient();
    }

    const { data: subscriptions, error } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, subscription')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching subscriptions from Supabase:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return NextResponse.json({
        success: true,
        sent: 0,
        message:
          'No push subscriptions found. User must enable notifications while logged in so a subscription is saved.',
      });
    }

    console.log(`Found ${subscriptions.length} subscription(s) for user ${userId}`);

    const origin = getSiteOrigin(request);
    const pushIcon = toAbsoluteUrl(icon, origin, '/foodCalLogo.jpeg');
    const pushBadge = toAbsoluteUrl(badge, origin, '/foodCalLogo.jpeg');

    const payload = JSON.stringify({
      title,
      body,
      icon: pushIcon,
      badge: pushBadge,
      data: {
        ...(data || {}),
        url: data?.url?.startsWith('http')
          ? data.url
          : `${origin}${data?.url || '/'}`,
        notificationId: data?.notificationId || null,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const row of subscriptions) {
      try {
        const subscription = row.subscription;
        if (!subscription || !subscription.endpoint) {
          console.warn('Malformed subscription object:', row);
          continue;
        }

        console.log(`Sending push to endpoint: ${subscription.endpoint.substring(0, 40)}...`);
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (error: any) {
        failedCount++;
        console.error(`Failed to send push to subscription:`, error.message);

        // Remove invalid subscriptions (410 Gone / 404)
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log(
            `Subscription is invalid (status: ${error.statusCode}), removing from database`
          );
          await admin
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', row.endpoint || row.subscription?.endpoint);
        }
      }
    }

    console.log(`Push complete: ${sentCount} sent, ${failedCount} failed`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      message: `Sent ${sentCount} push notification(s), failed ${failedCount}`,
    });
  } catch (error: any) {
    console.error('Push notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send push notifications' },
      { status: 500 }
    );
  }
}
