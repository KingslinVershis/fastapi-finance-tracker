import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './TransactionTable.css';

export const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="tx-pagination">
      <span className="tx-pagination-info">
        Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems}{' '}
        transactions)
      </span>
      <div className="tx-pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-sm"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary btn-sm"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
