// Products Data (from SuperMarket.java)
const products = [
    { id: 1, name: "Banana", price: 30.0, icon: "🍌" },
    { id: 2, name: "Apple", price: 120.0, icon: "🍎" },
    { id: 3, name: "Milk", price: 50.0, icon: "🥛" },
    { id: 4, name: "Cheese", price: 90.0, icon: "🧀" },
    { id: 5, name: "Bread", price: 40.0, icon: "🍞" },
    { id: 6, name: "Butter", price: 60.0, icon: "🧈" },
    { id: 7, name: "Eggs", price: 70.0, icon: "🥚" },
    { id: 8, name: "Chicken", price: 250.0, icon: "🍗" },
    { id: 9, name: "Rice", price: 80.0, icon: "🍚" },
    { id: 10, name: "Wheat", price: 40.0, icon: "🌾" },
    { id: 11, name: "Oil", price: 150.0, icon: "🫗" },
    { id: 12, name: "Salt", price: 20.0, icon: "🧂" },
    { id: 13, name: "Sugar", price: 40.0, icon: "🍬" },
    { id: 14, name: "Coffee", price: 140.0, icon: "☕" },
    { id: 15, name: "Tea", price: 100.0, icon: "🫖" },
    { id: 16, name: "Soap", price: 45.0, icon: "🧼" },
    { id: 17, name: "Shampoo", price: 110.0, icon: "🧴" },
    { id: 18, name: "Toothpaste", price: 50.0, icon: "🪥" },
    { id: 19, name: "Biscuits", price: 30.0, icon: "🍪" },
    { id: 20, name: "Juice", price: 60.0, icon: "🧃" }
];

// Cart Storage
let cart = new Map(); // Map<productId, {name, quantity, price}>

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

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(products);
    attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
    cartBtn.addEventListener("click", toggleCartPanel);
    closeCartBtn.addEventListener("click", closeCartPanel);
    searchInput.addEventListener("input", handleSearch);
    checkoutBtn.addEventListener("click", openCheckoutModal);
    clearCartBtn.addEventListener("click", clearCart);
    checkoutForm.addEventListener("submit", generateBill);

    // Close cart panel when clicking on backdrop
    cartBackdrop.addEventListener("click", closeCartPanel);

    // Close cart panel when clicking outside
    document.addEventListener("click", (e) => {
        if (!cartPanel.contains(e.target) && !cartBtn.contains(e.target) && window.innerWidth <= 768) {
            closeCartPanel();
        }
    });

    // Close modals when clicking outside
    checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) {
            closeCheckoutModal();
        }
    });

    billModal.addEventListener("click", (e) => {
        if (e.target === billModal) {
            closeBillModal();
        }
    });
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

// Create Product Card
function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.className = "qty-input";
    qtyInput.value = "1";
    qtyInput.min = "1";

    const addBtn = document.createElement("button");
    addBtn.className = "add-btn";
    addBtn.textContent = "Add";
    addBtn.onclick = (e) => {
        e.preventDefault();
        const qty = parseInt(qtyInput.value);
        if (qty > 0) {
            addToCart(product.id, product.name, product.price, qty);
            qtyInput.value = "1";
        }
    };

    card.innerHTML = `
        <div class="product-icon">${product.icon}</div>
        <div class="product-id">ID: ${product.id}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">Rs. ${product.price.toFixed(2)}</div>
        <div class="add-to-cart-section">
    `;

    card.querySelector(".add-to-cart-section").appendChild(qtyInput);
    card.querySelector(".add-to-cart-section").appendChild(addBtn);

    return card;
}

// Add to Cart
function addToCart(productId, productName, price, quantity) {
    const capitalized = productName.charAt(0).toUpperCase() + productName.slice(1);

    if (cart.has(productId)) {
        const item = cart.get(productId);
        item.quantity += quantity;
    } else {
        cart.set(productId, {
            name: capitalized,
            price: price,
            quantity: quantity
        });
    }

    updateCart();
    showNotification(`${capitalized} added to cart!`);
}

