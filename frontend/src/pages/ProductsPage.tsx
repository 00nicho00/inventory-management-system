import React, { useState, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StockBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { QuickProductModal } from '../components/products/QuickProductModal';
import { QuickMovementModal } from '../components/inventory/QuickMovementModal';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { EmptyState } from '../components/feedback/EmptyState';
import { Product, StockStatusFilter } from '../types/product';
import { MovementType } from '../types/inventory';
import { getCategoryStyle, getCategoryIconComponent } from '../utils/categoryIcons';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Tag,
  X,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StockStatusFilter>('all');

  const { products, isLoading, deleteProduct, isDeleting } = useProducts();
  const { categories } = useCategories();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType>('StockIn');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Smooth, instant client-side filtering (0ms lag, zero page re-renders/spinners)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Text Search (matches SKU or Name or Description)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesSku && !matchesDesc) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all') {
        if (p.categoryId !== Number(categoryFilter)) return false;
      }

      // 3. Stock Level Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'in_stock' && p.stockQuantity <= p.lowStockThreshold) return false;
        if (statusFilter === 'low_stock' && (p.stockQuantity === 0 || p.stockQuantity > p.lowStockThreshold)) return false;
        if (statusFilter === 'out_of_stock' && p.stockQuantity > 0) return false;
      }

      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setProductToEdit(null);
    setProductModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  const handleOpenMovement = (product: Product, type: MovementType) => {
    setSelectedProductId(product.id);
    setSelectedMovementType(type);
    setMovementModalOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    } catch {
      // Handled by toast
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const statusOptions: { value: StockStatusFilter; label: string }[] = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'in_stock', label: 'In Stock (> 5)' },
    { value: 'low_stock', label: 'Low Stock (1 - 5)' },
    { value: 'out_of_stock', label: 'Out of Stock (0)' },
  ];

  if (isLoading && products.length === 0) {
    return <LoadingSpinner text="Loading product inventory..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage SKUs, unit prices, product categories, and real-time inventory balances.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Add New Product
        </Button>
      </div>

      {/* Filter Toolbar with Instant Search and Clear button */}
      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Input
              placeholder="Search by SKU or Product Name..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              rightIcon={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StockStatusFilter)}
            />
          </div>
        </div>

        {/* Filter Summary Bar */}
        {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Found <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
              <strong className="text-slate-800">{products.length}</strong> total products
            </span>
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* Product Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try modifying your search criteria or resetting filters.'
              : 'Start your inventory catalog by adding your first product.'
          }
          actionText={search ? undefined : 'Add First Product'}
          onAction={search ? undefined : handleOpenCreate}
        />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Unit Price</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-6 text-right">Quick Stock Action / Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & SKU */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                              {p.sku}
                            </span>
                            {p.description && (
                              <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                                {p.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      {(() => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        const style = getCategoryStyle(cat?.color);
                        const IconComp = getCategoryIconComponent(cat?.icon);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style.bgLight} ${style.text} ${style.border}`}
                          >
                            <IconComp className="w-3 h-3" />
                            {p.categoryName}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(p.price)}
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <StockBadge quantity={p.stockQuantity} threshold={p.lowStockThreshold} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Stock In */}
                        <button
                          title="Stock In (+)"
                          onClick={() => handleOpenMovement(p, 'StockIn')}
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                        </button>

                        {/* Quick Stock Out */}
                        <button
                          title="Stock Out (-)"
                          onClick={() => handleOpenMovement(p, 'StockOut')}
                          disabled={p.stockQuantity === 0}
                          className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-200 mx-1" />

                        {/* Edit */}
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(p)}
                        >
                          Edit
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenDelete(p)}
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

      {/* Add / Edit Product Modal */}
      <QuickProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      {/* Quick Stock Movement Modal */}
      <QuickMovementModal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        defaultProductId={selectedProductId}
        defaultMovementType={selectedMovementType}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete.name}" (SKU: ${productToDelete.sku})? Any transaction logs will be archived.`}
          confirmText="Yes, Delete Product"
          isDangerous
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
