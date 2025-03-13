import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  showFilters: boolean;
  toggleFilters: () => void;
}

export default function FilterSidebar({ showFilters, toggleFilters }: FilterSidebarProps) {
  const [priceRanges, setPriceRanges] = useState({
    under10: false,
    from10to20: true,
    from20to30: false,
    over30: false,
  });
  
  const [formats, setFormats] = useState({
    hardcover: true,
    paperback: true,
    audiobook: false,
    ebook: false,
  });
  
  const [ratings, setRatings] = useState({
    fiveStars: false,
    fourStars: true,
    threeStars: false,
  });
  
  const [years, setYears] = useState({
    year2023: false,
    year2022: true,
    year2021: false,
    yearBefore: false,
  });
  
  const handlePriceChange = (id: keyof typeof priceRanges) => {
    setPriceRanges(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const handleFormatChange = (id: keyof typeof formats) => {
    setFormats(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const handleRatingChange = (id: keyof typeof ratings) => {
    setRatings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const handleYearChange = (id: keyof typeof years) => {
    setYears(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  return (
    <aside className="w-full md:w-64 lg:w-72 md:mr-8 mb-6 md:mb-0">
      <div className="bg-white rounded-lg shadow-sm p-5 sticky top-20">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Filters</h3>
          <Button
            variant="outline"
            className="md:hidden w-full flex justify-between items-center"
            onClick={toggleFilters}
          >
            <span>Show filters</span>
            <i className={cn(
              "fas fa-chevron",
              showFilters ? "fa-chevron-up" : "fa-chevron-down"
            )}></i>
          </Button>
        </div>
        
        <div className={cn("md:block", showFilters ? "block" : "hidden")}>
          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">Price Range</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="price-under-10" 
                  checked={priceRanges.under10}
                  onCheckedChange={() => handlePriceChange('under10')}
                />
                <label htmlFor="price-under-10" className="ml-2 text-sm">Under $10</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="price-10-20" 
                  checked={priceRanges.from10to20}
                  onCheckedChange={() => handlePriceChange('from10to20')}
                />
                <label htmlFor="price-10-20" className="ml-2 text-sm">$10 - $20</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="price-20-30" 
                  checked={priceRanges.from20to30}
                  onCheckedChange={() => handlePriceChange('from20to30')}
                />
                <label htmlFor="price-20-30" className="ml-2 text-sm">$20 - $30</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="price-over-30" 
                  checked={priceRanges.over30}
                  onCheckedChange={() => handlePriceChange('over30')}
                />
                <label htmlFor="price-over-30" className="ml-2 text-sm">$30+</label>
              </div>
            </div>
          </div>
          
          {/* Format */}
          <div className="mb-6">
            <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">Format</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="format-hardcover" 
                  checked={formats.hardcover}
                  onCheckedChange={() => handleFormatChange('hardcover')}
                />
                <label htmlFor="format-hardcover" className="ml-2 text-sm">Hardcover</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="format-paperback" 
                  checked={formats.paperback}
                  onCheckedChange={() => handleFormatChange('paperback')}
                />
                <label htmlFor="format-paperback" className="ml-2 text-sm">Paperback</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="format-audiobook" 
                  checked={formats.audiobook}
                  onCheckedChange={() => handleFormatChange('audiobook')}
                />
                <label htmlFor="format-audiobook" className="ml-2 text-sm">Audiobook</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="format-ebook" 
                  checked={formats.ebook}
                  onCheckedChange={() => handleFormatChange('ebook')}
                />
                <label htmlFor="format-ebook" className="ml-2 text-sm">E-Book</label>
              </div>
            </div>
          </div>
          
          {/* Customer Rating */}
          <div className="mb-6">
            <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">Customer Rating</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="rating-5" 
                  checked={ratings.fiveStars}
                  onCheckedChange={() => handleRatingChange('fiveStars')}
                />
                <label htmlFor="rating-5" className="ml-2 text-sm flex items-center">
                  <span className="flex text-accent">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </span>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="rating-4" 
                  checked={ratings.fourStars}
                  onCheckedChange={() => handleRatingChange('fourStars')}
                />
                <label htmlFor="rating-4" className="ml-2 text-sm flex items-center">
                  <span className="flex text-accent">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="far fa-star"></i>
                  </span>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="rating-3" 
                  checked={ratings.threeStars}
                  onCheckedChange={() => handleRatingChange('threeStars')}
                />
                <label htmlFor="rating-3" className="ml-2 text-sm flex items-center">
                  <span className="flex text-accent">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="far fa-star"></i>
                    <i className="far fa-star"></i>
                  </span>
                  <span className="ml-1">& Up</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Year of Publication */}
          <div>
            <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">Publication Year</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="year-2023" 
                  checked={years.year2023}
                  onCheckedChange={() => handleYearChange('year2023')}
                />
                <label htmlFor="year-2023" className="ml-2 text-sm">2023</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="year-2022" 
                  checked={years.year2022}
                  onCheckedChange={() => handleYearChange('year2022')}
                />
                <label htmlFor="year-2022" className="ml-2 text-sm">2022</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="year-2021" 
                  checked={years.year2021}
                  onCheckedChange={() => handleYearChange('year2021')}
                />
                <label htmlFor="year-2021" className="ml-2 text-sm">2021</label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="year-before" 
                  checked={years.yearBefore}
                  onCheckedChange={() => handleYearChange('yearBefore')}
                />
                <label htmlFor="year-before" className="ml-2 text-sm">2020 & Earlier</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
