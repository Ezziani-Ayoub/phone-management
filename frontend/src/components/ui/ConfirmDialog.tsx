import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmer',
  variant = 'danger',
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overflowX = originalOverflowX;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              <AlertTriangle
                size={20}
                className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
              disabled={loading}
            >
              {loading ? 'En cours...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
