import React from 'react';
import {
  FolderTree,
  Boxes,
  Laptop,
  Armchair,
  Coffee,
  Cable,
  Shirt,
  Sparkles,
  Smartphone,
  Headphones,
  Package,
  ShoppingCart,
  Tag,
  Cpu,
  Wrench,
  BookOpen,
  Heart,
  Music,
} from 'lucide-react';

export interface CategoryColorOption {
  id: string;
  name: string;
  bgLight: string;
  text: string;
  border: string;
  dotColor: string;
}

export const CATEGORY_COLORS: CategoryColorOption[] = [
  { id: 'purple', name: 'Purple', bgLight: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: 'bg-purple-500' },
  { id: 'blue', name: 'Blue', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: 'bg-blue-500' },
  { id: 'emerald', name: 'Emerald', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  { id: 'amber', name: 'Amber', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dotColor: 'bg-amber-500' },
  { id: 'rose', name: 'Rose', bgLight: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dotColor: 'bg-rose-500' },
  { id: 'indigo', name: 'Indigo', bgLight: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dotColor: 'bg-indigo-500' },
  { id: 'cyan', name: 'Cyan', bgLight: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dotColor: 'bg-cyan-500' },
  { id: 'orange', name: 'Orange', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dotColor: 'bg-orange-500' },
];

export const CATEGORY_ICONS = [
  { id: 'FolderTree', label: 'Folder', icon: FolderTree },
  { id: 'Laptop', label: 'Tech / PC', icon: Laptop },
  { id: 'Smartphone', label: 'Phone', icon: Smartphone },
  { id: 'Headphones', label: 'Audio', icon: Headphones },
  { id: 'Cable', label: 'Cables', icon: Cable },
  { id: 'Armchair', label: 'Furniture', icon: Armchair },
  { id: 'Coffee', label: 'Coffee / Food', icon: Coffee },
  { id: 'Shirt', label: 'Clothing', icon: Shirt },
  { id: 'Sparkles', label: 'Beauty / Acc.', icon: Sparkles },
  { id: 'Cpu', label: 'Hardware', icon: Cpu },
  { id: 'Wrench', label: 'Tools', icon: Wrench },
  { id: 'Boxes', label: 'Boxes', icon: Boxes },
  { id: 'ShoppingCart', label: 'Retail', icon: ShoppingCart },
  { id: 'BookOpen', label: 'Books', icon: BookOpen },
  { id: 'Tag', label: 'Tag', icon: Tag },
  { id: 'Heart', label: 'Health', icon: Heart },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderTree,
  Boxes,
  Laptop,
  Armchair,
  Coffee,
  Cable,
  Shirt,
  Sparkles,
  Smartphone,
  Headphones,
  Package,
  ShoppingCart,
  Tag,
  Cpu,
  Wrench,
  BookOpen,
  Heart,
  Music,
};

export function getCategoryStyle(colorId?: string) {
  const found = CATEGORY_COLORS.find((c) => c.id === colorId);
  return found || CATEGORY_COLORS[0];
}

export function getCategoryIconComponent(iconId?: string) {
  return iconMap[iconId || ''] || FolderTree;
}

export const CategoryIconBadge: React.FC<{
  iconName?: string;
  colorName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ iconName, colorName, size = 'md', className = '' }) => {
  const style = getCategoryStyle(colorName);
  const IconComp = getCategoryIconComponent(iconName);

  const sizeClasses = {
    sm: 'p-1.5 rounded-lg w-7 h-7',
    md: 'p-2 rounded-xl w-9 h-9',
    lg: 'p-2.5 rounded-2xl w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 border ${style.bgLight} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}
    >
      <IconComp className={iconSizes[size]} />
    </div>
  );
};
