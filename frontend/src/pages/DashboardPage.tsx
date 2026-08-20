import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MovementBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { QuickMovementModal } from '../components/inventory/QuickMovementModal';
import { QuickProductModal } from '../components/products/QuickProductModal';
import {
  Boxes,
  FolderTree,
  PackageCheck,
  AlertTriangle,
  ArrowLeftRight,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { summary, isLoading, error } = useDashboard();

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedAnalyticsCatId, setSelectedAnalyticsCatId] = useState<string>('all');

  if (isLoading) {
    return <LoadingSpinner text="Crunching inventory analytics..." size="lg" />;
  }

  if (error || !summary) {
    return (
      <div className="p-8 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-center">
        <p className="font-bold">Failed to load dashboard metrics</p>
        <p className="text-xs text-rose-600 mt-1">{(error as Error)?.message}</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Products',
      value: summary.totalProducts,
      subtitle: `Across ${summary.totalCategories} active categories`,
      icon: Boxes,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Total Stock Units',
      value: summary.totalStockUnits.toLocaleString(),
      subtitle: `Est. value: ${formatCurrency(summary.totalInventoryValue)}`,
      icon: PackageCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Units Sold (Outbound)',
      value: (summary.totalUnitsSold || 0).toLocaleString(),
      subtitle: `Sales: ${formatCurrency(summary.totalRevenueSold || 0)}`,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Low Stock Alerts',
      value: summary.lowStockCount,
      subtitle: 'Items at or below threshold',
      icon: AlertTriangle,
      color: summary.lowStockCount > 0 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-50 border-slate-200',
      badge: summary.lowStockCount > 0 ? 'Action Recommended' : 'Optimal',
      badgeColor: summary.lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
    },
  ];

  // Filter top selling products by selected category tab
  const topSellers = (summary.topSellingProducts || []).filter((p) => {
    if (selectedAnalyticsCatId === 'all') return true;
    return p.categoryId === Number(selectedAnalyticsCatId);
  });

  const maxUnitsSold = topSellers.length > 0 ? Math.max(...topSellers.map((p) => p.unitsSold)) : 1;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 text-white shadow-xl shadow-slate-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Inventory Health & Audit Ready
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Operations & Stock Overview
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Monitor real-time product quantities, track multi-channel stock in/out transactions, and prevent stockouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button
            variant="secondary"
            className="border border-slate-700/90 hover:border-slate-600 bg-slate-800/90 hover:bg-slate-750 text-white shadow-md hover:shadow-lg transition-all"
            leftIcon={<ArrowLeftRight className="w-4 h-4 text-emerald-400" />}
            onClick={() => setIsMovementModalOpen(true)}
          >
            Record Movement
          </Button>
          <Button
            variant="primary"
            className="shadow-md hover:shadow-lg transition-all"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsProductModalOpen(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{kpi.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{kpi.subtitle}</p>
                </div>
                <div className={`p-3 rounded-2xl border ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {kpi.badge && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.badgeColor}`}>
                    {kpi.badge}
                  </span>
                  <Link to="/products" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5">
                    View list <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 🚀 Top Items Sold & Bestseller Analytics Section */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bestseller Items & Sales Analytics</h3>
              <p className="text-xs text-slate-500 font-normal">Top products ranked by total outbound sales units</p>
            </div>
          </div>
        }
        action={
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedAnalyticsCatId('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedAnalyticsCatId === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {summary.categoryDistribution.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setSelectedAnalyticsCatId(String(cat.categoryId))}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedAnalyticsCatId === String(cat.categoryId)
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.categoryName}
              </button>
            ))}
          </div>
        }
      >
        {topSellers.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No stock out sales recorded for this category yet. Record a "Stock Out" movement to see bestsellers here!
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {topSellers.map((item, idx) => {
              const percentage = Math.round((item.unitsSold / maxUnitsSold) * 100);
              const rankBadge =
                idx === 0
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : idx === 1
                  ? 'bg-slate-200 text-slate-700 border-slate-300'
                  : idx === 2
                  ? 'bg-orange-100 text-orange-800 border-orange-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <div key={item.productId} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${rankBadge}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{item.productName}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {item.productSku}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 font-semibold">
                            <Tag className="w-2.5 h-2.5" />
                            {item.categoryName}
                          </span>
                          <span>•</span>
                          <span>Unit Price: <strong>{formatCurrency(item.price)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:text-right gap-4 sm:gap-6 ml-9 sm:ml-0 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Units Sold</span>
                        <span className="font-black text-slate-900 text-sm">{item.unitsSold} units</span>
                      </div>
                      <div className="border-l border-slate-200 pl-4 sm:pl-6">
                        <span className="text-slate-500 block text-[11px]">Sales Revenue</span>
                        <span className="font-black text-emerald-700 text-sm font-mono">{formatCurrency(item.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden ml-9 sm:ml-0 max-w-[calc(100%-2.25rem)] sm:max-w-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 transition-all duration-700"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Two Columns: Category Stock Distribution & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <Card
            title="Stock Units by Category"
            subtitle="Distribution of current inventory units"
            action={
              <Link to="/categories" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Manage Categories →
              </Link>
            }
          >
            <div className="space-y-4">
              {summary.categoryDistribution.map((cat) => {
                const percentage =
                  summary.totalStockUnits > 0
                    ? Math.round((cat.totalUnits / summary.totalStockUnits) * 100)
                    : 0;

                return (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.categoryName}</span>
                      <span className="text-slate-500 font-medium">
                        {cat.totalUnits} units ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card
            title="Recent Stock Movements"
            subtitle="Latest audit records of stock in and stock out operations"
            noPadding
            action={
              <Link to="/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View Full Audit Log →
              </Link>
            }
          >
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Balance After</th>
                    <th className="py-3 px-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.recentMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="font-semibold text-slate-800 line-clamp-1">{m.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{m.productSku}</div>
                      </td>
                      <td className="py-3 px-3">
                        <MovementBadge type={m.movementType} />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {m.movementType === 'StockIn' ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                        {m.balanceAfter}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatDateTime(m.timestamp)}
                      </td>
                    </tr>
                  ))}
                  {summary.recentMovements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No transactions recorded yet. Click "Record Movement" above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <QuickMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
      />
      <QuickProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
};
