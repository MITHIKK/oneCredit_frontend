import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleLogout = () => {
        onLogout();
        navigate('/');
        setShowMobileMenu(false);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/" onClick={() => setShowMobileMenu(false)}>🚌 SRI MURUGAN HOLIDAYS</Link>
            </div>
            
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                {showMobileMenu ? '✖️' : '☰'}
            </button>
            
            <div className={`nav-links ${showMobileMenu ? 'active' : ''}`}>
                <Link to="/" className="nav-link" onClick={() => setShowMobileMenu(false)}>🏠 Home</Link>
                <Link to="/book" className="nav-link" onClick={() => setShowMobileMenu(false)}>📅 Book Now</Link>
                <Link to="/calculate" className="nav-link" onClick={() => setShowMobileMenu(false)}>🧮 Calculate Cost</Link>
                <Link to="/contact" className="nav-link" onClick={() => setShowMobileMenu(false)}>📞 Contact</Link>
                
                {user ? (
                    
                    <>
                        {user.role === 'customer' ? (
                            <Link to="/dashboard" className="nav-link user-dashboard" onClick={() => setShowMobileMenu(false)}>
                                👤 My Dashboard
                            </Link>
                        ) : (
                            <Link to="/owner-dashboard" className="nav-link user-dashboard" onClick={() => setShowMobileMenu(false)}>
                                👨‍💼 Owner Dashboard
                            </Link>
                        )}
                        
                        <div className="nav-user-info">
                            <Link 
                                to="/profile" 
                                className="user-welcome-link"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Welcome, {user.name || user.username}!
                            </Link>
                            <button className="nav-logout-btn" onClick={handleLogout}>
                                🔓 Logout
                            </button>
                        </div>
                    </>
                ) : (
                    
                    <div className="nav-auth-links">
                        <Link to="/login" className="nav-link login-link" onClick={() => setShowMobileMenu(false)}>
                            🔐 Login
                        </Link>
                        <Link to="/signup" className="nav-link signup-link" onClick={() => setShowMobileMenu(false)}>
                            ✨ Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
