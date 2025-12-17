// Authentication management
class Auth {
    static TOKEN_KEY = 'story_app_token';
    static USER_KEY = 'story_app_user';

    // Register user
    static async register(name, email, password) {
        const result = await storyAPI.register(name, email, password);
        return result;
    }

    // Login user
    static async login(email, password) {
        const result = await storyAPI.login(email, password);

        if (result.loginResult) {
            // Save token and user data
            localStorage.setItem(this.TOKEN_KEY, result.loginResult.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify({
                userId: result.loginResult.userId,
                name: result.loginResult.name,
                email: email
            }));
        }

        return result;
    }

    // Logout user
    static logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        // Clear subscription data
        sessionStorage.removeItem('subscription_notification');
    }

    // Get token
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Get user data
    static getUser() {
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    // Check if authenticated
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Get auth header
    static getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}
