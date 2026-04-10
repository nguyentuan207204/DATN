import React from 'react';
import './Pagination.css';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

const Pagination = ({ 
  currentPage, 
  totalCount, 
  pageSize, 
  onPageChange,
  onPageSizeChange 
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (totalCount === 0) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="premium-pagination-container">
      <div className="page-size-selector">
        <span className="selector-label">Hiển thị:</span>
        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="premium-select"
        >
          {[7, 10, 20, 50, 100].map(size => (
            <option key={size} value={size}>{size} dòng</option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button 
            className="pagi-btn" 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
            title="Trang đầu"
          >
            <MdFirstPage />
          </button>
          
          <button 
            className="pagi-btn" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            title="Trang trước"
          >
            <MdChevronLeft />
          </button>

          {getPages().map(page => (
            <button
              key={page}
              className={`pagi-btn page-num ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button 
            className="pagi-btn" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            title="Trang sau"
          >
            <MdChevronRight />
          </button>

          <button 
            className="pagi-btn" 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
            title="Trang cuối"
          >
            <MdLastPage />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
