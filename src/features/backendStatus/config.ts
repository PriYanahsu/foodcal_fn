/**
 * Everything tunable about the backend wake-up lives here.
 *
 * Render's free tier stops the instance after ~15 minutes of no traffic, so the
 * first visitor after a quiet spell pays a cold JVM start. We ping a public
 * endpoint on load to absorb that wait up front instead of letting it land on
 * whatever the user clicks first.
 */

const RAW_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') ?? '';

export const BACKEND_URL = RAW_URL;

/** Set when NEXT_PUBLIC_BACKEND_URL is missing — a deploy mistake, not a cold start. */
export const IS_CONFIGURED = RAW_URL.length > 0;

/** Public, auth-free, and cheap: the JVM answering it at all is the signal. */
export const PING_URL = `${RAW_URL}/api/v1/auth/test`;

/**
 * Render holds a request open while the instance boots and answers it the moment
 * the JVM is up, so a pending ping is the fastest possible "ready" signal. Keep it
 * long: aborting early throws that away and leaves a gap until the next attempt.
 */
export const PING_TIMEOUT_MS = 60_000;

/** Breather after a ping that failed fast (network error, 502), so a booting instance isn't hammered. */
export const RETRY_DELAY_MS = 2_000;

/** After the budget runs out we keep pinging, just less often, so a late boot still flips the UI to ready. */
export const SLOW_RETRY_DELAY_MS = 10_000;

/** Time before the "taking longer than usual" card replaces the progress card. Pinging continues. */
export const WAKE_BUDGET_MS = 180_000;

/**
 * API calls wait for the server up to this long, then are released to fail with
 * a real error rather than hang. Longer than the budget, so a slow-but-normal
 * cold start still lets the queued calls go straight through once it answers.
 */
export const GATE_HOLD_MS = 360_000;

/** Typical cold start — drives the progress bar, not the giving-up decision. */
export const EXPECTED_WAKE_MS = 90_000;

/**
 * A warm server answers well inside this, so "waking" UI (banner, button copy,
 * subtitles) only appears once a ping has genuinely been slow — never as a flash.
 */
export const WAKE_NOTICE_AFTER_MS = 1_500;

/** Returning to the tab after this long means the instance may have idled out. */
export const REWAKE_AFTER_MS = 10 * 60_000;

/** Render's proxy returns these while the instance is still booting. */
export const COLD_START_STATUSES = [502, 503, 504];

/** Local Spring Boot needs different wording — nothing is "waking", it's just not running. */
export const IS_LOCAL_BACKEND = (() => {
  try {
    const { hostname } = new URL(RAW_URL);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
})();
