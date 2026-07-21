import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 32,
  text = 'Chargement...',
  fullPage = false,
}) => {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <Loader2
          className="animate-spin text-blue-600"
          size={size}
        />
        <p className="text-slate-500 text-sm">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="animate-spin text-blue-600" size={size - 8} />
      {text && <span className="text-slate-500 text-sm">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
