// Main JavaScript file for general functionality

// Utility functions
const Utils = {
    // Show notification/toast message
    showNotification: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at the top of the main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(alertDiv, mainContent.firstChild);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    },

    // Format date
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validate email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Show loading state
    showLoading: function(element) {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    },

    // Hide loading state
    hideLoading: function(element) {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }
};

// Form validation
class FormValidator {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.init();
    }

    init() {
        if (this.form) {
            this.setupValidation();
        }
    }

    setupValidation() {
        // Email validation
        const emailInputs = this.form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateEmail(input);
            });
        });

        // Required field validation
        const requiredInputs = this.form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateRequired(input);
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    validateEmail(input) {
        const email = input.value.trim();
        if (email && !Utils.validateEmail(email)) {
            this.showError(input, 'Please enter a valid email address');
            return false;
        } else {
            this.clearError(input);
            return true;
        }
    }

    validateRequired(input) {
        const value = input.value.trim();
        if (!value) {
            this.showError(input, 'This field is required');
            return false;
        } else {
            this.clearError(input);
            return true;
        }
    }

    validateForm() {
        let isValid = true;
        
        // Validate all required fields
        const requiredInputs = this.form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!this.validateRequired(input)) {
                isValid = false;
            }
        });

        // Validate email fields
        const emailInputs = this.form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input.value.trim() && !this.validateEmail(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showError(input, message) {
        this.clearError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        input.classList.add('is-invalid');
        input.parentNode.appendChild(errorDiv);
    }

    clearError(input) {
        input.classList.remove('is-invalid');
        const errorDiv = input.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Dashboard functionality
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupRefreshButton();
        this.setupSearchFunctionality();
        this.setupSortFunctionality();
    }

    setupRefreshButton() {
        const refreshBtn = document.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshData();
            });
        }
    }

    setupSearchFunctionality() {
        const searchInput = document.querySelector('[data-search]');
        if (searchInput) {
            const debouncedSearch = Utils.debounce((query) => {
                this.performSearch(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    setupSortFunctionality() {
        const sortButtons = document.querySelectorAll('[data-sort]');
        sortButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sortBy = button.getAttribute('data-sort');
                this.sortData(sortBy);
            });
        });
    }

    refreshData() {
        const refreshBtn = document.querySelector('[data-action="refresh"]');
        Utils.showLoading(refreshBtn);
        
        // Simulate refresh (replace with actual API call)
        setTimeout(() => {
            Utils.hideLoading(refreshBtn);
            Utils.showNotification('Data refreshed successfully', 'success');
        }, 1000);
    }

    performSearch(query) {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const isVisible = text.includes(query.toLowerCase());
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    sortData(sortBy) {
        const container = document.querySelector('.row');
        const cards = Array.from(container.children);
        
        cards.sort((a, b) => {
            const aValue = a.querySelector(`[data-${sortBy}]`)?.getAttribute(`data-${sortBy}`) || '';
            const bValue = b.querySelector(`[data-${sortBy}]`)?.getAttribute(`data-${sortBy}`) || '';
            return aValue.localeCompare(bValue);
        });
        
        cards.forEach(card => container.appendChild(card));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        new FormValidator(`#${form.id}`);
    });

    // Initialize dashboard functionality
    if (document.querySelector('.dashboard')) {
        new Dashboard();
    }

    // Setup tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Setup popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    });
});

// Export for use in other modules
window.Utils = Utils;
window.FormValidator = FormValidator;
window.Dashboard = Dashboard;
