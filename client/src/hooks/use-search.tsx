import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useLocation } from "wouter";
import { type FilterState, type UpstartSearchFacet } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

interface SearchContextProps {
  // Basic search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  
  // Advanced search
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  
  // Facets
  facets: UpstartSearchFacet[];
  isFacetsLoading: boolean;
  
  // Sorting
  sortBy: string;
  setSortBy: (sort: string) => void;
  
  // Navigation
  navigateToSearch: (params?: Record<string, string | string[]>) => void;
  
  // Clear
  clearAllFilters: () => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

// Default search filters
const defaultFilters: FilterState = {
  categories: [],
  priceRange: {},
  format: [],
  rating: null,
  publicationYear: []
};

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("relevance");
  const [, navigate] = useLocation();
  
  // Fetch available facets
  const { data: facetsData, isLoading: isFacetsLoading } = useQuery({
    queryKey: ['/api/search/facets'],
    queryFn: getQueryFn({
      on401: "returnNull"
    }),
    staleTime: 5 * 60 * 1000, // Cache facets for 5 minutes
  });
  
  // Update individual filter
  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSortBy("relevance");
  }, []);
  
  // Basic search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigateToSearch({ q: searchQuery.trim() });
    } else {
      navigate("/");
    }
  }, [searchQuery]);
  
  // Navigate to search page with params
  const navigateToSearch = useCallback((params: Record<string, string | string[]> = {}) => {
    // Build search URL with active filters
    const searchParams = new URLSearchParams();
    
    // Add query if exists
    if (searchQuery && !params.q) {
      searchParams.append('q', searchQuery);
    }
    
    // Add all params
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    // Add active filters if not already in params
    if (filters.categories.length > 0 && !params.category) {
      filters.categories.forEach(category => {
        searchParams.append('category', category);
      });
    }
    
    if (filters.priceRange.min !== undefined && !params.minPrice) {
      searchParams.append('minPrice', filters.priceRange.min.toString());
    }
    
    if (filters.priceRange.max !== undefined && !params.maxPrice) {
      searchParams.append('maxPrice', filters.priceRange.max.toString());
    }
    
    if (filters.format.length > 0 && !params.format) {
      filters.format.forEach(format => {
        searchParams.append('format', format);
      });
    }
    
    if (filters.rating !== null && !params.rating) {
      searchParams.append('rating', filters.rating.toString());
    }
    
    if (filters.publicationYear.length > 0 && !params.year) {
      filters.publicationYear.forEach(year => {
        searchParams.append('year', year.toString());
      });
    }
    
    // Add sort if not default
    if (sortBy !== 'relevance' && !params.sort) {
      searchParams.append('sort', sortBy);
    }
    
    // Navigate to search page
    const searchUrl = `/search?${searchParams.toString()}`;
    navigate(searchUrl);
  }, [navigate, searchQuery, filters, sortBy]);
  
  // Parse URL params to set initial state
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    // Parse search query
    const queryParam = params.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    
    // Parse filters
    const newFilters: FilterState = { ...defaultFilters };
    
    // Categories
    const categories = params.getAll('category');
    if (categories.length > 0) {
      newFilters.categories = categories;
    }
    
    // Price range
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');
    if (minPrice || maxPrice) {
      newFilters.priceRange = {
        ...(minPrice ? { min: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { max: parseFloat(maxPrice) } : {})
      };
    }
    
    // Format
    const formats = params.getAll('format');
    if (formats.length > 0) {
      newFilters.format = formats;
    }
    
    // Rating
    const rating = params.get('rating');
    if (rating) {
      newFilters.rating = parseFloat(rating);
    }
    
    // Publication year
    const years = params.getAll('year');
    if (years.length > 0) {
      newFilters.publicationYear = years.map(year => parseInt(year));
    }
    
    // Update state with parsed filters
    setFilters(newFilters);
    
    // Parse sort
    const sort = params.get('sort');
    if (sort) {
      setSortBy(sort);
    }
  }, []);
  
  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        handleSearch,
        filters,
        setFilters,
        updateFilter,
        facets: facetsData?.facets || [],
        isFacetsLoading,
        sortBy,
        setSortBy,
        navigateToSearch,
        clearAllFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  return context;
}
