import { createClient, type SupabaseClient } from '@supabase/supabase-js';
// @ts-expect-error Deno npm import
import webpush from 'npm:web-push@3.6.7';

/** Service-role client — avoid ReturnType<typeof createClient> (wrong overload / generics). */
type EdgeSupabase = SupabaseClient<any, 'public', any>;

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  subscription: { endpoint?: string; [key: string]: unknown } | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-push-secret',
};

function initWebPush(): boolean {
  const vapidPublicKey =
    Deno.env.get('VAPID_PUBLIC_KEY') || Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidEmail = Deno.env.get('VAPID_EMAIL') || 'mailto:noreply@foodcal.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not set on edge function — will fall back to API_BASE_URL /api/send-push');
    return false;
  }

  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
  return true;
}

/**
 * Deliver browser push even when the 
 * Prefer direct web-push from edge (service role can read subscriptions).
 * Fall back to Next.js /api/send-push if VAPID isn't configured here.
 */
async function deliverPushNotification(
  supabase: EdgeSupabase,
  opts: {
    userId: string;
    title: string;
    body: string;
    type: string;
    suggestion: string | null;
    apiBaseUrl: string | null;
    siteOrigin: string;
    canSendDirect: boolean;
    notificationId?: string | null;
  }
): Promise<{ sent: number; via: string }> {
  const {
    userId,
    title,
    body,
    type,
    suggestion,
    apiBaseUrl,
    siteOrigin,
    canSendDirect,
    notificationId,
  } = opts;
  const icon = `${siteOrigin}/foodCalLogo.jpeg`;
  const badge = icon;
  const payload = JSON.stringify({
    title,
    body,
    icon,
    badge,
    data: {
      type,
      suggestion,
      url: `${siteOrigin}/`,
      notificationId: notificationId || null,
    },
  });

  if (canSendDirect) {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, subscription')
      .eq('user_id', userId);

    const subscriptions = data as PushSubscriptionRow[] | null;

    if (error) {
      console.error(`Push subscription fetch failed for ${userId}:`, error);
    } else if (!subscriptions?.length) {
      console.log(`No push subscriptions for user ${userId} (user must enable push in the app)`);
      return { sent: 0, via: 'direct-none' };
    } else {
      let sent = 0;
      for (const row of subscriptions) {
        const sub = row.subscription;
        if (!sub?.endpoint) continue;
        try {
          await webpush.sendNotification(sub, payload);
          sent++;
        } catch (err: any) {
          console.error(`Direct push failed for ${userId}:`, err?.message || err);
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', userId)
              .eq('endpoint', row.endpoint || sub.endpoint);
          }
        }
      }
      // Only skip API fallback when at least one device got the push
      if (sent > 0) {
        return { sent, via: 'direct' };
      }
      console.warn(
        `Direct push sent=0 for ${userId} — falling back to /api/send-push`
      );
    }
  }

  // Fallback: Next.js route (same path as "Send Test Push", needs matching PUSH_INTERNAL_SECRET)
  if (!apiBaseUrl) {
    console.error('Cannot deliver push: no VAPID on edge and API_BASE_URL missing');
    return { sent: 0, via: 'none' };
  }

  const pushSecret = Deno.env.get('PUSH_INTERNAL_SECRET') || Deno.env.get('CRON_SECRET') || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (pushSecret) {
    headers['x-push-secret'] = pushSecret;
  } else {
    console.warn('PUSH_INTERNAL_SECRET / CRON_SECRET not set on edge — /api/send-push may 401');
  }

  console.log(`Calling fallback ${apiBaseUrl}/api/send-push for ${userId}`);
  const pushResponse = await fetch(`${apiBaseUrl}/api/send-push`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId,
      title,
      body,
      icon,
      badge,
      data: { type, suggestion, url: '/', notificationId: notificationId || null },
    }),
  });

  const result = await pushResponse.json().catch(() => ({}));
  if (!pushResponse.ok) {
    console.error(
      `Fallback /api/send-push failed for ${userId}: status=${pushResponse.status}`,
      result
    );
    return { sent: 0, via: 'api' };
  }
  return { sent: result.sent || 0, via: 'api' };
}

