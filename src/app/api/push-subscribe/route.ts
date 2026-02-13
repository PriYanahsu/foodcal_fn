import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * POST endpoint to save push subscription for authenticated users
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Store subscription in database
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Update existing subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          subscription: subscription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new subscription
      const { error } = await supabase.from('push_subscriptions').insert({
        user_id: session.user.id,
        endpoint: subscription.endpoint,
        subscription: subscription,
      });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}
