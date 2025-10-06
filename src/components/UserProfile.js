import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

function UserProfile({ user }) {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        address: '',
        bio: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userStats, setUserStats] = useState({
        totalTrips: 0,
        pendingTrips: 0,
        approvedTrips: 0,
        completedTrips: 0,
        totalSpent: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        loadUserProfile();
        
        if (user.role === 'customer') {
            loadUserStats();
        }
    }, [user, navigate]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            
            const response = await fetch(`http://localhost:5001/api/users/${user._id || user.id}/profile`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const userData = data.user;
                    setProfileData({
                        name: userData.fullName || userData.firstName + ' ' + userData.lastName || user.name,
                        username: userData.email || user.username,
                        email: userData.email || user.email,
                        phone: userData.phone || user.phone || '',
                        address: userData.address ? 
                            `${userData.address.street || ''} ${userData.address.city || ''} ${userData.address.state || ''} ${userData.address.country || ''}`.trim() : '',
                        bio: userData.bio || ''
                    });
                    
                    if (userData.completedTrips !== undefined) {
                        setUserStats(prev => ({
                            ...prev,
                            completedTrips: userData.completedTrips,
                            pendingTrips: userData.pendingTrips
                        }));
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading profile from backend:', error);
        } finally {
            setLoading(false);
        }
        
        const savedProfile = localStorage.getItem(`userProfile_${user.id || user._id || user.username}`);
        if (savedProfile) {
            setProfileData(JSON.parse(savedProfile));
        } else {
            
            setProfileData({
                name: user.name || user.username,
                username: user.username,
                email: user.email || '',
                phone: user.phone || '',
                address: '',
                bio: ''
            });
        }
    };

    const loadUserStats = async () => {
        if (user.role !== 'customer') return;

        try {
            
            const response = await fetch(`http://localhost:5001/api/trips/customer/${user._id || user.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const pendingCount = data.pendingTrips.filter(t => t.status === 'draft').length;
                    const awaitingPaymentCount = data.pendingTrips.filter(t => t.status === 'planned').length;
                    const confirmedCount = data.approvedTrips.filter(t => t.status === 'booked').length;
                    const completedCount = data.completedTrips.length;
                    
                    const stats = {
                        totalTrips: pendingCount + awaitingPaymentCount + confirmedCount + completedCount,
                        pendingTrips: pendingCount + awaitingPaymentCount,
                        approvedTrips: confirmedCount,
                        completedTrips: completedCount,
                        totalSpent: 5000 * confirmedCount 
                    };
                    
                    setUserStats(stats);
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching stats from backend:', error);
        }
        
        const pendingTrips = JSON.parse(localStorage.getItem('tripRequests') || '[]');
        const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
        const completedTrips = JSON.parse(localStorage.getItem('completedTrips') || '[]');
        
        const userTrips = [
            ...pendingTrips.filter(trip => trip.customerId === (user._id || user.id || user.username)),
            ...approvedTrips.filter(trip => trip.customerId === (user._id || user.id || user.username)),
            ...completedTrips.filter(trip => trip.customerId === (user._id || user.id || user.username))
        ];

        const stats = {
            totalTrips: userTrips.length,
            pendingTrips: pendingTrips.filter(trip => trip.customerId === (user._id || user.id)).length,
            approvedTrips: approvedTrips.filter(trip => trip.customerId === (user._id || user.id)).length,
            completedTrips: completedTrips.filter(trip => trip.customerId === (user._id || user.id)).length,
            totalSpent: userTrips
                .filter(trip => trip.advancePaid)
                .reduce((sum, trip) => sum + (trip.advancePaid || 0), 0)
        };

        setUserStats(stats);
    };

    const handleSave = () => {
        
        localStorage.setItem(`userProfile_${user.id || user.username}`, JSON.stringify(profileData));
        
        const updatedUser = { ...user, name: profileData.name, email: profileData.email, phone: profileData.phone };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleCancel = () => {
        loadUserProfile(); 
        setIsEditing(false);
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!user) {
        return (
            <div className="user-profile-loading">
                <div className="loading-spinner">🔄</div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="user-profile">
            {}
            <div className="profile-header">
                <div className="header-actions">
                    <button 
                        onClick={() => navigate(user.role === 'owner' ? '/owner-dashboard' : '/dashboard')} 
                        className="back-btn"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                <div className="profile-info">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            {(profileData.name?.charAt(0) || profileData.username?.charAt(0) || '?').toUpperCase()}
                        </div>
                    </div>
                    <div className="profile-details">
                        <h1>{user.role === 'owner' ? 'Owner Profile' : 'My Profile'}</h1>
                        <p className="role-badge">
                            {user.role === 'owner' ? '👨‍💼 Bus Owner' : '👤 Customer'}
                        </p>
                    </div>
                </div>
            </div>

            {}
            <div className="profile-form-section">
                <div className="section-header">
                    <h2>📋 Profile Information</h2>
                    <button 
                        onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                        className="edit-btn"
                    >
                        {isEditing ? '❌ Cancel' : '✏️ Edit Profile'}
                    </button>
                </div>

                <div className="profile-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={profileData.username}
                            disabled={true}
                            placeholder="Username cannot be changed"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your address"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself"
                            rows={4}
                        />
                    </div>

                    {isEditing && (
                        <div className="form-actions">
                            <button onClick={handleSave} className="save-btn">
                                ✅ Save Changes
                            </button>
                            <button onClick={handleCancel} className="cancel-btn">
                                ❌ Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {}
            {user.role === 'customer' && (
                <div className="user-stats">
                    <h2>📊 Your Trip Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon">📈</div>
                            <div className="stat-content">
                                <h3>{userStats.totalTrips}</h3>
                                <p>Total Trips</p>
                            </div>
                        </div>
                        <div className="stat-card pending">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3>{userStats.pendingTrips}</h3>
                                <p>Pending</p>
                            </div>
                        </div>
                        <div className="stat-card approved">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <h3>{userStats.approvedTrips}</h3>
                                <p>Approved</p>
                            </div>
                        </div>
                        <div className="stat-card completed">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-content">
                                <h3>{userStats.completedTrips}</h3>
                                <p>Completed</p>
                            </div>
                        </div>
                        <div className="stat-card revenue">
                            <div className="stat-icon">💰</div>
                            <div className="stat-content">
                                <h3>{formatCurrency(userStats.totalSpent)}</h3>
                                <p>Total Spent</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            <div className="account-info">
                <h2>🔐 Account Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Account Type</span>
                        <span className="value">{user.role === 'owner' ? 'Business Owner' : 'Customer'}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Member Since</span>
                        <span className="value">Today</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Status</span>
                        <span className="value status-active">🟢 Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
