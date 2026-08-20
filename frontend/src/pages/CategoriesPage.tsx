import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CategoryModal } from '../components/categories/CategoryModal';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { EmptyState } from '../components/feedback/EmptyState';
import { formatDateTime } from '../utils/formatters';
import { Category } from '../types/category';
import { CategoryIconBadge } from '../utils/categoryIcons';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { categories, isLoading, deleteCategory, isDeleting } = useCategories();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setModalOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch {
      // Handled by toast
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading categories..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Category Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize product categories with custom icons, color palettes, and catalog tags.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Add Category
        </Button>
      </div>

      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search category name or description..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500 ml-auto font-medium">
            Showing <strong className="text-slate-800">{filtered.length}</strong> of{' '}
            <strong className="text-slate-800">{categories.length}</strong> categories
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matching categories' : 'No categories yet'}
          description={
            search
              ? 'Try changing your search keywords or clear the filter.'
              : 'Get started by creating your first product category.'
          }
          actionText={search ? undefined : 'Add First Category'}
          onAction={search ? undefined : handleOpenCreate}
        />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Category Name</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Assigned Products</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <CategoryIconBadge
                          iconName={cat.icon}
                          colorName={cat.color}
                          size="md"
                        />
                        <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                      </div>
                    </td>
                      <td className="py-4 px-4 text-slate-600 text-xs max-w-xs truncate">
                        {cat.description || <span className="text-slate-300 italic">No description</span>}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          {cat.productCount ?? 0} {cat.productCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {formatDateTime(cat.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(cat)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenDelete(cat)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      {categoryToDelete && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Category"
          message={
            categoryToDelete.productCount > 0
              ? `Cannot delete "${categoryToDelete.name}" because it still contains ${categoryToDelete.productCount} product(s). You must first delete or reassign those products.`
              : `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
          }
          confirmText="Yes, Delete Category"
          isDangerous
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
