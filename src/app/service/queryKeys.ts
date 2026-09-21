export const queryKeys = {
  user: (userId: string) => ['user', userId] as const,
  fitness: (userId: string) => ['fitness', userId] as const,
  foodLogs: (date: string) => ['food-logs', date] as const,
  foodLogsRoot: ['food-logs'] as const,
  dailyStats: (date: string) => ['daily-stats', date] as const,
  dailyStatsRoot: ['daily-stats'] as const,
  history: ['history'] as const,
  weights: (userId: string) => ['weights', userId] as const,
};
