import React, { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useProducts } from '../hooks/useProducts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { MovementBadge } from '../components/common/Badge';
import { QuickMovementModal } from '../components/inventory/QuickMovementModal';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { EmptyState } from '../components/feedback/EmptyState';
import { formatDateTime } from '../utils/formatters';
import { MovementType } from '../types/inventory';
import { ArrowLeftRight, Search, History } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { movements, isLoading } = useInventory();
  const { products } = useProducts();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MovementType>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = movements.filter((m) => {
    if (typeFilter !== 'all' && m.movementType !== typeFilter) return false;
    if (productFilter !== 'all' && m.productId !== Number(productFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.productName.toLowerCase().includes(q) ||
        m.productSku.toLowerCase().includes(q) ||
        (m.remarks && m.remarks.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const productOptions = [
    { value: 'all', label: 'All Products' },
    ...products.map((p) => ({ value: String(p.id), label: `${p.name} (${p.sku})` })),
  ];

  const typeOptions = [
    { value: 'all', label: 'All Movement Types' },
    { value: 'StockIn', label: 'Stock In (+)' },
    { value: 'StockOut', label: 'Stock Out (-)' },
  ];

  if (isLoading && movements.length === 0) {
    return <LoadingSpinner text="Loading inventory movement logs..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory Stock Movements & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable transaction ledger capturing every stock intake and outbound dispatch.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          onClick={() => setModalOpen(true)}
        >
          Record Stock Movement
        </Button>
      </div>

      <Card noPadding className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <Input
              placeholder="Search product name, SKU, or reference..."
              leftIcon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              options={productOptions}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            />
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No movement logs recorded"
          description="Stock movements recorded through the Stock In / Stock Out interface will be listed here chronologically."
          actionText="Record First Movement"
          onAction={() => setModalOpen(true)}
          icon={<History className="w-10 h-10 text-slate-400" />}
        />
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4 text-center">Movement Type</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4 text-center">Balance (Before → After)</th>
                  <th className="py-3.5 px-6">Remarks / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {formatDateTime(m.timestamp)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{m.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{m.productSku}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <MovementBadge type={m.movementType} />
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-base font-mono">
                      <span
                        className={
                          m.movementType === 'StockIn' ? 'text-emerald-600' : 'text-indigo-600'
                        }
                      >
                        {m.movementType === 'StockIn' ? '+' : '-'}
                        {m.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-xs">
                      <span className="text-slate-400">{m.balanceBefore}</span>
                      <span className="text-slate-300 mx-1.5">→</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {m.balanceAfter}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600">
                      {m.remarks || <span className="text-slate-300 italic">No notes</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <QuickMovementModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
