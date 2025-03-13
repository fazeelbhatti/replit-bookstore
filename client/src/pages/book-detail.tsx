import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";

export default function BookDetail() {
  const [, params] = useRoute("/book/:id");
  const bookId = params?.id;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/books/${bookId}`],
    enabled: !!bookId,
  });
  
  const book = data?.book;
  
  const handleAddToCart = () => {
    if (book) {
      addToCart({
        bookId: book.id,
        quantity
      });
      
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>
            <div className="md:w-2/3">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <Skeleton className="h-10 w-48 mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <p className="mb-6">We couldn't find the book you're looking for.</p>
        <Link href="/">
          <Button>Back to Homepage</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/?category=${book.categories[0]?.id || ''}`} className="hover:text-primary">
            {book.categories[0]?.name || 'Books'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{book.title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Image */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-auto">
              <img 
                src={book.images[0]?.url} 
                alt={book.images[0]?.altText || book.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Book Details */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-serif font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            
            {/* Ratings */}
            <div className="flex items-center mb-4">
              <div className="flex text-accent">
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
              <span className="ml-2 text-gray-500">
                ({book.attributes.reviewCount?.toLocaleString() || 0} reviews)
              </span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <span className="text-2xl font-medium text-secondary">
                ${book.price.amount.toFixed(2)}
              </span>
              {book.price.compareAtAmount && (
                <span className="ml-2 text-gray-500 line-through">
                  ${book.price.compareAtAmount.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Special badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {book.attributes.isBestSeller && (
                <span className="bg-accent text-white text-xs px-2 py-1 rounded-sm">
                  Best Seller
                </span>
              )}
              {book.attributes.isNewRelease && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-sm">
                  New Release
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-sm ${book.inventoryStatus === 'IN_STOCK' 
                ? 'bg-green-100 text-green-800' 
                : book.inventoryStatus === 'LOW_STOCK' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'}`}
              >
                {book.inventoryStatus === 'IN_STOCK' 
                  ? 'In Stock' 
                  : book.inventoryStatus === 'LOW_STOCK' 
                    ? 'Low Stock' 
                    : 'Out of Stock'}
              </span>
            </div>
            
            {/* Book details */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                {book.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Format:</span>
                  <span className="ml-2">{book.attributes.format || 'Paperback'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Publication Year:</span>
                  <span className="ml-2">{book.attributes.publicationYear || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Categories:</span>
                  <span className="ml-2">{book.categories.map(c => c.name).join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2">{book.sku}</span>
                </div>
              </div>
            </div>
            
            {/* Add to cart */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center border rounded">
                <button 
                  className="px-3 py-2 text-gray-500 hover:text-gray-700" 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button 
                  className="px-3 py-2 text-gray-500 hover:text-gray-700" 
                  onClick={increaseQuantity}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <Button 
                onClick={handleAddToCart} 
                className="w-full sm:w-auto px-6"
                disabled={book.inventoryStatus === 'OUT_OF_STOCK'}
              >
                {book.inventoryStatus === 'OUT_OF_STOCK' 
                  ? 'Out of Stock' 
                  : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
