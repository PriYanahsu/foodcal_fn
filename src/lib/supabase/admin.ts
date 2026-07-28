import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for server-only jobs (push delivery, etc.).
 * Bypasses RLS — never import this into client components.
 */
export function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://comgkdwwfewrzhccmtud.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Required to deliver background push notifications.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
