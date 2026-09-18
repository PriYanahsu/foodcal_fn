/**
 * Backend wake-up: keeps the free-tier Spring Boot cold start off the user's
 * critical path. Render <WakeUpBanner /> once near the app root; API calls are
 * held automatically by the axios interceptor, which awaits the same gate.
 *
 * `waitForBackend` is intentionally not re-exported here — import it from
 * './wakeService' directly so callers like axios don't pull React in with it.
 */
export { WakeUpBanner } from './WakeUpBanner';
export { useBackendStatus } from './useBackendStatus';
export type { BackendStatus } from './wakeService';
