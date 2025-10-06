const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:3001', 
    'https://accounts.google.com',
    'https://onecredit-frontend.onrender.com',
    'https://onecredit-backend-8p7u.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

const DB_NAME = process.env.DB_NAME || 'oneCredit';
const MONGODB_URI = process.env.MONGODB_URI || `mongodb+srv://mkmithik2005:Mithik2005@cluster1.kdkc6ne.mongodb.net/oneCredit?retryWrites=true&w=majority&appName=Cluster1`;
console.log(`🔗 Connecting to database: ${DB_NAME}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB via Compass');
  console.log(`📊 Database: ${MONGODB_URI}`);
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connected successfully!',
    database: 'MongoDB Compass',
    timestamp: new Date().toISOString()
  });
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  username: { type: String },
  password: { type: String },
  googleId: { type: String },
  picture: { type: String },
  role: { type: String, default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

const TripSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  acType: { type: String, required: true },
  cost: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
  paymentMethod: { type: String },
  advancePaid: { type: Number, default: 0 },
  paymentDate: { type: Date },
  requestedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  confirmedAt: { type: Date }
});

const Trip = mongoose.model('Trip', TripSchema);

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    console.log('📝 Signup request received:', { name, email, phone, username });
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email === email ? 'Email' : 'Username');
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already exists'
      });
    }
    
    const newUser = new User({
      name,
      email,
      phone,
      username,
      password, 
      role: 'customer'
    });
    
    console.log('💾 Saving new user to database...');
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully:', savedUser._id);
    
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (role === 'owner') {
      if (username === 'srimuruganbusowner' && password === 'muruganbus') {
        res.json({
          message: 'Login successful',
          user: {
            username,
            role: 'owner',
            name: 'Sri Murugan Bus Owner',
            id: 'owner-001'
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid owner credentials' });
      }
    } else {
      const user = await User.findOne({ username, password });
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.json({
          message: 'Login successful',
          user: {
            ...userWithoutPassword,
            _id: user._id.toString(),
            id: user._id.toString(),
            name: user.name || `${user.firstName} ${user.lastName}`.trim(),
            role: 'customer'
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid customer credentials' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, userData } = req.body;
    console.log('🔐 Google login request received:', userData.email);
    
    let user = await User.findOne({ email: userData.email });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = userData.googleId;
        user.picture = userData.picture;
        await user.save();
      }
      console.log('✅ Existing user logged in via Google:', user.email);
    } else {
      const username = userData.email.split('@')[0] + Math.random().toString(36).substr(2, 4);
      
      user = new User({
        name: userData.name,
        email: userData.email,
        username: username,
        googleId: userData.googleId,
        picture: userData.picture,
        phone: '',
        password: 'google-oauth-user',
        role: 'customer'
      });
      
      await user.save();
      console.log('✅ New user created via Google:', user.email);
    }
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: 'Google login successful',
      user: {
        ...userWithoutPassword,
        _id: user._id.toString(),
        id: user._id.toString(),
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('❌ Google login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    console.log('📝 Trip request received:', req.body);
    
    const newTrip = new Trip(req.body);
    const savedTrip = await newTrip.save();
    
    console.log('✅ Trip saved successfully:', savedTrip._id);
    res.status(201).json({
      message: 'Trip request created successfully',
      trip: savedTrip
    });
  } catch (error) {
    console.error('❌ Trip creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ requestedAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log('📋 Fetching trips for customer:', customerId);
    
    const trips = await Trip.find({ customerId }).sort({ requestedAt: -1 });
    
    const pendingTrips = trips.filter(t => t.status === 'pending');
    const approvedTrips = trips.filter(t => t.status === 'approved' && t.paymentStatus !== 'paid');
    const confirmedTrips = trips.filter(t => t.status === 'confirmed' || t.paymentStatus === 'paid');
    const completedTrips = trips.filter(t => t.status === 'completed');
    
    console.log(`✅ Found ${trips.length} trips for customer ${customerId}`);
    console.log(`   - Pending: ${pendingTrips.length}`);
    console.log(`   - Approved (unpaid): ${approvedTrips.length}`);
    console.log(`   - Confirmed/Paid: ${confirmedTrips.length}`);
    console.log(`   - Completed: ${completedTrips.length}`);
    
    trips.forEach(trip => {
      console.log(`   Trip ${trip._id}: status=${trip.status}, paymentStatus=${trip.paymentStatus}`);
    });
    
    res.json({
      success: true,
      pendingTrips,
      approvedTrips,  
      confirmedTrips,  
      completedTrips,
      allTrips: trips
    });
  } catch (error) {
    console.error('❌ Error fetching customer trips:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.get('/api/trips/pending', async (req, res) => {
  try {
    console.log('📋 Fetching pending trips for owner...');
    const trips = await Trip.find({ status: 'pending' }).sort({ requestedAt: -1 });
    console.log(`✅ Found ${trips.length} pending trips`);
    
    res.json({
      success: true,
      trips
    });
  } catch (error) {
    console.error('❌ Error fetching pending trips:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.get('/api/trips/owner/all', async (req, res) => {
  try {
    console.log('📋 Fetching all trips for owner dashboard...');
    
    const allTrips = await Trip.find().sort({ requestedAt: -1 });
    
    const pendingTrips = allTrips.filter(t => t.status === 'pending');
    const approvedTrips = allTrips.filter(t => t.status === 'approved' && t.paymentStatus !== 'paid');
    const upcomingTrips = allTrips.filter(t => 
      (t.status === 'confirmed' || t.paymentStatus === 'paid') && t.status !== 'completed'
    );
    const completedTrips = allTrips.filter(t => t.status === 'completed');
    
    console.log('✅ Trip breakdown for owner:');
    console.log(`   - Pending: ${pendingTrips.length}`);
    console.log(`   - Approved (unpaid): ${approvedTrips.length}`);
    console.log(`   - Upcoming (paid): ${upcomingTrips.length}`);
    console.log(`   - Completed: ${completedTrips.length}`);
    
    res.json({
      success: true,
      pendingTrips,
      approvedTrips,
      upcomingTrips,
      completedTrips,
      allTrips
    });
  } catch (error) {
    console.error('❌ Error fetching owner trips:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

app.put('/api/trips/:tripId/approve', async (req, res) => {
  try {
    const { tripId } = req.params;
    console.log('✅ Approving trip:', tripId);
    
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { 
        status: 'approved',
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    console.log('✅ Trip approved successfully:', trip._id);
    res.json({
      success: true,
      message: 'Trip approved successfully',
      trip
    });
  } catch (error) {
    console.error('❌ Error approving trip:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/payments/create', async (req, res) => {
  try {
    const { tripId, userId, amount } = req.body;
    console.log('💳 Processing payment for trip:', tripId);
    console.log('   Amount:', amount);
    
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { 
        status: 'confirmed',
        paymentStatus: 'paid',
        advancePaid: amount || 5000,
        paymentDate: new Date(),
        confirmedAt: new Date()
      },
      { new: true }
    );
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    console.log('✅ Payment processed successfully for trip:', trip._id);
    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: {
        tripId,
        amount: amount || 5000,
        status: 'completed',
        date: new Date()
      },
      trip
    });
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/trips/book', async (req, res) => {
  try {
    const { userId, from, to, date, acType, cost } = req.body;
    console.log('🚌 New trip booking request:', { userId, from, to, date });
    
    let user = null;
    if (userId && userId !== 'owner-001') {
      user = await User.findById(userId);
      if (!user) {
        console.log('⚠️ User not found, creating trip with provided data');
      }
    }
    
    const tripData = {
      customerId: userId,
      customerName: user ? user.name : req.body.customerName || 'Customer',
      customerEmail: user ? user.email : req.body.customerEmail || '',
      customerPhone: user ? user.phone : req.body.customerPhone || '',
      from,
      to,
      date: new Date(date),
      timeSlot: req.body.timeSlot || '09:00 AM',
      acType: acType || 'Non-AC',
      cost: cost || 0,
      status: 'pending'
    };
    
    const newTrip = new Trip(tripData);
    const savedTrip = await newTrip.save();
    
    console.log('✅ Trip booked successfully:', savedTrip._id);
    res.status(201).json({
      success: true,
      message: 'Trip booked successfully',
      trip: savedTrip
    });
  } catch (error) {
    console.error('❌ Booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/trips/:tripId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const tripId = req.params.tripId;
    
    const updateData = { status };
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else if (status === 'confirmed') {
      updateData.confirmedAt = new Date();
    }
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      updateData,
      { new: true }
    );
    
    if (!updatedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    console.log(`✅ Trip ${tripId} status updated to ${status}`);
    res.json({
      message: 'Trip status updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('❌ Trip status update error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips/:tripId/payment', async (req, res) => {
  try {
    const { paymentMethod, advancePaid } = req.body;
    const tripId = req.params.tripId;
    
    console.log(`💰 Processing payment for trip ${tripId}:`, { paymentMethod, advancePaid });
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      {
        paymentStatus: 'paid',
        paymentMethod,
        advancePaid,
        paymentDate: new Date(),
        status: 'confirmed',
        confirmedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    console.log(`✅ Payment confirmed for trip ${tripId}`);
    res.json({
      message: 'Payment processed and trip confirmed successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
});
