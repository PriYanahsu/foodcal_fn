import axiosInstance from '@/lib/springboot/axios';
import type { History, HistoryStats } from '../type';
import { toHistoryList } from '../utils/helper';

let inflight: Promise<History[]> | null = null;

export const getHistory = async (): Promise<History[]> => {
  if (inflight) return inflight;

  inflight = (async () => {
    const response = await axiosInstance.get<Record<string, HistoryStats>>(
      '/v1/food/history/allLogs'
    );
    return toHistoryList(response.data);
  })().finally(() => {
    inflight = null;
  });

  return inflight;
};
