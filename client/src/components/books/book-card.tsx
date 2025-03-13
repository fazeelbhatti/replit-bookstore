import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { type UpstartBook } from "@shared/types";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: UpstartBook;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      bookId: book.id,
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${book.title} has been added to your cart.`,
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/book/${book.id}`} className="block">
        <div className="h-56 overflow-hidden relative">
          <img 
            src={book.images[0]?.url} 
            alt={book.images[0]?.altText || book.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          {(book.attributes.isBestSeller || book.attributes.isNewRelease) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              {book.attributes.isBestSeller && (
                <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-sm">
                  Best Seller
                </span>
              )}
              {book.attributes.isNewRelease && (
                <span className="inline-block bg-emerald-500 text-white text-xs px-2 py-1 rounded-sm ml-2">
                  New Release
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/book/${book.id}`} className="block group-hover:text-primary transition-colors">
          <h3 className="font-serif font-medium text-base">{book.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        <div className="flex items-center mb-3">
          <div className="flex text-accent text-sm">
            {[...Array(5)].map((_, i) => {
              const rating = book.attributes.rating || 0;
              if (i < Math.floor(rating)) {
                return <i key={i} className="fas fa-star"></i>;
              } else if (i === Math.floor(rating) && rating % 1 >= 0.5) {
                return <i key={i} className="fas fa-star-half-alt"></i>;
              } else {
                return <i key={i} className="far fa-star"></i>;
              }
            })}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({book.attributes.reviewCount?.toLocaleString() || 0})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-secondary">${book.price.amount.toFixed(2)}</span>
          <Button 
            size="sm"
            onClick={handleAddToCart}
            disabled={book.inventoryStatus === 'OUT_OF_STOCK'}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
