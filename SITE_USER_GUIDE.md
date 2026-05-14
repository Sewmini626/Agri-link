# AgriLink User Guide

## Overview
AgriLink is a bundled agricultural marketplace platform with three user interfaces:

- **Buyer/Marketplace frontend** (`frontend`) for customers to browse, search, save, order, and check out products.
- **Seller dashboard** (`frontend` > `/seller-dashboard`) for farmers to manage products, orders, and performance reports.
- **Admin portal** (`admin-frontend`) for administrators to monitor metrics, manage products, orders, and users.

> Screenshots should be placed in the `screenshots/` folder using the file names shown below.

---

## How to run the project

### Backend
1. Open a terminal in `backend`
2. Install PHP dependencies if needed: `composer install`
3. Start the backend server: `php artisan serve`
4. Confirm the API is available at `http://localhost:8000`

### Buyer/Seller Frontend
1. Open a terminal in `frontend`
2. Install Node dependencies: `npm install`
3. Start the development app: `npm run dev`
4. Open the app in the browser, usually at `http://localhost:5173`

### Admin Frontend
1. Open a terminal in `admin-frontend`
2. Install Node dependencies: `npm install`
3. Start the admin app: `npm run dev`
4. Open the admin site in the browser, usually at `http://localhost:4173`

---

## Buyer / Marketplace User Guide

### 1. Home Page
**Route:** `/`

Features:
- Hero welcome section with platform overview
- Quick access buttons to `Marketplace` and `Login`
- Market summary stats and featured product highlights
- Supports multi-language display with Sinhala and English styles

Screenshot placeholder:
- `screenshots/home.png`

### 2. Marketplace
**Route:** `/marketplace`

Features:
- Browse all available agricultural products
- Search products by name or description
- Filter by categories, price range, rating, and region
- Mobile-friendly filter drawer
- Product cards with image, rating, price, and quick actions

Screenshot placeholder:
- `screenshots/marketplace.png`

### 3. Product Details
**Route:** `/product/:id`

Features:
- Detailed product information and images
- Quantity selection before adding to cart
- Add to cart button
- Add product to saved wishlist
- Customer review display and submit review functionality (when logged in)
- Related product details and store information

Screenshot placeholder:
- `screenshots/product-details.png`

### 4. Cart + Checkout
**Route:** `/checkout`

Features:
- Review selected cart items
- Update quantities for cart products
- Complete checkout workflow for placing orders
- Order submission and payment summary

Screenshot placeholder:
- `screenshots/cart-checkout.png`

### 5. Orders
**Route:** `/orders`

Features:
- View the logged-in user’s order history
- Expand orders for details such as status, purchased items, delivery dates, and total price
- Visual order status badges: pending, confirmed, shipped, delivered, cancelled

Screenshot placeholder:
- `screenshots/orders.png`

### 6. Saved / Wishlist
**Route:** `/saved`

Features:
- Saved products list for quick return later
- Remove items from saved list
- Add saved products directly to cart
- Visual product cards with quick actions

Screenshot placeholder:
- `screenshots/saved.png`

### 7. Profile
**Route:** `/profile`

Features:
- User profile access
- Review account details and preferences
- Manage personal information (where available)

Screenshot placeholder:
- `screenshots/profile.png`

### 8. Login / Register
**Routes:** `/login`, `/register`

Features:
- User authentication for buyers and sellers
- Access gated buyer pages such as orders, profile, checkout
- Role-based navigation for farmer accounts

Screenshot placeholders:
- `screenshots/login.png`
- `screenshots/register.png`

---

## Seller Dashboard User Guide

### 1. Seller Dashboard Home
**Route:** `/seller-dashboard`

Features:
- Farmer-specific dashboard layout
- Sidebar navigation for Overview, Products, Orders, Reports
- Protected area that requires authenticated farmer role
- Logout action

Screenshot placeholder:
- `screenshots/seller-dashboard-overview.png`

### 2. Seller Products Management
**Route:** `/seller-dashboard/products`

Features:
- View your listed products
- Manage product inventory and stock levels
- Product summary cards or table view

Screenshot placeholder:
- `screenshots/seller-dashboard-products.png`

### 3. Seller Order Management
**Route:** `/seller-dashboard/orders`

Features:
- Review orders placed for your farm products
- Track buyer orders and fulfillment status
- Quick navigation to order detail information

Screenshot placeholder:
- `screenshots/seller-dashboard-orders.png`

### 4. Reports
**Route:** `/seller-dashboard/reports`

Features:
- View seller performance metrics and reports
- Track orders, revenue, and farm sales trends

Screenshot placeholder:
- `screenshots/seller-dashboard-reports.png`

---

## Admin Portal User Guide

### 1. Admin Login
**Route:** `/login` (admin portal)

Features:
- Admin authentication using email/password
- Protects all admin dashboard pages

Screenshot placeholder:
- `screenshots/admin-login.png`

### 2. Admin Dashboard
**Route:** `/dashboard`

Features:
- Summary cards for total users, active products, total orders, revenue
- Central admin overview of platform health
- Uses aggregated data from API endpoints

Screenshot placeholder:
- `screenshots/admin-dashboard.png`

### 3. Product Management
**Route:** `/products`

Features:
- List all products in the system
- Search products by name or category
- Delete products directly from the table
- View product stock and pricing information

Screenshot placeholder:
- `screenshots/admin-products.png`

### 4. Order Management
**Route:** `/orders`

Features:
- View all orders across the platform
- Order status badge display
- Update order status via admin actions
- Track customer and payment details

Screenshot placeholder:
- `screenshots/admin-orders.png`

### 5. User Management
**Route:** `/users`

Features:
- View all registered users
- Edit user details and roles
- Delete user accounts
- Manage buyer, farmer, and admin roles

Screenshot placeholder:
- `screenshots/admin-users.png`

---

## Screenshot Instructions

1. Create a folder named `screenshots` at the project root.
2. Capture the relevant page screenshots for each section.
3. Save them using the suggested file names above.
4. Replace the placeholders in this guide or add the images to documentation content.

Example:
- `screenshots/home.png`
- `screenshots/marketplace.png`
- `screenshots/product-details.png`
- `screenshots/cart-checkout.png`
- `screenshots/orders.png`
- `screenshots/saved.png`
- `screenshots/profile.png`
- `screenshots/seller-dashboard-overview.png`
- `screenshots/admin-dashboard.png`

---

## Notes

- The buyer frontend and admin frontend are separate apps in this repository.
- The app uses API calls to `http://localhost:8000/api/*` for product, order, and user data.
- If any page shows missing data, verify that the backend server is running and the database is seeded.
- The admin portal requires a stored admin token and user object in `localStorage`.
- The seller dashboard requires a logged-in farmer account in `localStorage`.
