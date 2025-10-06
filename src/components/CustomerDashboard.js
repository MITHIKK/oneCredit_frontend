import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { generateTripReceipt } from '../utils/generatePDF';
import './CustomerDashboard.css';

function CustomerDashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const [myTrips, setMyTrips] = useState([]);
    const [pendingTrips, setPendingTrips] = useState([]);
    const [approvedTrips, setApprovedTrips] = useState([]);
    const [completedTrips, setCompletedTrips] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('trips');
    const [loading, setLoading] = useState(true);
    const [isLoadingTrips, setIsLoadingTrips] = useState(false);
    const [stats, setStats] = useState({
        totalTrips: 0,
        pendingTrips: 0,
        approvedTrips: 0,
        completedTrips: 0
    });

    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId) {
            loadMyTrips();
            loadNotifications();
            
            const interval = setInterval(() => {
                if (!isLoadingTrips) {
                    loadMyTrips();
                }
            }, 10000); // Increased to 10 seconds to reduce API calls
            
            return () => clearInterval(interval);
        }
    }, [user?._id || user?.id]); // Single stable dependency

    const loadMyTrips = async () => {
        if (isLoadingTrips) {
            console.log('Already loading trips, skipping...');
            return;
        }
        
        try {
            setIsLoadingTrips(true);
            setLoading(true);
            console.log('Loading trips for customer:', user._id || user.id);
            
            const data = await api.get(`/trips/customer/${user._id || user.id}`);
            console.log('Received trip data:', data);
                
            if (data.success) {
                    
                    const pendingTripsData = data.pendingTrips || [];
                    const approvedTripsData = data.approvedTrips || [];
                    const confirmedTripsData = data.confirmedTrips || [];  
                    const completedTripsData = data.completedTrips || [];
                    
                    console.log('Trip arrays from backend:');
                    console.log('  Pending:', pendingTripsData.length);
                    console.log('  Approved (unpaid):', approvedTripsData.length);
                    console.log('  Confirmed:', confirmedTripsData.length);
                    console.log('  Completed:', completedTripsData.length);
                    
                    setPendingTrips(pendingTripsData);
                    setApprovedTrips(approvedTripsData);
                    setCompletedTrips(completedTripsData);
                    
                    const mapTrip = (trip) => {
                        
                        let displayStatus = trip.status;
                        
                        if (trip.status === 'confirmed' || trip.paymentStatus === 'paid') {
                            displayStatus = 'confirmed';
                        }
                        
                        else if (trip.status === 'approved' && trip.paymentStatus !== 'paid') {
                            displayStatus = 'awaiting_payment';
                        }
                        
                        console.log(`Trip ${trip._id}: status=${trip.status}, paymentStatus=${trip.paymentStatus}, displayStatus=${displayStatus}`);
                        
                        return {
                            ...trip,
                            id: trip._id || trip.id,
                            from: trip.from || 'N/A',
                            to: trip.to || 'N/A',
                            date: trip.date || trip.startDate,
                            timeSlot: trip.timeSlot || '09:00 AM',
                            acType: trip.acType || 'Non-AC',
                            cost: trip.cost || 0,
                            requestedAt: trip.requestedAt || trip.createdAt,
                            customerEmail: trip.customerEmail || user.email,
                            customerPhone: trip.customerPhone || user.phone,
                            status: displayStatus,
                            advancePaid: trip.advancePaid,
                            paymentDate: trip.paymentDate
                        };
                    };
                    
                    const allTrips = [
                        ...pendingTripsData.map(mapTrip),
                        ...approvedTripsData.map(mapTrip),
                        ...confirmedTripsData.map(mapTrip),  
                        ...completedTripsData.map(mapTrip)
                    ];
                    
                    console.log('Processed trips:', allTrips.length, 'total');
                    console.log('Pending:', pendingTripsData.length, 'Approved:', approvedTripsData.length, 'Completed:', completedTripsData.length);
                    
                    allTrips.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
                    setMyTrips(allTrips);
                    
                    setStats({
                        totalTrips: allTrips.length,
                        pendingTrips: pendingTripsData.length,
                        approvedTrips: approvedTripsData.length,
                        completedTrips: completedTripsData.length
                    });
            } else {
                console.log('No success flag in response, loading from localStorage');
                loadLocalTrips();
            }
        } catch (error) {
            console.error('Error loading trips:', error);
            
            loadLocalTrips();
        } finally {
            setLoading(false);
            setIsLoadingTrips(false);
        }
    };
    
    const loadLocalTrips = () => {
        
        const pendingTrips = JSON.parse(localStorage.getItem('tripRequests') || '[]')
            .filter(trip => trip.customerId === (user._id || user.id));
        const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]')
            .filter(trip => trip.customerId === (user._id || user.id));
        const completedTrips = JSON.parse(localStorage.getItem('completedTrips') || '[]')
            .filter(trip => trip.customerId === (user._id || user.id));
        
        const allTrips = [
            ...pendingTrips.map(trip => ({ ...trip, status: 'pending' })),
            ...approvedTrips.map(trip => ({ ...trip, status: 'awaiting_payment' })),
            ...completedTrips.map(trip => ({ ...trip, status: 'completed' }))
        ];
        
        allTrips.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
        setMyTrips(allTrips);
        
        setStats({
            totalTrips: allTrips.length,
            pendingTrips: pendingTrips.length,
            approvedTrips: approvedTrips.length,
            completedTrips: completedTrips.length
        });
    };

    const loadNotifications = () => {
        const customerNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
        setNotifications(customerNotifications);
    };

    const markNotificationAsRead = (index) => {
        const updatedNotifications = [...notifications];
        updatedNotifications[index].read = true;
        setNotifications(updatedNotifications);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f39c12';
            case 'awaiting_payment': return '#3498db';
            case 'confirmed': return '#27ae60';
            case 'completed': return '#9b59b6';
            default: return '#95a5a6';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'awaiting_payment': return '💳';
            case 'confirmed': return '✅';
            case 'completed': return '🎯';
            default: return '📋';
        }
    };
    
    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'PENDING APPROVAL';
            case 'awaiting_payment': return 'APPROVED - PAY NOW';
            case 'confirmed': return 'TRIP CONFIRMED';
            case 'completed': return 'COMPLETED';
            default: return status.toUpperCase();
        }
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    const handlePayNow = (trip) => {
        
        navigate('/payment', { 
            state: { 
                tripData: trip 
            }
        });
    };

    const handleDownloadReceipt = (trip) => {
        try {
            
            const receiptData = {
                ...trip,
                customerName: trip.customerName || user?.name || 'Customer',
                customerEmail: trip.customerEmail || user?.email || 'N/A',
                customerPhone: trip.customerPhone || user?.phone || 'N/A',
                status: 'confirmed',
                paymentStatus: 'paid',
                advancePaid: trip.advancePaid || 5000,
                paymentDate: trip.paymentDate || new Date(),
                paymentMethod: trip.paymentMethod || 'Online Payment',
                cost: trip.cost || 0  
            };
            
            const userData = {
                name: user?.name || 'Customer',
                email: user?.email || 'customer@email.com',
                phone: user?.phone || '+91-0000000000',
                id: user?._id || user?.id || 'user123',
                _id: user?._id || user?.id || 'user123'
            };
            
            const fileName = generateTripReceipt(receiptData, userData);
            
            console.log('Receipt generated successfully:', fileName);
            alert('Receipt downloaded successfully! Check your Downloads folder.');
        } catch (error) {
            console.error('Error generating receipt:', error);
            alert('Error generating receipt. Please check the console for details and try again.');
        }
    };

    return (
        <div className="customer-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome">
                        <h1>🚌 Welcome, <Link to="/profile" style={{color: 'inherit', textDecoration: 'underline'}}>{user.name}</Link>!</h1>
                        <p>Manage your trips and stay updated with Sri Murugan Holidays</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/profile" className="profile-btn" style={{padding: '10px 20px', backgroundColor: '#3498db', color: 'white', borderRadius: '8px', textDecoration: 'none', marginRight: '10px'}}>
                            👤 My Profile
                        </Link>
                        <Link to="/book" className="book-trip-btn">
                            ➕ Book New Trip
                        </Link>
                        <button onClick={onLogout} className="logout-btn">
                            🔐 Logout
                        </button>
                    </div>
                </div>
            </div>

            {}
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{stats.totalTrips}</h3>
                        <p>Total Trips</p>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{stats.pendingTrips}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.approvedTrips}</h3>
                        <p>Approved</p>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>{stats.completedTrips}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trips')}
                >
                    🚌 My Trips ({myTrips.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    🔔 Notifications {unreadNotifications > 0 && `(${unreadNotifications})`}
                </button>
            </div>

            {}
            <div className="tab-content">
                {activeTab === 'trips' && (
                    <div className="trips-section">
                        {loading ? (
                            <div className="loading-container" style={{textAlign: 'center', padding: '50px'}}>
                                <div className="loading-spinner" style={{fontSize: '48px'}}>⏳</div>
                                <h3>Loading your trips...</h3>
                                <p>Please wait while we fetch your trip details</p>
                            </div>
                        ) : myTrips.length === 0 ? (
                            <div className="no-trips">
                                <div className="no-trips-icon">🚌</div>
                                <h3>No trips booked yet</h3>
                                <p>Start planning your next adventure!</p>
                                <Link to="/book" className="book-now-btn">
                                    Book Your First Trip
                                </Link>
                            </div>
                        ) : (
                            <div className="trips-list">
                                {myTrips.map((trip) => (
                                    <div key={trip.id} className="trip-card">
                                        <div className="trip-card-header">
                                            <div className="trip-route">
                                                <span className="from">{trip.from}</span>
                                                <span className="arrow">→</span>
                                                <span className="to">{trip.to}</span>
                                            </div>
                                            <div className="trip-status">
                                                <span 
                                                    className={`status-badge ${trip.status}`}
                                                    style={{ backgroundColor: getStatusColor(trip.status) }}
                                                >
                                                    {getStatusIcon(trip.status)} {getStatusText(trip.status)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="trip-details">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="label">📅 Travel Date</span>
                                                    <span className="value">{formatDate(trip.date)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">⏰ Time Slot</span>
                                                    <span className="value">{trip.timeSlot || '09:00 AM'}</span>
                                                </div>
                                            </div>
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="label">🚌 Bus Type</span>
                                                    <span className="value">{trip.acType}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">💰 Total Cost</span>
                                                    <span className="value cost" style={{fontSize: '1.1em', fontWeight: 'bold', color: '#27ae60'}}>{formatCurrency(trip.cost)}</span>
                                                </div>
                                            </div>
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="label">📧 Contact Email</span>
                                                    <span className="value">{trip.customerEmail || user.email || 'N/A'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">📱 Phone</span>
                                                    <span className="value">{trip.customerPhone || user.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <span className="label">🆔 Trip ID</span>
                                                    <span className="value" style={{fontSize: '0.9em', color: '#7f8c8d'}}>{trip.id || trip._id}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">📝 Requested On</span>
                                                    <span className="value">{formatDate(trip.requestedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {trip.status === 'pending' && (
                                            <div className="trip-alert" style={{backgroundColor: '#fff5e6', borderLeft: '4px solid #f39c12', padding: '15px', marginTop: '15px'}}>
                                                <div className="alert-content">
                                                    <span className="alert-icon">⏳</span>
                                                    <div className="alert-text">
                                                        <strong>Awaiting Owner Approval</strong>
                                                        <p>Your trip request has been submitted. The owner will review and approve it soon. You will be notified once approved.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {trip.status === 'awaiting_payment' && (
                                            <div className="trip-alert" style={{backgroundColor: '#e8f4fd', borderLeft: '4px solid #3498db', padding: '15px', marginTop: '15px'}}>
                                                <div className="alert-content">
                                                    <span className="alert-icon">✅</span>
                                                    <div className="alert-text">
                                                        <strong>Trip Approved! - Payment Required</strong>
                                                        <p>Great news! Your trip has been approved by the owner. Please pay the advance amount to confirm your booking.</p>
                                                    </div>
                                                </div>
                                                <div className="payment-info" style={{marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                                    <h4 style={{margin: '0 0 10px 0'}}>💰 Payment Details:</h4>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                                        <span>Advance Amount:</span>
                                                        <strong style={{color: '#27ae60', fontSize: '1.2em'}}>₹5,000</strong>
                                                    </div>
                                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                                        <span>Remaining (Pay at pickup):</span>
                                                        <strong>₹{(trip.cost - 5000).toLocaleString('en-IN')}</strong>
                                                    </div>
                                                    <div style={{marginTop: '15px', textAlign: 'center'}}>
                                                        <button 
                                                            className="pay-now-btn"
                                                            onClick={() => handlePayNow(trip)}
                                                            style={{
                                                                backgroundColor: '#27ae60',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '12px 30px',
                                                                fontSize: '16px',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            💳 Pay ₹5,000 Now (Demo Payment)
                                                        </button>
                                                        <div style={{marginTop: '10px', fontSize: '12px', color: '#7f8c8d'}}>
                                                            🔒 Secure payment gateway • Multiple payment options available
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {trip.status === 'confirmed' && (
                                            <div className="trip-alert" style={{backgroundColor: '#d4edda', borderLeft: '4px solid #28a745', padding: '15px', marginTop: '15px'}}>
                                                <div className="alert-content">
                                                    <span className="alert-icon">🎉</span>
                                                    <div className="alert-text">
                                                        <strong>Trip Confirmed!</strong>
                                                        <p>Your payment has been received and your trip is confirmed. We will contact you before the trip with pickup details.</p>
                                                    </div>
                                                </div>
                                                {trip.advancePaid && (
                                                    <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px'}}>
                                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                            <div>
                                                                <div style={{marginBottom: '5px'}}>
                                                                    <span>✅ Advance Paid: </span>
                                                                    <strong style={{color: '#28a745'}}>₹{trip.advancePaid.toLocaleString('en-IN')}</strong>
                                                                </div>
                                                                {trip.paymentDate && (
                                                                    <div style={{fontSize: '12px', color: '#6c757d'}}>
                                                                        Payment Date: {formatDate(trip.paymentDate)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDownloadReceipt(trip)}
                                                                style={{
                                                                    backgroundColor: '#6c757d',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '8px 15px',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px',
                                                                    transition: 'background-color 0.3s'
                                                                }}
                                                                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                                                                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                                                                title="Download PDF Receipt"
                                                            >
                                                                🖨️ Download Receipt
                                                            </button>
                                                        </div>
                                                        <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #dee2e6'}}>
                                                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#495057'}}>
                                                                <span>Balance Amount (Pay at pickup):</span>
                                                                <strong>₹{(trip.cost - (trip.advancePaid || 5000)).toLocaleString('en-IN')}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {trip.status === 'completed' && (
                                            <div className="trip-feedback">
                                                <p>✨ Trip completed! Thank you for choosing Sri Murugan Holidays.</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="notifications-section">
                        <div className="notifications-header">
                            <h2>🔔 Your Notifications</h2>
                            {notifications.length > 0 && (
                                <button onClick={clearAllNotifications} className="clear-all-btn">
                                    Clear All
                                </button>
                            )}
                        </div>
                        
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <div className="no-notifications-icon">🔔</div>
                                <h3>No notifications</h3>
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="notifications-list">
                                {notifications.map((notification, index) => (
                                    <div 
                                        key={index} 
                                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                        onClick={() => markNotificationAsRead(index)}
                                    >
                                        <div className="notification-content">
                                            <div className="notification-type">
                                                {notification.type === 'trip_approved' && '✅'}
                                                {notification.type === 'trip_rejected' && '❌'}
                                                {notification.type === 'trip_completed' && '🎯'}
                                                {!notification.type && '📢'}
                                            </div>
                                            <div className="notification-text">
                                                <p>{notification.message}</p>
                                                <span className="notification-time">
                                                    {formatDate(notification.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                        {!notification.read && <div className="unread-indicator"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <Link to="/book" className="action-card">
                        <div className="action-icon">🎫</div>
                        <div className="action-text">
                            <h4>Book Trip</h4>
                            <p>Plan your next journey</p>
                        </div>
                    </Link>
                    <Link to="/calculate" className="action-card">
                        <div className="action-icon">🧮</div>
                        <div className="action-text">
                            <h4>Calculate Expense</h4>
                            <p>Estimate trip costs</p>
                        </div>
                    </Link>
                    <Link to="/contact" className="action-card">
                        <div className="action-icon">📞</div>
                        <div className="action-text">
                            <h4>Contact Us</h4>
                            <p>Get in touch</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboard;
