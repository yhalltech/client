// Enhanced Checkout Page with Full Cart Integration
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Checkout: Initializing...');
    
    // Wait for cart to be ready
    function initCheckout() {
        if (window.cart && window.cart.items) {
            loadCartItems();
        } else {
            setTimeout(initCheckout, 100);
        }
    }
    
    setTimeout(initCheckout, 500);
    
    function loadCartItems() {
        const cart = window.cart;
        const cartItems = cart.items;
        
        console.log('📦 Loading', cartItems.length, 'items');
        
        if (cartItems.length === 0) {
            showEmptyCart();
            return;
        }
        
        // Display cart items
        const tbody = document.querySelector('.cart_table tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            cartItems.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                
                const extras = [];
                if (item.color) extras.push(`Color: ${item.color}`);
                if (item.size) extras.push(`Size: ${item.size}`);
                const extrasText = extras.length > 0 ? `<p class="product-description" style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${extras.join(' • ')}</p>` : '';
                
                const row = `
                    <tr class="cart_item" data-index="${index}">
                        <td class="cart-col-image">
                            <img src="${item.image}" alt="${item.name}" 
                                 onerror="this.src='https://via.placeholder.com/80'">
                        </td>
                        <td class="cart-col-product">
                            <strong>${item.name}</strong>
                            ${extrasText}
                        </td>
                        <td class="cart-col-price">Ksh ${item.price.toLocaleString()}</td>
                        <td class="cart-col-quantity">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" data-index="${index}">-</button>
                                <span class="item-quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-index="${index}">+</button>
                            </div>
                        </td>
                        <td class="cart-col-total">Ksh ${itemTotal.toLocaleString()}</td>
                        <td class="cart-col-remove">
                            <button class="remove-item" data-index="${index}" title="Remove item">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                
                tbody.insertAdjacentHTML('beforeend', row);
            });
            
            // Bind events
            bindCartEvents();
            
            // Calculate totals
            updateTotals();
        }
    }
    
    function bindCartEvents() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const isPlus = this.classList.contains('plus');
                
                if (window.cart) {
                    window.cart.updateQuantity(index, isPlus ? 1 : -1);
                    setTimeout(loadCartItems, 100);
                }
            });
        });
        
        // Remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                
                if (window.cart && confirm('Remove this item?')) {
                    window.cart.removeItem(index);
                    setTimeout(loadCartItems, 100);
                }
            });
        });
    }
    
    function updateTotals() {
        if (!window.cart) return;
        
        const subtotal = window.cart.getTotalPrice();
        const shipping = subtotal > 0 ? 9.99 : 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        // Update summary
        const summaryRows = document.querySelectorAll('.summary-row');
        if (summaryRows.length >= 4) {
            summaryRows[0].querySelector('span:last-child').textContent = `Ksh ${subtotal.toLocaleString()}`;
            summaryRows[1].querySelector('span:last-child').textContent = `Ksh ${shipping.toFixed(2)}`;
            summaryRows[2].querySelector('span:last-child').textContent = `Ksh ${tax.toFixed(2)}`;
            summaryRows[3].querySelector('span:last-child').textContent = `Ksh ${total.toFixed(2)}`;
        }
    }
    
    function showEmptyCart() {
        const container = document.querySelector('.checkout-container .container');
        if (container) {
            container.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 80px 20px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-shopping-cart" style="font-size: 80px; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 20px; font-size: 24px;">Your cart is empty</h3>
                    <p style="color: #999; margin-bottom: 30px;">Looks like you haven't added any items to your cart yet.</p>
                    <a href="shop.html" style="display: inline-block; background: #BA0909; color: white; padding: 15px 40px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s;">Start Shopping</a>
                </div>
            `;
        }
    }
    
    // Proceed to payment
    const proceedBtn = document.getElementById('proceedToPayment');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            // Validate customer info
            const name = document.querySelector('input[placeholder="Enter your name"]').value.trim();
            const email = document.querySelector('input[placeholder="your@email.com"]').value.trim();
            const phone = document.querySelector('input[placeholder="+1234567890"]').value.trim();
            const address = document.querySelector('textarea').value.trim();
            
            if (!name || !email || !phone || !address) {
                alert('Please fill in all customer information fields');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Save customer info
            const customerInfo = { name, email, phone, address };
            localStorage.setItem('checkout_customer_info', JSON.stringify(customerInfo));
            
            // Get cart total
            const total = window.cart ? window.cart.getTotalPrice() : 0;
            const shipping = 9.99;
            const tax = total * 0.08;
            const finalTotal = total + shipping + tax;
            
            // Show loading
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.disabled = true;
            
            // Redirect to payment
            setTimeout(() => {
                window.location.href = `payments.html?type=cart&total=${finalTotal.toFixed(2)}`;
            }, 1000);
        });
    }
    
    console.log('✅ Checkout: Ready');
});