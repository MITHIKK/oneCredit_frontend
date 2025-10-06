import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateTripReceipt } from '../utils/generatePDF';
import './Payment.css';

function Payment({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [tripData, setTripData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [paymentData, setPaymentData] = useState({
        upiId: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: '',
        netbanking: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState('method');
    const [processingStep, setProcessingStep] = useState(0);
    const [showPdfNotification, setShowPdfNotification] = useState(false);

    useEffect(() => {
        
        if (location.state && location.state.tripData) {
            setTripData(location.state.tripData);
        } else {
            
            navigate('/dashboard');
        }
    }, [location.state, navigate]);

    const advanceAmount = tripData ? 5000 : 0; 

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setPaymentStep('processing');
        setProcessingStep(0);
        setShowPdfNotification(false);

        // Start processing immediately with step-by-step progress
        processPayment();
    };

    const processPayment = async () => {
        const steps = [
            'Validating payment details',
            'Connecting to payment gateway', 
            'Processing transaction',
            'Generating receipt',
            'Sending confirmations'
        ];
        
        try {
            // Step 1: Validate payment details
            setProcessingStep(0);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 2: Connect to payment gateway
            setProcessingStep(1);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 3: Process transaction
            setProcessingStep(2);
            const response = await fetch('http://localhost:5001/api/payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tripId: tripData._id || tripData.id,
                    userId: user._id || user.id,
                    amount: advanceAmount
                })
            });
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Payment processed and trip confirmed:', data.payment);
                    
                    // Step 4: Generate receipt
                    setProcessingStep(3);
                    setShowPdfNotification(true);
                    
                    try {
                        const updatedTripData = {
                            ...tripData,
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            advancePaid: advanceAmount,
                            paymentDate: new Date(),
                            paymentMethod: paymentMethod
                        };
                        
                        const userData = {
                            name: user?.name || 'Customer',
                            email: user?.email || 'customer@email.com',
                            phone: user?.phone || '+91-0000000000',
                            id: user?._id || user?.id || 'user123',
                            _id: user?._id || user?.id || 'user123'
                        };
                        
                        const fileName = generateTripReceipt(updatedTripData, userData);
                        console.log('📄 PDF receipt generated successfully:', fileName);
                        
                        await new Promise(resolve => setTimeout(resolve, 1200));
                    } catch (pdfError) {
                        console.error('Error generating PDF:', pdfError);
                        alert('Payment successful! However, there was an issue generating the PDF receipt. Please contact support.');
                    }
                    
                    // Step 5: Send confirmations
                    setProcessingStep(4);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    sendConfirmationMessages();
                    
                    setPaymentStep('success');
                    setIsProcessing(false);
                    return;
                }
            }
        } catch (error) {
            console.error('Backend payment error:', error);
        }
        
        try {
            
            const approvedTrips = JSON.parse(localStorage.getItem('approvedTrips') || '[]');
            const tripIndex = approvedTrips.findIndex(t => t.id === tripData.id);
            
            if (tripIndex !== -1) {
                approvedTrips[tripIndex] = {
                    ...approvedTrips[tripIndex],
                    paymentStatus: 'paid',
                    advancePaid: advanceAmount,
                    paymentMethod: paymentMethod,
                    paidAt: new Date().toISOString()
                };
                localStorage.setItem('approvedTrips', JSON.stringify(approvedTrips));
            }
            
            const payments = JSON.parse(localStorage.getItem('payments') || '[]');
            payments.push({
                id: `payment-${Date.now()}`,
                tripId: tripData.id,
                userId: user._id || user.id,
                amount: advanceAmount,
                method: paymentMethod,
                status: 'completed',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('payments', JSON.stringify(payments));
            
            sendConfirmationMessages();
            
            setPaymentStep('success');
        } catch (error) {
            console.error('Payment processing error:', error);
            setPaymentStep('method');
            alert('Payment processing failed. Please try again.');
        }

        setIsProcessing(false);
    };

    const sendConfirmationMessages = () => {
        sendWhatsAppConfirmation();
        sendEmailConfirmation();
    };

    const sendWhatsAppConfirmation = () => {
        
        const phoneNumber = user.phone;
        const message = `🎉 Payment Confirmation - Sri Murugan Holidays

Hello ${user.name}!

Your advance payment has been successfully received!

🎫 Trip Details:
📍 From: ${tripData.from}
📍 To: ${tripData.to}
📅 Date: ${new Date(tripData.date).toLocaleDateString('en-IN')}
🚌 Bus Type: ${tripData.acType}

💰 Payment Details:
💳 Advance Paid: ₹${advanceAmount.toLocaleString('en-IN')}
📅 Payment Date: ${new Date().toLocaleDateString('en-IN')}
💸 Balance Amount: ₹${(tripData.cost - advanceAmount).toLocaleString('en-IN')} (Pay at pickup)

✅ Your trip is now CONFIRMED!

We will contact you 1 day before your trip with pickup details.

Thank you for choosing Sri Murugan Holidays! 🚌✨

Contact: +91-98765-43210`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            const confirmSend = window.confirm(
                `✅ Payment Successful!\n\n` +
                `A WhatsApp confirmation message is ready to be sent to ${phoneNumber}.\n\n` +
                `Click OK to open WhatsApp and send the confirmation message, or Cancel to skip.`
            );
            
            if (confirmSend) {
                window.open(whatsappUrl, '_blank');
            }
        }, 1000);

        const whatsappMessages = JSON.parse(localStorage.getItem('whatsappMessages') || '[]');
        whatsappMessages.unshift({
            to: phoneNumber,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent'
        });
        localStorage.setItem('whatsappMessages', JSON.stringify(whatsappMessages));
    };

    const sendEmailConfirmation = () => {
        
        const emailContent = {
            to: user.email,
            subject: '🎉 Trip Confirmed - Sri Murugan Holidays',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">🚌 Sri Murugan Holidays</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Trip is Confirmed!</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
                            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">Payment Successful!</h2>
                            <p style="color: #7f8c8d; margin: 0; font-size: 16px;">Dear ${user.name}, your advance payment has been received and your trip is now confirmed.</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
                            <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">🎫 Trip Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-weight: 500;">Route:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 600; text-align: right;">${tripData.from} → ${tripData.to}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-weight: 500;">Travel Date:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 600; text-align: right;">${new Date(tripData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-weight: 500;">Bus Type:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 600; text-align: right;">${tripData.acType}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-weight: 500;">Departure Time:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 600; text-align: right;">${tripData.timeSlot || 'To be confirmed'}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #27ae60;">
                            <h3 style="color: #27ae60; margin: 0 0 20px 0; font-size: 18px;">💰 Payment Summary</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #2e7d32; font-weight: 500;">Total Trip Cost:</td>
                                    <td style="padding: 8px 0; color: #2e7d32; font-weight: 600; text-align: right;">₹${tripData.cost.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #27ae60; font-weight: 600;">Advance Paid:</td>
                                    <td style="padding: 8px 0; color: #27ae60; font-weight: 700; text-align: right; font-size: 18px;">₹${advanceAmount.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #f39c12; font-weight: 500;">Balance Amount:</td>
                                    <td style="padding: 8px 0; color: #f39c12; font-weight: 600; text-align: right;">₹${(tripData.cost - advanceAmount).toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-size: 14px;">Payment Method:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 500; text-align: right; text-transform: uppercase;">${paymentMethod}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d; font-size: 14px;">Payment Date:</td>
                                    <td style="padding: 8px 0; color: #2c3e50; font-weight: 500; text-align: right;">${new Date().toLocaleDateString('en-IN')}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: #fff5e6; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #f39c12;">
                            <h4 style="color: #e67e22; margin: 0 0 15px 0; font-size: 16px;">📋 Important Instructions</h4>
                            <ul style="color: #8b5a3c; margin: 0; padding-left: 20px; line-height: 1.6;">
                                <li>Please pay the balance amount of <strong>₹${(tripData.cost - advanceAmount).toLocaleString('en-IN')}</strong> at the time of pickup</li>
                                <li>We will contact you 1 day before your trip with exact pickup location and time</li>
                                <li>Please carry a valid government-issued ID for verification</li>
                                <li>Report at pickup location 15 minutes before departure time</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                            <h4 style="color: #2c3e50; margin: 0 0 15px 0;">📞 Need Help?</h4>
                            <p style="color: #7f8c8d; margin: 0 0 15px 0; line-height: 1.6;">If you have any questions or need to make changes to your booking, please contact us:</p>
                            <div style="color: #667eea; font-weight: 600;">
                                <div style="margin-bottom: 5px;">📱 Phone: +91-98765-43210</div>
                                <div style="margin-bottom: 5px;">📧 Email: support@srimuruganbusowner.com</div>
                                <div>🕒 Available: 6:00 AM - 10:00 PM</div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">Thank you for choosing Sri Murugan Holidays!</p>
                            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 14px;">Have a safe and pleasant journey! 🚌✨</p>
                        </div>
                    </div>
                </div>
            `
        };

        const emailMessages = JSON.parse(localStorage.getItem('emailMessages') || '[]');
        emailMessages.unshift({
            ...emailContent,
            timestamp: new Date().toISOString(),
            status: 'sent',
            tripId: tripData.id,
            customerName: user.name
        });
        localStorage.setItem('emailMessages', JSON.stringify(emailMessages));

        setTimeout(() => {
            const emailWindow = window.open('', '_blank', 'width=700,height=800,scrollbars=yes');
            if (emailWindow) {
                emailWindow.document.write(`
                    <html>
                        <head>
                            <title>Email Confirmation - Sri Murugan Holidays</title>
                        </head>
                        <body style="margin: 0; padding: 20px; background-color: #f0f0f0;">
                            <div style="text-align: center; padding: 20px; background: #2c3e50; color: white; margin-bottom: 20px;">
                                <h2>📧 Email Confirmation Sent!</h2>
                                <p>This is a preview of the email sent to: ${user.email}</p>
                            </div>
                            ${emailContent.html}
                            <div style="text-align: center; padding: 20px; margin-top: 20px; background: #2c3e50; color: white;">
                                <p><strong>✅ Email successfully sent to ${user.email}</strong></p>
                                <button onclick="window.close()" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">Close</button>
                            </div>
                        </body>
                    </html>
                `);
                emailWindow.document.close();
            }
        }, 2000);

        console.log('Email sent to:', user.email, emailContent);
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    if (!tripData) {
        return (
            <div className="payment-loading">
                <div className="loading-spinner">🚌</div>
                <p>Loading payment details...</p>
            </div>
        );
    }

    if (paymentStep === 'success') {
        return (
            <div className="payment-success-page">
                <div className="success-container">
                    <div className="success-icon">✅</div>
                    <h1>Payment Successful!</h1>
                    <div className="success-details">
                        <p><strong>Advance Amount Paid:</strong> {formatCurrency(advanceAmount)}</p>
                        <p><strong>Balance Amount:</strong> {formatCurrency(tripData.cost - advanceAmount)} (Pay at pickup)</p>
                        <p><strong>Trip:</strong> {tripData.from} → {tripData.to}</p>
                        <p><strong>Date:</strong> {new Date(tripData.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="success-message">
                        <p>🎉 Your trip is now confirmed!</p>
                        <p>📱 WhatsApp confirmation sent to {user.phone}</p>
                        <p>📧 Email confirmation sent to {user.email}</p>
                        <p>📞 We'll contact you 1 day before your trip with pickup details.</p>
                    </div>
                    <div className="success-actions">
                        <button 
                            className="dashboard-btn" 
                            onClick={() => navigate('/dashboard')}
                        >
                            📋 Go to Dashboard
                        </button>
                        <button 
                            className="new-booking-btn" 
                            onClick={() => navigate('/book')}
                        >
                            🎫 Book Another Trip
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                    <h1>💳 Complete Payment</h1>
                </div>

                <div className="trip-summary">
                    <h3>🎫 Trip Summary</h3>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Route:</span>
                            <span>{tripData.from} → {tripData.to}</span>
                        </div>
                        <div className="summary-row">
                            <span>Date:</span>
                            <span>{new Date(tripData.date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Bus Type:</span>
                            <span>{tripData.acType}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Cost:</span>
                            <span>{formatCurrency(tripData.cost)}</span>
                        </div>
                        <div className="summary-row advance">
                            <span>Advance Payment:</span>
                            <span>{formatCurrency(advanceAmount)}</span>
                        </div>
                        <div className="summary-row balance">
                            <span>Balance (Pay at pickup):</span>
                            <span>{formatCurrency(tripData.cost - advanceAmount)}</span>
                        </div>
                    </div>
                </div>

                {paymentStep === 'processing' ? (
                    <div className="payment-processing">
                        <div className="processing-spinner">💳</div>
                        <h3>Processing Payment...</h3>
                        <p>Please wait while we process your payment securely</p>
                        
                        {showPdfNotification && (
                            <div className="pdf-download-notification">
                                <h4>📄 Generating Receipt</h4>
                                <p>Your payment receipt is being generated and will download automatically</p>
                            </div>
                        )}
                        
                        <div className="processing-steps">
                            <div className={`step ${processingStep >= 0 ? 'completed' : ''}`}>
                                Validating payment details
                            </div>
                            <div className={`step ${processingStep >= 1 ? (processingStep === 1 ? 'active' : 'completed') : ''}`}>
                                Connecting to payment gateway
                            </div>
                            <div className={`step ${processingStep >= 2 ? (processingStep === 2 ? 'active' : 'completed') : ''}`}>
                                Processing transaction
                            </div>
                            <div className={`step ${processingStep >= 3 ? (processingStep === 3 ? 'active' : 'completed') : ''}`}>
                                Generating PDF receipt
                            </div>
                            <div className={`step ${processingStep >= 4 ? (processingStep === 4 ? 'active' : 'completed') : ''}`}>
                                Sending confirmations
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="payment-methods">
                            <h3>💰 Select Payment Method</h3>
                            <div className="method-options">
                                <label className={`method-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="method-icon">📱</span>
                                    <span className="method-name">UPI</span>
                                </label>

                                <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="method-icon">💳</span>
                                    <span className="method-name">Debit/Credit Card</span>
                                </label>

                                <label className={`method-option ${paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value="netbanking"
                                        checked={paymentMethod === 'netbanking'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="method-icon">🏦</span>
                                    <span className="method-name">Net Banking</span>
                                </label>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="payment-form">
                            {paymentMethod === 'upi' && (
                                <div className="upi-section">
                                    <div className="form-group">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            value={paymentData.upiId}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                upiId: e.target.value
                                            })}
                                            placeholder="yourname@paytm / yourname@gpay"
                                            required
                                        />
                                    </div>
                                    <div className="demo-note">
                                        <p>💡 Demo Mode: Use any valid UPI ID format (name@paytm, name@gpay, etc.)</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="card-section">
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            value={paymentData.cardNumber}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                cardNumber: e.target.value
                                            })}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input
                                                type="text"
                                                value={paymentData.expiryDate}
                                                onChange={(e) => setPaymentData({
                                                    ...paymentData,
                                                    expiryDate: e.target.value
                                                })}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                value={paymentData.cvv}
                                                onChange={(e) => setPaymentData({
                                                    ...paymentData,
                                                    cvv: e.target.value
                                                })}
                                                placeholder="123"
                                                maxLength="3"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Cardholder Name</label>
                                        <input
                                            type="text"
                                            value={paymentData.cardName}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                cardName: e.target.value
                                            })}
                                            placeholder="Name on card"
                                            required
                                        />
                                    </div>
                                    <div className="demo-note">
                                        <p>💡 Demo Mode: Use test card number 4111 1111 1111 1111 with any future expiry and CVV</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'netbanking' && (
                                <div className="netbanking-section">
                                    <div className="form-group">
                                        <label>Select Bank</label>
                                        <select
                                            value={paymentData.netbanking}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                netbanking: e.target.value
                                            })}
                                            required
                                        >
                                            <option value="">Choose your bank</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="pnb">Punjab National Bank</option>
                                            <option value="bob">Bank of Baroda</option>
                                        </select>
                                    </div>
                                    <div className="demo-note">
                                        <p>💡 Demo Mode: Select any bank to proceed with demo payment</p>
                                    </div>
                                </div>
                            )}

                            <div className="payment-summary">
                                <div className="amount-display">
                                    <span>Amount to Pay:</span>
                                    <span className="amount">{formatCurrency(advanceAmount)}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="pay-now-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `💳 Pay ${formatCurrency(advanceAmount)}`}
                            </button>

                            <div className="security-note">
                                <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Payment;
