import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { QuickMovementModal } from '../inventory/QuickMovementModal';
import { QuickProductModal } from '../products/QuickProductModal';

const SIDEBAR_STATE_KEY = 'stockpulse_sidebar_collapsed';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STATE_KEY, String(next));
      } catch (e) {
        console.warn('Could not save sidebar preference:', e);
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          onOpenMovementModal={() => setIsMovementModalOpen(true)}
          onOpenProductModal={() => setIsProductModalOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        
        <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
          <div
            className={`transition-all duration-300 ease-in-out ${
              isCollapsed
                ? 'w-full max-w-[1700px] mx-auto px-8 sm:px-12 py-8 space-y-6'
                : 'max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-6'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Quick Modals */}
      <QuickMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
      />
      <QuickProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
};