// Helper function to get AI coaching advice
async function getCoachingAdvice(
  apiBaseUrl: string,
  stats: { calories: number; protein: number; carbs: number; fats: number },
  goals: { objective: string; target_weight: number | null; target_date: string | null },
  profileData: {
    gender: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    activity_level: string | null;
  }
): Promise<string | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/fitness-consultant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stats: {
          gender: profileData.gender || 'Unknown',
          age: profileData.age || 30,
          height: profileData.height || 170,
          weight: profileData.weight || 70,
          activity_level: profileData.activity_level || 'Moderately Active',
        },
        goals: {
          objective: goals.objective || 'Maintain Weight',
          target_weight: goals.target_weight,
          target_date: goals.target_date,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.advice || null;
  } catch (error) {
    return null;
  }
}

// Helper function to check if user is behind on diet
function checkDietCompletion(
  currentCalories: number,
  targetCalories: number,
  hour: number
): { isBehind: boolean; progressPercent: number; timeOfDay: string; mealType: string } {
  if (!targetCalories || targetCalories === 0) {
    return { isBehind: false, progressPercent: 0, timeOfDay: 'unknown', mealType: 'unknown' };
  }

  const progressPercent = (currentCalories / targetCalories) * 100;

  // Expected progress thresholds based on time of day
  let expectedProgress = 0;
  let timeOfDay = 'morning';
  let mealType = 'breakfast';

  if (hour >= 6 && hour < 12) {
    // Morning: Should have ~25% of daily calories (breakfast)
    expectedProgress = 25;
    timeOfDay = 'morning';
    mealType = 'breakfast';
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: Should have ~60% of daily calories (breakfast + lunch)
    expectedProgress = 60;
    timeOfDay = 'afternoon';
    mealType = 'lunch';
  } else if (hour >= 18 && hour < 22) {
    // Evening: Should have ~85% of daily calories (breakfast + lunch + dinner)
    expectedProgress = 85;
    timeOfDay = 'evening';
    mealType = 'dinner';
  } else {
    // Night/End of Day: Should have ~100% of daily calories
    expectedProgress = 95;
    timeOfDay = 'night';
    mealType = 'snack';
  }

  const isBehind = progressPercent < expectedProgress - 10; // 10% tolerance

  return { isBehind, progressPercent, timeOfDay, mealType };
}

