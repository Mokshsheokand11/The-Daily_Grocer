// App State
let products = [];
let cart = new Map(); // Map<productId, {name, quantity, price}>
let isAdmin = false;

// DOM Elements
const productsGrid = document.getElementById("productsGrid");
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const searchInput = document.getElementById("searchInput");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const billModal = document.getElementById("billModal");
const billHistoryModal = document.getElementById("billHistoryModal");
const adminLoginModal = document.getElementById("adminLoginModal");
const adminDashboardModal = document.getElementById("adminDashboardModal");
const productModal = document.getElementById("productModal");

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    await fetchProducts();
    attachEventListeners();
    prepopulateCart(); // Added this
});

// Pre-populate Cart with some items
function prepopulateCart() {
    const itemsToAdd = [
        { id: 3, quantity: 2 },  // Milk
        { id: 5, quantity: 1 },  // Bread
        { id: 21, quantity: 3 }  // Chocolate
    ];

    itemsToAdd.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            cart.set(product.id, { name: product.name, price: product.price, quantity: item.quantity });
        }
    });

    updateCart();
    // Show the cart panel
    toggleCartPanel();
}

// Fetch Products from API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        showNotification("❌ Failed to load products");
    }
}

// Event Listeners
function attachEventListeners() {
    cartBtn.addEventListener("click", toggleCartPanel);
    closeCartBtn.addEventListener("click", closeCartPanel);
    searchInput.addEventListener("input", handleSearch);
    checkoutBtn.addEventListener("click", openCheckoutModal);
    clearCartBtn.addEventListener("click", clearCart);
    checkoutForm.addEventListener("submit", handleCheckout);
    
    // Admin Login Form
    document.getElementById("adminLoginForm").addEventListener("submit", handleAdminLogin);
    
    // Product Form
    document.getElementById("productForm").addEventListener("submit", saveProduct);

    // Inventory Search
    const inventorySearch = document.getElementById("inventorySearch");
    if (inventorySearch) {
        inventorySearch.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            renderInventoryTable(products.filter(p => p.name.toLowerCase().includes(term)));
        });
    }

    // Modal click-outside
    [checkoutModal, billModal, billHistoryModal, adminLoginModal, adminDashboardModal, productModal].forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("show");
                document.body.style.overflow = "auto";
            }
        });
    });

    // Close cart panel when clicking on backdrop
    cartBackdrop.addEventListener("click", closeCartPanel);
}

// Render Products
function renderProducts(productsToRender) {
    productsGrid.innerHTML = "";

    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #95a5a6;">No products found</p>';
        return;
    }

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = `product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`;

    const isOutOfStock = product.stock <= 0;

    card.innerHTML = `
        <div class="product-icon">${product.icon}</div>
        <div class="product-id">ID: ${product.id}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">Rs. ${product.price.toFixed(2)}</div>
        <div class="stock-info ${product.stock < 10 ? 'low-stock' : ''}">
            Stock: ${product.stock}
        </div>
        <div class="add-to-cart-section">
            <input type="number" class="qty-input" value="1" min="1" max="${product.stock}" ${isOutOfStock ? 'disabled' : ''}>
            <button class="add-btn" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? 'Sold Out' : 'Add'}
            </button>
        </div>
    `;

    const addBtn = card.querySelector(".add-btn");
    const qtyInput = card.querySelector(".qty-input");

    addBtn.onclick = (e) => {
        const qty = parseInt(qtyInput.value);
        if (qty > 0 && qty <= product.stock) {
            addToCart(product.id, product.name, product.price, qty);
        } else if (qty > product.stock) {
            showNotification("❌ Not enough stock!");
        }
    };

    return card;
}

// Cart Logic
function addToCart(productId, productName, price, quantity) {
    if (cart.has(productId)) {
        const item = cart.get(productId);
        item.quantity += quantity;
    } else {
        cart.set(productId, { name: productName, price, quantity });
    }
    updateCart();
    showNotification(`✅ ${productName} added!`);
}

