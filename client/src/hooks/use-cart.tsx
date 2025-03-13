import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type CartItem, type Cart } from "@shared/types";

interface CartContextProps {
  cart: Cart;
  isLoading: boolean;
  addToCart: (item: { bookId: string; quantity: number }) => Promise<void>;
  updateCartItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  // Fetch cart data
  const {
    data: cartData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["/api/cart"],
    enabled: initialized,
  });

  const cart: Cart = cartData || { items: [], total: 0 };

  // Initialize cart - need to fetch it on mount to establish session
  useEffect(() => {
    const initCart = async () => {
      try {
        await refetch();
        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      }
    };
    
    initCart();
  }, [refetch]);

  // Add to cart mutation
  const { mutateAsync: addItemMutation } = useMutation({
    mutationFn: (item: { bookId: string; quantity: number }) => {
      return apiRequest("POST", "/api/cart", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Update cart item mutation
  const { mutateAsync: updateItemMutation } = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove cart item mutation
  const { mutateAsync: removeItemMutation } = useMutation({
    mutationFn: (itemId: number) => {
      return apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const { mutateAsync: clearCartMutation } = useMutation({
    mutationFn: () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  // API functions
  const addToCart = async (item: { bookId: string; quantity: number }) => {
    await addItemMutation(item);
  };

  const updateCartItemQuantity = async (itemId: number, quantity: number) => {
    await updateItemMutation({ itemId, quantity });
  };

  const removeCartItem = async (itemId: number) => {
    await removeItemMutation(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateCartItemQuantity,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
