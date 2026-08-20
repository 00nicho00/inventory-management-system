export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  price: number;
  lowStockThreshold?: number;
}

export interface UpdateProductDto {
  name: string;
  description?: string;
  categoryId: number;
  price: number;
  lowStockThreshold?: number;
}

export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductFilter {
  search?: string;
  categoryId?: number | 'all';
  stockStatus?: StockStatusFilter;
  page?: number;
  pageSize?: number;
}
