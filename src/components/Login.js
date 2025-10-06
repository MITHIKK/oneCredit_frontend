import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';
import './Login.css';

function Login({ onLogin }) {
    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
        role: 'customer' 
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginData.username,
                    password: loginData.password,
                    role: loginData.role
                })
            });

            const data = await response.json();

            if (response.ok) {
                const userData = {
                    ...data.user,
                    _id: data.user._id || data.user.id,
                    id: data.user._id || data.user.id
                };
                onLogin(userData);
            } else {
                setError(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please check if the server is running.');
        }
        
        setIsLoading(false);
    };

    const handleGoogleSuccess = (userData) => {
        onLogin(userData);
    };

    const handleGoogleError = (error) => {
        setError(error);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>🚌 Sri Murugan Holidays</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}
                    
                    {}
                    <div className="role-selection">
                        <label>
                            <input
                                type="radio"
                                value="customer"
                                checked={loginData.role === 'customer'}
                                onChange={(e) => setLoginData({
                                    ...loginData,
                                    role: e.target.value,
                                    username: '',
                                    password: ''
                                })}
                            />
                            <span className="role-option">
                                👤 Customer Login
                            </span>
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="owner"
                                checked={loginData.role === 'owner'}
                                onChange={(e) => setLoginData({
                                    ...loginData,
                                    role: e.target.value,
                                    username: '',
                                    password: ''
                                })}
                            />
                            <span className="role-option">
                                👨‍💼 Owner Login
                            </span>
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={loginData.username}
                            onChange={(e) => setLoginData({
                                ...loginData,
                                username: e.target.value
                            })}
                            placeholder={loginData.role === 'owner' ? 'Owner username' : 'Your username'}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({
                                ...loginData,
                                password: e.target.value
                            })}
                            placeholder="Your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? '🔄 Signing In...' : '🔐 Sign In'}
                    </button>

                    {loginData.role === 'customer' && (
                        <>
                            <div className="google-signin-divider">or</div>
                            <GoogleSignIn 
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                            />
                            <div className="signup-link">
                                <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
                            </div>
                        </>
                    )}

                    {loginData.role === 'owner' && (
                        <div className="owner-info">
                            <p>ℹ️ Owner login credentials are provided by system administrator</p>
                        </div>
                    )}
                </form>

                {}
                <div className="demo-credentials">
                    <h4>🧪 Demo Credentials:</h4>
                    <div className="demo-section">
                        <strong>Owner:</strong>
                        <p>Username: srimuruganbusowner</p>
                        <p>Password: muruganbus</p>
                    </div>
                    <div className="demo-section">
                        <strong>Customer:</strong>
                        <p>Create a new account or use registered credentials</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
