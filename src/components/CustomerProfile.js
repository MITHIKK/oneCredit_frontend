import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './CustomerProfile.css';

function CustomerProfile({ user }) {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState(null);
    const [customerTrips, setCustomerTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tripStats, setTripStats] = useState({
        totalTrips: 0,
        pendingTrips: 0,
        approvedTrips: 0,
        confirmedTrips: 0,
        completedTrips: 0,
        totalSpent: 0
    });

    useEffect(() => {
        if (user?.role !== 'owner') {
            navigate('/login');
            return;
        }
        loadCustomerProfile();
    }, [customerId, user, navigate]);

    const loadCustomerProfile = () => {
        try {
            setLoading(true);
            setError('');

            const pendingTrips = JSON.parse(localStorage.getItem('tripRequests') || '[]');
            const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
            const completedTrips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
            
            const allTrips = [
                ...pendingTrips.map(trip => ({ ...trip, status: 'pending' })),
                ...approvedTrips.map(trip => ({ ...trip, status: 'approved' })),
                ...completedTrips.map(trip => ({ ...trip, status: 'completed' }))
            ];

            const customerTripsData = allTrips.filter(trip => 
                trip.customerId === customerId || 
                trip.customerName === customerId ||
                trip.customerEmail === customerId
            );

            if (customerTripsData.length > 0) {
                const firstTrip = customerTripsData[0];
                const customerInfo = {
                    id: customerId,
                    username: firstTrip.customerName || customerId,
                    name: firstTrip.customerName || customerId,
                    email: firstTrip.customerEmail || '',
                    phone: firstTrip.customerPhone || '',
                    status: 'active',
                    createdAt: firstTrip.requestedAt || new Date().toISOString(),
                    profile: {
                        firstName: firstTrip.customerName?.split(' ')[0] || '',
                        lastName: firstTrip.customerName?.split(' ').slice(1).join(' ') || '',
                        phone: firstTrip.customerPhone || ''
                    }
                };

                setCustomerData(customerInfo);
                setCustomerTrips(customerTripsData);
                calculateTripStats(customerTripsData);
            } else {
                const customerInfo = {
                    id: customerId,
                    username: customerId,
                    name: customerId,
                    email: '',
                    phone: '',
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    profile: {
                        firstName: customerId,
                        lastName: '',
                        phone: ''
                    }
                };

                setCustomerData(customerInfo);
                setCustomerTrips([]);
                calculateTripStats([]);
            }

        } catch (error) {
            console.error('Error loading customer profile:', error);
            setError(error.message || 'Failed to load customer profile');
        } finally {
            setLoading(false);
        }
    };

    const calculateTripStats = (trips) => {
        const stats = {
            totalTrips: trips.length,
            pendingTrips: 0,
            approvedTrips: 0,
            confirmedTrips: 0,
            completedTrips: 0,
            totalSpent: 0
        };

        trips.forEach(trip => {
            switch (trip.status) {
                case 'pending':
                    stats.pendingTrips++;
                    break;
                case 'approved':
                    stats.approvedTrips++;
                    break;
                case 'confirmed':
                    stats.confirmedTrips++;
                    stats.totalSpent += trip.advancePaid || 0;
                    break;
                case 'completed':
                    stats.completedTrips++;
                    stats.totalSpent += trip.advancePaid || 0;
                    break;
                default:
                    break;
            }
        });

        setTripStats(stats);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f39c12';
            case 'approved': return '#3498db';
            case 'confirmed': return '#27ae60';
            case 'completed': return '#9b59b6';
            default: return '#95a5a6';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'approved': return '✅';
            case 'confirmed': return '💳';
            case 'completed': return '🎯';
            default: return '📋';
        }
    };

    if (loading) {
        return (
            <div className="customer-profile-loading">
                <div className="loading-spinner">🚌</div>
                <p>Loading customer profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-profile-error">
                <div className="error-icon">❌</div>
                <h2>Error Loading Profile</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/owner-dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    if (!customerData) {
        return (
            <div className="customer-profile-error">
                <div className="error-icon">👤</div>
                <h2>Customer Not Found</h2>
                <p>The requested customer profile could not be found.</p>
                <button onClick={() => navigate('/owner-dashboard')} className="back-btn">
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="customer-profile">
            {}
            <div className="profile-header">
                <div className="header-actions">
                    <button onClick={() => navigate('/owner-dashboard')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                </div>
                <div className="profile-info">
                    <div className="profile-avatar">
                        {customerData.profile?.profilePicture ? (
                            <img src={customerData.profile.profilePicture} alt="Profile" />
                        ) : (
                            <div className="avatar-placeholder">
                                {(customerData.profile?.firstName?.charAt(0) || customerData.username?.charAt(0) || '?').toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="profile-details">
                        <h1>
                            {customerData.profile?.firstName && customerData.profile?.lastName 
                                ? `${customerData.profile.firstName} ${customerData.profile.lastName}`
                                : customerData.username
                            }
                        </h1>
                        <p className="username">@{customerData.username}</p>
                        <div className="contact-info">
                            {customerData.email && (
                                <span className="contact-item">
                                    📧 {customerData.email}
                                </span>
                            )}
                            {customerData.profile?.phone && (
                                <span className="contact-item">
                                    📱 {customerData.profile.phone}
                                </span>
                            )}
                        </div>
                        <div className="profile-meta">
                            <span className="join-date">
                                👤 Member since {formatDate(customerData.createdAt)}
                            </span>
                            <span className={`status-indicator ${customerData.status}`}>
                                {customerData.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="trip-statistics">
                <h2>📊 Trip Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{tripStats.totalTrips}</h3>
                            <p>Total Trips</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>{tripStats.pendingTrips}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card approved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>{tripStats.approvedTrips}</h3>
                            <p>Approved</p>
                        </div>
                    </div>
                    <div className="stat-card confirmed">
                        <div className="stat-icon">💳</div>
                        <div className="stat-content">
                            <h3>{tripStats.confirmedTrips}</h3>
                            <p>Confirmed</p>
                        </div>
                    </div>
                    <div className="stat-card completed">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <h3>{tripStats.completedTrips}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card revenue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>{formatCurrency(tripStats.totalSpent)}</h3>
                            <p>Total Spent</p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            {customerData.profile && (
                <div className="customer-details">
                    <h2>👤 Customer Details</h2>
                    <div className="details-grid">
                        {customerData.profile.dateOfBirth && (
                            <div className="detail-item">
                                <span className="label">Date of Birth</span>
                                <span className="value">{formatDate(customerData.profile.dateOfBirth)}</span>
                            </div>
                        )}
                        {customerData.profile.address && (
                            <div className="detail-item address">
                                <span className="label">Address</span>
                                <div className="address-value">
                                    {customerData.profile.address.street && <div>{customerData.profile.address.street}</div>}
                                    {customerData.profile.address.city && customerData.profile.address.state && (
                                        <div>{customerData.profile.address.city}, {customerData.profile.address.state}</div>
                                    )}
                                    {customerData.profile.address.zipCode && <div>{customerData.profile.address.zipCode}</div>}
                                    {customerData.profile.address.country && <div>{customerData.profile.address.country}</div>}
                                </div>
                            </div>
                        )}
                        {customerData.profile.bio && (
                            <div className="detail-item bio">
                                <span className="label">Bio</span>
                                <span className="value">{customerData.profile.bio}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {}
            <div className="recent-trips">
                <div className="section-header">
                    <h2>🚌 Recent Trips</h2>
                    {customerTrips.length > 5 && (
                        <span className="trips-count">Showing 5 of {customerTrips.length} trips</span>
                    )}
                </div>
                
                {customerTrips.length === 0 ? (
                    <div className="no-trips">
                        <div className="no-trips-icon">🚌</div>
                        <h3>No trips found</h3>
                        <p>This customer hasn't booked any trips yet.</p>
                    </div>
                ) : (
                    <div className="trips-list">
                        {customerTrips.slice(0, 5).map((trip) => (
                            <div key={trip._id || trip.id} className="trip-card">
                                <div className="trip-card-header">
                                    <div className="trip-route">
                                        <span className="from">{trip.from}</span>
                                        <span className="arrow">→</span>
                                        <span className="to">{trip.to}</span>
                                    </div>
                                    <div className="trip-status">
                                        <span 
                                            className={`status-badge ${trip.status || 'pending'}`}
                                            style={{ backgroundColor: getStatusColor(trip.status || 'pending') }}
                                        >
                                            {getStatusIcon(trip.status || 'pending')} {(trip.status || 'pending').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="trip-details">
                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="label">Travel Date</span>
                                            <span className="value">{formatDate(trip.date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">AC Type</span>
                                            <span className="value">{trip.acType}</span>
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="label">Cost</span>
                                            <span className="value cost">{formatCurrency(trip.cost)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">Requested</span>
                                            <span className="value">{formatDate(trip.requestedAt)}</span>
                                        </div>
                                    </div>
                                    {trip.advancePaid && (
                                        <div className="detail-row">
                                            <div className="detail-item">
                                                <span className="label">Advance Paid</span>
                                                <span className="value advance-paid">{formatCurrency(trip.advancePaid)}</span>
                                            </div>
                                            {trip.paymentStatus && (
                                                <div className="detail-item">
                                                    <span className="label">Payment Status</span>
                                                    <span className={`value payment-status ${trip.paymentStatus}`}>
                                                        {trip.paymentStatus === 'paid' ? '✅ Paid' : '⌛ Pending'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {customerTrips.length > 5 && (
                    <div className="view-all-trips">
                        <button className="view-all-btn">
                            View All {customerTrips.length} Trips
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CustomerProfile;
