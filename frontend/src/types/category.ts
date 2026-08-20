export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string; // e.g. 'purple', 'blue', 'emerald', 'amber', 'rose', 'indigo', 'cyan', 'orange'
  icon?: string;  // e.g. 'FolderTree', 'Laptop', 'Armchair', 'Coffee', 'Cable', 'Sparkles'
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}
