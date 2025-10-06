import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateTripReceipt = (tripData, userData) => {
    try {
        console.log('Starting PDF generation...');
        console.log('Trip Data:', tripData);
        console.log('User Data:', userData);
        
        const doc = new jsPDF();
        
        let yPos = 20;
        
        doc.setFillColor(26, 188, 156);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SRI MURUGAN HOLIDAYS', 105, yPos, { align: 'center' });
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Premium Bus Travel Services', 105, yPos, { align: 'center' });
    
        yPos = 55;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('BOOKING CONFIRMATION', 105, yPos, { align: 'center' });
        
        yPos = 70;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const receiptId = tripData._id || tripData.id || `RCP-${Date.now()}`;
        doc.text(`Receipt No: ${receiptId}`, 20, yPos);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 150, yPos);
        
        yPos = 80;
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos, 180, 35, 'F');
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CUSTOMER DETAILS', 20, yPos);
        
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const customerName = tripData.customerName || userData?.name || 'Customer';
        const customerEmail = tripData.customerEmail || userData?.email || 'N/A';
        const customerPhone = tripData.customerPhone || userData?.phone || 'N/A';
        const customerId = tripData.customerId || userData?._id || userData?.id || 'N/A';
        
        doc.text(`Name: ${customerName}`, 20, yPos);
        doc.text(`Email: ${customerEmail}`, 20, yPos + 7);
        doc.text(`Phone: ${customerPhone}`, 110, yPos);
        doc.text(`Customer ID: ${customerId}`, 110, yPos + 7);
    
        yPos = 120;
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos, 180, 55, 'F');
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TRIP DETAILS', 20, yPos);
        
        const fromLocation = tripData.from || 'N/A';
        const toLocation = tripData.to || 'N/A';
        let tripDate = 'N/A';
        try {
            if (tripData.date) {
                tripDate = new Date(tripData.date).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        } catch (e) {
            console.error('Date formatting error:', e);
            tripDate = tripData.date || 'N/A';
        }
        
        const timeSlot = tripData.timeSlot || '09:00 AM';
        const busType = tripData.acType === 'AC' ? 'AC Bus' : 'Non-AC Bus';
        const tripStatus = tripData.status === 'confirmed' ? 'CONFIRMED' : (tripData.status || 'PENDING').toUpperCase();
        
        const tripDetails = [
            ['Route', `${fromLocation} to ${toLocation}`],
            ['Travel Date', tripDate],
            ['Departure Time', timeSlot],
            ['Bus Type', busType],
            ['Trip Status', tripStatus]
        ];
    
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: yPos + 5,
                head: [],
                body: tripDetails,
                theme: 'plain',
                styles: {
                    cellPadding: 2,
                    fontSize: 10,
                    textColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40 },
                    1: { cellWidth: 140 }
                }
            });
        } else {
            
            yPos += 10;
            doc.setFontSize(10);
            tripDetails.forEach((detail, index) => {
                doc.setFont('helvetica', 'bold');
                doc.text(detail[0] + ':', 25, yPos + (index * 7));
                doc.setFont('helvetica', 'normal');
                doc.text(detail[1], 70, yPos + (index * 7));
            });
        }
    
        yPos = 180;
        doc.setFillColor(230, 255, 230);
        doc.rect(15, yPos, 180, 50, 'F');
        
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT DETAILS', 20, yPos);
        
        const totalCost = Number(tripData.cost) || 0;
        const advancePaid = Number(tripData.advancePaid) || 5000;
        const balanceAmount = totalCost - advancePaid;
        const paymentMethod = tripData.paymentMethod || 'Online Payment';
        
        let paymentDate = new Date().toLocaleDateString('en-IN');
        try {
            if (tripData.paymentDate) {
                paymentDate = new Date(tripData.paymentDate).toLocaleDateString('en-IN');
            }
        } catch (e) {
            console.error('Payment date formatting error:', e);
        }
        
        const paymentDetails = [
            ['Total Trip Cost', `Rs. ${totalCost.toLocaleString('en-IN')}`],
            ['Advance Paid', `Rs. ${advancePaid.toLocaleString('en-IN')}`],
            ['Balance Amount', `Rs. ${balanceAmount.toLocaleString('en-IN')}`],
            ['Payment Method', paymentMethod],
            ['Payment Date', paymentDate],
            ['Payment Status', 'PAID']
        ];
    
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: yPos + 5,
                head: [],
                body: paymentDetails,
                theme: 'plain',
                styles: {
                    cellPadding: 2,
                    fontSize: 10,
                    textColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 50 },
                    1: { cellWidth: 130, halign: 'right' }
                }
            });
        } else {
            
            yPos += 10;
            doc.setFontSize(10);
            paymentDetails.forEach((detail, index) => {
                doc.setFont('helvetica', 'bold');
                doc.text(detail[0] + ':', 25, yPos + (index * 7));
                doc.setFont('helvetica', 'normal');
                doc.text(detail[1], 150, yPos + (index * 7));
            });
        }
    
        yPos = 240;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('IMPORTANT NOTES:', 20, yPos);
        
        yPos += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const notes = [
            'Please carry this receipt and a valid ID proof during travel',
            'Balance amount to be paid at the time of boarding',
            'Reporting time: 30 minutes before departure',
            'For cancellations, contact us at least 24 hours before travel',
            'Contact: +91-98765-43210 | Email: support@srimuruganbusowner.com'
        ];
        
        notes.forEach(note => {
            doc.text('- ' + note, 20, yPos);
            yPos += 7;
        });
    
        yPos = 280;
        doc.setFillColor(26, 188, 156);
        doc.rect(0, yPos, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('Thank you for choosing Sri Murugan Holidays!', 105, yPos + 8, { align: 'center' });
        doc.text('Have a Safe and Pleasant Journey!', 105, yPos + 15, { align: 'center' });
        
        const fileName = `Sri_Murugan_Receipt_${receiptId.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        doc.save(fileName);
        
        console.log('PDF generated and saved successfully:', fileName);
        return fileName;
        
    } catch (error) {
        console.error('Detailed PDF generation error:', error);
        console.error('Error stack:', error.stack);
        alert(`Error generating PDF: ${error.message}\n\nPlease check the browser console for more details.`);
        throw error;
    }
};

export const testPDFGeneration = () => {
    try {
        const doc = new jsPDF();
        doc.text('Test PDF', 10, 10);
        doc.save('test.pdf');
        console.log('Test PDF generated successfully');
        return true;
    } catch (error) {
        console.error('Test PDF generation failed:', error);
        return false;
    }
};

export const generateDetailedInvoice = (tripData, userData) => {
    try {
        
        return generateTripReceipt(tripData, userData);
    } catch (error) {
        console.error('Error generating detailed invoice:', error);
        throw error;
    }
};
