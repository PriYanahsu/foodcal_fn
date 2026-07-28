import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');
  const next = nextParam?.startsWith('/') ? nextParam : '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      'https://comgkdwwfewrzhccmtud.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbWdrZHd3ZmV3cnpoY2NtdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTQwMzAsImV4cCI6MjA4NDE3MDAzMH0.mMESXf-OX2V-Xx3Sp7dhkw4ZYk_GelZdi6A8BlCaNuk',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('OAuth callback error:', error.message);
  }

  return NextResponse.redirect(`${origin}/login`);
}
