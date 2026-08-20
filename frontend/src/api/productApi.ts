import { apiClient } from './apiClient';
import { Product, CreateProductDto, UpdateProductDto, ProductFilter } from '../types/product';

export const productApi = {
  async getAll(filter?: ProductFilter): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products', { params: filter });
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async create(dto: CreateProductDto): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', dto);
    return data;
  },

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
