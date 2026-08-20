import { apiClient } from './apiClient';
import { StockMovement, RecordMovementDto } from '../types/inventory';

export const inventoryApi = {
  async getMovements(productId?: number): Promise<StockMovement[]> {
    const { data } = await apiClient.get<StockMovement[]>('/inventory/movements', {
      params: { productId },
    });
    return data;
  },

  async recordMovement(dto: RecordMovementDto): Promise<StockMovement> {
    const { data } = await apiClient.post<StockMovement>('/inventory/movement', dto);
    return data;
  },
};
