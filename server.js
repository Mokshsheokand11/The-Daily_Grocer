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
