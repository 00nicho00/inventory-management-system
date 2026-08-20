import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading inventory data...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3">
      <Loader2 className={`animate-spin text-emerald-600 ${sizeClasses[size]}`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};