// Only 3 scheduled slots + optional night nudge if not tracking
function generateNotification(
  progressPercent: number,
  hasLoggedToday: boolean,
  hour: number
): {
  title: string;
  message: string;
  type: 'goal_reminder' | 'coach_advice' | 'system' | 'milestone' | 'motivation';
} {
  // 1. Morning (~8 AM)
  if (hour === 8) {
    if (!hasLoggedToday) {
      return {
        title: 'Good Morning! 🌅',
        message:
          'Start your day by logging breakfast. A quick log keeps you on track.',
        type: 'motivation',
      };
    }
    return {
      title: 'Morning Fuel-Up! ⚡',
      message: `Nice start — you're at ${Math.round(progressPercent)}%. Keep logging as you go.`,
      type: 'motivation',
    };
  }

  // 2. Noon (12 PM)
  if (hour === 12) {
    if (!hasLoggedToday) {
      return {
        title: 'Lunch Time! 🍽️',
        message: "Haven't logged yet today — snap or log lunch to stay on track.",
        type: 'goal_reminder',
      };
    }
    return {
      title: 'Midday Check-In 💪',
      message: `You're at ${Math.round(progressPercent)}% of your goal. Log lunch if you haven't already.`,
      type: 'goal_reminder',
    };
  }

  // 3. Afternoon (4 PM)
  if (hour === 16) {
    if (!hasLoggedToday) {
      return {
        title: 'Afternoon Reminder ☀️',
        message: "Still nothing logged today. A quick meal log now keeps your day accurate.",
        type: 'goal_reminder',
      };
    }
    return {
      title: 'Afternoon Check-In ☀️',
      message: `You're at ${Math.round(progressPercent)}%. Log any afternoon meals or snacks.`,
      type: 'goal_reminder',
    };
  }

  // Night — only when not tracking (no logs today)
  if (hour === 21 && !hasLoggedToday) {
    return {
      title: "Don't Miss Today 🌙",
      message:
        "You haven't logged any meals today. Still time to add something before the day ends.",
      type: 'goal_reminder',
    };
  }

  // Fallback (should rarely hit — schedule gates sends)
  return {
    title: 'Keep Going! 💪',
    message: `You're at ${Math.round(progressPercent)}% of your goal. Log your next meal when you can.`,
    type: 'motivation',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const isTestMode = url.searchParams.get('test') === 'true';

    let apiBaseUrl = Deno.env.get('API_BASE_URL') || Deno.env.get('NEXT_PUBLIC_SITE_URL') || null;
    if (!apiBaseUrl) {
      const supabaseUrlEnv = Deno.env.get('SUPABASE_URL') || '';
      if (supabaseUrlEnv.includes('localhost') || supabaseUrlEnv.includes('127.0.0.1')) {
        apiBaseUrl = 'http://localhost:3000';
      }
    }
    if (apiBaseUrl) {
      apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
      console.log(`Using API Base URL: ${apiBaseUrl}`);
    }

    const canSendDirect = initWebPush();
    const siteOrigin = apiBaseUrl || 'https://food-cal-fe-ewy4.vercel.app';
    console.log(
      `Push delivery: direct=${canSendDirect}, fallbackApi=${!!apiBaseUrl}, origin=${siteOrigin}`
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Missing environment variables');
    }

    const supabase: EdgeSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch profiles with all necessary fields
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(
        'id, goal, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fats_target, timezone, gender, age, height, weight, activity_level, target_weight, target_date'
      );

    if (profilesError) throw profilesError;

    console.log(`Found ${profiles?.length || 0} profiles to process`);

    const results = {
      processed: 0,
      notificationsSent: 0,
      errors: 0,
    };

    for (const profile of profiles || []) {
      try {
        results.processed++;

        const timeZone = profile.timezone || 'UTC';
        const now = new Date();

        // Resolve Local Time
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          minute: 'numeric',
          hourCycle: 'h23',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        });

        const parts = formatter.formatToParts(now);
        const getPart = (t: string) => parts.find((p) => p.type === t)?.value;

        const hour = parseInt(getPart('hour') || '0', 10);
        const minutes = parseInt(getPart('minute') || '0', 10);
        const userTodayDateString = `${getPart('year')}-${getPart('month')?.padStart(2, '0')}-${getPart('day')?.padStart(2, '0')}`;

        console.log(
          `User ${profile.id}: Timezone=${timeZone}, LocalTime=${hour}:${minutes}, Target=${profile.daily_calorie_target}`
        );

        // Skip if no calorie target set
        if (!profile.daily_calorie_target || profile.daily_calorie_target === 0) {
          console.log(`Skipping user ${profile.id}: No calorie target set`);
          continue;
        }

        // Validate time parsing
        if (isNaN(hour) || isNaN(minutes)) {
          console.error(`Skipping user ${profile.id}: Failed to parse time`);
          results.errors++;
          continue;
        }

        // Calculate start and end of day in UTC for querying food_logs
        const startOfDay = new Date(now);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Get today's food logs
        const { data: foodLogs, error: logsError } = await supabase
          .from('food_logs')
          .select('calories, protein, carbs, fats, created_at')
          .eq('user_id', profile.id)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        if (logsError) {
          results.errors++;
          continue;
        }

        // Calculate current intake
        const currentStats = {
          calories: foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0,
          protein: foodLogs?.reduce((sum, log) => sum + (log.protein || 0), 0) || 0,
          carbs: foodLogs?.reduce((sum, log) => sum + (log.carbs || 0), 0) || 0,
          fats: foodLogs?.reduce((sum, log) => sum + (log.fats || 0), 0) || 0,
        };

        const hasLoggedToday = (foodLogs?.length || 0) > 0;

        // Check diet completion (progress % for message copy)
        const { isBehind, progressPercent } = checkDietCompletion(
          currentStats.calories,
          profile.daily_calorie_target,
          hour
        );

        // Exactly 3 daily slots + night only if not tracking
        // 30 min windows so cron (~every 15–30m) still hits them
        const isMorning = hour === 8 && minutes < 30;
        const isNoon = hour === 12 && minutes < 30;
        const isAfternoon4pm = hour === 16 && minutes < 30;
        // Night nudge: only when user hasn't logged anything today
        const isNightNoTrack = hour === 21 && minutes < 30 && !hasLoggedToday;

        const shouldSendNotification =
          isTestMode || isMorning || isNoon || isAfternoon4pm || isNightNoTrack;

        console.log(
          `User ${profile.id}: shouldSend=${shouldSendNotification} (morning=${isMorning}, noon=${isNoon}, 4pm=${isAfternoon4pm}, nightNoTrack=${isNightNoTrack}, hasLogged=${hasLoggedToday})`
        );

        if (!shouldSendNotification) continue;

        // In test mode, force a morning-style message via hour override
        const messageHour = isTestMode
          ? 8
          : isMorning
            ? 8
            : isNoon
              ? 12
              : isAfternoon4pm
                ? 16
                : 21;

        const notification = generateNotification(
          progressPercent,
          hasLoggedToday,
          messageHour
        );

        // Optional AI tip only on scheduled sends when behind (not a separate notif)
        let suggestion: string | null = null;
        if (isBehind && apiBaseUrl && (isNoon || isAfternoon4pm)) {
          try {
            console.log(`User ${profile.id}: Fetching coaching advice...`);
            suggestion = await getCoachingAdvice(
              apiBaseUrl,
              currentStats,
              {
                objective: profile.goal || 'Maintain Weight',
                target_weight: profile.target_weight,
                target_date: profile.target_date,
              },
              {
                gender: profile.gender,
                age: profile.age,
                height: profile.height,
                weight: profile.weight,
                activity_level: profile.activity_level,
              }
            );
            console.log(
              `User ${profile.id}: Coaching advice received: ${suggestion ? 'Yes' : 'No'}`
            );
          } catch (error) {
            console.error(`User ${profile.id}: Coaching advice error:`, error);
          }
        }

        // Duplicate guard (skip in test mode)
        if (!isTestMode) {
          const { data: recentNotifs } = await supabase
            .from('notifications')
            .select('title, created_at, type')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(10);

          // Same title/type within 2 hours → skip
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          const alreadySent = recentNotifs?.some((n) => {
            const notifDate = new Date(n.created_at);
            return (
              notifDate > twoHoursAgo &&
              n.title === notification.title &&
              n.type === notification.type
            );
          });

          if (alreadySent) {
            console.log(`User ${profile.id}: Skipping duplicate notification within 2 hours`);
            continue;
          }
        }

        console.log(`User ${profile.id}: Inserting notification record...`);
        const { data: insertedRows, error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            suggestion: suggestion || undefined,
          })
          .select('id')
          .maybeSingle();

        if (insertError) {
          console.error(`CRITICAL: Database insert failed for user ${profile.id}:`, insertError);
          results.errors++;
        } else {
          console.log(`User ${profile.id}: Notification record created successfully`);
          results.notificationsSent++;

          // Browser push — works when website is closed (SW receives it)
          try {
            const pushResult = await deliverPushNotification(supabase, {
              userId: profile.id,
              title: notification.title,
              body: notification.message,
              type: notification.type,
              suggestion,
              apiBaseUrl,
              siteOrigin,
              canSendDirect,
              notificationId: insertedRows?.id ?? null,
            });
            console.log(
              `Push for ${profile.id}: sent=${pushResult.sent} via=${pushResult.via}`
            );
          } catch (error) {
            console.error(`Error delivering push for user ${profile.id}:`, error);
          }
        }
      } catch (e) {
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: `Processed ${results.processed} users, sent ${results.notificationsSent} notifications`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
