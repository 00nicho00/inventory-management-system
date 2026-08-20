import React from 'react';
import { MovementType } from '../../types/inventory';
import { ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface StockBadgeProps {
  quantity: number;
  threshold?: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ quantity, threshold = 5 }) => {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
        <XCircle className="w-3.5 h-3.5" />
        Out of Stock (0)
      </span>
    );
  }

  if (quantity <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
        <AlertTriangle className="w-3.5 h-3.5" />
        Low Stock ({quantity})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
      <CheckCircle className="w-3.5 h-3.5" />
      In Stock ({quantity})
    </span>
  );
};

export interface MovementBadgeProps {
  type: MovementType;
}

export const MovementBadge: React.FC<MovementBadgeProps> = ({ type }) => {
  if (type === 'StockIn') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
        Stock In
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
      Stock Out
    </span>
  );
};
