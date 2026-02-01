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
    console.log('Push notification request received');
    try {
        const payloadJson = await request.json();
        const { userId, title, body, icon, badge, data } = payloadJson;

        console.log(`Processing push for user: ${userId}, title: ${title}`);

        if (!userId || !title || !body) {
            console.warn('Missing required fields for push notification');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!webpush) {
            console.error('Web-push library not initialized - check VAPID keys');
            return NextResponse.json({
                success: false,
                sent: 0,
                message: 'Web-push library not initialized. Check server environment variables (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).'
            }, { status: 500 });
        }

        const supabase = await createClient();

        // Get all push subscriptions for this user
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('subscription')
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
                message: 'No push subscriptions found'
            });
        }

        console.log(`Found ${subscriptions.length} subscription(s) for user ${userId}`);

        const pushIcon = icon || '/foodCalLogo.jpeg';
        const pushBadge = badge || '/foodCalLogo.jpeg';

        const payload = JSON.stringify({
            title,
            body,
            icon: pushIcon,
            badge: pushBadge,
            data: {
                ...(data || {}),
                url: data?.url || '/', // Default to root if not provided
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

                console.log(`Sending push to endpoint: ${subscription.endpoint.substring(0, 30)}...`);
                await webpush.sendNotification(subscription, payload);
                sentCount++;
            } catch (error: any) {
                failedCount++;
                console.error(`Failed to send push to subscription:`, error.message);

                // Remove invalid subscriptions (410 Gone)
                if (error.statusCode === 410 || error.statusCode === 404) {
                    console.log(`Subscription is invalid (status: ${error.statusCode}), removing from database`);
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', userId)
                        .eq('endpoint', row.subscription?.endpoint);
                }
            }
        }

        console.log(`Push complete: ${sentCount} sent, ${failedCount} failed`);

        return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            message: `Sent ${sentCount} push notification(s), failed ${failedCount}`
        });

    } catch (error: any) {
        console.error('Push notification API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send push notifications' },
            { status: 500 }
        );
    }
}
