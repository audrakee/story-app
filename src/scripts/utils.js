// Utility functions
class Utils {
    // Show loading indicator
    static showLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    // Hide loading indicator
    static hideLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Show success toast
    static showSuccessToast(message) {
        const toast = document.getElementById('success-toast');
        if (toast) {
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }

    // Show error toast
    static showErrorToast(message) {
        const toast = document.getElementById('error-toast');
        if (toast) {
            toast.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 3000);
        }
    }

    // Format date
    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('id-ID', options);
    }

    // Validate email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password (minimum 8 characters)
    static validatePassword(password) {
        return password.length >= 8;
    }

    // Validate form inputs
    static validateFormInputs(inputs) {
        const errors = {};

        for (const [key, value] of Object.entries(inputs)) {
            if (!value || value.toString().trim() === '') {
                errors[key] = 'This field is required';
            }

            // Email validation
            if (key === 'email' && value && !this.validateEmail(value)) {
                errors[key] = 'Please enter a valid email';
            }

            // Password validation
            if (key === 'password' && value && !this.validatePassword(value)) {
                errors[key] = 'Password must be at least 8 characters';
            }
        }

        return errors;
    }

    // Truncate text
    static truncateText(text, length = 100) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    // Get image dimensions
    static getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Convert file to base64
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Check if online
    static isOnline() {
        return navigator.onLine;
    }

    // Wait for online
    static async waitForOnline(timeout = 30000) {
        return new Promise((resolve) => {
            if (navigator.onLine) {
                resolve(true);
                return;
            }

            const handleOnline = () => {
                window.removeEventListener('online', handleOnline);
                clearTimeout(timer);
                resolve(true);
            };

            const timer = setTimeout(() => {
                window.removeEventListener('online', handleOnline);
                resolve(false);
            }, timeout);

            window.addEventListener('online', handleOnline);
        });
    }

    // Generate unique ID
    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get query parameter
    static getQueryParam(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    // Set element content safely
    static setElementContent(element, content) {
        if (element) {
            element.textContent = content;
        }
    }

    // Set element HTML safely
    static setElementHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }

    // Add class to element
    static addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    }

    // Remove class from element
    static removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    }

    // Toggle class on element
    static toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    }

    // Check if element has class
    static hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    // Show element
    static showElement(element) {
        if (element) {
            element.style.display = '';
        }
    }

    // Hide element
    static hideElement(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    // Safely clear element children
    static clearElement(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }
}
