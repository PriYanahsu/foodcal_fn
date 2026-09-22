/**
 * The wake-up itself: a request gate, a ping loop, and a subscribable status.
 *
 * This lives outside React on purpose. There is exactly one backend and one
 * cold start per page load, so the state is global rather than per-component —
 * which also means a remounted provider can't kick off a second ping loop.
 * React reads it through `useBackendStatus` and `useSyncExternalStore`.
 */

import {
  COLD_START_STATUSES,
  GATE_HOLD_MS,
  IS_CONFIGURED,
  REWAKE_AFTER_MS,
  PING_TIMEOUT_MS,
  PING_URL,
  RETRY_DELAY_MS,
  SLOW_RETRY_DELAY_MS,
  WAKE_BUDGET_MS,
} from './config';

export type BackendStatus = 'waking' | 'ready' | 'failed';

export type WakeState = {
  status: BackendStatus;
  /** When the current attempt began; 0 before the first one starts. */
  startedAt: number;
};

/** Shared by the server render and the client's first render, so they match. */
const INITIAL_STATE: WakeState = { status: 'waking', startedAt: 0 };

let state: WakeState = INITIAL_STATE;
const listeners = new Set<() => void>();

function publish(next: Partial<WakeState>) {
  state = { ...state, ...next };
  listeners.forEach((notify) => notify());
}

/* ---------------------------------------------------------------- gate --- */

/**
 * While the backend is cold, API calls wait here instead of firing into a 502.
 * The gate opens when a ping lands, so the queue drains into a live server — or
 * after GATE_HOLD_MS, so calls surface a real error rather than hanging on a
 * promise nothing will ever resolve.
 */
let gateOpen = false;
let queued: Array<() => void> = [];

function openGate() {
  gateOpen = true;
  const waiting = queued;
  queued = [];
  waiting.forEach((resume) => resume());
}

/** Awaited by the axios request interceptor before every call. */
export function waitForBackend(): Promise<void> {
  // Self-starting: even if no component ever mounted the hook, a request can
  // never end up waiting on a loop that was never kicked off.
  void startWake();
  if (gateOpen) return Promise.resolve();
  return new Promise<void>((resume) => queued.push(resume));
}

/* ----------------------------------------------------------------- ping --- */

/** Resolves the loop's current pause early — used by retry and by returning to the tab. */
let cutSleepShort: (() => void) | null = null;

function sleep(ms: number) {
  return new Promise<void>((resume) => {
    const done = () => {
      clearTimeout(timer);
      cutSleepShort = null;
      resume();
    };
    const timer = setTimeout(done, ms);
    cutSleepShort = done;
  });
}

type PingResult = 'up' | 'down' | 'timeout';

/** One attempt. 'timeout' means the request was held open the whole time, not refused. */
async function pingOnce(): Promise<PingResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const res = await fetch(PING_URL, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    // Anything that isn't the proxy's boot response means the JVM is serving —
    // a 401 still proves it's up, so don't read non-2xx as asleep.
    return COLD_START_STATUSES.includes(res.status) ? 'down' : 'up';
  } catch {
    return controller.signal.aborted ? 'timeout' : 'down';
  } finally {
    clearTimeout(timeout);
  }
}

let running = false;

/* ------------------------------------------------------- last seen alive --- */

/**
 * When the server last answered anything — a ping or a real API call. Persisted
 * so a reload, the redirect after sign-in, or a second tab doesn't treat an
 * instance that was serving seconds ago as cold and flash the waking UI.
 */
const ALIVE_KEY = 'foodcal:backend-alive-at';
let aliveAt = readStoredAliveAt();

function readStoredAliveAt(): number {
  try {
    return Number(localStorage.getItem(ALIVE_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Called on every answered request, so active use keeps the "awake" window fresh. */
export function markBackendAlive() {
  aliveAt = Date.now();
  try {
    localStorage.setItem(ALIVE_KEY, String(aliveAt));
  } catch {
    // Storage blocked (private mode etc.) — the in-memory value still works.
  }
}

function recentlyAlive() {
  return aliveAt > 0 && Date.now() - aliveAt < REWAKE_AFTER_MS;
}

/**
 * The server answered recently, so assume it is still up: open the gate and
 * report ready straight away, then confirm with one silent ping. Only if that
 * ping fails does the visible wake loop run.
 */
async function runQuietCheck() {
  running = true;
  openGate();
  publish({ status: 'ready' });
  const alive = (await pingOnce()) === 'up';
  running = false;
  if (alive) {
    markBackendAlive();
    return;
  }
  void runWakeLoop();
}

async function runWakeLoop() {
  running = true;
  gateOpen = false;
  publish({ status: 'waking', startedAt: Date.now() });

  // Never gives up on its own: a boot that outlasts the budget still flips the UI
  // to ready the moment it answers, instead of stranding the user on the retry card.
  for (;;) {
    const result = await pingOnce();
    if (result === 'up') {
      markBackendAlive();
      openGate();
      publish({ status: 'ready' });
      running = false;
      return;
    }

    const elapsed = Date.now() - state.startedAt;
    if (state.status === 'waking' && elapsed >= WAKE_BUDGET_MS) publish({ status: 'failed' });
    // A request that fails with a real error is recoverable, one that waits forever is not.
    if (!gateOpen && elapsed >= GATE_HOLD_MS) openGate();

    // A timed-out ping was held by the proxy the whole time, so the instance is
    // booting — go again at once rather than leave a window with nothing pending.
    if (result === 'timeout') continue;
    await sleep(state.status === 'failed' ? SLOW_RETRY_DELAY_MS : RETRY_DELAY_MS);
  }
}

/** Idempotent: starts the loop once, and is a no-op while one is in flight. */
export function startWake() {
  watchRefocus();
  if (running) return;
  if (!IS_CONFIGURED) {
    // No API address in this build — nothing to ping, and nothing to wait for.
    openGate();
    publish({ status: 'failed' });
    return;
  }
  if (recentlyAlive()) {
    void runQuietCheck();
    return;
  }
  void runWakeLoop();
}

/**
 * User-triggered retry, and the refocus re-ping. While the loop is already
 * running this restarts the attempt (fresh progress bar, requests held again)
 * and pings immediately instead of waiting out the current pause.
 */
export function retryWake() {
  if (!running) {
    startWake();
    return;
  }
  if (state.status === 'failed') {
    gateOpen = false;
    publish({ status: 'waking', startedAt: Date.now() });
  }
  cutSleepShort?.();
}

/**
 * Coming back to a tab left open past the idle window: the instance has likely
 * been stopped again, so warm it before the user clicks anything. Registered
 * once for the life of the page, so it is never torn down.
 */
let watchingRefocus = false;

function watchRefocus() {
  if (watchingRefocus || typeof document === 'undefined') return;
  watchingRefocus = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    // Background tabs throttle timers hard, so a loop still in flight may be
    // sitting in a long pause — ping now so the UI catches up on return.
    if (running) {
      cutSleepShort?.();
      return;
    }
    if (aliveAt === 0 || recentlyAlive()) return;
    retryWake();
  });
}

/* ------------------------------------------------------------ subscribe --- */

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): WakeState {
  return state;
}

export function getServerSnapshot(): WakeState {
  return INITIAL_STATE;
}
