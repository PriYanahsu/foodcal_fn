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

/** A single ping is abandoned after this long; the next attempt takes over. */
export const PING_TIMEOUT_MS = 20_000;

/** Breather between attempts, so a booting instance isn't hammered. */
export const RETRY_DELAY_MS = 3_000;

/** Total time we keep trying before showing the retry card. */
export const WAKE_BUDGET_MS = 75_000;

/** Typical cold start — drives the progress bar, not the giving-up decision. */
export const EXPECTED_WAKE_MS = 50_000;

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
