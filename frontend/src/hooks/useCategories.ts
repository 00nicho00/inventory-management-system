import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { CreateCategoryDto, UpdateCategoryDto } from '../types/category';
import toast from 'react-hot-toast';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoryApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoryApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Category created successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create category.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateCategoryDto }) =>
      categoryApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Category updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Category deleted successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete category.');
    },
  });

  return {
    ...query,
    categories: query.data || [],
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
