import React from 'react';
import { Plus, ArrowLeftRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../common/Button';

export interface HeaderProps {
  onOpenMovementModal?: () => void;
  onOpenProductModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMovementModal,
  onOpenProductModal,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left: Collapse Toggle & System Status */}
      <div className="flex items-center gap-3">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-700" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-3">
        {onOpenMovementModal && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />}
            onClick={onOpenMovementModal}
          >
            Stock In / Out
          </Button>
        )}
        {onOpenProductModal && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenProductModal}
          >
            New Product
          </Button>
        )}
      </div>
    </header>
  );
};
