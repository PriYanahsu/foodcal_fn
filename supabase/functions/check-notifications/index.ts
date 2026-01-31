import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to get AI coaching advice
async function getCoachingAdvice(
    apiBaseUrl: string,
    stats: { calories: number; protein: number; carbs: number; fats: number },
    goals: { objective: string; target_weight: number | null; target_date: string | null },
    profileData: { gender: string | null; age: number | null; height: number | null; weight: number | null; activity_level: string | null }
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
        })

        if (!response.ok) {
            console.error(`Fitness consultant API error: ${response.status}`)
            return null
        }

        const data = await response.json()
        return data.data?.advice || null
    } catch (error) {
        console.error('Error calling fitness-consultant API:', error)
        return null
    }
}

// Helper function to check if user is behind on diet
function checkDietCompletion(
    currentCalories: number,
    targetCalories: number,
    hour: number
): { isBehind: boolean; progressPercent: number; timeOfDay: string } {
    if (!targetCalories || targetCalories === 0) {
        return { isBehind: false, progressPercent: 0, timeOfDay: 'unknown' }
    }

    const progressPercent = (currentCalories / targetCalories) * 100

    // Expected progress thresholds based on time of day
    let expectedProgress = 0
    let timeOfDay = 'morning'

    if (hour >= 6 && hour < 12) {
        // Morning: Should have ~25% of daily calories (breakfast)
        expectedProgress = 25
        timeOfDay = 'morning'
    } else if (hour >= 12 && hour < 18) {
        // Afternoon: Should have ~60% of daily calories (breakfast + lunch)
        expectedProgress = 60
        timeOfDay = 'afternoon'
    } else if (hour >= 18 && hour < 22) {
        // Evening: Should have ~85% of daily calories (breakfast + lunch + dinner)
        expectedProgress = 85
        timeOfDay = 'evening'
    } else {
        // Night/End of Day: Should have ~100% of daily calories
        expectedProgress = 95
        timeOfDay = 'night'
    }

    const isBehind = progressPercent < expectedProgress - 10 // 10% tolerance

    return { isBehind, progressPercent, timeOfDay }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const isTestMode = url.searchParams.get('test') === 'true'
        
        // Try to get API base URL from environment, or construct from request
        // In production, this should be set to your Next.js app URL
        let apiBaseUrl = Deno.env.get('API_BASE_URL')
        if (!apiBaseUrl) {
            // Fallback: try to construct from Supabase URL (for local dev)
            const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
            // Remove /functions path if present and use as base
            apiBaseUrl = supabaseUrl.replace(/\/functions\/.*$/, '')
            // For local development, you might need to set this manually
            if (!apiBaseUrl || apiBaseUrl === supabaseUrl) {
                console.warn('API_BASE_URL not set. AI coaching advice will be disabled.')
                apiBaseUrl = '' // Will skip AI advice calls
            }
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch profiles with all necessary fields
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, goal, daily_calorie_target, daily_protein_target, daily_carbs_target, daily_fats_target, timezone, gender, age, height, weight, activity_level, target_weight, target_date')

        if (profilesError) throw profilesError

        console.log(`Checking notifications for ${profiles?.length || 0} users. Test Mode: ${isTestMode}`)

        const results = {
            processed: 0,
            notificationsSent: 0,
            errors: 0,
        }

        for (const profile of profiles || []) {
            try {
                results.processed++

                // Skip if no calorie target set
                if (!profile.daily_calorie_target || profile.daily_calorie_target === 0) {
                    console.log(`User ${profile.id}: No calorie target set, skipping`)
                    continue
                }

                const timeZone = profile.timezone || 'UTC'
                const now = new Date()

                // Resolve Local Time
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    hour: 'numeric',
                    minute: 'numeric',
                    hourCycle: 'h23',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                })

                const parts = formatter.formatToParts(now)
                const getPart = (t: string) => parts.find(p => p.type === t)?.value

                const hour = parseInt(getPart('hour') || '0', 10)
                const minutes = parseInt(getPart('minute') || '0', 10)
                const userTodayDateString = `${getPart('year')}-${getPart('month')?.padStart(2, '0')}-${getPart('day')?.padStart(2, '0')}`

                // Calculate start and end of day in UTC for querying food_logs
                const startOfDay = new Date(now)
                startOfDay.setUTCHours(0, 0, 0, 0)
                const endOfDay = new Date(now)
                endOfDay.setUTCHours(23, 59, 59, 999)

                // Get today's food logs
                const { data: foodLogs, error: logsError } = await supabase
                    .from('food_logs')
                    .select('calories, protein, carbs, fats')
                    .eq('user_id', profile.id)
                    .gte('created_at', startOfDay.toISOString())
                    .lte('created_at', endOfDay.toISOString())

                if (logsError) {
                    console.error(`Error fetching food logs for user ${profile.id}:`, logsError)
                    results.errors++
                    continue
                }

                // Calculate current intake
                const currentStats = {
                    calories: foodLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0,
                    protein: foodLogs?.reduce((sum, log) => sum + (log.protein || 0), 0) || 0,
                    carbs: foodLogs?.reduce((sum, log) => sum + (log.carbs || 0), 0) || 0,
                    fats: foodLogs?.reduce((sum, log) => sum + (log.fats || 0), 0) || 0,
                }

                // Check diet completion
                const { isBehind, progressPercent, timeOfDay } = checkDietCompletion(
                    currentStats.calories,
                    profile.daily_calorie_target,
                    hour
                )

                // Triggers - Using ranges to catch the time window more reliably
                const isSystemCheck = (hour === 1 && minutes < 5)
                const isMorningKickoff = (hour === 8 && minutes < 5)
                const isAfternoon = (hour === 15 && minutes < 5)
                const isEvening = (hour === 19 && minutes < 5)
                // End of day: 12:10 AM (00:10) - midnight + 10 minutes
                const isEndOfDay = (hour === 0 && minutes >= 10)

                // ✅ SPECIFIC TEST WINDOW: 2:40 AM – 2:45 AM
                const isTestWindow = (hour === 2 && minutes >= 40 && minutes < 45)

                // Evaluate if we should check (time-based OR diet completion check)
                let shouldEvaluate = isTestMode || isSystemCheck || isMorningKickoff || isAfternoon || isEvening || isEndOfDay || isTestWindow

                // Also check if user is behind on diet (regardless of time, but with some limits)
                const shouldCheckDietCompletion = isBehind && (isTestMode || isAfternoon || isEvening || isEndOfDay || isTestWindow)

                console.log(`User ${profile.id}: Local Time ${hour}:${minutes.toString().padStart(2, '0')} (${timeZone}) | Calories: ${currentStats.calories}/${profile.daily_calorie_target} (${Math.round(progressPercent)}%) | Behind: ${isBehind}`)
                console.log(`  Time Checks: SystemCheck=${isSystemCheck}, Morning=${isMorningKickoff}, Afternoon=${isAfternoon}, Evening=${isEvening}, EndOfDay=${isEndOfDay}, TestWindow=${isTestWindow}`)
                console.log(`  Should Evaluate: ${shouldEvaluate}, Should Check Diet: ${shouldCheckDietCompletion}`)

                if (!shouldEvaluate && !shouldCheckDietCompletion) continue

                // Condition Logic
                let conditionMet = false
                let title = ''
                let message = ''
                let notificationType: 'goal_reminder' | 'coach_advice' | 'system' | 'milestone' = 'goal_reminder'

                if (isTestMode || isTestWindow) {
                    conditionMet = true
                    title = 'Night Owl Check! 🦉'
                    message = `It's ${hour}:${minutes.toString().padStart(2, '0')}. Just checking in — don't forget rest is part of progress.`
                } else if (shouldCheckDietCompletion && isBehind) {
                    // User is behind on diet - this is the main feature!
                    conditionMet = true
                    const caloriesNeeded = Math.max(0, profile.daily_calorie_target - currentStats.calories)
                    
                    if (timeOfDay === 'afternoon') {
                        title = 'Energy Boost Needed! ⚡'
                        message = `You're at ${Math.round(progressPercent)}% of your daily goal. You need about ${Math.round(caloriesNeeded)} more calories to stay on track.`
                    } else if (timeOfDay === 'evening') {
                        title = 'Almost There! 🌙'
                        message = `You're at ${Math.round(progressPercent)}% of your daily goal. Just ${Math.round(caloriesNeeded)} more calories to complete your day strong!`
                    } else if (timeOfDay === 'night') {
                        title = 'Final Push! 💪'
                        message = `You're at ${Math.round(progressPercent)}% of your daily goal. Don't give up now - you're so close!`
                    } else {
                        title = 'Stay on Track! 📊'
                        message = `You're currently at ${Math.round(progressPercent)}% of your daily calorie goal. Keep logging your meals!`
                    }
                    notificationType = 'coach_advice'
                } else if (isEndOfDay) {
                    // End of day notification - always send at 11:15 PM regardless of diet status
                    conditionMet = true
                    if (isBehind) {
                        // User is behind - encourage them
                        const caloriesNeeded = Math.max(0, profile.daily_calorie_target - currentStats.calories)
                        title = 'Final Push! 💪'
                        message = `You're at ${Math.round(progressPercent)}% of your daily goal. You still need ${Math.round(caloriesNeeded)} more calories. Don't give up - every calorie counts!`
                        notificationType = 'coach_advice'
                    } else if (progressPercent >= 100) {
                        // User completed their goal - celebrate!
                        title = 'Goal Achieved! 🎉'
                        message = `Congratulations! You've reached ${Math.round(progressPercent)}% of your daily calorie goal. Great job staying on track today!`
                        notificationType = 'milestone'
                    } else {
                        // User is on track but not quite there - gentle reminder
                        const caloriesNeeded = Math.max(0, profile.daily_calorie_target - currentStats.calories)
                        title = 'End of Day Check-in 📊'
                        message = `You're at ${Math.round(progressPercent)}% of your daily goal. ${caloriesNeeded > 0 ? `Just ${Math.round(caloriesNeeded)} more calories to complete your day!` : 'You\'re doing great!'}`
                        notificationType = 'goal_reminder'
                    }
                } else if (isSystemCheck) {
                    conditionMet = true
                    title = 'System Check 🛠️'
                    message = "Ready for the day? Your coach is standing by."
                } else if (isMorningKickoff) {
                    conditionMet = true
                    title = 'Rise and Shine! ☀️'
                    message = "Start your day with a win. Log your breakfast to stay on track!"
                }

                if (!conditionMet) {
                    console.log(`User ${profile.id}: No condition met. Skipping notification.`)
                    continue
                }

                // Get AI coaching advice if user is behind on diet
                let suggestion: string | null = null
                if (shouldCheckDietCompletion && isBehind && apiBaseUrl) {
                    try {
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
                        )
                    } catch (error) {
                        console.error(`Failed to get coaching advice for user ${profile.id}:`, error)
                        // Continue without suggestion - notification will still be sent
                    }
                }

                // Check for duplicates (unless it's test mode)
                if (!isTestMode) {
                    const { data: recentNotifs } = await supabase
                        .from('notifications')
                        .select('title, created_at')
                        .eq('user_id', profile.id)
                        .order('created_at', { ascending: false })
                        .limit(5)

                    const alreadySent = recentNotifs?.some(n => {
                        const d = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(n.created_at))
                        return d === userTodayDateString && n.title === title
                    })

                    if (alreadySent) {
                        console.log(`User ${profile.id}: Already sent '${title}' today. skipping.`)
                        continue
                    }
                }

                console.log(`User ${profile.id}: Sending notification: ${title}`)
                const { error: insertError } = await supabase.from('notifications').insert({
                    user_id: profile.id,
                    title,
                    message,
                    type: notificationType,
                    suggestion: suggestion || undefined,
                })

                if (insertError) {
                    console.error(`User ${profile.id}: Insert failed!`, insertError)
                    results.errors++
                } else {
                    results.notificationsSent++
                }

            } catch (e) {
                console.error(`Error processing profile ${profile.id}:`, e)
                results.errors++
            }
        }

        return new Response(JSON.stringify({ 
            success: true,
            ...results,
            message: `Processed ${results.processed} users, sent ${results.notificationsSent} notifications`
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: corsHeaders,
        })
    }
})
