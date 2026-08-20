import { StockMovement } from './inventory';

export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalUnits: number;
}

export interface TopSellingProduct {
  productId: number;
  productSku: string;
  productName: string;
  categoryId: number;
  categoryName: string;
  price: number;
  unitsSold: number;
  totalRevenue: number;
}

export interface CategorySalesSummary {
  categoryId: number;
  categoryName: string;
  unitsSold: number;
  totalRevenue: number;
}

export interface DashboardSummary {
  totalCategories: number;
  totalProducts: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  totalUnitsSold: number;
  totalRevenueSold: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryDistribution: CategoryDistribution[];
  topSellingProducts: TopSellingProduct[];
  categorySales: CategorySalesSummary[];
  recentMovements: StockMovement[];
}
