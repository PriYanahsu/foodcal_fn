import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const USER_DATA_TABLES = [
  'food_logs',
  'weight_logs',
  'step_logs',
  'notifications',
  'push_subscriptions',
  'user_preferences',
] as const;

async function deleteUserStorageFiles(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  userId: string
) {
  const { data: files, error } = await admin.storage.from(bucket).list('', {
    limit: 1000,
    search: userId,
  });

  if (error || !files?.length) return;

  const paths = files
    .filter((f) => f.name?.startsWith(userId))
    .map((f) => f.name);

  if (paths.length) {
    await admin.storage.from(bucket).remove(paths);
  }
}

/**
 * DELETE — permanently remove the authenticated user and all related data.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const admin = createAdminClient();

    // Collect meal image paths before wiping food_logs
    const { data: mealLogs } = await admin
      .from('food_logs')
      .select('image_path')
      .eq('user_id', userId)
      .not('image_path', 'is', null);

    const mealPaths = (mealLogs || [])
      .map((row) => row.image_path as string | null)
      .filter((p): p is string => Boolean(p));

    const { data: profile } = await admin
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle();

    // Wipe app data first (FKs block auth.users delete without CASCADE)
    for (const table of USER_DATA_TABLES) {
      const { error } = await admin.from(table).delete().eq('user_id', userId);
      if (error && !error.message?.includes('does not exist')) {
        console.error(`Failed deleting ${table}:`, error.message);
      }
    }

    if (mealPaths.length) {
      await admin.storage.from('meal_images').remove(mealPaths);
    }
    if (profile?.avatar_url) {
      await admin.storage.from('avatars').remove([profile.avatar_url]);
    }

    // Fallback: anything else prefixed with user id
    await deleteUserStorageFiles(admin, 'avatars', userId);
    await deleteUserStorageFiles(admin, 'meal_images', userId);

    const { error: profileError } = await admin.from('profiles').delete().eq('id', userId);
    if (profileError) {
      console.error('Failed deleting profile:', profileError.message);
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      return NextResponse.json(
        { error: deleteUserError.message || 'Failed to delete auth user' },
        { status: 500 }
      );
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete account';
    console.error('delete-account error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
