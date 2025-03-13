import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/ui/hero-section";
import CategoryNavigation from "@/components/filters/category-navigation";
import FilterSidebar from "@/components/filters/filter-sidebar";
import BookGrid from "@/components/books/book-grid";
import { useSearch } from "@/hooks/use-search";

const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "rating", label: "Average Rating" },
];

export default function Home() {
  const { searchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Fetch books with filters
  const { data: booksData, isLoading } = useQuery({
    queryKey: [
      "/api/books", 
      { 
        page: currentPage, 
        limit: 12, 
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy
      }
    ],
  });
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const categories = categoriesData?.categories || [];
  const books = booksData?.books || [];
  const pagination = booksData?.pagination || { totalCount: 0, pageSize: 12, currentPage: 1, totalPages: 1 };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <HeroSection />
      
      <CategoryNavigation 
        categories={categories} 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />
      
      <div className="flex flex-col md:flex-row">
        <FilterSidebar 
          showFilters={showFilters} 
          toggleFilters={toggleFilters}
        />
        
        <div className="flex-grow">
          {/* Sort controls */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {searchQuery 
                ? `Search Results for "${searchQuery}" (${pagination.totalCount})`
                : selectedCategory === "all"
                  ? `Best Sellers (${pagination.totalCount})`
                  : `${categories.find(c => c.id === selectedCategory)?.name || ''} (${pagination.totalCount})`
              }
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2 hidden md:inline">Sort by:</span>
              <select 
                className="border-gray-300 rounded-md text-sm focus:ring-primary focus:border-primary"
                value={sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <BookGrid 
            books={books} 
            isLoading={isLoading} 
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
