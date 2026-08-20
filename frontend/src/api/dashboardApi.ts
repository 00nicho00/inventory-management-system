import { apiClient } from './apiClient';
import { DashboardSummary } from '../types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
