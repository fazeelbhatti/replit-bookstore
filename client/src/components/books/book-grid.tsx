import { type UpstartBook } from "@shared/types";
import BookCard from "./book-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface BookGridProps {
  books: UpstartBook[];
  isLoading: boolean;
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function BookGrid({ books, isLoading, pagination, onPageChange }: BookGridProps) {
  const { currentPage, totalPages } = pagination;
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Determine middle range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to show 3 middle pages
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-56 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No books found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
        <Button onClick={() => onPageChange(1)}>Reset Filters</Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm">
            <Button
              variant={currentPage === 1 ? "outline" : "default"}
              className={`rounded-l-md ${currentPage === 1 ? 'text-gray-500' : 'text-white'}`}
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {renderPageNumbers().map((page, index) => (
              page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                <span 
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  className={currentPage === page ? 'bg-primary text-white' : 'bg-white text-gray-500'}
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )
            ))}
            
            <Button
              variant={currentPage === totalPages ? "outline" : "default"}
              className={`rounded-r-md ${currentPage === totalPages ? 'text-gray-500' : 'text-white'}`}
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </>
  );
}
