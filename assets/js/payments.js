
// payments.js - Additional Payment Functionality
// Initialize payment method display
function initializePaymentMethod() {
    const paymentMethodSelect = document.getElementById('payment_method');
    if (paymentMethodSelect && paymentMethodSelect.value) {
        paymentMethodSelect.dispatchEvent(new Event('change'));
    }
}

// Format currency
function formatCurrency(amount) {
    return 'Ksh ' + parseFloat(amount).toLocaleString('en-KE');
}

// Validate phone number
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate payment summary
function generatePaymentSummary() {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const type = urlParams.get('type');
    
    if (amount) {
        // Update all amount displays
        const amountElements = document.querySelectorAll('[id*="Amount"], #summaryAmount, #total-amount-display');
        amountElements.forEach(element => {
            if (element.id.includes('Amount')) {
                element.textContent = formatCurrency(amount);
            }
        });
    }
}

// Auto-format phone number
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('0')) {
        value = '+254' + value.substring(1);
    } else if (value.startsWith('7') || value.startsWith('1')) {
        value = '+254' + value;
    }
    
    // Format: +254 7XX XXX XXX
    if (value.length > 3) {
        value = value.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    }
    
    input.value = value;
}

// Add phone formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone_number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
        
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhoneNumber(this.value)) {
                this.classList.add('border-red-500');
                this.nextElementSibling?.classList.remove('hidden');
            } else {
                this.classList.remove('border-red-500');
                this.nextElementSibling?.classList.add('hidden');
            }
        });
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('border-red-500');
            } else {
                this.classList.remove('border-red-500');
            }
        });
    }
    
    // Generate payment summary on page load
    setTimeout(generatePaymentSummary, 500);
    
    // Initialize payment method
    setTimeout(initializePaymentMethod, 1000);
});

console.log('✅ Payments.js loaded');