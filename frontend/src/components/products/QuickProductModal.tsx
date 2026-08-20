import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types/product';
import { validateSku, validateRequired } from '../../utils/validators';

export interface QuickProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const QuickProductModal: React.FC<QuickProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories } = useCategories();
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();

  const isEditing = !!productToEdit;

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setSku(productToEdit.sku);
        setName(productToEdit.name);
        setDescription(productToEdit.description || '');
        setCategoryId(String(productToEdit.categoryId));
        setPrice(String(productToEdit.price));
        setLowStockThreshold(String(productToEdit.lowStockThreshold || 5));
      } else {
        setSku('');
        setName('');
        setDescription('');
        setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
        setPrice('');
        setLowStockThreshold('5');
      }
      setErrors({});
    }
  }, [isOpen, productToEdit, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      const skuErr = validateSku(sku);
      if (skuErr) newErrors.sku = skuErr;
    }

    const nameErr = validateRequired(name, 'Product Name');
    if (nameErr) newErrors.name = nameErr;

    if (!categoryId) {
      newErrors.categoryId = 'Category selection is required.';
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Price must be a non-negative number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && productToEdit) {
        await updateProduct({
          id: productToEdit.id,
          dto: {
            name: name.trim(),
            description: description.trim(),
            categoryId: Number(categoryId),
            price: priceNum,
            lowStockThreshold: Number(lowStockThreshold) || 5,
          },
        });
      } else {
        await createProduct({
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          price: priceNum,
          lowStockThreshold: Number(lowStockThreshold) || 5,
        });
      }
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Operation failed.' });
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      subtitle={
        isEditing
          ? 'Update product details and price.'
          : 'Create a new inventory product catalog item. Initial stock starts at 0.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SKU (immutable when editing) */}
        <Input
          label="SKU (Stock Keeping Unit)"
          placeholder="e.g., TECH-001, FURN-102"
          required
          disabled={isEditing}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          error={errors.sku}
          helperText={isEditing ? 'SKU cannot be modified after creation.' : undefined}
        />

        {/* Product Name */}
        <Input
          label="Product Name"
          placeholder="e.g., Wireless Mechanical Keyboard"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        {/* Category & Price in Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            required
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            placeholder="-- Choose Category --"
            error={errors.categoryId}
          />
          <Input
            label="Unit Price (RM)"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
          />
        </div>

        {/* Low Stock Warning Threshold */}
        <Input
          label="Low Stock Warning Threshold"
          type="number"
          min="1"
          placeholder="5"
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(e.target.value)}
          helperText="Triggers an amber warning when stock drops to or below this amount."
        />

        {/* Description */}
        <Input
          label="Description (Optional)"
          placeholder="Brief product notes, dimensions, or features"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {errors.form && <p className="text-xs text-rose-600 font-medium">{errors.form}</p>}

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
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
