# FixNFit Co. - Complete E-commerce Platform
## Air Cooler Spare Parts Store

A full-stack MERN e-commerce application with separate pages for all features.

---

## 📁 Complete Directory Structure

```
fixnfit-complete/
│
├── backend/                              # Node.js + Express Backend
│   ├── config/
│   │   └── database.js                   # MongoDB connection configuration
│   │
│   ├── models/
│   │   ├── User.js                       # User schema (auth, cart, orders)
│   │   ├── Product.js                    # Product schema (12 categories)
│   │   └── Order.js                      # Order schema (tracking, status)
│   │
│   ├── routes/
│   │   ├── auth.js                       # Login, Register, Password update
│   │   ├── products.js                   # CRUD, Reviews, Categories, Search
│   │   ├── orders.js                     # Create, Track, Update, Cancel orders
│   │   ├── users.js                      # Profile, Cart management
│   │   └── payment.js                    # Razorpay & Stripe integration
│   │
│   ├── middleware/
│   │   ├── auth.js                       # JWT authentication & authorization
│   │   └── error.js                      # Error handling middleware
│   │
│   ├── controllers/                      # (Optional) Business logic layer
│   │
│   ├── .env.example                      # Environment variables template
│   ├── package.json                      # Backend dependencies
│   └── server.js                         # Main server entry point
│
├── frontend/                             # React Frontend Application
│   ├── public/
│   │   ├── index.html                    # HTML template
│   │   └── favicon.ico                   # Site icon
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx            # Navigation header
│   │   │   │   ├── Footer.jsx            # Site footer
│   │   │   │   ├── Navbar.jsx            # Main navigation
│   │   │   │   ├── Loader.jsx            # Loading spinner
│   │   │   │   └── ErrorBoundary.jsx     # Error handling component
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.jsx       # Individual product display
│   │   │   │   ├── ProductList.jsx       # Products grid/list
│   │   │   │   ├── ProductDetail.jsx     # Single product page
│   │   │   │   ├── ProductFilters.jsx    # Category/price filters
│   │   │   │   └── ProductReviews.jsx    # Reviews section
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.jsx          # Single cart item
│   │   │   │   ├── CartSummary.jsx       # Cart totals
│   │   │   │   └── CartSidebar.jsx       # Slide-out cart
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx         # Login page
│   │   │   │   ├── RegisterForm.jsx      # Registration page
│   │   │   │   └── PrivateRoute.jsx      # Protected route wrapper
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx    # Admin overview
│   │   │   │   ├── ProductManagement.jsx # Add/Edit products
│   │   │   │   ├── OrderManagement.jsx   # Manage orders
│   │   │   │   └── UserManagement.jsx    # View users
│   │   │   │
│   │   │   └── profile/
│   │   │       ├── ProfilePage.jsx       # User profile
│   │   │       ├── OrderHistory.jsx      # Past orders
│   │   │       └── AddressForm.jsx       # Shipping address
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Landing page
│   │   │   ├── ProductsPage.jsx          # All products page
│   │   │   ├── ProductDetailsPage.jsx    # Single product view
│   │   │   ├── CartPage.jsx              # Shopping cart page
│   │   │   ├── CheckoutPage.jsx          # Checkout process
│   │   │   ├── OrderConfirmation.jsx     # Order success page
│   │   │   ├── ProfilePage.jsx           # User dashboard
│   │   │   ├── OrderTrackingPage.jsx     # Track order
│   │   │   ├── AboutPage.jsx             # About us
│   │   │   ├── ContactPage.jsx           # Contact form
│   │   │   └── NotFoundPage.jsx          # 404 error page
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # User authentication state
│   │   │   ├── CartContext.jsx           # Shopping cart state
│   │   │   └── ProductContext.jsx        # Products state
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                    # Axios configuration
│   │   │   ├── authService.js            # Auth API calls
│   │   │   ├── productService.js         # Product API calls
│   │   │   ├── orderService.js           # Order API calls
│   │   │   └── paymentService.js         # Payment API calls
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js             # Price, date formatting
│   │   │   ├── validators.js             # Form validation
│   │   │   └── constants.js              # App constants
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css                 # Global styles
│   │   │   ├── variables.css             # CSS variables (colors)
│   │   │   └── components.css            # Component styles
│   │   │
│   │   ├── App.jsx                       # Main app component
│   │   └── index.jsx                     # React entry point
│   │
│   └── package.json                      # Frontend dependencies
│
├── README.md                             # This file
└── SETUP_GUIDE.md                        # Detailed setup instructions
```

---

## 🎯 Key Features

