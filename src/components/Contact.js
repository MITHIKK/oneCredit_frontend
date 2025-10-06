import React from 'react';
import './Contact.css';

function Contact() {
    const contactInfo = [
        {
            platform: 'Phone',
            icon: '📞',
            text: '8220391947',
            link: 'tel:+918220391947'
        },
        {
            platform: 'WhatsApp',
            icon: '📱',
            text: 'WhatsApp Group',
            link: 'https://wa.me/918220391947'
        },
        {
            platform: 'Instagram',
            icon: '📷',
            text: '@sri_murugan_bus_krr',
            link: 'https://instagram.com/sri_murugan_bus_krr'
        },
        {
            platform: 'Facebook',
            icon: '👥',
            text: 'Sri Murugan Holidays',
            link: 'https://facebook.com/srimuruganholidays'
        }
    ];

    const handleContactClick = (link, platform) => {
        if (platform === 'Phone') {
            window.open(link, '_self');
        } else {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <h1>Contact Sri Murugan Holidays</h1>
                    <p>Get in touch with us for your hill station tour bookings</p>
                </div>
            </section>

            <section className="contact-methods">
                <div className="container">
                    <div className="contact-grid">
                        {contactInfo.map((contact, index) => (
                            <div 
                                key={index} 
                                className="contact-card"
                                onClick={() => handleContactClick(contact.link, contact.platform)}
                            >
                                <div className="contact-icon">{contact.icon}</div>
                                <h3>{contact.platform}</h3>
                                <p className="contact-text">{contact.text}</p>
                                <button className="contact-btn">
                                    {contact.platform === 'Phone' ? 'Call Now' : 
                                     contact.platform === 'WhatsApp' ? 'Join Group' : 
                                     `Visit ${contact.platform}`}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="company-info">
                <div className="container">
                    <div className="info-grid">
                        <div className="info-card">
                            <h3>📍 Address</h3>
                            <p>123, Main Road, Bus Stand</p>
                            <p>Karur - 639001, Tamil Nadu</p>
                        </div>
                        
                        <div className="info-card">
                            <h3>🕒 Timing</h3>
                            <p>6:00 AM - 10:00 PM (Daily)</p>
                            <p className="highlight">24/7 Support Available</p>
                        </div>
                        
                        <div className="info-card">
                            <h3>✉️ Email</h3>
                            <p>info@srimuruganholidays.com</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Contact;
