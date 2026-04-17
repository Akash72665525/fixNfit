# FixNFit Co. - Complete Setup Guide

## Prerequisites

- Node.js v16 or higher
- MongoDB installed (local or Atlas)
- npm or yarn
- Git (optional)

## Step-by-Step Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` file with your values:
```
MONGODB_URI=mongodb://localhost:27017/fixnfit_ecommerce
JWT_SECRET=your_secret_key_min_32_characters
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 3. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string
```

### 4. Start Backend Server

```bash
npm start
# Server runs on http://localhost:5000
```

### 5. Frontend Setup

Open new terminal:
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

## Creating Admin User

Use MongoDB:
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@fixnfit.com",
  password: "$2a$10$...",  // Hashed password
  role: "admin"
})
```

Or register normally and update role in database.

## Testing

1. Open http://localhost:3000
2. Register a new account
3. Browse products
4. Add to cart
5. Complete checkout

## Production Deployment

### Backend (Heroku/Railway)
```bash
git init
git add .
git commit -m "Initial commit"
# Deploy to your platform
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**MongoDB connection error:**
- Check if MongoDB is running
- Verify connection string

**CORS errors:**
- Check FRONTEND_URL in backend .env
- Verify proxy in frontend package.json

## Support

Email: support@fixnfit.com
