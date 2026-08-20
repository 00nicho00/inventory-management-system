import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { MovementType } from '../../types/inventory';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface QuickMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: number;
  defaultMovementType?: MovementType;
}

export const QuickMovementModal: React.FC<QuickMovementModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
  defaultMovementType = 'StockIn',
}) => {
  const { products } = useProducts();
  const { recordMovement, isRecording } = useInventory();

  const [productId, setProductId] = useState<string>('');
  const [movementType, setMovementType] = useState<MovementType>('StockIn');
  const [quantity, setQuantity] = useState<string>('1');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultProductId) setProductId(String(defaultProductId));
      else if (products.length > 0 && !productId) setProductId(String(products[0].id));
      setMovementType(defaultMovementType);
      setQuantity('1');
      setRemarks('');
      setError(null);
    }
  }, [isOpen, defaultProductId, defaultMovementType, products]);

  const selectedProduct = products.find((p) => p.id === Number(productId));
  const qtyNumber = parseInt(quantity, 10) || 0;
  const currentStock = selectedProduct ? selectedProduct.stockQuantity : 0;
  const willExceedStock = movementType === 'StockOut' && qtyNumber > currentStock;
  const calculatedBalanceAfter =
    selectedProduct
      ? movementType === 'StockIn'
        ? currentStock + qtyNumber
        : Math.max(0, currentStock - qtyNumber)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError('Please select a product.');
      return;
    }
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    if (willExceedStock) {
      setError(
        `Cannot stock out ${qtyNumber} units. Only ${currentStock} available in inventory.`
      );
      return;
    }

    try {
      await recordMovement({
        productId: Number(productId),
        movementType,
        quantity: qtyNumber,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record movement.');
    }
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.sku}) — ${p.stockQuantity} in stock`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Movement"
      subtitle="Stock In will increase inventory balance; Stock Out will safely decrement it."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <Select
          label="Product"
          required
          options={productOptions}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setError(null);
          }}
          placeholder="-- Select a Product --"
        />

        {/* Movement Type Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Movement Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMovementType('StockIn');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                movementType === 'StockIn'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Stock In (+)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMovementType('StockOut');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                movementType === 'StockOut'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              <span>Stock Out (-)</span>
            </button>
          </div>
        </div>

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          min="1"
          step="1"
          required
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            setError(null);
          }}
        />

        {/* Real-time Calculation Card */}
        {selectedProduct && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Current Stock:</span>{' '}
              <span className="font-bold text-slate-800">{currentStock} units</span>
            </div>
            <div className="text-slate-400">→</div>
            <div>
              <span className="text-slate-500">Projected Balance:</span>{' '}
              <span
                className={`font-bold ${
                  willExceedStock ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {calculatedBalanceAfter} units
              </span>
            </div>
          </div>
        )}

        {/* Real-time Warning for Negative Balance */}
        {willExceedStock && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <strong>Insufficient Stock:</strong> You cannot withdraw {qtyNumber} units because
              only {currentStock} are available.
            </div>
          </div>
        )}

        {/* Remarks / Reason */}
        <Input
          label="Remarks / Reference (Optional)"
          placeholder="e.g., Supplier Batch #992, Client Order #1004"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        {/* Error message */}
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isRecording}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isRecording}
            disabled={willExceedStock || !productId}
          >
            Confirm Movement
          </Button>
        </div>
      </form>
    </Modal>
  );
};
