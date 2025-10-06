# Trip Booking Application - Complete Workflow Test Guide

## ✅ Features Implemented

1. **Customer Login & Dashboard**
   - Customer can login and see welcome message with their name
   - Dashboard displays pending, approved, and completed trips
   - Status indicators show trip status clearly

2. **Customer Profile Page**
   - Simple profile page accessible from dashboard
   - Shows customer name, username, completed trips count, and pending trips

3. **Trip Booking with MongoDB**
   - Customers can book trips
   - Trip data is saved to MongoDB database (tripapp_db)
   - Trips appear in customer dashboard with correct status

4. **Owner Approval Flow**
   - Owner can login and see pending trip requests
   - Owner can approve trips
   - Approved trips status changes to "awaiting payment"

5. **Payment System**
   - Customers see payment prompt for approved trips
   - Demo payment of ₹5000 advance
   - After payment, trip status changes to "confirmed"

## 🚀 How to Start the Application

### Step 1: Start MongoDB
Make sure MongoDB is running on your system:
```
mongod
```

### Step 2: Start Backend Server
```bash
cd F:\uidexp\backend
npm run dev
```
The backend will run on: http://localhost:5000

### Step 3: Start Frontend
In a new terminal:
```bash
cd F:\uidexp
npm start
```
The frontend will run on: http://localhost:3000

## 📋 Testing Workflow

### 1. Customer Signup & Login
1. Go to http://localhost:3000
2. Click on "Login" in navbar
3. Switch to "Customer Login"
4. Either:
   - Sign up as new customer
   - Or login with any email/password (auto-creates user in demo mode)

### 2. Book a Trip
1. After login, click "Book New Trip" from dashboard
2. Select:
   - From: Any departure city
   - To: Any destination
   - Date: Any future date
   - AC/Non-AC preference
   - Time slot
3. Click "Book Now" and confirm

### 3. Check Customer Dashboard
- Trip appears as "PENDING APPROVAL" in dashboard
- Welcome message shows customer name
- Stats show pending trips count

### 4. Owner Login & Approval
1. Logout from customer account
2. Login as owner:
   - Username: `srimuruganbusowner`
   - Password: `muruganbus`
3. In owner dashboard, see pending trip requests
4. Click "Approve" on the trip

### 5. Customer Payment
1. Logout and login back as customer
2. In dashboard, trip now shows "APPROVED - PAY NOW"
3. Click "Pay ₹5,000 Now"
4. Choose payment method (UPI/Card/NetBanking)
5. Fill demo payment details
6. Complete payment

### 6. Verify Final Status
- Trip status changes to "TRIP CONFIRMED"
- Payment confirmation shown
- Trip appears in confirmed trips

## 🗄️ Database Structure

**MongoDB Database:** `tripapp_db`

**Collections:**
- `users` - Customer information
- `trips` - Trip bookings and status
- `payments` - Payment records

## 🔍 Status Flow

1. **Draft/Pending** → Trip requested by customer
2. **Planned/Awaiting Payment** → Approved by owner
3. **Booked/Confirmed** → Payment completed
4. **Completed** → Trip finished

## 🛠️ Troubleshooting

### Backend Not Connecting to MongoDB
- Ensure MongoDB is running
- Check connection string in server.js
- Default: `mongodb://localhost:27017/tripapp_db`

### API Calls Failing
- Verify backend is running on port 5000
- Check CORS settings in backend
- Frontend should be on port 3000

### Status Not Updating
- Clear browser cache
- Refresh page after actions
- Check browser console for errors

## 📝 Key Files Modified

### Backend
- `/backend/server.js` - API routes for trips, payments, users
- `/backend/models/User.js` - User schema
- `/backend/models/Trip.js` - Trip schema  
- `/backend/models/Payment.js` - Payment schema

### Frontend
- `/src/components/CustomerDashboard.js` - Customer dashboard with trip status
- `/src/components/UserProfile.js` - Customer profile page
- `/src/components/BookingForm.js` - Trip booking with MongoDB
- `/src/components/OwnerDashboard.js` - Owner approval interface
- `/src/components/Payment.js` - Payment processing
- `/src/App.js` - Routing configuration

## ✨ Demo Features

- Auto-creates users if not exists (for testing)
- Fallback to localStorage if MongoDB unavailable
- Demo payment accepts any valid format
- WhatsApp/Email confirmation simulation

## 🎯 Success Indicators

✅ Customer sees welcome message with name
✅ Profile page shows trip statistics
✅ Trip booking saves to MongoDB
✅ Owner can approve trips
✅ Payment of ₹5000 works
✅ Status updates correctly through workflow
✅ Data persists in MongoDB

---

**Note:** This is a demo application. In production, implement:
- Real authentication with JWT
- Actual payment gateway integration
- Real WhatsApp Business API
- Email service integration
- Input validation & security measures
