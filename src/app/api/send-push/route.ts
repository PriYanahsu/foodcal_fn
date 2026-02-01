import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

/**
 * POST endpoint to send push notifications
 */
export async function POST(request: Request) {
    try {
        const { userId, title, body, icon, badge, data } = await request.json();

        if (!userId || !title || !body) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!webpush) {
            return NextResponse.json({
                success: false,
                sent: 0,
                message: 'Web-push library not installed'
            });
        }

        const supabase = await createClient();

        // Get all push subscriptions for this user
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                message: 'No push subscriptions found'
            });
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icons/icon-192x192.png',
            badge: badge || '/icons/icon-192x192.png',
            data: {
                ...(data || {}),
                url: '/', // Always open to dashboard
                notificationId: data?.notificationId || null,
            },
        });

        let sentCount = 0;
        let failedCount = 0;

        for (const row of subscriptions) {
            try {
                const subscription = row.subscription;
                if (!subscription || !subscription.endpoint) continue;

                await webpush.sendNotification(subscription, payload);
                sentCount++;
            } catch (error: any) {
                failedCount++;
                // Remove invalid subscriptions (410 Gone)
                if (error.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', userId)
                        .eq('endpoint', row.subscription?.endpoint);
                }
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            message: `Sent ${sentCount} push notification(s)`
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to send push notifications' },
            { status: 500 }
        );
    }
}
