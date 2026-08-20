import { apiClient } from './apiClient';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

export const categoryApi = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },

  async getById(id: number): Promise<Category> {
    const { data } = await apiClient.get<Category>(`/categories/${id}`);
    return data;
  },

  async create(dto: CreateCategoryDto): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', dto);
    return data;
  },

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
};
