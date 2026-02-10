🛒 Multi-Vendor E-Commerce Backend

A scalable, production-ready multi-vendor e-commerce backend built with Node.js, Express, MongoDB, supporting users, sellers, carts, orders, payments, messaging, withdrawals, and admin management.

This backend follows a clean MVC architecture, uses JWT authentication, Cloudinary for media, Stripe for payments, and is designed to scale safely for real-world commerce.

🚀 Features
👤 User

User registration with email verification

Secure login & logout (JWT + cookies)

Azure authentication support

User profile & avatar update

Address management

Password change

Order history

Messaging with sellers

🏪 Seller / Shop

Seller registration with email verification

Seller login & logout

Shop profile & avatar

Product & event management

Order fulfillment

Withdraw requests

Transaction history

🛍 Product

Product creation (multi-image support)

Shop-based product listing

Product reviews & ratings

Stock & sold count management

Admin product moderation

🧺 Cart System (NEW)

Per-user persistent cart

Multi-seller cart support

Quantity updates

Server-side price safety

Auto-clear after order

📦 Orders

Order creation from cart

Multi-seller order splitting

Order lifecycle tracking

Refund handling

Seller balance settlement

Admin order oversight

💳 Payments

Stripe payment intent integration

Secure client secret handling

💬 Messaging

User ↔ Seller conversations

Message support with images

Conversation tracking

💸 Withdrawals

Seller withdrawal requests

Admin approval flow

Email notifications

Transaction ledger

🛡 Admin

User, seller, product, order, event, coupon management

Full platform oversight

🏗 Tech Stack
Layer	Technology
Runtime	Node.js
Framework	Express.js
Database	MongoDB (Mongoose)
Auth	JWT (Cookies)
Media	Cloudinary
Payments	Stripe
Email	Nodemailer
Uploads	Multer
Security	bcrypt, HTTP-only cookies
📁 Project Structure
src/
├── app.js
├── server.js
├── config/
│   ├── ENUM.js
│   └── db.js
├── models/
│   ├── user.model.js
│   ├── shop.model.js
│   ├── product.model.js
│   ├── cart.model.js
│   ├── order.model.js
│   ├── conversation.model.js
│   ├── message.model.js
│   ├── coupon.model.js
│   ├── event.model.js
│   └── withdraw.model.js
├── routes/
│   ├── user.routes.js
│   ├── shop.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── payment.routes.js
│   ├── conversation.routes.js
│   ├── message.routes.js
│   ├── coupon.routes.js
│   ├── event.routes.js
│   └── withdraw.routes.js
├── controllers/
│   ├── user.controllers.js
│   ├── shop.controllers.js
│   ├── product.controllers.js
│   ├── cart.controllers.js
│   ├── order.controllers.js
│   ├── payment.controllers.js
│   ├── conversation.controllers.js
│   ├── message.controllers.js
│   ├── coupon.controllers.js
│   ├── event.controllers.js
│   └── withdraw.controllers.js
├── middleware/
│   ├── auth.js
│   ├── CatchAsyncError.js
│   └── error.js
├── utils/
│   ├── ErrorHandler.js
│   ├── SendToken.js
│   ├── SendShopToken.js
│   ├── SendVerificationEmail.js
│   └── Cloudinary.js

🔐 Authentication Flow

JWT stored in HTTP-only cookies

isAuthenticated → User routes

isSellerAuthenticated → Seller routes

isAdmin("Admin") → Admin routes

🧺 Cart → Order Flow (Important)

User adds items to cart

Cart stored securely in DB

Order created from cart only

Orders split per seller

Cart auto-cleared after success

POST /api/v1/cart/add-to-cart
GET  /api/v1/cart/get-cart
POST /api/v1/order/create-order

💳 Payment Flow (Stripe)
POST /api/v1/payment/payment-process
GET  /api/v1/payment/get/stripeapikey


Backend creates payment intent

Frontend confirms payment

Order finalized after success

⚙️ Environment Variables

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret
ACTIVATION_SECRET=your_activation_secret

CLOUDINARY_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_API_KEY=pk_test_xxxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password

CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

▶️ Run Locally
npm install
npm run dev


or

npm start

🧪 API Conventions

REST-based endpoints

Consistent HTTP status codes

Centralized error handling

Async/await everywhere

No controller logic in routes

🛡 Security Measures

Password hashing (bcrypt)

JWT + cookies

Server-side price validation

Stock integrity checks

Role-based access control

Cloudinary media isolation

🚧 Future Enhancements

MongoDB transactions (ACID)

Redis cart/session cache

Socket.IO real-time chat

Search & filtering

Pagination everywhere

Invoice generation

Admin analytics dashboard

📌 Final Notes

✔ Clean MVC architecture
✔ Production-safe async handling
✔ Fully modular & scalable
✔ No controller leakage into routes
✔ Cart system fully integrated
