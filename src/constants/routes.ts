export const ROUTES = {
  HOME: '/',
  SCAN: '/scan',
  PROFILE: '/profile',
  HISTORY: '/history',
  LOGIN: '/login',
  WELCOME: '/welcome',
  /** The welcome flow straight at the plan wizard (`START_PARAM` in OnboardingFlow). */
  PLAN_SETUP: '/welcome?start=plan',
} as const;
