// Register Page
async function registerPage(params) {
    // If already authenticated, redirect to home
    if (Auth.isAuthenticated()) {
        window.location.hash = '#/';
        return '';
    }

    const html = `
        <div class="auth-container">
            <h2>Register</h2>
            <form id="register-form" class="auth-form">
                <div class="form-group">
                    <label for="register-name">Name</label>
                    <input 
                        type="text" 
                        id="register-name" 
                        name="name" 
                        required
                        aria-label="Full name"
                        aria-required="true"
                    >
                    <span class="error-message" id="name-error"></span>
                </div>

                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input 
                        type="email" 
                        id="register-email" 
                        name="email" 
                        required
                        aria-label="Email address"
                        aria-required="true"
                    >
                    <span class="error-message" id="email-error"></span>
                </div>

                <div class="form-group">
                    <label for="register-password">Password (minimum 8 characters)</label>
                    <input 
                        type="password" 
                        id="register-password" 
                        name="password" 
                        required
                        aria-label="Password"
                        aria-required="true"
                    >
                    <span class="error-message" id="password-error"></span>
                </div>

                <button type="submit" aria-label="Create new account">Create Account</button>
            </form>

            <div class="auth-link">
                Already have an account? <a href="#/login">Login here</a>
            </div>
        </div>
    `;

    // Render HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Setup event listeners
    const form = tempDiv.querySelector('#register-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        // Validate inputs
        const errors = Utils.validateFormInputs({ name, email, password });

        // Clear previous errors
        document.getElementById('name-error').textContent = '';
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        // Show errors if any
        if (Object.keys(errors).length > 0) {
            if (errors.name) {
                document.getElementById('name-error').textContent = errors.name;
            }
            if (errors.email) {
                document.getElementById('email-error').textContent = errors.email;
            }
            if (errors.password) {
                document.getElementById('password-error').textContent = errors.password;
            }
            return;
        }

        try {
            Utils.showLoading();

            // Register API call
            const result = await Auth.register(name, email, password);

            Utils.hideLoading();
            Utils.showSuccessToast('Registration successful! Please login.');

            // Redirect to login
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 500);
        } catch (error) {
            Utils.hideLoading();
            Utils.showErrorToast(error.message || 'Registration failed');
            console.error('Register error:', error);
        }
    });

    return tempDiv.innerHTML;
}
