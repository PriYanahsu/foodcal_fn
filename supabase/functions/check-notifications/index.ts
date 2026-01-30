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
        const url = new URL(req.url)
        const isTestMode = url.searchParams.get('test') === 'true'

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, goal, daily_calorie_target, timezone')

        if (profilesError) throw profilesError

        console.log(`Checking notifications for ${profiles?.length || 0} users. Test Mode: ${isTestMode}`)

        for (const profile of profiles) {
            try {
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

                // Triggers
                const isSystemCheck = (hour === 1 && minutes < 5)
                const isMorningKickoff = (hour === 8 && minutes < 5)
                const isEvening = (hour === 19 && minutes < 5)
                const isEndOfDay = (hour === 23 && minutes >= 55)

                // ✅ SPECIFIC TEST WINDOW: 2:40 AM – 2:45 AM
                const isTestWindow = (hour === 2 && minutes >= 40 && minutes < 45)

                let shouldEvaluate = isTestMode || isSystemCheck || isMorningKickoff || isEvening || isEndOfDay || isTestWindow

                console.log(`User ${profile.id}: Local Time ${hour}:${minutes.toString().padStart(2, '0')} (${timeZone}) | Match: ${shouldEvaluate}`)

                if (!shouldEvaluate) continue

                // Condition Logic
                let conditionMet = false
                let title = ''
                let message = ''

                if (isTestMode || isTestWindow) {
                    conditionMet = true
                    title = 'Night Owl Check! 🦉'
                    message = `It's ${hour}:${minutes.toString().padStart(2, '0')}. Just checking in — don’t forget rest is part of progress.`
                } else if (isSystemCheck) {
                    conditionMet = true
                    title = 'System Check 🛠️'
                    message = "Ready for the day? Your coach is standing by."
                } else if (isMorningKickoff) {
                    conditionMet = true
                    title = 'Rise and Shine! ☀️'
                    message = "Start your day with a win. Log your breakfast to stay on track!"
                }

                if (!conditionMet) continue

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
                    type: 'goal_reminder',
                })

                if (insertError) console.error(`User ${profile.id}: Insert failed!`, insertError)

            } catch (e) {
                console.error(`Error processing profile ${profile.id}:`, e)
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: corsHeaders,
        })
    }
})