function updateCart() {
    const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.size === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cartItems.innerHTML = "";
        cart.forEach((item, productId) => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-info">Rs. ${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-price">Rs. ${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-btn" onclick="removeFromCart(${productId})">×</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    updateCartSummary();
}

function updateCartSummary() {
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.quantity);
    const gst = subtotal * 0.16;
    const total = subtotal + gst;

    document.getElementById("subtotal").textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById("gst").textContent = `Rs. ${gst.toFixed(2)}`;
    document.getElementById("total").textContent = `Rs. ${total.toFixed(2)}`;
}

function removeFromCart(productId) {
    cart.delete(productId);
    updateCart();
}

function clearCart() {
    if (cart.size > 0 && confirm("Clear your cart?")) {
        cart.clear();
        updateCart();
    }
}

// Checkout Logic
function openCheckoutModal() {
    if (cart.size === 0) return;
    checkoutModal.classList.add("show");
}

function closeCheckoutModal() {
    checkoutModal.classList.remove("show");
    checkoutForm.reset();
}

async function handleCheckout(e) {
    e.preventDefault();
    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();

    const items = [];
    let subtotal = 0;
    cart.forEach((item, id) => {
        items.push({ name: item.name, quantity: item.quantity, price: item.price, total: item.price * item.quantity });
        subtotal += item.price * item.quantity;
    });

    const gst = subtotal * 0.16;
    const grandTotal = subtotal + gst;

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName, customerPhone, items, subtotal, gst, grandTotal })
        });

        const result = await response.json();
        if (result.success) {
            showBill(result.bill);
            cart.clear();
            updateCart();
            closeCheckoutModal();
            fetchProducts(); // Refresh stock
        } else {
            alert("Checkout failed: " + result.error);
        }
    } catch (error) {
        console.error("Checkout error:", error);
    }
}

function showBill(bill) {
    const billHTML = `
        <div class="bill-header">
            <h2>THE_DAILY_GROCER BILL</h2>
            <p>Thank you for your purchase!</p>
        </div>
        <div class="bill-info">
            <p><strong>Customer:</strong> ${bill.customerName}</p>
            <p><strong>Phone:</strong> ${bill.customerPhone}</p>
            <p><strong>Date:</strong> ${bill.date}</p>
        </div>
        <table class="bill-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${bill.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${item.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="bill-summary">
            <p>Subtotal: Rs. ${bill.subtotal.toFixed(2)}</p>
            <p>GST (16%): Rs. ${bill.gst.toFixed(2)}</p>
            <h3>Total: Rs. ${bill.grandTotal.toFixed(2)}</h3>
        </div>
    `;
    document.getElementById("billContent").innerHTML = billHTML;
    window.currentBill = bill;
    billModal.classList.add("show");
}

// Bill History
async function openBillHistoryModal() {
    try {
        const response = await fetch('/api/bills');
        const history = await response.json();
        const container = document.getElementById("billHistoryContainer");
        
        if (history.length === 0) {
            container.innerHTML = "<p>No transaction history found.</p>";
        } else {
            container.innerHTML = history.reverse().map(bill => `
                <div class="history-item">
                    <div>
                        <strong>${bill.customerName}</strong><br>
                        <small>${bill.date}</small>
                    </div>
                    <div>Rs. ${bill.grandTotal.toFixed(2)}</div>
                    <button class="btn-small" onclick='showBill(${JSON.stringify(bill)})'>View</button>
                </div>
            `).join('');
        }
        billHistoryModal.classList.add("show");
    } catch (error) {
        showNotification("❌ Failed to load history");
    }
}

// Admin Logic
function openAdminLoginModal() {
    adminLoginModal.classList.add("show");
}

function closeAdminLoginModal() {
    adminLoginModal.classList.remove("show");
    document.getElementById("adminLoginForm").reset();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById("adminPassword").value;
    if (pass.toUpperCase() === "THE_DAILY_GROCER") {
        isAdmin = true;
        closeAdminLoginModal();
        openAdminDashboardModal();
        showNotification("🔓 Admin Access Granted");
    } else {
        alert("Incorrect Password!");
    }
}

