import { NextResponse } from 'next/server';
import { getRequestAccessToken } from '@/lib/springboot/request-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const internalSecret = process.env.PUSH_INTERNAL_SECRET || process.env.CRON_SECRET;
  const headerSecret =
    request.headers.get('x-push-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = await getRequestAccessToken();
  const allowed =
    Boolean(token) || (Boolean(internalSecret) && headerSecret === internalSecret);

  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: false, sent: 0, message: 'Push backend not configured' });
}
