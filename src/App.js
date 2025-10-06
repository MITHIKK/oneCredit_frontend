import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import BookingForm from './components/BookingForm';
import Calculate from './components/Calculate';
import Contact from './components/Contact';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Signup from './components/Signup';
import OwnerDashboard from './components/OwnerDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerProfile from './components/CustomerProfile';
import Payment from './components/Payment';
import TestPDF from './components/TestPDF';

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">🚌</div>
        <p>Loading Sri Murugan Holidays...</p>
      </div>
    );
  }

  return (
    <div className={`App ${isHomePage ? 'home-page' : ''}`}>
      <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          {}
          <Route path="/" element={<Home />} />
          <Route path="/calculate" element={<Calculate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/test-pdf" element={<TestPDF />} />
          
          {}
          <Route 
            path="/login" 
            element={
              user ? 
                <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/dashboard'} /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? 
                <Navigate to="/dashboard" /> : 
                <Signup onSignup={handleSignup} />
            } 
          />
          
          {}
          <Route 
            path="/book" 
            element={
              user && user.role === 'customer' ? 
                <BookingForm user={user} /> : 
                user && user.role === 'owner' ? 
                  <Navigate to="/owner-dashboard" /> :
                  <BookingForm user={user} /> 
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user && user.role === 'customer' ? 
                <CustomerDashboard user={user} onLogout={handleLogout} /> :
                user && user.role === 'owner' ? 
                  <Navigate to="/owner-dashboard" /> :
                  <Navigate to="/login" />
            } 
          />
          <Route 
            path="/payment" 
            element={
              user && user.role === 'customer' ? 
                <Payment user={user} /> :
                <Navigate to="/login" />
            } 
          />
          
          {}
          <Route 
            path="/owner-dashboard" 
            element={
              user && user.role === 'owner' ? 
                <OwnerDashboard user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            } 
          />
          <Route 
            path="/customer-profile/:customerId" 
            element={
              user && user.role === 'owner' ? 
                <CustomerProfile user={user} /> :
                <Navigate to="/login" />
            } 
          />
          
          {}
          <Route 
            path="/profile" 
            element={
              user && user.role === 'customer' ? 
                <UserProfile user={user} /> :
                user && user.role === 'owner' ? 
                  <Navigate to="/owner-dashboard" /> :
                  <Navigate to="/login" />
            } 
          />
          
          {}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
