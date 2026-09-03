import { NextResponse } from 'next/server';
import { getRequestAccessToken } from '@/lib/springboot/request-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const token = await getRequestAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await request.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
