import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <div className="home-overlay"></div>
            <div className="home-content">
                <div className="welcome-section">
                    <div className="bus-icon">🚌</div>
                    <h1>Welcome to Sri Murugan Holidays</h1>
                    <p>Your Journey, Our Priority</p>
                    <div className="tagline">
                        <span>✨ Comfortable • Safe • Reliable ✨</span>
                    </div>
                    <div className="cta-section">
                        <Link to="/book" className="cta-button primary">📅 Book Your Journey</Link>
                        <Link to="/calculate" className="cta-button secondary">🧮 Calculate Cost</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
