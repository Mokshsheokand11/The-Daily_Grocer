const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');

// Helper to read JSON files
const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Helper to write JSON files
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing to ${filePath}:`, error);
        return false;
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Frontend')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

// GET all products
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE);
    res.json(products);
});

// POST update or add product (Admin)
app.post('/api/products', (req, res) => {
    const { product } = req.body;
    let products = readJSON(PRODUCTS_FILE);
    
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...product };
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ ...product, id: newId });
    }
    
    if (writeJSON(PRODUCTS_FILE, products)) {
        res.json({ success: true, message: 'Product saved' });
    } else {
        res.status(500).json({ success: false, error: 'Failed to save product' });
    }
});

// DELETE a product (Admin)
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let products = readJSON(PRODUCTS_FILE);
    const filtered = products.filter(p => p.id !== id);
    
    if (writeJSON(PRODUCTS_FILE, filtered)) {
        res.json({ success: true, message: 'Product deleted' });
    } else {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// POST checkout - processes sale, updates stock, saves bill
app.post('/api/checkout', (req, res) => {
    try {
        const { customerName, customerPhone, items, subtotal, gst, grandTotal } = req.body;
        
        // 1. Process Stock
        let products = readJSON(PRODUCTS_FILE);
        let stockError = null;

        items.forEach(item => {
            const product = products.find(p => p.name === item.name);
            if (product) {
                if (product.stock < item.quantity) {
                    stockError = `Insufficient stock for ${item.name} (Available: ${product.stock})`;
                } else {
                    product.stock -= item.quantity;
                }
            }
        });

        if (stockError) {
            return res.status(400).json({ success: false, error: stockError });
        }

        // 2. Save Bill
        let bills = readJSON(BILLS_FILE);
        const newBill = {
            id: Date.now(),
            customerName,
            customerPhone,
            items,
            subtotal,
            gst,
            grandTotal,
            date: new Date().toLocaleString(),
            timestamp: new Date().toISOString()
        };
        bills.push(newBill);

        if (writeJSON(PRODUCTS_FILE, products) && writeJSON(BILLS_FILE, bills)) {
            res.json({
                success: true,
                message: 'Checkout successful',
                bill: newBill
            });
        } else {
            res.status(500).json({ success: false, error: 'Failed to save transaction' });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// GET all bills (History)
app.get('/api/bills', (req, res) => {
    const bills = readJSON(BILLS_FILE);
    res.json(bills);
});

// DELETE all bills (Clear History)
app.delete('/api/bills', (req, res) => {
    if (writeJSON(BILLS_FILE, [])) {
        res.json({ success: true, message: 'All bills deleted' });
    } else {
        res.status(500).json({ success: false, error: 'Failed to clear bill history' });
    }
});

// Email endpoint for sending bills
app.post('/api/send-bill', (req, res) => {
    try {
        const { email, bill } = req.body;
        if (!email || !bill) {
            return res.status(400).json({ success: false, error: 'Email and bill data required' });
        }

        // Simulating email sending
        console.log(`\n📧 Bill sent to ${email} for Customer: ${bill.customerName}`);
        res.json({ success: true, message: `Bill sent successfully to ${email}` });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🛍️  THE_DAILY_GROCER - PRO Supermarket System            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server is running on: http://localhost:${PORT}`);
    console.log('');
});
