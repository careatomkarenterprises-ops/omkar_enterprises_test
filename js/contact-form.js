/* ===========================================
   CONTACT FORM FRONTEND HANDLER
   Version: 2.0 | Enhanced with validation and feedback
   =========================================== */

class ContactFormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }
    
    init() {
        // Setup form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Setup real-time validation
        this.setupValidation();
        
        // Setup phone formatting
        this.setupPhoneFormatting();
        
        // Setup character counter for message
        this.setupCharacterCounter();
    }
    
    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation on blur
            input.addEventListener('blur', () => this.validateField(input));
            
            // Clear error on focus
            input.addEventListener('focus', () => this.clearError(input));
            
            // Real-time validation for required fields
            if (input.hasAttribute('required')) {
                input.addEventListener('input', () => {
                    if (input.value.trim()) {
                        this.clearError(input);
                    }
                });
            }
        });
    }
    
    setupPhoneFormatting() {
        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Format as XXX-XXX-XXXX
            if (value.length > 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            } else if (value.length > 3) {
                value = value.replace(/(\d{3})(\d{1,3})/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }
    
    setupCharacterCounter() {
        const messageInput = this.form.querySelector('textarea[name="message"]');
        if (!messageInput) return;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.85rem;
            color: #666;
            margin-top: 5px;
        `;
        
        messageInput.parentNode.appendChild(counter);
        
        // Update counter
        const updateCounter = () => {
            const length = messageInput.value.length;
            const max = 2000;
            counter.textContent = `${length}/${max} characters`;
            counter.style.color = length > max ? '#dc3545' : '#666';
        };
        
        messageInput.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Check required fields
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (Indian numbers)
        if (field.type === 'tel' && value) {
            const digits = value.replace(/\D/g, '');
            if (digits.length < 10) {
                isValid = false;
                errorMessage = 'Phone number must be at least 10 digits';
            }
        }
        
        // Message length validation
        if (field.name === 'message' && value.length > 2000) {
            isValid = false;
            errorMessage = 'Message is too long (max 2000 characters)';
        }
        
        if (!isValid) {
            this.showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showError(field, message) {
        this.clearError(field);
        
        // Add error class to field
        field.classList.add('is-invalid');
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.85rem;
            margin-top: 5px;
            display: block;
        `;
        
        field.parentNode.appendChild(errorDiv);
        
        // Focus the field
        field.focus();
    }
    
    clearError(field) {
        field.classList.remove('is-invalid');
        
        // Remove error message
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        // Check consent checkbox
        const consent = this.form.querySelector('input[name="consent"]');
        if (consent && !consent.checked) {
            this.showError(consent, 'You must agree to the terms');
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }
        
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to server
            const response = await fetch('contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                this.showSuccessMessage(result);
                
                // Reset form
                this.form.reset();
                
                // Reset character counter if exists
                const counter = this.form.querySelector('.char-counter');
                if (counter) {
                    counter.textContent = '0/2000 characters';
                    counter.style.color = '#666';
                }
                
            } else {
                // Show error message
                this.showNotification(result.message || 'Submission failed', 'error');
                
                // Show field errors if any
                if (result.errors) {
                    result.errors.forEach(error => {
                        // Try to find the field that caused the error
                        const field = this.findFieldByError(error);
                        if (field) {
                            this.showError(field, error);
                        }
                    });
                }
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Network error. Please try again or contact us directly.', 'error');
            
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    findFieldByError(errorMessage) {
        const lowerError = errorMessage.toLowerCase();
        
        if (lowerError.includes('email')) return this.form.querySelector('input[type="email"]');
        if (lowerError.includes('phone')) return this.form.querySelector('input[type="tel"]');
        if (lowerError.includes('name')) return this.form.querySelector('input[name="name"]');
        if (lowerError.includes('subject')) return this.form.querySelector('select[name="subject"]');
        if (lowerError.includes('message')) return this.form.querySelector('textarea[name="message"]');
        
        return null;
    }
    
    showSuccessMessage(result) {
        // Create success modal
        const modal = document.createElement('div');
        modal.className = 'success-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Thank You!</h3>
                <p>Your message has been sent successfully.</p>
                
                <div class="success-details">
                    <div class="detail-item">
                        <i class="fas fa-hashtag"></i>
                        <div>
                            <small>Reference Number</small>
                            <strong>${result.reference || 'CONT' + Date.now().toString().slice(-6)}</strong>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <small>Response Time</small>
                            <strong>Within 24 hours</strong>
                        </div>
                    </div>
                </div>
                
                <p class="next-steps">${result.next_steps || 'Our team will contact you shortly.'}</p>
                
                <div class="modal-actions">
                    <button class="btn btn-primary close-modal">
                        <i class="fas fa-check"></i> Continue
                    </button>
                    <a href="contact.html" class="btn btn-outline">
                        <i class="fas fa-envelope"></i> Send Another
                    </a>
                </div>
                
                <div class="modal-footer">
                    <small>
                        <i class="fas fa-info-circle"></i>
                        An email confirmation has been sent to you.
                    </small>
                </div>
            </div>
        `;
        
        // Add styles
        this.addModalStyles();
        
        // Add to page
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Setup close functionality
        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        };
        
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
    
    addModalStyles() {
        if (document.querySelector('#success-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'success-modal-styles';
        styles.textContent = `
            .success-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .success-modal .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1;
            }
            
            .success-modal .modal-content {
                background: white;
                border-radius: 15px;
                padding: 40px 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                position: relative;
                z-index: 2;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                animation: modalAppear 0.3s ease;
            }
            
            @keyframes modalAppear {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .success-modal .modal-icon {
                font-size: 4rem;
                color: #28a745;
                margin-bottom: 20px;
            }
            
            .success-modal h3 {
                color: #001F3F;
                margin-bottom: 10px;
            }
            
            .success-modal p {
                color: #666;
                margin-bottom: 25px;
            }
            
            .success-modal .success-details {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                text-align: left;
            }
            
            .success-modal .detail-item {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .success-modal .detail-item:last-child {
                margin-bottom: 0;
            }
            
            .success-modal .detail-item i {
                font-size: 1.5rem;
                color: #D4AF37;
            }
            
            .success-modal .detail-item small {
                display: block;
                color: #666;
                font-size: 0.85rem;
            }
            
            .success-modal .detail-item strong {
                display: block;
                color: #001F3F;
                font-size: 1.1rem;
                margin-top: 5px;
            }
            
            .success-modal .next-steps {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #c3e6cb;
                font-size: 0.95rem;
            }
            
            .success-modal .modal-actions {
                display: flex;
                gap: 15px;
                margin: 30px 0 20px;
                justify-content: center;
            }
            
            .success-modal .modal-footer {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #666;
                font-size: 0.85rem;
            }
            
            @media (max-width: 576px) {
                .success-modal .modal-actions {
                    flex-direction: column;
                }
                
                .success-modal .modal-actions .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles if not present
        if (!document.querySelector('#form-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'form-notification-styles';
            styles.textContent = `
                .form-notification {
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
                
                .form-notification.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                
                .form-notification.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                
                .form-notification.info {
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
                
                .close-notification {
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
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        window.contactFormHandler = new ContactFormHandler('contactForm');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormHandler;
}
