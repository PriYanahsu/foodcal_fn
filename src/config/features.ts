/**
 * Product feature flags — flip a flag to `false` to hide that feature
 * from nav, routes, providers, and UI across the app.
 */
export const FEATURES = {
  nutrition: true,
  fitness: true,
  exercises: false,
  scan: true,
  steps: false,
  history: true,
  notifications: true,
  profile: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}

/** Paths that should 404/redirect when their feature is off */
export const FEATURE_ROUTES: Partial<Record<FeatureKey, string>> = {
  exercises: '/exercises',
  steps: '/steps',
  fitness: '/fitness',
  scan: '/scan',
  history: '/history',
  notifications: '/notifications',
  profile: '/profile',
};

export function getDisabledFeaturePaths(): string[] {
  return (Object.entries(FEATURE_ROUTES) as [FeatureKey, string][])
    .filter(([key]) => !FEATURES[key])
    .map(([, path]) => path);
}
