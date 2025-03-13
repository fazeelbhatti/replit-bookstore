import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { type CartItem as CartItemType } from "@shared/types";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItemQuantity, removeCartItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleDecrease = () => {
    if (item.quantity > 1) {
      setIsUpdating(true);
      updateCartItemQuantity(item.id, item.quantity - 1)
        .finally(() => setIsUpdating(false));
    }
  };
  
  const handleIncrease = () => {
    setIsUpdating(true);
    updateCartItemQuantity(item.id, item.quantity + 1)
      .finally(() => setIsUpdating(false));
  };
  
  const handleRemove = () => {
    removeCartItem(item.id);
  };
  
  return (
    <div className="flex items-start py-4 border-b">
      <img 
        src={item.imageUrl} 
        alt={item.title} 
        className="w-16 h-24 object-cover rounded"
      />
      <div className="ml-4 flex-grow">
        <h4 className="font-serif font-medium text-sm">{item.title}</h4>
        <p className="text-sm text-gray-600">{item.author}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-medium text-secondary">${item.price.toFixed(2)}</span>
          <div className="flex items-center border rounded">
            <Button
              variant="ghost" 
              size="sm"
              className="px-2 py-1 h-auto text-sm"
              onClick={handleDecrease}
              disabled={isUpdating || item.quantity <= 1}
            >
              -
            </Button>
            <span className="px-2 py-1 text-sm">
              {isUpdating ? "..." : item.quantity}
            </span>
            <Button
              variant="ghost" 
              size="sm"
              className="px-2 py-1 h-auto text-sm"
              onClick={handleIncrease}
              disabled={isUpdating}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <button 
        className="ml-2 text-gray-400 hover:text-red-500"
        onClick={handleRemove}
        disabled={isUpdating}
        aria-label="Remove item"
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
}