### Customer Features
✅ **Browse Products** - 12 categories of air cooler spare parts
✅ **Search & Filter** - Find products by name, category, price
✅ **Shopping Cart** - Add, remove, update quantities
✅ **User Authentication** - Register, login, password management
✅ **Order Management** - Place orders, track status
✅ **Multiple Payment Options** - Razorpay, Stripe, Cash on Delivery
✅ **Product Reviews** - Rate and review products
✅ **Profile Management** - Update personal information
✅ **Order History** - View past purchases

### Admin Features
✅ **Product Management** - Add, edit, delete products
✅ **Order Management** - View, update order status
✅ **User Management** - View customer list
✅ **Inventory Control** - Track stock levels
✅ **Dashboard Analytics** - Sales and order statistics

---

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Razorpay** - Payment gateway (India)
- **Stripe** - Payment gateway (International)

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Hot Toast** - Notifications

---

## ⚙️ Environment Variables

Create `.env` file in backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fixnfit_ecommerce
JWT_SECRET=your_jwt_secret_min_32_characters
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- MongoDB installed and running
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📱 Page Routes

### Public Routes
- `/` - Home page
- `/products` - Products listing
- `/products/:id` - Product details
- `/login` - Login page
- `/register` - Registration page
- `/about` - About us
- `/contact` - Contact page

### Protected Routes (Require Login)
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/profile` - User profile
- `/orders` - Order history
- `/orders/:id` - Order tracking

### Admin Routes (Require Admin Role)
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/users` - User management

---

## 🗄️ Database Models

### User Model
```javascript
{
  name, email, password (hashed),
  phone, address, role (customer/admin),
  cart: [{ product, quantity }],
  orders: [Order references],
  wishlist: [Product references]
}
```

### Product Model
```javascript
{
  name, description, category,
  price, originalPrice, discount,
  brand, compatibility, stock, sku,
  images, specifications, warranty,
  ratings: { average, count },
  reviews: [{ user, rating, comment }],
  isFeatured, isActive
}
```

### Order Model
```javascript
{
  orderNumber (auto-generated),
  user, items: [{ product, quantity, price }],
  shippingAddress, paymentMethod, paymentStatus,
  orderStatus (pending → confirmed → processing → shipped → delivered),
  statusHistory: [{ status, timestamp, note }],
  subtotal, shippingCost, tax, discount, total,
  trackingNumber, estimatedDelivery, deliveredAt
}
```

---

## 🎨 Color Scheme
- Primary: `#ff6b35` (Orange)
- Secondary: `#ff8c5f` (Light Orange)
- Background: `#ffffff` (White)
- Text: `#212529` (Dark Gray)

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Update password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get categories
- `GET /api/products/featured` - Get featured products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/cart` - Get cart
- `POST /api/users/cart` - Add to cart
- `PUT /api/users/cart/:productId` - Update cart item
- `DELETE /api/users/cart/:productId` - Remove from cart
- `GET /api/users` - Get all users (Admin)

### Payment
- `POST /api/payment/razorpay/create-order` - Create Razorpay order
- `POST /api/payment/razorpay/verify` - Verify payment
- `POST /api/payment/stripe/create-intent` - Create Stripe intent

---

## 📦 Product Categories

1. Cooling Pads
2. Water Pumps
3. Motors
4. Fans & Blowers
5. Remote Controls
6. Castor Wheels
7. Filters
8. Water Level Indicators
9. Switches & Buttons
10. Cooler Bodies
11. Ice Chambers
12. Other Parts

---

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication (30-day expiry)
- Protected API routes
- Input validation and sanitization
- XSS protection
- CORS configuration
- Admin role-based access control

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Payment gateway integration
- [ ] Order tracking
- [ ] Admin product management
- [ ] Admin order management

---

## 📈 Future Enhancements

- Email notifications for orders
- Wishlist functionality
- Product comparisons
- Advanced search with filters
- Customer support chat
- Mobile app (React Native)
- Multi-language support
- Inventory alerts
- Sales analytics dashboard
- Promotional codes/coupons

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Ensure MongoDB is running
sudo systemctl start mongod
# Or start MongoDB manually
mongod --dbpath /path/to/data
```

**Port Already in Use**
```bash
# Change PORT in .env file
# Or kill process using port
lsof -ti:5000 | xargs kill -9
```

**CORS Errors**
- Check FRONTEND_URL in backend .env
- Ensure proxy is set in frontend package.json

---

## 📞 Support

For issues or questions:
- Email: support@fixnfit.com
- Phone: +91 12345 67890

---

## 👨‍💻 Development Team

Created for **FixNFit Co.**

---

## 📄 License

© 2026 FixNFit Co. All rights reserved.

---

## 🎉 Ready to Launch!

1. Setup database
2. Configure environment variables
3. Install dependencies (backend & frontend)
4. Start both servers
5. Access http://localhost:3000
6. Create admin account
7. Add products
8. Start selling!

**Happy Coding! 🚀**
