const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// API endpoint for bill generation (optional - for future backend integration)
app.post('/api/bill', (req, res) => {
    try {
        const { customerName, customerPhone, items, subtotal, gst, grandTotal } = req.body;
        
        // You can add backend logic here later
        res.json({
            success: true,
            message: 'Bill generated successfully',
            billData: {
                customerName,
                customerPhone,
                items,
                subtotal,
                gst,
                grandTotal,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Email endpoint for sending bills
app.post('/api/send-bill', (req, res) => {
    try {
        const { email, bill } = req.body;

        if (!email || !bill) {
            return res.status(400).json({ success: false, error: 'Email and bill data required' });
        }

        // Format bill for email
        let billContent = `
═══════════════════════════════════════════
        THE_DAILY_GROCER - BILL
═══════════════════════════════════════════

CUSTOMER DETAILS:
─────────────────────────────────────────
Name: ${bill.customerName}
Phone: ${bill.customerPhone}
Date: ${bill.date}

ITEMS PURCHASED:
─────────────────────────────────────────`;

        bill.items.forEach(item => {
            billContent += `
${item.name}
  Quantity: ${item.quantity} x Rs. ${item.price.toFixed(2)} = Rs. ${item.total.toFixed(2)}`;
        });

        billContent += `

─────────────────────────────────────────
Subtotal: Rs. ${bill.subtotal.toFixed(2)}
GST (16%): Rs. ${bill.gst.toFixed(2)}
═════════════════════════════════════════
TOTAL PAYABLE: Rs. ${bill.grandTotal.toFixed(2)}
═════════════════════════════════════════

Thank you for shopping with us! 🛍️
Visit us again soon!

www.thedailygrocer.com`;

        // In a production app, you would use nodemailer or SendGrid here
        // For now, we'll just log it and return success
        console.log(`\n📧 Bill sent to ${email}\n${billContent}`);
        
        res.json({
            success: true,
            message: `Bill sent successfully to ${email}`
        });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🛍️  THE_DAILY_GROCER - Supermarket Billing System        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server is running on: http://localhost:${PORT}`);
    console.log(`✅ Open your browser and navigate to: http://localhost:${PORT}`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});
