import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { RecordMovementDto } from '../types/inventory';
import toast from 'react-hot-toast';

export const MOVEMENTS_QUERY_KEY = ['movements'];

export function useInventory(productId?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...MOVEMENTS_QUERY_KEY, productId],
    queryFn: () => inventoryApi.getMovements(productId),
  });

  const movementMutation = useMutation({
    mutationFn: (dto: RecordMovementDto) => inventoryApi.recordMovement(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: MOVEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const action = data.movementType === 'StockIn' ? 'Stock In recorded' : 'Stock Out recorded';
      toast.success(`${action}: ${data.quantity} units for ${data.productName}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record stock movement.');
    },
  });

  return {
    ...query,
    movements: query.data || [],
    recordMovement: movementMutation.mutateAsync,
    isRecording: movementMutation.isPending,
  };
}
