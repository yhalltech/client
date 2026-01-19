// Initialize payment method display if already selected
$(document).ready(function() {
    // ... existing code ...
    
    // Initialize payment method on page load
    setTimeout(function() {
        const selectedMethod = $('#payment_method').val();
        if (selectedMethod) {
            $('#payment_method').trigger('change');
        }
    }, 100);
    
    console.log('✅ Payments: Ready');
});