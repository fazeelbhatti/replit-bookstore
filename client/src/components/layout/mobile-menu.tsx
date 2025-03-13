import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  show: boolean;
  toggleMenu: () => void;
}

export default function MobileMenu({ show, toggleMenu }: MobileMenuProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-gray-800 bg-opacity-75 z-40",
      show ? "block" : "hidden"
    )}>
      <div className="bg-white h-full w-3/4 max-w-xs p-5 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-primary">Menu</span>
          <button 
            onClick={toggleMenu}
            aria-label="Close menu"
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <nav className="flex flex-col space-y-4">
          <Link 
            href="/" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md"
            onClick={toggleMenu}
          >
            Home
          </Link>
          <Link 
            href="/?category=all" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md"
            onClick={toggleMenu}
          >
            Categories
          </Link>
          <Link 
            href="/?sort=newest" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md"
            onClick={toggleMenu}
          >
            New Arrivals
          </Link>
          <Link 
            href="/" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md"
            onClick={toggleMenu}
          >
            Best Sellers
          </Link>
          <Link 
            href="#" 
            className="py-2 px-4 hover:bg-gray-100 rounded-md"
            onClick={toggleMenu}
          >
            My Account
          </Link>
        </nav>
      </div>
    </div>
  );
}
