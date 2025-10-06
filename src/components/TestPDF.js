import React from 'react';
import { jsPDF } from 'jspdf';
import { generateTripReceipt, testPDFGeneration } from '../utils/generatePDF';

function TestPDF() {
    const testSimplePDF = () => {
        try {
            console.log('Testing simple PDF generation...');
            const result = testPDFGeneration();
            if (result) {
                alert('Simple PDF test successful!');
            } else {
                alert('Simple PDF test failed. Check console.');
            }
        } catch (error) {
            console.error('Simple PDF test error:', error);
            alert('Error: ' + error.message);
        }
    };

    const testBasicPDF = () => {
        try {
            console.log('Testing basic jsPDF...');
            const doc = new jsPDF();
            
            doc.text('Hello World', 10, 10);
            doc.text('This is a test PDF', 10, 20);
            
            doc.save('basic-test.pdf');
            
            alert('Basic PDF generated successfully!');
        } catch (error) {
            console.error('Basic PDF error:', error);
            alert('Error: ' + error.message);
        }
    };

    const testFullReceipt = () => {
        try {
            console.log('Testing full receipt generation...');
            
            const tripData = {
                id: 'TEST123',
                from: 'Chennai',
                to: 'Bangalore',
                date: new Date().toISOString(),
                timeSlot: '09:00 AM',
                acType: 'AC',
                cost: 15000,
                status: 'confirmed',
                advancePaid: 5000,
                paymentDate: new Date().toISOString(),
                paymentMethod: 'UPI',
                customerName: 'Test Customer',
                customerEmail: 'test@example.com',
                customerPhone: '+91-9876543210'
            };
            
            const userData = {
                id: 'USER123',
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '+91-9876543210'
            };
            
            const result = generateTripReceipt(tripData, userData);
            console.log('Receipt generated:', result);
            alert('Full receipt generated successfully!');
        } catch (error) {
            console.error('Full receipt error:', error);
            alert('Error: ' + error.message);
        }
    };

    const testMinimalPDF = () => {
        try {
            console.log('Testing minimal PDF with safe options...');
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text('Sri Murugan Holidays', 20, 20);
            
            doc.setFontSize(12);
            doc.text('Receipt', 20, 30);
            
            doc.setFontSize(10);
            doc.text('From: Chennai', 20, 40);
            doc.text('To: Bangalore', 20, 50);
            doc.text('Date: ' + new Date().toLocaleDateString(), 20, 60);
            doc.text('Amount: Rs. 5000', 20, 70);
            
            doc.save('minimal-test.pdf');
            
            alert('Minimal PDF generated successfully!');
        } catch (error) {
            console.error('Minimal PDF error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            alert('Error: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>PDF Generation Test Page</h2>
            <p>Click the buttons below to test different PDF generation methods:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', marginTop: '20px' }}>
                <button 
                    onClick={testBasicPDF}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Test Basic PDF (Hello World)
                </button>
                
                <button 
                    onClick={testMinimalPDF}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#9b59b6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Test Minimal Receipt PDF
                </button>
                
                <button 
                    onClick={testSimplePDF}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Test Simple PDF (Utility Function)
                </button>
                
                <button 
                    onClick={testFullReceipt}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Test Full Receipt Generation
                </button>
            </div>
            
            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                <h3>Instructions:</h3>
                <ol>
                    <li>Open the browser console (F12) before testing</li>
                    <li>Start with "Test Basic PDF" to verify jsPDF is working</li>
                    <li>If basic test works, try "Test Minimal Receipt PDF"</li>
                    <li>Finally, test the full receipt generation</li>
                    <li>Check console for any error messages</li>
                </ol>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                <h3>Common Issues:</h3>
                <ul>
                    <li><strong>Import Error:</strong> Check if jspdf is properly installed</li>
                    <li><strong>Font Error:</strong> Default fonts might not be available</li>
                    <li><strong>AutoTable Error:</strong> jspdf-autotable might not be properly imported</li>
                    <li><strong>Save Error:</strong> Browser might block the download</li>
                </ul>
            </div>
        </div>
    );
}

export default TestPDF;
