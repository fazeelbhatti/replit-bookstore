import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useSearch } from "@/hooks/use-search";
import MobileMenu from "./mobile-menu";
import CartSidebar from "../cart/cart-sidebar";

export default function Header() {
  const [location, navigate] = useLocation();
  const { cart } = useCart();
  const { searchQuery, setSearchQuery, handleSearch } = useSearch();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    if (showCart) setShowCart(false);
  };
  
  const toggleCart = () => {
    setShowCart(!showCart);
    if (showMobileMenu) setShowMobileMenu(false);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
    if (location !== "/") {
      navigate("/");
    }
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">BookHaven</span>
        </Link>
        
        {/* Search bar (desktop) */}
        <div className="hidden md:block w-1/2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              className="w-full py-2 px-4 pr-10 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
            >
              <i className="fas fa-search text-gray-500"></i>
            </Button>
          </form>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link href="/?category=all" className="hidden md:block text-gray-600 hover:text-primary transition-colors">
            Categories
          </Link>
          <Link href="/?sort=newest" className="hidden md:block text-gray-600 hover:text-primary transition-colors">
            New Arrivals
          </Link>
          <Link href="/" className="hidden md:block text-gray-600 hover:text-primary transition-colors">
            Best Sellers
          </Link>
          
          {/* Cart button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative"
          >
            <i className="fas fa-shopping-cart text-xl"></i>
            {cart.items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </Button>
          
          {/* Account */}
          <Button
            variant="ghost"
            size="icon"
            className="md:flex items-center text-gray-700 hover:text-primary hidden"
          >
            <i className="fas fa-user text-xl"></i>
          </Button>
          
          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700"
          >
            <i className="fas fa-bars text-xl"></i>
          </Button>
        </nav>
      </div>
      
      {/* Search bar (mobile) */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="text"
            placeholder="Search books..."
            className="w-full py-2 px-4 pr-10 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
          >
            <i className="fas fa-search text-gray-500"></i>
          </Button>
        </form>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu show={showMobileMenu} toggleMenu={toggleMobileMenu} />
      
      {/* Cart Sidebar */}
      <CartSidebar show={showCart} toggleCart={toggleCart} />
    </header>
  );
}
