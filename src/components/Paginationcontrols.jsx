import React from "react"

const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    isLoading 
  }) => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const leftOffset = Math.floor(maxVisiblePages / 2);
        let start = currentPage - leftOffset;
        let end = currentPage + leftOffset;
        
        if (start < 1) {
          start = 1;
          end = maxVisiblePages;
        }
        
        if (end > totalPages) {
          end = totalPages;
          start = totalPages - maxVisiblePages + 1;
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };
  
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-sm text-gray-600 ">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            aria-label="First page"
          >
            «
          </button>
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            aria-label="Previous page"
          >
            ‹
          </button>
          
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`w-10 h-10 rounded-md ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'border hover:bg-gray-100'
              }`}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            aria-label="Next page"
          >
            ›
          </button>
          
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors"
            aria-label="Last page"
          >
            »
          </button>
        </div>
        
        <div className="flex items-center gap-2 ">
          <span className="text-sm md:hidden">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={isLoading}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {[10, 20, 50,100,500,1000,1500,3000].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };



export default PaginationControls