function openAdminDashboardModal() {
    if (!isAdmin) return;
    adminDashboardModal.classList.add("show");
    switchTab('inventory');
}

function closeAdminDashboardModal() {
    adminDashboardModal.classList.remove("show");
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tab + 'Tab').classList.add('active');
    document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    if (tab === 'inventory') renderInventoryTable(products);
    if (tab === 'analytics') updateAnalytics();
}

function renderInventoryTable(prods) {
    const tbody = document.getElementById("inventoryTableBody");
    tbody.innerHTML = prods.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.icon}</td>
            <td>${p.name}</td>
            <td>${p.price.toFixed(2)}</td>
            <td class="${p.stock < 10 ? 'low-stock-text' : ''}">${p.stock}</td>
            <td>
                <button class="btn-edit" onclick="openEditProductModal(${p.id})">Edit</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">Del</button>
            </td>
        </tr>
    `).join('');
}

async function updateAnalytics() {
    try {
        const response = await fetch('/api/bills');
        const bills = await response.json();
        
        let revenue = 0;
        let itemCounts = {};
        
        bills.forEach(bill => {
            revenue += bill.grandTotal;
            bill.items.forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        
        let popular = "-";
        let max = 0;
        for (const name in itemCounts) {
            if (itemCounts[name] > max) {
                max = itemCounts[name];
                popular = `${name} (${max})`;
            }
        }
        
        document.getElementById("totalRevenue").textContent = `Rs. ${revenue.toFixed(2)}`;
        document.getElementById("totalSalesCount").textContent = bills.length;
        document.getElementById("popularItem").textContent = popular;
    } catch (e) {
        console.error(e);
    }
}

// Product CRUD
function openAddProductModal() {
    document.getElementById("productModalTitle").textContent = "Add New Product";
    document.getElementById("productForm").reset();
    document.getElementById("editProductId").value = "";
    productModal.classList.add("show");
}

function openEditProductModal(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    
    document.getElementById("productModalTitle").textContent = "Edit Product";
    document.getElementById("editProductId").value = p.id;
    document.getElementById("prodName").value = p.name;
    document.getElementById("prodPrice").value = p.price;
    document.getElementById("prodIcon").value = p.icon;
    document.getElementById("prodStock").value = p.stock;
    
    productModal.classList.add("show");
}

function closeProductModal() {
    productModal.classList.remove("show");
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById("editProductId").value;
    const product = {
        id: id ? parseInt(id) : null,
        name: document.getElementById("prodName").value,
        price: parseFloat(document.getElementById("prodPrice").value),
        icon: document.getElementById("prodIcon").value,
        stock: parseInt(document.getElementById("prodStock").value)
    };
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product })
        });
        
        const res = await response.json();
        if (res.success) {
            showNotification("✅ Product saved!");
            closeProductModal();
            await fetchProducts();
            renderInventoryTable(products);
        }
    } catch (e) {
        alert("Failed to save");
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        const res = await response.json();
        if (res.success) {
            showNotification("🗑️ Product deleted");
            await fetchProducts();
            renderInventoryTable(products);
        }
    } catch (e) {
        alert("Delete failed");
    }
}

// Utility
function showNotification(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function toggleCartPanel() {
    cartPanel.classList.toggle("show");
}

function closeCartPanel() {
    cartPanel.classList.remove("show");
}

function handleSearch() {
    const term = searchInput.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(term)));
}

function closeBillModal() { billModal.classList.remove("show"); }
function closeBillHistoryModal() { billHistoryModal.classList.remove("show"); }
function closeAdminDashboardModal() { adminDashboardModal.classList.remove("show"); }

function printBill() { window.print(); }
function downloadBillPDF() { /* Simulation already exists in previous code, can be merged if needed */ }
function emailBill() { /* Similar to checkout logic */ }
