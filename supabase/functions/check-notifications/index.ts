/// <reference path="../deno.d.ts" />
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Get all profiles (including those without targets for testing/basic checks)
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, goal, daily_calorie_target, timezone, gender, age, height, weight, activity_level')

        if (profilesError) throw profilesError

        console.log(`Checking notifications for ${profiles?.length || 0} users...`)

        const results = []

        for (const profile of profiles) {
            try {
                // 2. Determine User's Local Time
                const timeZone = profile.timezone || 'UTC'
                const now = new Date()

                // Format to parts to get local hour/minute
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hourCycle: 'h23',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric'
                })

                const parts = formatter.formatToParts(now)
                const getPart = (type: string) => parts.find(p => p.type === type)?.value
                const hour = parseInt(getPart('hour') || '0', 10)
                const minutes = parseInt(getPart('minute') || '0', 10)

                // Format Date for comparison: YYYY-MM-DD
                const year = getPart('year')
                const month = getPart('month')?.padStart(2, '0')
                const day = getPart('day')?.padStart(2, '0')
                const userTodayDateString = `${year}-${month}-${day}` // e.g. 2023-10-27

                // Optimization: Only fetch logs if time is interesting
                const isSystemCheck = hour === 1
                const isMorningKickoff = hour === 8
                const isInactivityCheck = hour === 10
                const isEnergyCheck = hour === 11
                const isAfternoon = hour >= 15 && hour < 18
                const isEvening = hour >= 18 && hour < 21
                const isNight = hour >= 21
                const isEndOfDay = hour === 23 && minutes >= 55 // End of day summary

                // Test Triggers
                const isTestCheck = hour === 1 && (minutes >= 20 && minutes <= 30)
                const isTwoAMCheck = hour === 2 // Added per user request

                console.log(`User ${profile.id}: Time ${hour}:${minutes.toString().padStart(2, '0')} (${timeZone}) | Test: ${isTestCheck}, 2AM: ${isTwoAMCheck}, System: ${isSystemCheck}`)

                if (!isSystemCheck && !isMorningKickoff && !isInactivityCheck && !isEnergyCheck &&
                    !isAfternoon && !isEvening && !isNight && !isEndOfDay && !isTestCheck && !isTwoAMCheck) {
                    console.log(`User ${profile.id}: Skipping - not a trigger time.`)
                    continue;
                }

                // 3. Fetch "Today's" Logs for this user
                const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                const { data: logs, error: logsError } = await supabase
                    .from('food_logs')
                    .select('calories, created_at')
                    .eq('user_id', profile.id)
                    .gte('created_at', yesterday.toISOString())

                if (logsError) {
                    console.error(`User ${profile.id}: Error fetching logs:`, logsError)
                    continue;
                }

                // Filter logs strictly for "today" in user's timezone
                const todayLogs = (logs || []).filter(log => {
                    const logDate = new Date(log.created_at)
                    const logDateString = new Intl.DateTimeFormat('en-CA', { timeZone }).format(logDate)
                    return logDateString === userTodayDateString
                })

                const currentCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0)
                const target = profile.daily_calorie_target || 2000 // Fallback if not set
                const remaining = Math.max(0, target - currentCalories)
                const objective = (profile.goal || 'Maintain Weight').toLowerCase()

                console.log(`User ${profile.id}: Calories ${currentCalories}/${target}, Logs: ${todayLogs.length}`)

                // 4. Logic Implementation
                let conditionMet = false
                let title = ''
                let message = ''

                // TRIGGERS
                if (isTwoAMCheck) {
                    conditionMet = true
                    title = 'Night Owl Check! 🦉'
                    message = `It's 2:00 AM! Your personal coach is just checking in. Make sure to get some rest to conquer your goals tomorrow!`
                } else if (isTestCheck) {
                    conditionMet = true
                    title = 'Test Notification! 🔔'
                    message = `It's 1:25 AM (or close)! This is your high-priority test notification for the Edge Function at ${hour}:${minutes}.`
                } else if (isSystemCheck) {
                    conditionMet = true
                    title = 'System Check 🛠️'
                    message = "Testing the wires! Just making sure your personal coach is ready for your big day tomorrow. See you in the morning!"
                } else if (isMorningKickoff) {
                    conditionMet = true
                    title = 'Rise and Shine! ☀️'
                    message = "Good morning! Identifying your breakfast is the first choice of the day. Logging it now sets a great momentum for your body!"
                } else if (isInactivityCheck && todayLogs.length === 0) {
                    conditionMet = true
                    title = 'Thinking of You... 🤗'
                    message = "Your coaching journey is built on small, consistent steps. Tracking isn't just about logs; it's about staying connected with your goals. Have you had a chance to track today?"
                } else if (isEnergyCheck) {
                    conditionMet = true
                    title = 'Energy Check-In ⚡'
                    message = "How are you feeling? A glass of water or a light protein-rich snack can keep your energy steady. Your body will thank you later!"
                }
                // WEIGHT GAIN COACH
                else if (objective.includes('gain')) {
                    if (isAfternoon && currentCalories < target * 0.4) {
                        conditionMet = true
                        title = 'Fueling Your Mastery 🚀'
                        message = `You're doing incredible! You've reached 40% of your power target. You're just ${remaining} calories away from your afternoon peak—let's keep fueling!`
                    } else if (isEvening && currentCalories < target * 0.6) {
                        conditionMet = true
                        title = 'Strength in Progress ✨'
                        message = `Almost there! You've nailed 60% of your goal already. Your coach recommends a nutrient-dense dinner to support those gains!`
                    } else if (isNight && currentCalories < target * 0.9) {
                        conditionMet = true
                        title = 'Finishing with Power 💪'
                        message = `What a day of growth! You’re just ${remaining} calories from your finish line. One last nourishing snack will help you wake up stronger tomorrow.`
                    }
                }
                // WEIGHT LOSS COACH
                else if (objective.includes('loss') || objective.includes('lose')) {
                    if (currentCalories > target * 0.9 && currentCalories < target) {
                        conditionMet = true
                        title = 'Mindful & Steady 🌿'
                        message = `You're 90% of the way to your goal! Your discipline today is inspiring—choose your next small bite mindfully to finish this day as a champion.`
                    } else if (currentCalories >= target) {
                        conditionMet = true
                        title = 'Goal Mastered! 🏆'
                        message = `You did it! You've hit your target exactly. Take a moment to celebrate your discipline today—consistency is your superpower.`
                    }
                }
                // MAINTAIN / GENERIC COACH
                else {
                    if (hour >= 20 && currentCalories < target * 0.5) {
                        conditionMet = true
                        title = 'Nourish Your Body 🥗'
                        message = `You've reached your half-way mark! Your coach is checking in—let's make sure your body has the balance it needs to feel amazing tomorrow.`
                    }
                }

                // END OF DAY SUMMARY
                if (isEndOfDay) {
                    const isGoalMet = currentCalories >= target * 0.9 && currentCalories <= target * 1.1;
                    conditionMet = true;
                    title = isGoalMet ? 'Day Complete: Victory! 🌟' : 'Day Complete: Great Spirit! 🌙';
                    message = isGoalMet
                        ? `Fantastic focus today! You stayed right in your lane. Sleep well, knowing you're one step closer to your best self.`
                        : `The day is done, and your effort counts! You logged ${currentCalories} calories. Tomorrow is a fresh canvas to create the habits we're building together!`;
                }

                if (conditionMet) {
                    // 5. Check Duplicates in DB
                    const { data: recentNotifs } = await supabase
                        .from('notifications')
                        .select('title, created_at')
                        .eq('user_id', profile.id)
                        .order('created_at', { ascending: false })
                        .limit(20)

                    const alreadySent = (isTestCheck || isTwoAMCheck) ? false : recentNotifs?.some(n => {
                        const nDateStr = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(n.created_at))
                        return nDateStr === userTodayDateString && n.title === title
                    })

                    if (alreadySent) {
                        console.log(`User ${profile.id}: Notification '${title}' already sent today. Skipping.`)
                    }

                    if (!alreadySent) {
                        // 6. Insert Notification
                        const { error: insertError } = await supabase.from('notifications').insert({
                            user_id: profile.id,
                            title,
                            message,
                            type: 'goal_reminder',
                            created_at: new Date().toISOString()
                        })

                        if (insertError) {
                            console.error(`User ${profile.id}: Error inserting notification:`, insertError)
                        } else {
                            console.log(`User ${profile.id}: Notification sent! (${title})`)
                            results.push({ user: profile.id, status: 'Notified', title })
                        }
                    }
                } else {
                    console.log(`User ${profile.id}: No conditions met for notification.`)
                }
            } catch (err) {
                console.error(`Error processing user ${profile.id}:`, err)
            }
        }

        return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'
        console.error('Fatal Error:', errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})

