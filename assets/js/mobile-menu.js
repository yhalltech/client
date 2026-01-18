// mobile-menu.js - Simple version (compatible with header.html)
console.log('📱 Mobile Menu: Loading...');

// This file is now mostly redundant since functionality is in header.html
// Keeping it for compatibility

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Mobile Menu: DOM ready');
    
    // Check if header already initialized mobile menu
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle && !mobileToggle.hasAttribute('data-initialized')) {
        console.log('📱 Mobile Menu: Initializing fallback...');
        
        // Basic fallback initialization
        mobileToggle.addEventListener('click', function() {
            const menu = document.getElementById('mobileMenu');
            if (menu) {
                menu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
        
        const closeBtn = document.getElementById('mobileClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                const menu = document.getElementById('mobileMenu');
                if (menu) {
                    menu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        mobileToggle.setAttribute('data-initialized', 'true');
    }
    
    console.log('📱 Mobile Menu: Ready');
});