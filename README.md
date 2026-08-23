# The Artline

A MERN-stack art marketplace where collectors browse and buy original artwork, and artists list, sell, and fulfill orders for their own pieces.

## Project Type

MERN Fullstack (MongoDB, Express, React, Node.js)

## Tech Stack

- **Frontend:** React (Vite), React Router, Chakra UI
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT, bcrypt
- **Payments:** Razorpay
- **Images:** Cloudinary
- **Email:** Nodemailer (Gmail SMTP)

## Features

**For collectors**
- Browse by category with infinite scroll, filters (category, artist, price), and search
- Guest cart (localStorage) that merges into your account on login
- Checkout with saved addresses, delivery instructions, and Razorpay payment
- Order tracking through paid → processing → shipped → delivered, with cancellation while still early
- Wishlist across every listing page
- Reviews — unlocked once an order is actually delivered
- Profile picture upload, account settings, password reset via emailed OTP

**For artists**
- Add/edit/delete listings with category, price, dimensions, and stock
- Sales dashboard: revenue, units sold, and per-order fulfillment (advance status, see buyer shipping details)
- Public per-artist storefront page

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A [Cloudinary](https://cloudinary.com) account (image uploads)
- A [Razorpay](https://dashboard.razorpay.com) account (test mode is fine)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for OTP/order emails — requires 2-Step Verification enabled)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
PORT=3000
MONGO_URL=<your MongoDB connection string>
SECRET_KEY=<a long random string, used to sign JWTs>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_MAIL=<your gmail address>
SMTP_PASSWORD=<gmail app password>

RAZORPAY_KEY_ID=<from Razorpay dashboard>
RAZORPAY_KEY_SECRET=<from Razorpay dashboard>

# Optional, production only — comma-separated allowed frontend origins.
# Leave unset in development to allow all origins.
# CORS_ORIGIN=https://your-frontend-domain.com
```

```bash
npm run server
```

Optionally seed the database with a real, license-verified art catalog sourced from Wikimedia Commons:

```bash
node scripts/seed.js
```

### Frontend

```bash
cd frontend/ArtGallary
npm install
npm run dev
```

By default the frontend talks to `http://localhost:3000`. To point it at a deployed backend, set `VITE_API_URL` (e.g. in a `.env.production` file or your hosting platform's environment variables) before building.

## Deployed App

Frontend: [art-gallary-do7i.vercel.app](https://art-gallary-do7i.vercel.app/)

The deployed instance may be out of date relative to `main` — redeploy both the frontend (with `VITE_API_URL` set to the live backend) and backend to pick up the latest changes.
