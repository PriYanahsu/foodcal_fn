import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    'https://comgkdwwfewrzhccmtud.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvbWdrZHd3ZmV3cnpoY2NtdHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTQwMzAsImV4cCI6MjA4NDE3MDAzMH0.mMESXf-OX2V-Xx3Sp7dhkw4ZYk_GelZdi6A8BlCaNuk',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
