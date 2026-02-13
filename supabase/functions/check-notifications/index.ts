import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Generate positive, motivating notification messages
function generateNotification(
  timeOfDay: string,
  mealType: string,
  progressPercent: number,
  caloriesNeeded: number,
  hasLoggedToday: boolean,
  isGoalAchieved: boolean,
  hour: number,
  minutes: number
): {
  title: string;
  message: string;
  type: 'goal_reminder' | 'coach_advice' | 'system' | 'milestone' | 'motivation';
} {
  // Test condition window
  if (hour === 0 && minutes >= 23 && minutes <= 25) {
    return {
      title: 'Global Test Active 🌍',
      message:
        'Your push notification system is now configured for global timezones and background delivery!',
      type: 'system',
    };
  }

  // Morning notifications (7-9 AM)
  if (hour >= 7 && hour < 9) {
    if (!hasLoggedToday) {
      return {
        title: 'Good Morning, Champion! 🌅',
        message:
          'Rise and shine! Your journey to greatness starts with a healthy breakfast. Ready to fuel your day?',
        type: 'motivation',
      };
    }
    if (progressPercent < 20) {
      return {
        title: 'Morning Fuel-Up! ⚡',
        message: `You're off to a great start! Let's keep the momentum going. You've got ${Math.round(100 - progressPercent)}% of your day ahead - make it count!`,
        type: 'motivation',
      };
    }
    return {
      title: "You're Crushing It! 🔥",
      message: `Amazing start to your day! You're already at ${Math.round(progressPercent)}% of your goal. Keep this energy going!`,
      type: 'milestone',
    };
  }

  // Lunch notifications (12-2 PM)
  if (hour >= 12 && hour < 14) {
    if (!hasLoggedToday) {
      return {
        title: 'Lunch Time, Hero! 🍽️',
        message:
          "Your body is asking for fuel! Time to log that delicious lunch and keep your progress on track. You've got this!",
        type: 'motivation',
      };
    }
    if (progressPercent < 50) {
      return {
        title: 'Midday Momentum! 💪',
        message: `You're at ${Math.round(progressPercent)}% - that's solid progress! A balanced lunch will power you through the afternoon. Let's do this!`,
        type: 'coach_advice',
      };
    }
    return {
      title: "You're On Fire! 🔥",
      message: `Wow! ${Math.round(progressPercent)}% already? You're absolutely killing it today. Keep up this incredible pace!`,
      type: 'milestone',
    };
  }

  // Afternoon check-in (3-4 PM)
  if (hour >= 15 && hour < 16) {
    if (!hasLoggedToday) {
      return {
        title: 'Afternoon Check-In! ☀️',
        message:
          "Hey there! Don't forget to log your meals today. Every entry brings you closer to your goals. You're doing amazing!",
        type: 'goal_reminder',
      };
    }
    if (progressPercent < 60) {
      return {
        title: 'Keep Going Strong! 💪',
        message: `You're at ${Math.round(progressPercent)}% - you've got this! A healthy snack or meal will keep your energy levels perfect.`,
        type: 'coach_advice',
      };
    }
    return {
      title: 'Incredible Progress! 🌟',
      message: `Look at you go! ${Math.round(progressPercent)}% already? You're making this look easy. Keep it up!`,
      type: 'milestone',
    };
  }

  // Dinner notifications (6-8 PM)
  if (hour >= 18 && hour < 20) {
    if (!hasLoggedToday) {
      return {
        title: 'Evening Excellence! 🌙',
        message:
          "Time for dinner! Log your meal and celebrate another day of progress. You're building something amazing!",
        type: 'motivation',
      };
    }
    if (progressPercent < 80) {
      return {
        title: 'Almost There! 🎯',
        message: `You're at ${Math.round(progressPercent)}% - so close! A nutritious dinner will help you finish strong. You've got this!`,
        type: 'coach_advice',
      };
    }
    return {
      title: 'Outstanding Work! ⭐',
      message: `${Math.round(progressPercent)}%? You're absolutely incredible! Finish strong with a great dinner.`,
      type: 'milestone',
    };
  }

  // End of day (9-11 PM)
  if (hour >= 21 && hour < 23) {
    if (isGoalAchieved) {
      return {
        title: 'Goal Achieved! 🎉',
        message: `Congratulations, superstar! You've crushed your daily goal with ${Math.round(progressPercent)}%! This is what dedication looks like. Rest well, champion!`,
        type: 'milestone',
      };
    }
    if (progressPercent >= 90) {
      return {
        title: 'So Close! 🌟',
        message: `You're at ${Math.round(progressPercent)}% - absolutely incredible! You're so close to perfection. Every step counts!`,
        type: 'milestone',
      };
    }
    if (progressPercent >= 70) {
      return {
        title: 'Great Day! 💫',
        message: `You've reached ${Math.round(progressPercent)}% today - that's fantastic progress! Consistency is key, and you're showing it.`,
        type: 'milestone',
      };
    }
    if (!hasLoggedToday) {
      return {
        title: "Don't Miss Out! 🌙",
        message:
          "It's not too late! Log your meals and end your day on a high note. Every entry matters in your journey!",
        type: 'goal_reminder',
      };
    }
    return {
      title: 'End of Day Reflection 📊',
      message: `You're at ${Math.round(progressPercent)}% today. Progress, not perfection! Tomorrow is another opportunity to shine.`,
      type: 'goal_reminder',
    };
  }

  // Late night (11 PM - 1 AM)
  if (hour >= 23 || hour < 1) {
    if (isGoalAchieved) {
      return {
        title: 'Perfect Day Complete! ✨',
        message: `You did it! ${Math.round(progressPercent)}% achieved. Rest well knowing you gave it your all today.`,
        type: 'milestone',
      };
    }
    return {
      title: 'Rest Well, Warrior! 🌙',
      message:
        'Another day of progress in the books. Rest up and recharge - tomorrow is full of new possibilities!',
      type: 'motivation',
    };
  }

  // Default fallback
  return {
    title: 'Keep Going! 💪',
    message: `You're at ${Math.round(progressPercent)}% of your goal. Every moment is a chance to make progress. You've got this!`,
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

    let apiBaseUrl = Deno.env.get('API_BASE_URL');
    if (!apiBaseUrl) {
      // Fallback: try to derive from SUPABASE_URL if it looks like a local or custom setup
      // but ideally this should be set as a secret
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
        apiBaseUrl = 'http://localhost:3000';
      } else {
        console.warn(
          'API_BASE_URL not set. Push notifications will likely fail if derived incorrectly.'
        );
      }
    }

    if (apiBaseUrl) {
      console.log(`Using API Base URL: ${apiBaseUrl}`);
    } else {
      console.error(
        'CRITICAL: API_BASE_URL not set and could not be resolved. Web Push will NOT work.'
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        const isGoalAchieved = currentStats.calories >= profile.daily_calorie_target;

        // Check diet completion
        const { isBehind, progressPercent, timeOfDay, mealType } = checkDietCompletion(
          currentStats.calories,
          profile.daily_calorie_target,
          hour
        );

        const caloriesNeeded = Math.max(0, profile.daily_calorie_target - currentStats.calories);

        // Schedule notifications at optimal meal times
        // Test time: Global trigger for verification
        const isTestTime = hour === 0 && minutes >= 23 && minutes < 25;

        // Breakfast: 7-9 AM (30 min window for cron)
        const isBreakfastTime = hour === 8 && minutes < 30;
        // Lunch: 12-2 PM (30 min window for cron)
        const isLunchTime = hour === 13 && minutes < 30;
        // Afternoon check-in: 3-4 PM (30 min window for cron)
        const isAfternoonCheck = hour === 15 && minutes >= 30;
        // Dinner: 6-8 PM (30 min window for cron)
        const isDinnerTime = hour === 19 && minutes < 30;
        // Evening wrap-up: 9-11 PM (30 min window for cron)
        const isEveningWrap = hour === 22 && minutes < 30;
        // Late night: 11 PM - 1 AM (30 min window for cron)
        const isLateNight = hour === 23 && minutes >= 30;

        // Determine if we should send a notification
        // IF isTestMode is true (from URL), we ALWAYS send.
        const shouldSendNotification =
          isTestMode ||
          isTestTime ||
          isBreakfastTime ||
          isLunchTime ||
          isAfternoonCheck ||
          isDinnerTime ||
          isEveningWrap ||
          isLateNight ||
          (isBehind && hour >= 12 && hour < 22); // Send reminder if behind during active hours

        console.log(
          `User ${profile.id}: shouldSendNotification=${shouldSendNotification} (isTestTime=${isTestTime}, isBehind=${isBehind})`
        );

        if (!shouldSendNotification) continue;

        // Generate notification based on context
        const notification = generateNotification(
          timeOfDay,
          mealType,
          progressPercent,
          caloriesNeeded,
          hasLoggedToday,
          isGoalAchieved,
          hour,
          minutes
        );

        // Get AI coaching advice if user is behind on diet
        let suggestion: string | null = null;
        if (isBehind && apiBaseUrl && hour >= 12 && hour < 22) {
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

        // ... DUPLICATE CHECK LOGIC ...
        // Check for duplicates (unless it's test mode or test time)
        if (!isTestMode && !isTestTime) {
          const { data: recentNotifs } = await supabase
            .from('notifications')
            .select('title, created_at, type')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(10);

          // Check if same notification was sent in the last 2 hours (to prevent spam)
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          const alreadySent = recentNotifs?.some((n) => {
            const notifDate = new Date(n.created_at);
            // Same title and type, and sent within last 2 hours
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
        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: profile.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          suggestion: suggestion || undefined,
        });

        if (insertError) {
          console.error(`CRITICAL: Database insert failed for user ${profile.id}:`, insertError);
          results.errors++;
        } else {
          console.log(`User ${profile.id}: Notification record created successfully`);
          results.notificationsSent++;

          // Send push notification if API base URL is available
          if (apiBaseUrl) {
            try {
              const pushPayload = {
                userId: profile.id,
                title: notification.title,
                body: notification.message,
                icon: '/foodCalLogo.jpeg',
                badge: '/foodCalLogo.jpeg',
                data: {
                  type: notification.type,
                  suggestion: suggestion,
                },
              };

              console.log(
                `Attempting to send push notification to user ${profile.id} via ${apiBaseUrl}/api/send-push`
              );

              const pushResponse = await fetch(`${apiBaseUrl}/api/send-push`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(pushPayload),
              });

              // Log push notification result for debugging
              if (!pushResponse.ok) {
                const errorData = await pushResponse.json().catch(() => ({}));
                console.error(
                  `Failed to send push notification for user ${profile.id}:`,
                  errorData
                );
              } else {
                const successData = await pushResponse.json().catch(() => ({}));
                console.log(
                  `Push notification successfully sent for user ${profile.id}:`,
                  successData
                );
              }
            } catch (error) {
              console.error(`Error calling push notification API for user ${profile.id}:`, error);
            }
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
