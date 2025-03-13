# Book Haven - Modern E-commerce Bookstore

This is a modern e-commerce bookstore built using React, Express, and the Upstart Commerce Headless API. Book Haven offers a comprehensive online shopping experience for book lovers, featuring a wide selection of titles across various genres.

## Screenshots

### Home Page
![Home Page](https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=600&fit=crop)

The home page showcases featured books, new releases, and bestsellers with an intuitive interface for browsing the catalog.

### Book Detail
![Book Detail](https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=900&fit=crop)

The book detail page provides comprehensive information about each title, including description, author information, reviews, and pricing details.

### Shopping Cart
![Shopping Cart](https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&h=600&fit=crop)

The cart functionality allows customers to review selected items, adjust quantities, and proceed to checkout.

### Checkout Process
![Checkout](https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&h=600&fit=crop)

A streamlined checkout process with shipping options, payment integration, and order summary.

## Features

- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Product Catalog**: Browse books by category, author, or using the search function
- **Advanced Filtering**: Filter books by price, format, publication year, and more
- **Shopping Cart**: Add, remove, and adjust quantities of items
- **User Accounts**: Create accounts, track order history, and save favorite books
- **Secure Checkout**: Multi-step checkout process with shipping and payment integration
- **Real-time Inventory**: Check availability and stock levels for all products

## Technology Stack

### Frontend
- React
- TypeScript
- TailwindCSS
- Shadcn UI Components
- TanStack Query for data fetching
- Wouter for routing
- React Hook Form for forms

### Backend
- Node.js with Express
- Session management with express-session
- In-memory storage (with option for PostgreSQL integration)
- RESTful API architecture

### External APIs
- Upstart Commerce Headless API for product catalog

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/book-haven.git
cd book-haven
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory with the following variables:
```
UPSTART_API_KEY=your_api_key
UPSTART_API_URL=https://api.upstartcommerce.com/v1
```

4. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:5000

## API Documentation

### Book API
- `GET /api/books` - Get all books with optional filtering
- `GET /api/books/:id` - Get a specific book by ID
- `GET /api/categories` - Get all book categories

### Cart API
- `GET /api/cart` - Get the current user's cart
- `POST /api/cart` - Add an item to the cart
- `PATCH /api/cart/:id` - Update a cart item's quantity
- `DELETE /api/cart/:id` - Remove an item from the cart
- `DELETE /api/cart` - Clear the entire cart

### Checkout API
- `POST /api/checkout` - Process a checkout with shipping and payment information

## Future Enhancements

- User authentication and profile management
- Wish list functionality
- Book recommendations based on purchase history
- Review and rating system
- Advanced search with full-text capabilities
- Integration with additional payment providers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Upstart Commerce for providing the headless commerce API
- The React and Express communities for exceptional documentation
- All contributors who have helped improve this project