import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import CartItem from "./cart-item";
import { Skeleton } from "@/components/ui/skeleton";

interface CartSidebarProps {
  show: boolean;
  toggleCart: () => void;
}

export default function CartSidebar({ show, toggleCart }: CartSidebarProps) {
  const { cart, isLoading } = useCart();
  
  return (
    <div className={cn(
      "fixed inset-0 bg-gray-800 bg-opacity-75 z-40",
      show ? "block" : "hidden"
    )}>
      <div className="bg-white h-full w-full md:w-96 max-w-md ml-auto p-5 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold">
            Your Cart {!isLoading && `(${cart.items.length})`}
          </span>
          <button 
            onClick={toggleCart}
            aria-label="Close cart"
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <>
              <div className="py-4 border-b">
                <div className="flex items-start">
                  <Skeleton className="w-16 h-24" />
                  <div className="ml-4 flex-grow">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <div className="flex items-center justify-between mt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6 ml-2" />
                </div>
              </div>
              <div className="py-4 border-b">
                <div className="flex items-start">
                  <Skeleton className="w-16 h-24" />
                  <div className="ml-4 flex-grow">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <div className="flex items-center justify-between mt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                  <Skeleton className="w-6 h-6 ml-2" />
                </div>
              </div>
            </>
          ) : cart.items.length > 0 ? (
            cart.items.map(item => (
              <CartItem key={item.id} item={item} />
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <i className="fas fa-shopping-cart text-4xl mb-4 block"></i>
              <p>Your cart is empty</p>
              <Link href="/" onClick={toggleCart}>
                <Button variant="link" className="mt-2">Continue Shopping</Button>
              </Link>
            </div>
          )}
        </div>
        
        {cart.items.length > 0 && (
          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-medium">${cart.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6">
              <span>Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <Link href="/checkout" onClick={toggleCart}>
              <Button className="w-full py-3">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
