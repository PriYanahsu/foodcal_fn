'use client';

import { useEffect, useMemo, useState } from 'react';
import type { History } from '../type';
import { getHistory } from '../service/history.api';
import { DEFAULT_CALORIE_TARGET } from '../utils/Constants';
import { getHistoryOverview } from '../utils/helper';

export function useHistory() {
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const days = await getHistory();
        if (!cancelled) setHistory(days);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => getHistoryOverview(history), [history]);

  return {
    history,
    loading,
    stats,
    target: DEFAULT_CALORIE_TARGET,
  };
}
