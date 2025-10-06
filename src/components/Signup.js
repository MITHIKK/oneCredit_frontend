import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css';

function Signup({ onSignup }) {
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!signupData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!signupData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!signupData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(signupData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!signupData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (signupData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!signupData.password) {
            newErrors.password = 'Password is required';
        } else if (signupData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (signupData.password !== signupData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            
            const response = await fetch('http://localhost:5001/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: signupData.name,
                    email: signupData.email,
                    phone: signupData.phone,
                    username: signupData.username,
                    password: signupData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                
                onSignup({
                    username: data.user.username,
                    role: 'customer',
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    id: data.user._id
                });
            } else {
                
                if (data.error.includes('Email')) {
                    setErrors({ email: data.error });
                } else if (data.error.includes('Username')) {
                    setErrors({ username: data.error });
                } else {
                    setErrors({ general: data.error });
                }
            }
        } catch (error) {
            console.error('Signup error:', error);
            setErrors({ general: 'Network error. Please check if the server is running.' });
        }

        setIsLoading(false);
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-header">
                    <h1>🚌 Sri Murugan Holidays</h1>
                    <p>Create your customer account</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                value={signupData.name}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    name: e.target.value
                                })}
                                placeholder="Enter your full name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                value={signupData.email}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    email: e.target.value
                                })}
                                placeholder="your.email@example.com"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                value={signupData.phone}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    phone: e.target.value
                                })}
                                placeholder="10-digit mobile number"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>

                        <div className="form-group">
                            <label>Username *</label>
                            <input
                                type="text"
                                value={signupData.username}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    username: e.target.value
                                })}
                                placeholder="Choose a username"
                                className={errors.username ? 'error' : ''}
                            />
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password *</label>
                            <input
                                type="password"
                                value={signupData.password}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    password: e.target.value
                                })}
                                placeholder="At least 6 characters"
                                className={errors.password ? 'error' : ''}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                value={signupData.confirmPassword}
                                onChange={(e) => setSignupData({
                                    ...signupData,
                                    confirmPassword: e.target.value
                                })}
                                placeholder="Re-enter password"
                                className={errors.confirmPassword ? 'error' : ''}
                            />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    <button type="submit" className="signup-btn" disabled={isLoading}>
                        {isLoading ? '🔄 Creating Account...' : '✨ Create Account'}
                    </button>

                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </form>

                <div className="terms-note">
                    <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
