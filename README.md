# Travel App with MongoDB Backend

A comprehensive travel management application built with React frontend and Node.js/Express backend using MongoDB for data storage.

## Features

### User Management
- User registration and authentication with JWT tokens
- Secure password hashing with bcrypt
- Profile management with personal information
- Emergency contacts and travel documents storage
- Account security with login attempt tracking

### Trip Management
- Create and manage trip itineraries
- Multiple travelers support
- Accommodation and transportation booking
- Daily activity planning
- Budget tracking and expense management
- Trip status tracking (draft, planned, booked, in-progress, completed)

### Payment Management
- Payment tracking for all trip expenses
- Multiple payment method support
- Vendor and receipt management
- Refund processing
- Payment analytics and reporting
- Currency support for international travel

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI framework
- **React Router DOM** - Client-side routing

## Project Structure

```
F:\uidexp\
├── backend\                 # Backend server
│   ├── models\             # MongoDB schemas
│   │   ├── User.js         # User model with credentials
│   │   ├── Trip.js         # Trip model with itinerary
│   │   └── Payment.js      # Payment model with transactions
│   ├── routes\             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── trips.js        # Trip management routes
│   │   └── payments.js     # Payment management routes
│   ├── middleware\         # Custom middleware
│   │   └── auth.js         # Authentication middleware
│   ├── server.js           # Main server file
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── src\                    # React frontend
│   ├── services\           # API service layers
│   │   ├── api.js          # Base API configuration
│   │   ├── authService.js  # Authentication services
│   │   ├── tripService.js  # Trip management services
│   │   └── paymentService.js # Payment services
│   └── ...                # React components and files
└── README.md              # This file
```

## Database Schema

### User Model
- Personal information (name, email, phone, address)
- Authentication credentials with security features
- Travel preferences and emergency contacts
- Passport and travel document information

### Trip Model
- Trip details (destination, dates, type, status)
- Traveler information for group trips
- Detailed itinerary with daily activities
- Accommodation and transportation bookings
- Budget allocation and expense tracking

### Payment Model
- Payment transactions with vendor details
- Multiple payment methods and currencies
- Tax and fee breakdowns
- Refund processing and tracking
- Receipt and document storage

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

   **Important:** Update the following in your `.env` file:
   ```
   # Change these for production:
   JWT_SECRET=your_actual_secret_key_here
   ENCRYPTION_KEY=your_32_character_encryption_key
   
   # For MongoDB Atlas, update this:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel_app
   ```

4. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout
- `DELETE /api/auth/account` - Delete account

### Trips
- `GET /api/trips` - Get user trips (with filtering)
- `GET /api/trips/:id` - Get specific trip
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/travelers` - Add travelers
- `PUT /api/trips/:id/accommodations` - Update accommodations
- `PUT /api/trips/:id/itinerary` - Update itinerary
- `GET /api/trips/stats/overview` - Get trip statistics

### Payments
- `GET /api/payments` - Get user payments (with filtering)
- `GET /api/payments/:id` - Get specific payment
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `POST /api/payments/:id/refund` - Process refund
- `GET /api/payments/stats/overview` - Get payment statistics
- `GET /api/payments/trip/:tripId` - Get trip payments
- `POST /api/payments/bulk` - Create multiple payments

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Controlled cross-origin access
- **Helmet Security** - Additional security headers
- **Account Locking** - Automatic account lock after failed attempts

## Development

To test the backend API:
1. Start MongoDB (local or Atlas)
2. Start backend server: `cd backend && npm run dev`
3. Start frontend: `npm start`
4. Access the app at http://localhost:3000

## Production Deployment

1. Set strong JWT secrets and encryption keys
2. Configure production MongoDB instance
3. Set NODE_ENV=production
4. Configure proper CORS origins
5. Set up SSL/HTTPS certificates

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
