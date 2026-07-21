import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationInfo } from '../../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  const range = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number;

  for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
    range.push(i);
  }

  if (range[0] - 1 === 1) {
    range.unshift(1);
  } else {
    range.unshift(1);
    if (range[1] - 1 > 1) rangeWithDots.push(1, '...');
    else rangeWithDots.push(1);
  }

  if (totalPages - range[range.length - 1] === 1) {
    range.push(totalPages);
  } else {
    if (totalPages - range[range.length - 1] > 1) {
      range.push(totalPages);
      rangeWithDots.push(...range.slice(1), '...', totalPages);
    } else {
      range.push(totalPages);
      rangeWithDots.push(...range.slice(1));
    }
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-slate-500">
        Affichage de <span className="font-medium text-slate-700">{startItem}</span> à{' '}
        <span className="font-medium text-slate-700">{endItem}</span> sur{' '}
        <span className="font-medium text-slate-700">{total}</span> résultats
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="btn btn-ghost p-2 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="btn btn-ghost p-2 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
