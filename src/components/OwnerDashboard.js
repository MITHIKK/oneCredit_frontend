import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './OwnerDashboard.css';

function OwnerDashboard({ user, onLogout }) {
    const [tripRequests, setTripRequests] = useState([]);
    const [upcomingTrips, setUpcomingTrips] = useState([]);  
    const [approvedTrips, setApprovedTrips] = useState([]);  
    const [completedTrips, setCompletedTrips] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        upcomingTrips: 0,
        approvedTrips: 0,
        completedTrips: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        loadTripData();
        loadNotifications();
    }, []);

    const loadTripData = async () => {
        try {
            
            const data = await api.get('/trips/owner/all');
            if (data.success) {
                    
                    const pendingTrips = data.pendingTrips || [];
                    const approvedUnpaidTrips = data.approvedTrips || [];
                    const paidTrips = data.upcomingTrips || [];
                    const completedTripsData = data.completedTrips || [];
                    
                    setTripRequests(pendingTrips);
                    setApprovedTrips(approvedUnpaidTrips);
                    setUpcomingTrips(paidTrips);
                    setCompletedTrips(completedTripsData);
                    
                    const totalRevenue = [...paidTrips, ...completedTripsData].reduce(
                        (sum, trip) => sum + (trip.advancePaid || 0), 
                        0
                    );
                    
                    setStats({
                        totalRequests: pendingTrips.length + approvedUnpaidTrips.length + paidTrips.length + completedTripsData.length,
                        pendingRequests: pendingTrips.length,
                        upcomingTrips: paidTrips.length,
                        approvedTrips: approvedUnpaidTrips.length,
                        completedTrips: completedTripsData.length,
                        totalRevenue
                    });
                    return;
            }
        } catch (error) {
            console.error('Error loading from backend:', error);
        }
        
        try {
            const pendingTrips = JSON.parse(localStorage.getItem('tripRequests') || '[]');
            const approvedTripsData = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
            const completedTripsData = JSON.parse(localStorage.getItem('completedTrips') || '[]');
            
            setTripRequests(pendingTrips);
            setApprovedTrips(approvedTripsData);
            setCompletedTrips(completedTripsData);
            
            const totalRevenue = [...approvedTripsData, ...completedTripsData].reduce((sum, trip) => sum + (trip.advancePaid || 0), 0);
            
            setStats({
                totalRequests: pendingTrips.length + approvedTripsData.length + completedTripsData.length,
                pendingRequests: pendingTrips.length,
                approvedTrips: approvedTripsData.length,
                completedTrips: completedTripsData.length,
                totalRevenue
            });
        } catch (error) {
            console.error('Error loading trip data:', error);
        }
    };

    const loadNotifications = () => {
        const notifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
        setNotifications(notifications.slice(0, 5)); 
    };

    const approveTrip = async (tripId) => {
        try {
            
            const data = await api.put(`/trips/${tripId}/approve`, {});
            
            if (data.success) {
                alert('Trip approved successfully! Customer will be notified to make advance payment.');
                loadTripData();
                return;
            }
        } catch (error) {
            console.error('Error approving trip via backend:', error);
        }
        
        const tripRequests = JSON.parse(localStorage.getItem('tripRequests') || '[]');
        const tripToApprove = tripRequests.find(trip => trip.id === tripId);
        
        if (tripToApprove) {
            
            const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
            const updatedApprovedTrips = [...approvedTrips, { 
                ...tripToApprove, 
                status: 'approved', 
                approvedAt: new Date().toISOString()
            }];
            localStorage.setItem('approvedTrips', JSON.stringify(updatedApprovedTrips));
            
            const updatedTripRequests = tripRequests.filter(trip => trip.id !== tripId);
            localStorage.setItem('tripRequests', JSON.stringify(updatedTripRequests));
            
            addCustomerNotification(tripToApprove.customerId, {
                type: 'trip_approved',
                message: `Your trip request from ${tripToApprove.from} to ${tripToApprove.to} has been approved! Please pay the advance amount to confirm your booking.`,
                tripId: tripId,
                timestamp: new Date().toISOString()
            });
            
            loadTripData();
            alert('Trip approved successfully! Customer will be notified.');
        }
    };

    const rejectTrip = async (tripId, reason = 'Not available for selected dates') => {
        try {
            const data = await api.put(`/trips/${tripId}/reject`, { reason });
            
            if (data.success) {
                alert(`Trip rejected successfully! Reason: ${reason}`);
                loadTripData();
                return;
            }
        } catch (error) {
            console.error('Error rejecting trip via backend:', error);
        }
        
        // Fallback to localStorage if API fails
        const tripRequests = JSON.parse(localStorage.getItem('tripRequests') || '[]');
        const tripToReject = tripRequests.find(trip => trip.id === tripId);
        
        if (tripToReject) {
            const updatedTripRequests = tripRequests.filter(trip => trip.id !== tripId);
            localStorage.setItem('tripRequests', JSON.stringify(updatedTripRequests));
            
            addCustomerNotification(tripToReject.customerId, {
                type: 'trip_rejected',
                message: `Your trip request from ${tripToReject.from} to ${tripToReject.to} has been declined. Reason: ${reason}`,
                tripId: tripId,
                timestamp: new Date().toISOString()
            });
            
            loadTripData();
            alert(`Trip rejected successfully! Reason: ${reason}`);
        }
    };

    const markTripCompleted = (tripId) => {
        const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
        const tripToComplete = approvedTrips.find(trip => trip.id === tripId);
        
        if (tripToComplete) {
            
            const completedTrips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
            const updatedCompletedTrips = [...completedTrips, { 
                ...tripToComplete, 
                status: 'completed', 
                completedAt: new Date().toISOString()
            }];
            localStorage.setItem('completedTrips', JSON.stringify(updatedCompletedTrips));
            
            const updatedApprovedTrips = approvedTrips.filter(trip => trip.id !== tripId);
            localStorage.setItem('approvedTrips', JSON.stringify(updatedApprovedTrips));
            
            addCustomerNotification(tripToComplete.customerId, {
                type: 'trip_completed',
                message: `Your trip from ${tripToComplete.from} to ${tripToComplete.to} has been completed. Thank you for choosing Sri Murugan Holidays!`,
                tripId: tripId,
                timestamp: new Date().toISOString()
            });
            
            loadTripData();
        }
    };

    const addCustomerNotification = (customerId, notification) => {
        const customerNotifications = JSON.parse(localStorage.getItem(`notifications_${customerId}`) || '[]');
        customerNotifications.unshift(notification);
        localStorage.setItem(`notifications_${customerId}`, JSON.stringify(customerNotifications));
    };

    const addOwnerNotification = (notification) => {
        const ownerNotifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
        ownerNotifications.unshift(notification);
        localStorage.setItem('ownerNotifications', JSON.stringify(ownerNotifications));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const renderTripCard = (trip, actions) => (
        <div key={trip._id || trip.id} className="trip-card">
            <div className="trip-header">
                <div className="customer-info">
                    <h3>
                        {trip.customerName ? (
                            <Link 
                                to={`/customer-profile/${encodeURIComponent(trip.customerName)}`}
                                className="customer-name-link"
                                title="View customer profile"
                            >
                                {trip.customerName}
                            </Link>
                        ) : (
                            'Anonymous Customer'
                        )}
                    </h3>
                    <p>{trip.customerEmail} • {trip.customerPhone}</p>
                </div>
                <div className="trip-status">
                    <span className={`status-badge ${trip.status || 'pending'}`}>
                        {(trip.status || 'pending').toUpperCase()}
                    </span>
                </div>
            </div>
            
            <div className="trip-details">
                <div className="route">
                    <span className="from">{trip.from}</span>
                    <span className="arrow">→</span>
                    <span className="to">{trip.to}</span>
                </div>
                
                <div className="trip-info">
                    <div className="info-item">
                        <span className="label">Travel Date:</span>
                        <span className="value">{formatDate(trip.date)}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">AC Type:</span>
                        <span className="value">{trip.acType}</span>
                    </div>
                                    <div className="info-item">
                                        <span className="label">Cost:</span>
                                        <span className="value cost">{formatCurrency(trip.cost)}</span>
                                    </div>
                                    {trip.paymentStatus && (
                                        <div className="info-item">
                                            <span className="label">Payment Status:</span>
                                            <span className={`value payment-status ${trip.paymentStatus}`}>
                                                {trip.paymentStatus === 'paid' ? '✅ Paid' : '⌛ Pending'}
                                            </span>
                                        </div>
                                    )}
                                    {trip.advancePaid && (
                                        <div className="info-item">
                                            <span className="label">Advance Paid:</span>
                                            <span className="value advance-paid">{formatCurrency(trip.advancePaid)}</span>
                                        </div>
                                    )}
                    <div className="info-item">
                        <span className="label">Requested:</span>
                        <span className="value">{formatDate(trip.requestedAt)}</span>
                    </div>
                </div>
            </div>
            
            <div className="trip-actions">
                {actions}
            </div>
        </div>
    );

    return (
        <div className="owner-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome">
                        <h1>🚌 Sri Murugan Holidays - Owner Dashboard</h1>
                        <p>Welcome back, {user.username}</p>
                    </div>
                    <button onClick={onLogout} className="logout-btn">
                        🔐 Logout
                    </button>
                </div>
            </div>

            {}
            <div className="stats-grid">
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{stats.pendingRequests}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.approvedTrips}</h3>
                        <p>Approved Trips</p>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <h3>{stats.completedTrips}</h3>
                        <p>Completed Trips</p>
                    </div>
                </div>
                <div className="stat-card revenue">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>{formatCurrency(stats.totalRevenue)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            {}
            {notifications.length > 0 && (
                <div className="notifications-section">
                    <h2>📢 Recent Notifications</h2>
                    <div className="notifications-list">
                        {notifications.map((notification, index) => (
                            <div key={index} className="notification-item">
                                <span className="notification-message">{notification.message}</span>
                                <span className="notification-time">{formatDate(notification.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Requests ({tripRequests.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('approved')}
                >
                    Approved Trips ({approvedTrips.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed Trips ({completedTrips.length})
                </button>
            </div>

            {}
            <div className="tab-content">
                {activeTab === 'pending' && (
                    <div className="trips-section">
                        {tripRequests.length === 0 ? (
                            <div className="no-trips">
                                <p>No pending trip requests</p>
                            </div>
                        ) : (
                            tripRequests.map(trip => 
                                renderTripCard(trip, (
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => approveTrip(trip._id || trip.id)}
                                            className="approve-btn"
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            onClick={() => rejectTrip(trip._id || trip.id)}
                                            className="reject-btn"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                )}

                {activeTab === 'approved' && (
                    <div className="trips-section">
                        {approvedTrips.length === 0 ? (
                            <div className="no-trips">
                                <p>No approved trips</p>
                            </div>
                        ) : (
                            approvedTrips.map(trip => 
                                renderTripCard(trip, (
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => markTripCompleted(trip.id)}
                                            className="complete-btn"
                                        >
                                            🎯 Mark Completed
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                )}

                {activeTab === 'completed' && (
                    <div className="trips-section">
                        {completedTrips.length === 0 ? (
                            <div className="no-trips">
                                <p>No completed trips yet</p>
                            </div>
                        ) : (
                            completedTrips.map(trip => 
                                renderTripCard(trip, (
                                    <div className="completed-badge">
                                        <span>✨ Trip Completed</span>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OwnerDashboard;
