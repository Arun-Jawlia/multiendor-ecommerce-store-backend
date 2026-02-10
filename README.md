# 🛒 Multi-Vendor E-Commerce Backend

A **production-ready multi-vendor e-commerce backend** built with **Node.js, Express, and MongoDB**.  
This system supports **users, sellers, carts, orders, payments, messaging, withdrawals, and admin operations**, following a **clean MVC architecture** and real-world commerce workflows.

---

## 🚀 Features

### 👤 User
- User registration with email verification
- Secure login/logout (JWT + HTTP-only cookies)
- Azure authentication support
- Profile update & avatar upload
- Address management
- Password management
- Order history
- Messaging with sellers

### 🏪 Seller / Shop
- Seller registration with email verification
- Seller login/logout
- Shop profile & avatar management
- Product and event management
- Order fulfillment
- Withdraw request system
- Transaction history

### 🛍 Product
- Product creation (multi-image support)
- Shop-based product listing
- Product reviews & ratings
- Stock and sold-out tracking
- Admin product moderation

### 🧺 Cart System
- Persistent cart per user
- Multi-seller cart support
- Quantity updates
- Server-side price protection
- Automatic cart clearing after order

### 📦 Orders
- Order creation from cart only (secure)
- Multi-seller order splitting
- Order lifecycle tracking
- Refund handling
- Seller balance settlement
- Admin order management

### 💳 Payments
- Stripe payment intent integration
- Secure client secret handling

### 💬 Messaging
- User ↔ Seller conversations
- Message support with images
- Conversation tracking

### 💸 Withdrawals
- Seller withdraw requests
- Admin approval flow
- Email notifications
- Seller transaction ledger

### 🛡 Admin
- Full control over users, sellers, products, orders, events, coupons, and withdrawals

---

## 🏗 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Cloudinary** (image storage)
- **Stripe** (payments)
- **Multer** (file uploads)
- **Nodemailer** (emails)

---

## 📁 Project Structure

src/
├── app.js
├── server.js
├── config/
│ ├── ENUM.js
│ └── db.js
├── models/
│ ├── user.model.js
│ ├── shop.model.js
│ ├── product.model.js
│ ├── cart.model.js
│ ├── order.model.js
│ ├── conversation.model.js
│ ├── message.model.js
│ ├── coupon.model.js
│ ├── event.model.js
│ └── withdraw.model.js
├── routes/
│ ├── user.routes.js
│ ├── shop.routes.js
│ ├── product.routes.js
│ ├── cart.routes.js
│ ├── order.routes.js
│ ├── payment.routes.js
│ ├── conversation.routes.js
│ ├── message.routes.js
│ ├── coupon.routes.js
│ ├── event.routes.js
│ └── withdraw.routes.js
├── controllers/
│ ├── user.controllers.js
│ ├── shop.controllers.js
│ ├── product.controllers.js
│ ├── cart.controllers.js
│ ├── order.controllers.js
│ ├── payment.controllers.js
│ ├── conversation.controllers.js
│ ├── message.controllers.js
│ ├── coupon.controllers.js
│ ├── event.controllers.js
│ └── withdraw.controllers.js
├── middleware/
│ ├── auth.js
│ ├── CatchAsyncError.js
│ └── error.js
├── utils/
│ ├── ErrorHandler.js
│ ├── SendToken.js
│ ├── SendShopToken.js
│ ├── SendVerificationEmail.js
│ └── Cloudinary.js



---

### 🛡 Security Highlights
- Password hashing with bcrypt
- JWT + HTTP-only cookies
- Server-side price & stock validation
- Role-based access control
- Centralized error handling
  
---

### 🚧 Future Improvements
- MongoDB transactions for payments & orders
- Redis for cart/session caching
- Socket.IO real-time chat
- Advanced search & filtering
- Pagination across all APIs
- Invoice & reporting system
- Admin analytics dashboard
