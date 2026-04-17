# FixNFit Co. - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All authenticated requests require JWT token in header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

**POST /auth/register**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**POST /auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**GET /auth/me** (Protected)
Returns current user

### Products

**GET /products**
Query params: category, search, minPrice, maxPrice, page, limit

**GET /products/:id**
Get single product

**POST /products** (Admin only)
Create product

**PUT /products/:id** (Admin only)
Update product

**DELETE /products/:id** (Admin only)
Delete product

### Orders

**POST /orders** (Protected)
```json
{
  "items": [{"product": "id", "quantity": 1}],
  "shippingAddress": {...},
  "paymentMethod": "cod"
}
```

**GET /orders/my-orders** (Protected)
Get user orders

**GET /orders/:id** (Protected)
Get order details

### Cart

**GET /users/cart** (Protected)

**POST /users/cart** (Protected)
```json
{
  "productId": "id",
  "quantity": 1
}
```

**PUT /users/cart/:productId** (Protected)
Update quantity

**DELETE /users/cart/:productId** (Protected)
Remove item

### Payment

**POST /payment/razorpay/create-order** (Protected)
```json
{
  "amount": 1000,
  "currency": "INR"
}
```

**POST /payment/razorpay/verify** (Protected)
Verify payment

## Response Format

Success:
```json
{
  "success": true,
  "data": {...}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
