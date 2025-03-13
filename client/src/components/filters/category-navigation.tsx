import { type UpstartCategory } from "@shared/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryNavigationProps {
  categories: UpstartCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryNavigation({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryNavigationProps) {
  return (
    <section className="mb-8">
      <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
        {categories.length > 0 ? (
          categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className={cn(
                "whitespace-nowrap",
                selectedCategory === category.id 
                  ? "" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              )}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </Button>
          ))
        ) : (
          // Placeholder buttons while loading
          Array(8).fill(0).map((_, index) => (
            <Button
              key={index}
              variant="secondary"
              className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-800 opacity-50"
              disabled
            >
              Category {index + 1}
            </Button>
          ))
        )}
      </div>
    </section>
  );
}
