// Complete Shopping Cart System - Fully Functional
class ShoppingCart {
    constructor() {
        this.items = [];
        this.initialized = false;
        this.storageKey = 'kalenjin_vibes_cart';
    }

    init() {
        if (this.initialized) {
            console.log('🛒 Cart already initialized');
            return;
        }
        
        console.log('🛒 Initializing cart...');
        
        // Load saved cart
        this.loadFromStorage();
        
        // Update display
        this.updateCartDisplay();
        
        // Make globally available
        window.cart = this;
        window.addToCart = (item) => this.addItem(item);
        
        this.initialized = true;
        console.log('✅ Cart ready with', this.items.length, 'items');
    }

    addItem(item) {
        console.log('🛒 Adding item:', item);
        
        // Validate item
        if (!item || !item.id || !item.name || !item.price) {
            console.error('❌ Invalid item:', item);
            this.showNotification('Invalid product data', 'error');
            return false;
        }

        // Check if item exists
        const existingIndex = this.items.findIndex(i => 
            i.id === item.id && 
            i.color === item.color && 
            i.size === item.size
        );
        
        if (existingIndex !== -1) {
            // Update quantity
            this.items[existingIndex].quantity = 
                parseInt(this.items[existingIndex].quantity) + 
                parseInt(item.quantity || 1);
            this.showNotification(`Updated ${item.name} quantity`);
        } else {
            // Add new item
            this.items.push({
                id: item.id,
                name: item.name,
                price: parseFloat(item.price),
                image: item.image || 'https://via.placeholder.com/80',
                quantity: parseInt(item.quantity || 1),
                color: item.color || '',
                size: item.size || ''
            });
            this.showNotification(`Added ${item.name} to cart`);
        }

        this.updateCartDisplay();
        this.saveToStorage();
        this.openCart();
        
        return true;
    }

    removeItem(index) {
        if (this.items[index]) {
            const itemName = this.items[index].name;
            this.items.splice(index, 1);
            this.updateCartDisplay();
            this.saveToStorage();
            this.showNotification(`Removed ${itemName}`);
        }
    }

    updateQuantity(index, change) {
        if (this.items[index]) {
            const newQuantity = this.items[index].quantity + change;
            
            if (newQuantity < 1) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQuantity;
                this.updateCartDisplay();
                this.saveToStorage();
            }
        }
    }

    clearCart() {
        if (confirm('Clear all items from cart?')) {
            this.items = [];
            this.updateCartDisplay();
            this.saveToStorage();
            this.showNotification('Cart cleared');
        }
    }

    updateCartDisplay() {
        const body = document.getElementById('cartBody');
        const footer = document.getElementById('cartFooter');
        const totalEl = document.getElementById('cartTotal');
        const badge = document.getElementById('cartBadge');

        if (!body || !footer || !totalEl || !badge) return;

        // Update badge
        const totalItems = this.getTotalItems();
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';

        // Empty cart state
        if (this.items.length === 0) {
            body.innerHTML = `
                <div class="cart-empty" style="text-align: center; padding: 60px 20px;">
                    <i class="fas fa-shopping-cart" style="font-size: 72px; color: #e5e7eb; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; font-weight: 500; color: #777; margin-bottom: 10px;">Your cart is empty</p>
                    <p style="font-size: 14px; color: #999; margin-bottom: 25px;">Add items from the shop to get started</p>
                    <a href="shop.html" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #BA0909 0%, #8B0000 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Browse Shop</a>
                </div>
            `;
            footer.style.display = 'none';
            return;
        }

        // Show footer with items
        footer.style.display = 'block';
        let total = 0;
        let itemsHTML = '';

        this.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const extras = [];
            if (item.color) extras.push(`Color: ${item.color}`);
            if (item.size) extras.push(`Size: ${item.size}`);
            const extrasText = extras.length > 0 ? `<p style="font-size: 12px; color: #666; margin: 5px 0;">${extras.join(' • ')}</p>` : '';

            itemsHTML += `
                <div class="cart-item" style="display: flex; align-items: center; padding: 15px; background: white; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); gap: 15px; transition: all 0.3s ease;">
                    <img src="${item.image}" alt="${item.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid #f5f5f5; background: #f9f9f9;"
                         onerror="this.src='https://via.placeholder.com/80'">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #333; margin-bottom: 5px; font-size: 16px;">${item.name}</div>
                        ${extrasText}
                        <div style="color: #BA0909; font-weight: 700; font-size: 18px; margin-bottom: 10px;">Ksh ${item.price.toLocaleString()}</div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button onclick="window.cart.updateQuantity(${index}, -1)" 
                                    style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; cursor: pointer; font-weight: bold; transition: all 0.2s;">-</button>
                            <span style="min-width: 40px; text-align: center; font-weight: 600; font-size: 16px; background: #f8f9fa; padding: 4px 8px; border-radius: 6px;">${item.quantity}</span>
                            <button onclick="window.cart.updateQuantity(${index}, 1)" 
                                    style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; cursor: pointer; font-weight: bold; transition: all 0.2s;">+</button>
                        </div>
                    </div>
                    <button onclick="window.cart.removeItem(${index})" 
                            style="background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); border: none; color: white; padding: 10px; border-radius: 10px; width: 40px; height: 40px; cursor: pointer; transition: all 0.3s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        body.innerHTML = itemsHTML;
        totalEl.textContent = `Ksh ${total.toLocaleString()}`;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    openCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showNotification(message, type = 'success') {
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background: linear-gradient(135deg, ${type === 'success' ? '#25D366 0%, #1DA851' : '#ff4444 0%, #cc0000'} 100%) !important;
            color: white !important;
            padding: 15px 25px !important;
            border-radius: 12px !important;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3) !important;
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            z-index: 100000 !important;
            animation: slideInRight 0.3s ease !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            border: 2px solid white !important;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            console.log('💾 Cart saved:', this.items.length, 'items');
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.items = saved ? JSON.parse(saved) : [];
            console.log('📦 Cart loaded:', this.items.length, 'items');
        } catch (e) {
            console.error('Failed to load cart:', e);
            this.items = [];
        }
    }

    // Get cart data for checkout
    getCartData() {
        return {
            items: this.items,
            totalItems: this.getTotalItems(),
            totalPrice: this.getTotalPrice()
        };
    }
}

// Initialize when header is loaded
document.addEventListener('header-loaded', function() {
    console.log('📦 Header loaded - initializing cart...');
    setTimeout(() => {
        if (!window.cart) {
            window.cart = new ShoppingCart();
            window.cart.init();
        }
    }, 100);
});

// Fallback initialization
setTimeout(() => {
    if (!window.cart) {
        console.log('📦 Fallback cart initialization...');
        window.cart = new ShoppingCart();
        window.cart.init();
    }
}, 2000);