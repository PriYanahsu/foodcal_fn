import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * API endpoint to manually trigger the notification check edge function
 * This is useful for testing and can be called by cron jobs or webhooks
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Check if user is authenticated (optional - you might want to make this admin-only)
        // For now, we'll allow any authenticated user to trigger it
        // In production, you might want to add admin role check
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get Supabase URL and anon key from environment
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: 'Supabase configuration missing' },
                { status: 500 }
            );
        }

        // Get test mode from query params
        const url = new URL(request.url);
        const isTestMode = url.searchParams.get('test') === 'true';

        // Construct the edge function URL
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/check-notifications${isTestMode ? '?test=true' : ''}`;

        // Call the edge function
        const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge function error:', errorText);
            return NextResponse.json(
                { error: 'Failed to trigger notification check', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            message: 'Notification check triggered successfully',
            data,
        });

    } catch (error: any) {
        console.error('Error triggering notification check:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to trigger notification check' },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint for health check and status
 */
export async function GET() {
    return NextResponse.json({
        message: 'Notification check endpoint is active',
        usage: 'POST to this endpoint to trigger notification checks',
        testMode: 'Add ?test=true query parameter to enable test mode',
    });
}
