import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';
import { validateRequired } from '../../utils/validators';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getCategoryIconComponent,
  getCategoryStyle,
  CategoryIconBadge,
} from '../../utils/categoryIcons';
import { Check, Palette, Sparkles } from 'lucide-react';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories();
  const isEditing = !!categoryToEdit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [selectedIcon, setSelectedIcon] = useState('FolderTree');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setDescription(categoryToEdit.description || '');
        setSelectedColor(categoryToEdit.color || 'purple');
        setSelectedIcon(categoryToEdit.icon || 'FolderTree');
      } else {
        setName('');
        setDescription('');
        setSelectedColor('purple');
        setSelectedIcon('FolderTree');
      }
      setError(null);
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateRequired(name, 'Category Name');
    if (nameErr) {
      setError(nameErr);
      return;
    }

    try {
      if (isEditing && categoryToEdit) {
        await updateCategory({
          id: categoryToEdit.id,
          dto: {
            name: name.trim(),
            description: description.trim(),
            color: selectedColor,
            icon: selectedIcon,
          },
        });
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    }
  };

  const previewStyle = getCategoryStyle(selectedColor);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create New Category'}
      subtitle={
        isEditing
          ? 'Customize category details, color theme, and icon.'
          : 'Create a customized product category with unique colors and icons.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Preview Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
          <CategoryIconBadge iconName={selectedIcon} colorName={selectedColor} size="md" />
          <div>
            <div className="text-xs font-bold text-slate-900">
              {name.trim() || 'Category Name Preview'}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {description.trim() || 'No description entered'}
            </p>
          </div>
        </div>

        {/* Name */}
        <Input
          label="Category Name"
          placeholder="e.g., Electronics, Audio Equipment, Workspaces"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          error={error || undefined}
        />

        {/* Description */}
        <Input
          label="Description (Optional)"
          placeholder="e.g., High-performance gadgets and devices"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color Palette Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Color Theme</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {CATEGORY_COLORS.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  title={color.name}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? `${color.bgLight} ${color.border} ring-2 ring-emerald-500/30 scale-105 shadow-sm`
                      : 'bg-white border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${color.dotColor} flex items-center justify-center text-white shadow-xs`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 mt-1 capitalize">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Selector Grid */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Icon</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200/70">
            {CATEGORY_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  title={item.label}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md scale-105 ring-2 ring-slate-900/20'
                      : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isCreating || isUpdating}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isCreating || isUpdating}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
