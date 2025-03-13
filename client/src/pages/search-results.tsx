import { useState, useEffect } from "react";
import { useSearch } from "../hooks/use-search";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";
import { type UpstartBook, type UpstartSearchFacet } from "@shared/types";

// Components
import BookCard from "../components/books/book-card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Separator } from "../components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

import { Loader2, SlidersHorizontal, XCircle } from "lucide-react";

export default function SearchResults() {
  const { 
    searchQuery, 
    filters, 
    updateFilter, 
    clearAllFilters, 
    facets, 
    sortBy, 
    setSortBy 
  } = useSearch();
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Parse URL parameters for search
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const rating = searchParams.get('rating');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const formatParam = searchParams.getAll('format');
  const yearParam = searchParams.getAll('year');
  const sort = searchParams.get('sort') || 'relevance';
  
  // Construct the search API URL with parameters
  const searchUrl = new URL('/api/search', window.location.origin);
  if (query) searchUrl.searchParams.append('q', query);
  if (page) searchUrl.searchParams.append('page', page.toString());
  if (category && category !== 'all') searchUrl.searchParams.append('category', category);
  if (rating) searchUrl.searchParams.append('rating', rating);
  if (minPrice) searchUrl.searchParams.append('minPrice', minPrice);
  if (maxPrice) searchUrl.searchParams.append('maxPrice', maxPrice);
  formatParam.forEach(format => searchUrl.searchParams.append('format', format));
  yearParam.forEach(year => searchUrl.searchParams.append('year', year));
  if (sort && sort !== 'relevance') searchUrl.searchParams.append('sort', sort);
  
  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: [searchUrl.toString()],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!query || !!category || formatParam.length > 0 || yearParam.length > 0,
  });
  
  const books: UpstartBook[] = searchResults?.items || [];
  const resultFacets: UpstartSearchFacet[] = searchResults?.facets || [];
  const totalCount = searchResults?.pagination?.totalCount || 0;
  const totalPages = searchResults?.pagination?.totalPages || 0;
  
  // Handle price range changes
  const handlePriceChange = (value: number[]) => {
    updateFilter('priceRange', { min: value[0], max: value[1] });
  };
  
  // Get price range for slider
  const priceRange = resultFacets.find(facet => facet.code === 'price.amount');
  const minPriceValue = filters.priceRange.min || 0;
  const maxPriceValue = filters.priceRange.max || 100; // Default max if not set
  
  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', (page - 1).toString());
      window.history.pushState({}, '', `?${newParams.toString()}`);
      window.location.reload(); // Refresh to apply new params
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', (page + 1).toString());
      window.history.pushState({}, '', `?${newParams.toString()}`);
      window.location.reload(); // Refresh to apply new params
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : 'All Books'}
        </h1>
        <p className="text-gray-500">
          {totalCount} {totalCount === 1 ? 'result' : 'results'} found
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filter button */}
        <div className="lg:hidden flex justify-between mb-4">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                {/* Mobile filter content - same as desktop but in a sheet */}
                <FiltersContent 
                  facets={resultFacets} 
                  filters={filters} 
                  updateFilter={updateFilter}
                  minPrice={minPriceValue}
                  maxPrice={maxPriceValue}
                  handlePriceChange={handlePriceChange}
                />
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      clearAllFilters();
                      setMobileFiltersOpen(false);
                      window.location.href = query ? `/search?q=${query}` : '/search';
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear all filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Sort dropdown - mobile */}
          <Select value={sortBy} onValueChange={(value) => {
            setSortBy(value);
            const newParams = new URLSearchParams(searchParams);
            if (value !== 'relevance') {
              newParams.set('sort', value);
            } else {
              newParams.delete('sort');
            }
            window.history.pushState({}, '', `?${newParams.toString()}`);
            window.location.reload(); // Refresh to apply new params
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Desktop filters sidebar */}
        <div className="hidden lg:block w-1/4 min-w-[250px]">
          <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  clearAllFilters();
                  window.location.href = query ? `/search?q=${query}` : '/search';
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            </div>
            
            <FiltersContent 
              facets={resultFacets} 
              filters={filters} 
              updateFilter={updateFilter}
              minPrice={minPriceValue}
              maxPrice={maxPriceValue}
              handlePriceChange={handlePriceChange}
            />
          </div>
        </div>
        
        {/* Main content area */}
        <div className="lg:w-3/4">
          {/* Desktop sort controls */}
          <div className="hidden lg:flex justify-between items-center mb-6">
            <div>
              <p className="text-sm text-gray-500">
                Showing {books.length > 0 ? (page - 1) * 12 + 1 : 0} - {Math.min(page * 12, totalCount)} of {totalCount} results
              </p>
            </div>
            
            <Select value={sortBy} onValueChange={(value) => {
              setSortBy(value);
              const newParams = new URLSearchParams(searchParams);
              if (value !== 'relevance') {
                newParams.set('sort', value);
              } else {
                newParams.delete('sort');
              }
              window.history.pushState({}, '', `?${newParams.toString()}`);
              window.location.reload(); // Refresh to apply new params
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Search results */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading search results...</span>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-6 rounded-lg text-center">
              <p className="text-destructive font-medium">
                An error occurred while fetching search results.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again or refine your search query.
              </p>
            </div>
          ) : books.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handlePrevPage} 
                      disabled={page === 1}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        // Center current page in pagination
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (page <= 3) {
                          pageNumber = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = page - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={i}
                            onClick={() => {
                              const newParams = new URLSearchParams(searchParams);
                              newParams.set('page', pageNumber.toString());
                              window.history.pushState({}, '', `?${newParams.toString()}`);
                              window.location.reload();
                            }}
                            variant={pageNumber === page ? "default" : "outline"}
                            className="h-10 w-10"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={handleNextPage} 
                      disabled={page === totalPages}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-muted/50 p-12 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Filters content component shared between mobile and desktop
interface FiltersContentProps {
  facets: UpstartSearchFacet[];
  filters: any;
  updateFilter: any;
  minPrice: number;
  maxPrice: number;
  handlePriceChange: (value: number[]) => void;
}

function FiltersContent({ 
  facets, 
  filters, 
  updateFilter, 
  minPrice, 
  maxPrice, 
  handlePriceChange 
}: FiltersContentProps) {
  // Get category facet
  const categoryFacet = facets.find(facet => facet.code === 'category');
  
  // Get format facet
  const formatFacet = facets.find(facet => facet.code === 'attributes.format');
  
  // Get rating facet
  const ratingFacet = facets.find(facet => facet.code === 'attributes.rating');
  
  // Get year facet
  const yearFacet = facets.find(facet => facet.code === 'attributes.publicationYear');
  
  return (
    <div className="space-y-6">
      {/* Categories filter */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-base font-medium">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {categoryFacet?.values.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.value}`} 
                    checked={filters.categories.includes(category.value)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked 
                        ? [...filters.categories, category.value]
                        : filters.categories.filter((c: string) => c !== category.value);
                      
                      updateFilter('categories', newCategories);
                      
                      // Update URL and reload
                      const params = new URLSearchParams(window.location.search);
                      params.delete('category');
                      newCategories.forEach(c => params.append('category', c as string));
                      window.history.pushState({}, '', `?${params.toString()}`);
                      window.location.reload();
                    }}
                  />
                  <Label 
                    htmlFor={`category-${category.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.name} ({category.count})
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Price range filter */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger className="text-base font-medium">
            Price
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="px-2">
                <Slider
                  defaultValue={[minPrice, maxPrice]}
                  max={100}
                  step={1}
                  onValueChange={handlePriceChange}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-muted px-3 py-1 rounded-md">
                  ${minPrice.toFixed(2)}
                </div>
                <div className="bg-muted px-3 py-1 rounded-md">
                  ${maxPrice.toFixed(2)}
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2" 
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('minPrice', minPrice.toString());
                  params.set('maxPrice', maxPrice.toString());
                  window.history.pushState({}, '', `?${params.toString()}`);
                  window.location.reload();
                }}
              >
                Apply Price Filter
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {/* Format filter */}
      {formatFacet && formatFacet.values.length > 0 && (
        <Accordion type="single" collapsible defaultValue="format">
          <AccordionItem value="format">
            <AccordionTrigger className="text-base font-medium">
              Format
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {formatFacet.values.map((format) => (
                  <div key={format.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`format-${format.value}`} 
                      checked={filters.format.includes(format.value)}
                      onCheckedChange={(checked) => {
                        const newFormats = checked 
                          ? [...filters.format, format.value]
                          : filters.format.filter((f: string) => f !== format.value);
                        
                        updateFilter('format', newFormats);
                        
                        // Update URL and reload
                        const params = new URLSearchParams(window.location.search);
                        params.delete('format');
                        newFormats.forEach(f => params.append('format', f as string));
                        window.history.pushState({}, '', `?${params.toString()}`);
                        window.location.reload();
                      }}
                    />
                    <Label 
                      htmlFor={`format-${format.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {format.name} ({format.count})
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {/* Rating filter */}
      {ratingFacet && ratingFacet.values.length > 0 && (
        <Accordion type="single" collapsible defaultValue="rating">
          <AccordionItem value="rating">
            <AccordionTrigger className="text-base font-medium">
              Rating
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <Select 
                  value={filters.rating?.toString() || ""}
                  onValueChange={(value) => {
                    const rating = value ? parseFloat(value) : null;
                    updateFilter('rating', rating);
                    
                    // Update URL and reload
                    const params = new URLSearchParams(window.location.search);
                    if (rating !== null) {
                      params.set('rating', rating.toString());
                    } else {
                      params.delete('rating');
                    }
                    window.history.pushState({}, '', `?${params.toString()}`);
                    window.location.reload();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a minimum rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    {[4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating}+ Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      {/* Publication Year filter */}
      {yearFacet && yearFacet.values.length > 0 && (
        <Accordion type="single" collapsible defaultValue="year">
          <AccordionItem value="year">
            <AccordionTrigger className="text-base font-medium">
              Publication Year
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {yearFacet.values
                  .sort((a, b) => Number(b.value) - Number(a.value)) // Sort years descending
                  .map((year) => (
                    <div key={year.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`year-${year.value}`} 
                        checked={filters.publicationYear.includes(Number(year.value))}
                        onCheckedChange={(checked) => {
                          const newYears = checked 
                            ? [...filters.publicationYear, Number(year.value)]
                            : filters.publicationYear.filter((y: number) => y !== Number(year.value));
                          
                          updateFilter('publicationYear', newYears);
                          
                          // Update URL and reload
                          const params = new URLSearchParams(window.location.search);
                          params.delete('year');
                          newYears.forEach(y => params.append('year', y.toString()));
                          window.history.pushState({}, '', `?${params.toString()}`);
                          window.location.reload();
                        }}
                      />
                      <Label 
                        htmlFor={`year-${year.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {year.value} ({year.count})
                      </Label>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}