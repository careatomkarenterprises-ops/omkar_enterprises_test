/* ===========================================
   OMKAR ENTERPRISES - MAIN JAVASCRIPT
   Version: 2.0 | Core Website Functionality
   =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Omkar Enterprises website initialized');
    
    // Initialize all modules
    initMobileNavigation();
    initFAQAccordion();
    initSmoothScrolling();
    initCurrentYear();
    initFormValidation();
    initScrollAnimations();
    initHeroCalculator();
    initTooltips();
    initCounters();
    initContactForm();
    initBackToTop();
});

/* ========== MOBILE NAVIGATION ========== */
function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    if (!hamburger || !navMenu) {
        console.warn('Mobile navigation elements not found');
        return;
    }
    
    // Create overlay element
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Toggle menu function
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Prevent scrolling when menu is open
        if (navMenu.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    };
    
    // Hamburger click event
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', toggleMenu);
    
    // Close menu when clicking links (for single page navigation)
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            toggleMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Close menu on window resize (if resizing to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
}

/* ========== FAQ ACCORDION ========== */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', function() {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
    
    // Open first FAQ item by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
        const firstAnswer = faqItems[0].querySelector('.faq-answer');
        if (firstAnswer) {
            firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
        }
    }
}

/* ========== SMOOTH SCROLLING ========== */
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Calculate offset for fixed header
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    location.hash = href;
                }
            }
        });
    });
    
    // Add active class to nav links on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    function updateActiveNavLink() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            
            if (scrollY >= (sectionTop - headerHeight - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial call
}

/* ========== UPDATE CURRENT YEAR ========== */
function initCurrentYear() {
    const yearElements = document.querySelectorAll('#currentYear, .current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

/* ========== FORM VALIDATION ========== */
function initFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
            
            // If form is valid, show success message
            if (form.checkValidity()) {
                showFormSuccess(form);
            }
        }, false);
    });
    
    // Real-time validation
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    const isValid = field.checkValidity();
    const feedback = field.nextElementSibling;
    
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        if (!isValid) {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    }
}

