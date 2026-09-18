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
  IS_CONFIGURED,
  REWAKE_AFTER_MS,
  PING_TIMEOUT_MS,
  PING_URL,
  RETRY_DELAY_MS,
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
 * Both outcomes open the gate: on success the queue drains into a live server,
 * and on failure it drains anyway, so calls surface a real error rather than
 * hanging on a promise nothing will ever resolve.
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

const sleep = (ms: number) => new Promise((resume) => setTimeout(resume, ms));

/** One attempt. False on timeout, network error, or a cold-start status. */
async function pingOnce(): Promise<boolean> {
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
    return !COLD_START_STATUSES.includes(res.status);
  } catch {
    return false;
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
  const alive = await pingOnce();
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

  const deadline = Date.now() + WAKE_BUDGET_MS;
  while (Date.now() < deadline) {
    if (await pingOnce()) {
      markBackendAlive();
      openGate();
      publish({ status: 'ready' });
      running = false;
      return;
    }
    await sleep(RETRY_DELAY_MS);
  }

  // Out of budget. Open the gate anyway: a request that fails with a real error
  // is recoverable, one that waits forever is not.
  openGate();
  publish({ status: 'failed' });
  running = false;
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

/** User-triggered retry, and the refocus re-ping. */
export function retryWake() {
  if (running) return;
  startWake();
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
