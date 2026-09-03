import { NextResponse } from 'next/server';
import { getRequestAccessToken } from '@/lib/springboot/request-auth';

export const runtime = 'nodejs';

export async function DELETE() {
  const token = await getRequestAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ error: 'Account deletion is not available yet' }, { status: 501 });
}
