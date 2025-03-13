import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useLocation } from "wouter";

interface SearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/");
    }
  }, [searchQuery, navigate]);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        handleSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  
  if (context === undefined) {
    // Provide a default implementation if the context is not available
    // This allows components to use the hook without being wrapped in the provider
    const [searchQuery, setSearchQuery] = useState("");
    const [, navigate] = useLocation();
    
    const handleSearch = useCallback(() => {
      if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/");
      }
    }, [searchQuery, navigate]);
    
    return {
      searchQuery,
      setSearchQuery,
      handleSearch,
    };
  }
  
  return context;
}