function showFormSuccess(form) {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success mt-3';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <strong>Thank you!</strong> Your message has been sent successfully.
    `;
    
    // Insert after form
    form.parentNode.insertBefore(successMessage, form.nextSibling);
    
    // Reset form after 3 seconds
    setTimeout(() => {
        form.reset();
        form.classList.remove('was-validated');
        successMessage.remove();
    }, 3000);
}

/* ========== SCROLL ANIMATIONS ========== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate, .step-card, .tier-card, .legal-card');
    
    if (!animatedElements.length) return;
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe each element
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/* ========== HERO CALCULATOR ========== */
function initHeroCalculator() {
    const calculator = document.querySelector('.calculator-card');
    if (!calculator) return;
    
    const amountInput = calculator.querySelector('#investmentAmount');
    const currentAmount = calculator.querySelector('#currentAmount');
    const monthlyReturn = calculator.querySelector('#monthlyReturn');
    const annualReturn = calculator.querySelector('#annualReturn');
    const totalReturn = calculator.querySelector('#totalReturn');
    
    if (!amountInput || !currentAmount) return;
    
    // Format currency in Indian Rupees
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    // Update calculator function
    function updateCalculator() {
        const amount = parseInt(amountInput.value);
        
        // Update current amount display
        currentAmount.textContent = formatter.format(amount);
        
        // Calculate returns (2.5% monthly)
        const monthly = amount * 0.025;
        const annual = monthly * 12;
        
        // Update result displays
        if (monthlyReturn) monthlyReturn.textContent = formatter.format(monthly);
        if (annualReturn) annualReturn.textContent = formatter.format(annual);
        if (totalReturn) totalReturn.textContent = formatter.format(annual);
        
        // Update slider background
        updateSliderBackground(amount);
    }
    
    // Update slider visual background
    function updateSliderBackground(value) {
        const min = parseInt(amountInput.min) || 25000;
        const max = parseInt(amountInput.max) || 2500000;
        const percentage = ((value - min) / (max - min)) * 100;
        
        amountInput.style.background = `
            linear-gradient(to right, 
                var(--gold) 0%, 
                var(--gold) ${percentage}%, 
                var(--medium-gray) ${percentage}%, 
                var(--medium-gray) 100%
            )`;
    }
    
    // Add quick amount buttons
    function addQuickAmountButtons() {
        const quickAmounts = [25000, 100000, 500000, 1000000, 2500000];
        const container = document.createElement('div');
        container.className = 'quick-amounts mt-3';
        container.innerHTML = `
            <p class="mb-2"><small>Quick select:</small></p>
            <div class="d-flex flex-wrap gap-2">
                ${quickAmounts.map(amount => `
                    <button type="button" class="btn btn-outline btn-sm" data-amount="${amount}">
                        ${formatter.format(amount)}
                    </button>
                `).join('')}
            </div>
        `;
        
        amountInput.parentNode.appendChild(container);
        
        // Add click events to quick amount buttons
        container.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                const amount = parseInt(this.getAttribute('data-amount'));
                amountInput.value = amount;
                updateCalculator();
            });
        });
    }
    
    // Initialize
    amountInput.addEventListener('input', updateCalculator);
    updateCalculator(); // Initial calculation
    addQuickAmountButtons();
}

/* ========== TOOLTIPS ========== */
function initTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } else {
        // Fallback custom tooltips
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', showCustomTooltip);
            element.addEventListener('mouseleave', hideCustomTooltip);
        });
    }
}

function showCustomTooltip(event) {
    const element = event.target;
    const title = element.getAttribute('title');
    
    if (!title) return;
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = title;
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = rect.top - 10 + 'px';
    tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
    tooltip.style.zIndex = '9999';
    
    // Add to DOM
    document.body.appendChild(tooltip);
    
    // Store reference
    element._tooltip = tooltip;
    
    // Remove title attribute to prevent default tooltip
    element.removeAttribute('title');
}

function hideCustomTooltip(event) {
    const element = event.target;
    
    if (element._tooltip) {
        element._tooltip.remove();
        delete element._tooltip;
        
        // Restore title attribute
        const title = element.getAttribute('data-original-title') || element._originalTitle;
        if (title) {
            element.setAttribute('title', title);
        }
    }
}

/* ========== COUNTERS (For statistics) ========== */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (!counters.length) return;
    
    // Create observer for counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function startCounter(counterElement) {
    const target = parseInt(counterElement.getAttribute('data-target') || counterElement.textContent.replace(/\D/g, ''));
    const duration = parseInt(counterElement.getAttribute('data-duration') || 2000);
    const increment = target / (duration / 16); // 60fps
    
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        counterElement.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

/* ========== CONTACT FORM ========== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        try {
            // Simulate API call (replace with actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showNotification('Message sent successfully! We\'ll contact you soon.', 'success');
            
            // Reset form
            this.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Something went wrong. Please try again.', 'error');
            
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ========== BACK TO TOP BUTTON ========== */
function initBackToTop() {
    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 999;
        box-shadow: var(--shadow-lg);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'var(--gold)';
        this.style.color = 'var(--primary-blue)';
        this.style.transform = 'translateY(-3px)';
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'var(--primary-blue)';
        this.style.color = 'white';
        this.style.transform = 'translateY(0)';
    });
}

/* ========== NOTIFICATION SYSTEM ========== */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                min-width: 300px;
                max-width: 400px;
                z-index: 9999;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                animation: slideInRight 0.3s ease;
            }
            .custom-notification.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .custom-notification.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .custom-notification.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            .custom-notification.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-content i {
                font-size: 1.2rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                padding: 5px;
            }
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/* ========== LAZY LOAD IMAGES ========== */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (!images.length) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

/* ========== PERFORMANCE OPTIMIZATIONS ========== */
function initPerformance() {
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Handle scroll completion
        }, 100);
    });
    
    // Throttle resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Handle resize completion
        }, 250);
    });
}

/* ========== ANALYTICS (Optional) ========== */
function initAnalytics() {
    // Track page views (you can integrate Google Analytics here)
    console.log('Page viewed:', window.location.pathname);
    
    // Track outbound links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            console.log('Outbound link clicked:', this.href);
        });
    });
    
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            console.log('Form submitted:', this.id || 'unnamed form');
        });
    });
}

/* ========== INITIALIZE ON LOAD ========== */
window.addEventListener('load', function() {
    // Initialize lazy loading
    initLazyLoading();
    
    // Initialize performance optimizations
    initPerformance();
    
    // Initialize analytics (optional)
    initAnalytics();
    
    // Remove loading state if present
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }, 500);
    }
});

/* ========== ERROR HANDLING ========== */
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.error);
    // You can send errors to your error tracking service here
});

/* ========== UTILITY FUNCTIONS ========== */

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard!', 'success'))
        .catch(err => console.error('Copy failed:', err));
}

/* ========== EXPORT FOR MODULE USAGE ========== */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileNavigation,
        initFAQAccordion,
        initSmoothScrolling,
        showNotification,
        formatCurrency,
        formatDate
    };
}
