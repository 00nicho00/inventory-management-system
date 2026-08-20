import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { CreateProductDto, UpdateProductDto, ProductFilter } from '../types/product';
import toast from 'react-hot-toast';

export const PRODUCTS_QUERY_KEY = ['products'];

export function useProducts(filter?: ProductFilter) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, filter],
    queryFn: () => productApi.getAll(filter),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductDto) => productApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product created successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create product.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProductDto }) =>
      productApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update product.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Product deleted successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete product.');
    },
  });

  return {
    ...query,
    products: query.data || [],
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
