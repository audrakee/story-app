// Login Page
async function loginPage(params) {
    // If already authenticated, redirect to home
    if (Auth.isAuthenticated()) {
        window.location.hash = '#/';
        return '';
    }

    const html = `
        <div class="auth-container">
            <h2>Login</h2>
            <form id="login-form" class="auth-form">
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input 
                        type="email" 
                        id="login-email" 
                        name="email" 
                        required
                        aria-label="Email address"
                        aria-required="true"
                    >
                    <span class="error-message" id="email-error"></span>
                </div>

                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        name="password" 
                        required
                        aria-label="Password"
                        aria-required="true"
                    >
                    <span class="error-message" id="password-error"></span>
                </div>

                <button type="submit" aria-label="Sign in to your account">Sign In</button>
            </form>

            <div class="auth-link">
                Don't have an account? <a href="#/register">Register here</a>
            </div>
        </div>
    `;

    // Render HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Setup event listeners
    const form = tempDiv.querySelector('#login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Validate inputs
        const errors = Utils.validateFormInputs({ email, password });

        // Clear previous errors
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        // Show errors if any
        if (Object.keys(errors).length > 0) {
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

            // Login API call
            const result = await Auth.login(email, password);

            Utils.hideLoading();
            Utils.showSuccessToast('Login successful!');

            // Redirect to home
            setTimeout(() => {
                window.location.hash = '#/';
            }, 500);
        } catch (error) {
            Utils.hideLoading();
            Utils.showErrorToast(error.message || 'Login failed');
            console.error('Login error:', error);
        }
    });

    return tempDiv.innerHTML;
}