// Update Cart Display
function updateCart() {
    // Update cart count
    const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (cart.size === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cartItems.innerHTML = "";

        cart.forEach((item, productId) => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";

            const itemTotal = item.price * item.quantity;

            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-info">Rs. ${item.price.toFixed(2)} each</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="decreaseQty(${productId})">−</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="increaseQty(${productId})">+</button>
                    </div>
                </div>
                <div class="cart-item-price">Rs. ${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeFromCart(${productId})">Remove</button>
            `;

            cartItems.appendChild(cartItem);
        });
    }

    // Update summary
    updateCartSummary();
}

// Increase Quantity
function increaseQty(productId) {
    const item = cart.get(productId);
    if (item) {
        item.quantity++;
        updateCart();
    }
}

// Decrease Quantity
function decreaseQty(productId) {
    const item = cart.get(productId);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            removeFromCart(productId);
            return;
        }
        updateCart();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart.delete(productId);
    updateCart();
    showNotification("Item removed from cart");
}

// Clear Cart
function clearCart() {
    if (confirm("Are you sure you want to clear the cart?")) {
        cart.clear();
        updateCart();
        showNotification("Cart cleared");
    }
}

// Update Cart Summary
function updateCartSummary() {
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const gst = subtotal * 0.16;
    const total = subtotal + gst;

    document.getElementById("subtotal").textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById("gst").textContent = `Rs. ${gst.toFixed(2)}`;
    document.getElementById("total").textContent = `Rs. ${total.toFixed(2)}`;
}

// Toggle Cart Panel
function toggleCartPanel() {
    cartPanel.classList.toggle("show");
    if (window.innerWidth <= 768) {
        cartBackdrop.classList.toggle("show");
        document.body.style.overflow = cartPanel.classList.contains("show") ? "hidden" : "auto";
    }
}

// Close Cart Panel
function closeCartPanel() {
    cartPanel.classList.remove("show");
    cartBackdrop.classList.remove("show");
    document.body.style.overflow = "auto";
}

// Search Products
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
        renderProducts(products);
    } else {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filtered);
    }
}

// Open Checkout Modal
function openCheckoutModal() {
    if (cart.size === 0) {
        alert("Cart is empty!");
        return;
    }
    checkoutModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

// Close Checkout Modal
function closeCheckoutModal() {
    checkoutModal.classList.remove("show");
    document.body.style.overflow = "auto";
    checkoutForm.reset();
}

// Generate Bill
function generateBill(e) {
    e.preventDefault();

    const customerName = document.getElementById("customerName").value.trim();
    const customerPhone = document.getElementById("customerPhone").value.trim();

    if (!customerName || !customerPhone) {
        alert("Please fill in all fields");
        return;
    }

    // Calculate totals
    let subtotal = 0;
    const billItems = [];

    cart.forEach((item, productId) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        billItems.push({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal
        });
    });

    const gst = subtotal * 0.16;
    const grandTotal = subtotal + gst;
    const date = new Date().toLocaleString();

    // Create Bill HTML
    const billHTML = `
        <div class="bill-header">
            <h2>THE_DAILY_GROCER BILL</h2>
            <p>Thank you for your purchase!</p>
        </div>

        <div class="bill-info">
            <div class="bill-info-item">
                <span class="bill-info-label">Customer Name:</span>
                <span class="bill-info-value">${escapseHTML(customerName)}</span>
            </div>
            <div class="bill-info-item">
                <span class="bill-info-label">Phone:</span>
                <span class="bill-info-value">${customerPhone}</span>
            </div>
            <div class="bill-info-item">
                <span class="bill-info-label">Date & Time:</span>
                <span class="bill-info-value">${date}</span>
            </div>
        </div>

        <div class="bill-items">
            <div class="bill-items-header">
                <span>Item</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
            </div>
            ${billItems.map(item => `
                <div class="bill-item-row">
                    <span>${item.name}</span>
                    <span>${item.quantity}</span>
                    <span>Rs. ${item.price.toFixed(2)}</span>
                    <span>Rs. ${item.total.toFixed(2)}</span>
                </div>
            `).join("")}
        </div>

        <div class="bill-calculations">
            <div class="calc-row">
                <span>Subtotal:</span>
                <span>Rs. ${subtotal.toFixed(2)}</span>
            </div>
            <div class="calc-row">
                <span>GST (16%):</span>
                <span>Rs. ${gst.toFixed(2)}</span>
            </div>
            <div class="calc-row total">
                <span>Total Payable:</span>
                <span>Rs. ${grandTotal.toFixed(2)}</span>
            </div>
        </div>
    `;

    document.getElementById("billContent").innerHTML = billHTML;

    // Store bill data for print/download
    window.billData = {
        customerName,
        customerPhone,
        date,
        items: billItems,
        subtotal,
        gst,
        grandTotal
    };

    closeCheckoutModal();
    billModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

// Close Bill Modal
function closeBillModal() {
    billModal.classList.remove("show");
    document.body.style.overflow = "auto";
}

// Print Bill
function printBill() {
    window.print();
}

// Download Bill as PDF (requires jsPDF library)
function downloadBill() {
    const { customerName, date, items, subtotal, gst, grandTotal } = window.billData;

    let billText = "==== SUPERMARKET BILL ====\n\n";
    billText += `Customer: ${customerName}\n`;
    billText += `Date: ${date}\n\n`;
    billText += "Items:\n";
    billText += "-".repeat(50) + "\n";

    items.forEach(item => {
        billText += `${item.name} x${item.quantity} = Rs. ${item.total.toFixed(2)}\n`;
    });

    billText += "-".repeat(50) + "\n";
    billText += `Subtotal: Rs. ${subtotal.toFixed(2)}\n`;
    billText += `GST (16%): Rs. ${gst.toFixed(2)}\n`;
    billText += `Total: Rs. ${grandTotal.toFixed(2)}\n\n`;
    billText += "Thank you for shopping!\n";

    // Create blob and download
    const blob = new Blob([billText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showNotification("Bill downloaded!");
}

// New Transaction
function newTransaction() {
    cart.clear();
    updateCart();
    closeBillModal();
    checkoutForm.reset();
    searchInput.value = "";
    renderProducts(products);
    showNotification("New transaction started");
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideInRight 0.3s ease reverse";
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Escape HTML
function escapseHTML(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Adjust cart panel visibility on window resize
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        cartPanel.classList.remove("show");
        document.body.style.overflow = "auto";
    }
});
