import { NextResponse } from 'next/server';
import { getRequestAccessToken } from '@/lib/springboot/request-auth';

export const runtime = 'nodejs';

export async function POST() {
  const token = await getRequestAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ error: 'Notifications backend not configured' }, { status: 501 });
}
