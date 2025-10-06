import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingForm.css';

function BookingForm({ user }) {
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState({
        fromDestination: '',
        toDestination: '',
        date: '',
        isAC: false,
        timeSlot: ''
    });

    const [showConfirmation, setShowConfirmation] = useState(false);

    const destinations = {
        from: ['Karur', 'Namakkal', 'Salem', 'Trichy', 'Erode'],
        to: ['Kodaikanal', 'Ooty', 'Munnar', 'Valparai']
    };

    const baseRates = {
        'Kodaikanal': 50000,
        'Ooty': 55000,
        'Munnar': 65000,
        'Valparai': 52000
    };

    const calculateCost = () => {
        if (!bookingData.toDestination) return 0;
        
        let total = baseRates[bookingData.toDestination];
        
        if (bookingData.isAC) {
            total += 5000;
        }
        
        total += 3000;
        
        return total;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!user) {
            alert('Please log in to book a trip.');
            navigate('/login');
            return;
        }
        
        setShowConfirmation(true);
    };

    const confirmBooking = async () => {
        try {
            
            const tripRequest = {
                userId: user._id || user.id || user.username,
                customerId: user._id || user.id || user.username,  
                customerName: user.name || user.username,
                customerEmail: user.email || '',
                customerPhone: user.phone || '',
                from: bookingData.fromDestination,
                to: bookingData.toDestination,
                date: bookingData.date,
                timeSlot: bookingData.timeSlot,
                acType: bookingData.isAC ? 'AC' : 'Non-AC',
                travelers: [{
                    firstName: user.name?.split(' ')[0] || user.username,
                    lastName: user.name?.split(' ')[1] || '',
                    dateOfBirth: new Date('1990-01-01'),
                    gender: 'prefer_not_to_say',
                    nationality: 'Indian'
                }],
                cost: calculateCost()
            };
            
            try {
                const response = await fetch('http://localhost:5001/api/trips/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(tripRequest)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert('🎉 Booking request submitted successfully! \n\nYour request has been sent to the owner for approval. You will be notified once it\'s approved.');
                        setShowConfirmation(false);
                        
                        setBookingData({
                            fromDestination: '',
                            toDestination: '',
                            date: '',
                            isAC: false,
                            timeSlot: ''
                        });
                        
                        navigate('/dashboard');
                        return;
                    }
                }
            } catch (backendError) {
                console.error('Backend booking error:', backendError);
                
            }
            
            const localTripRequest = {
                id: `trip-${Date.now()}`,
                customerId: user._id || user.id || user.username,
                customerName: user.name || user.username,
                customerEmail: user.email || '',
                customerPhone: user.phone || '',
                from: bookingData.fromDestination,
                to: bookingData.toDestination,
                date: bookingData.date,
                timeSlot: bookingData.timeSlot,
                acType: bookingData.isAC ? 'AC' : 'Non-AC',
                cost: calculateCost(),
                status: 'pending',
                requestedAt: new Date().toISOString()
            };
            
            const existingTrips = JSON.parse(localStorage.getItem('tripRequests') || '[]');
            existingTrips.push(localTripRequest);
            localStorage.setItem('tripRequests', JSON.stringify(existingTrips));
            
            const ownerNotifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
            ownerNotifications.unshift({
                type: 'new_booking',
                message: `New booking request from ${localTripRequest.customerName} for ${localTripRequest.from} to ${localTripRequest.to} on ${localTripRequest.date}`,
                tripId: localTripRequest.id,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('ownerNotifications', JSON.stringify(ownerNotifications));
            
            alert('🎉 Booking request submitted successfully! \n\nYour request has been sent to the owner for approval. You will be notified once it\'s approved.');
            setShowConfirmation(false);
            
            setBookingData({
                fromDestination: '',
                toDestination: '',
                date: '',
                isAC: false,
                timeSlot: ''
            });
            
            navigate('/dashboard');
            
        } catch (error) {
            console.error('Booking submission error:', error);
            alert('Error submitting booking request. Please try again.');
        }
    };

    const cancelBooking = () => {
        setShowConfirmation(false);
    };

    const timeSlots = [
        "06:00 AM", "09:00 AM", "12:00 PM",
        "03:00 PM", "06:00 PM", "09:00 PM"
    ];

    return (
        <div className="booking-form">
            <div className="booking-header">
                <h2>🚌 Tour Bus Booking</h2>
                {user ? (
                    <p className="user-info">Booking as: <strong>{user.name}</strong></p>
                ) : (
                    <p className="login-prompt">
                        Please <button className="login-link" onClick={() => navigate('/login')}>log in</button> to book a trip
                    </p>
                )}
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>From (Departure City):</label>
                    <select
                        value={bookingData.fromDestination}
                        onChange={(e) => setBookingData({
                            ...bookingData,
                            fromDestination: e.target.value
                        })}
                        required
                    >
                        <option value="">Select departure city</option>
                        {destinations.from.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>To (Destination):</label>
                    <select
                        value={bookingData.toDestination}
                        onChange={(e) => setBookingData({
                            ...bookingData,
                            toDestination: e.target.value
                        })}
                        required
                    >
                        <option value="">Select destination</option>
                        {destinations.to.map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={bookingData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingData({
                            ...bookingData,
                            date: e.target.value
                        })}
                        required
                    />
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={bookingData.isAC}
                            onChange={(e) => setBookingData({
                                ...bookingData,
                                isAC: e.target.checked
                            })}
                        />
                        AC Bus (+₹5,000)
                    </label>
                </div>

                <div className="form-group">
                    <label>Time Slot:</label>
                    <select
                        value={bookingData.timeSlot}
                        onChange={(e) => setBookingData({
                            ...bookingData,
                            timeSlot: e.target.value
                        })}
                        required
                    >
                        <option value="">Select departure time</option>
                        {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                        ))}
                    </select>
                </div>

                {}
                {bookingData.toDestination && (
                    <div className="cost-preview">
                        <h3>Estimated Cost: ₹{calculateCost().toLocaleString('en-IN')}</h3>
                    </div>
                )}

                <button type="submit" className="submit-btn">Book Now</button>
            </form>

            {}
            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h3>🎫 Booking Confirmation</h3>
                        <div className="confirmation-details">
                            <div className="detail-row">
                                <span className="detail-label">From:</span>
                                <span className="detail-value">{bookingData.fromDestination}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">To:</span>
                                <span className="detail-value">{bookingData.toDestination}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Date:</span>
                                <span className="detail-value">{bookingData.date}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Time:</span>
                                <span className="detail-value">{bookingData.timeSlot}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Bus Type:</span>
                                <span className="detail-value">{bookingData.isAC ? 'AC Bus' : 'Non-AC Bus'}</span>
                            </div>
                            <div className="detail-row total-cost">
                                <span className="detail-label">Total Cost:</span>
                                <span className="detail-value">₹{calculateCost().toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <div className="confirmation-actions">
                            <button className="confirm-btn" onClick={confirmBooking}>
                                ✅ Confirm Booking
                            </button>
                            <button className="cancel-btn" onClick={cancelBooking}>
                                ❌ Cancel
                            </button>
                        </div>
                        <p className="confirmation-note">
                            * We will contact you within 2 hours to confirm and collect advance payment
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookingForm;
