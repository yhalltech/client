// assets/js/footer.js

// Footer component functionality
class FooterManager {
    constructor() {
        this.init();
    }

    init() {
        this.setCurrentYear();
        this.addEventListeners();
        this.initNewsletter();
    }

    setCurrentYear() {
        const yearElements = document.querySelectorAll('.current-year');
        yearElements.forEach(element => {
            element.textContent = new Date().getFullYear();
        });
    }

    addEventListeners() {
        // Newsletter form submission
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Social media links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleSocialClick(e));
        });
    }

    initNewsletter() {
        // Check if user is already subscribed
        const isSubscribed = localStorage.getItem('kalenjin_vibes_subscribed');
        if (isSubscribed) {
            const newsletterForm = document.getElementById('newsletter-form');
            if (newsletterForm) {
                const input = newsletterForm.querySelector('input[type="email"]');
                const button = newsletterForm.querySelector('button[type="submit"]');
                if (input && button) {
                    input.value = JSON.parse(isSubscribed).email;
                    input.disabled = true;
                    button.textContent = 'Subscribed ✓';
                    button.disabled = true;
                    button.classList.add('bg-green-600', 'hover:bg-green-700');
                }
            }
        }
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showAlert('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Save to localStorage
            localStorage.setItem('kalenjin_vibes_subscribed', JSON.stringify({
                email: email,
                date: new Date().toISOString()
            }));

            // Update UI
            emailInput.value = email;
            emailInput.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Subscribed';
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');

            // Show success message
            this.showAlert('Successfully subscribed to our newsletter!', 'success');
        }, 1000);
    }

    handleSocialClick(e) {
        const platform = e.currentTarget.dataset.platform || 'unknown';
        
        // Track social media clicks
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_click', {
                'event_category': 'Social Media',
                'event_label': platform,
                'value': 1
            });
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        alertDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(alertDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(alertDiv);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.footerManager = new FooterManager();
});