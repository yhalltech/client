// Enhanced Payments Page - Works with Cart & All Payment Types
$(document).ready(function() {
    console.log('💳 Payments: Initializing...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookingType = urlParams.get('type');
    const totalAmount = parseFloat(urlParams.get('total') || 0);
    
    // Copy to clipboard function - ALWAYS VISIBLE
    window.copyToClipboard = function(text, buttonId) {
        navigator.clipboard.writeText(text).then(function() {
            const btn = document.getElementById(buttonId);
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Copied!';
            btn.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
            btn.style.color = 'white';
            
            showToast('✓ Copied to clipboard!', 'success');
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Copy failed:', err);
            showToast('Failed to copy', 'error');
        });
    };
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#25D366' : '#ff4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 15px;
            z-index: 10001;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    // Load cart data if cart checkout
    if (bookingType === 'cart') {
        loadCartCheckout();
    }
    
    function loadCartCheckout() {
        // Get cart from storage
        const cartData = JSON.parse(localStorage.getItem('kalenjin_vibes_cart') || '[]');
        const customerInfo = JSON.parse(localStorage.getItem('checkout_customer_info') || '{}');
        
        if (cartData.length > 0) {
            $('#orderSummary').show();
            
            // Display cart items
            let cartItemsHtml = '';
            let cartTotal = 0;
            
            cartData.forEach(item => {
                const itemTotal = item.price * item.quantity;
                cartTotal += itemTotal;
                
                cartItemsHtml += `
                    <div class="order-item d-flex justify-content-between mb-2">
                        <span>${item.quantity}x ${item.name}</span>
                        <span style="font-weight: 600;">Ksh ${itemTotal.toLocaleString()}</span>
                    </div>
                `;
            });
            
            $('#order-items').html(cartItemsHtml);
            
            const shipping = 9.99;
            const tax = cartTotal * 0.08;
            const finalTotal = totalAmount || (cartTotal + shipping + tax);
            
            $('#total-amount-display').text('Ksh ' + finalTotal.toLocaleString());
            
            // Pre-fill customer info if available
            if (customerInfo.name) $('#full_name').val(customerInfo.name);
            if (customerInfo.email) $('#email').val(customerInfo.email);
            if (customerInfo.phone) $('#phone_number').val(customerInfo.phone);
            
            $('#bookingType').val('cart_checkout');
            $('#bookingAmount').val(finalTotal.toFixed(2));
            
            // Show summary
            $('#bookingSummary').show().html(`
                <h4 class="mb-3">🛒 Shopping Cart Order</h4>
                <div class="alert alert-info">
                    <p><strong>Order Type:</strong> Shopping Cart Purchase</p>
                    <p><strong>Total Items:</strong> ${cartData.length}</p>
                    <p><strong>Subtotal:</strong> Ksh ${cartTotal.toLocaleString()}</p>
                    <p><strong>Shipping:</strong> Ksh ${shipping.toFixed(2)}</p>
                    <p><strong>Tax (8%):</strong> Ksh ${tax.toFixed(2)}</p>
                    <p><strong>Total Amount:</strong> Ksh ${finalTotal.toLocaleString()}</p>
                </div>
            `);
        }
    }
    
    // Update payment amounts when method changes
    $('#payment_method').on('change', function() {
        const method = $(this).val();
        $('#mpesa-details, #paybill-details, #transaction-reference-group').hide();
        $('#transaction_reference').removeAttr('required');
        
        const amount = parseFloat($('#bookingAmount').val() || totalAmount || 0);
        
        if (method === 'mpesa') {
            $('#mpesa-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
            
            $('#mpesaAmount').text('Ksh ' + amount.toLocaleString());
            
            // Add copy button for Till Number
            setTimeout(() => {
                const tillNumber = '3049015';
                const tillHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>4. Enter Till Number: <strong style="color: #28a745; font-size: 20px;">${tillNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyTillBtn" onclick="copyToClipboard('${tillNumber}', 'copyTillBtn')" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                $('#mpesa-details ul li:nth-child(4)').html(tillHtml);
            }, 100);
            
        } else if (method === 'paybill') {
            $('#paybill-details, #transaction-reference-group').show();
            $('#transaction_reference').attr('required', 'required');
            
            $('#paybillAmount').text('Ksh ' + amount.toLocaleString());
            
            // Add copy buttons for Paybill
            setTimeout(() => {
                const businessNumber = '542542';
                const accountNumber = '79233';
                
                const businessHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>4. Business Number: <strong style="color: #28a745; font-size: 20px;">${businessNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyBusinessBtn" onclick="copyToClipboard('${businessNumber}', 'copyBusinessBtn')" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                
                const accountHtml = `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span>5. Account Number: <strong style="color: #28a745; font-size: 20px;">${accountNumber}</strong></span>
                        <button type="button" class="copy-btn-inline" id="copyAccountBtn" onclick="copyToClipboard('${accountNumber}', 'copyAccountBtn')" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                            <i class="far fa-copy"></i> Copy
                        </button>
                    </div>
                `;
                
                $('#paybill-details ul li:nth-child(4)').html(businessHtml);
                $('#paybill-details ul li:nth-child(5)').html(accountHtml);
            }, 100);
        }
    });
    
    // Form submission
    $('#payment-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            full_name: $('#full_name').val().trim(),
            email: $('#email').val().trim(),
            phone: $('#phone_number').val().trim(),
            payment_method: $('#payment_method').val(),
            transaction_code: $('#transaction_reference').val().trim(),
            amount: $('#bookingAmount').val() || totalAmount.toFixed(2)
        };
        
        // Validation
        if (!formData.full_name || !formData.email || !formData.phone || !formData.payment_method || !formData.transaction_code) {
            alert('Please fill all required fields');
            return false;
        }
        
        // Build WhatsApp message
        let message = `💳 PAYMENT CONFIRMATION\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📧 ${formData.full_name}\n`;
        message += `📞 ${formData.phone}\n`;
        message += `💰 Ksh ${parseFloat(formData.amount).toLocaleString()}\n`;
        message += `🔢 ${formData.transaction_code}\n`;
        message += `💳 ${formData.payment_method.toUpperCase()}\n\n`;
        
        if (bookingType === 'cart') {
            const cartData = JSON.parse(localStorage.getItem('kalenjin_vibes_cart') || '[]');
            message += `🛒 CART ITEMS:\n`;
            cartData.forEach(item => {
                message += `• ${item.quantity}x ${item.name} - Ksh ${(item.price * item.quantity).toLocaleString()}\n`;
            });
            message += `\n`;
        }
        
        message += `✅ Kalenjin Vibes Payment`;
        
        const whatsappUrl = `https://wa.me/254797265275?text=${encodeURIComponent(message)}`;
        
        // Show loading
        const submitBtn = $('#complete-purchase-btn');
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Processing...').prop('disabled', true);
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            showToast('✓ Redirecting to WhatsApp...');
            
            // Clear cart if cart checkout
            if (bookingType === 'cart') {
                localStorage.removeItem('kalenjin_vibes_cart');
                localStorage.removeItem('checkout_customer_info');
            }
            
            setTimeout(() => window.location.href = 'index.html', 2000);
        }, 1000);
        
        return false;
    });
    
    // Cancel button
    $('#cancel-btn').on('click', function(e) {
        e.preventDefault();
        if (confirm('Cancel payment and return to homepage?')) {
            window.location.href = 'index.html';
        }
    });
    
    console.log('✅ Payments: Ready');
});