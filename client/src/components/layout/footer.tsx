import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-lg mb-4">BookHaven</h4>
            <p className="text-gray-400 text-sm mb-4">Your destination for the best books at unbeatable prices.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Pinterest">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Order Status</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Payment Options</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">About Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Subscribe</h4>
            <p className="text-gray-400 text-sm mb-4">Get updates on new releases and exclusive offers.</p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="text-gray-800 w-full rounded-l-md focus:outline-none border-0"
              />
              <Button type="submit" className="rounded-l-none">
                Join
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2023 BookHaven. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
