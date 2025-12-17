// SPA Router with hash routing and view transitions
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.container = document.getElementById('app-container');
        this.previousView = null;
    }

    // Register route
    register(path, handler) {
        this.routes[path] = handler;
    }

    // Navigate to route
    async navigate(path, params = {}) {
        // Extract hash without #
        const hashPath = path.replace('#', '');
        const routePath = hashPath.split('?')[0] || '/';

        // Check if route exists
        if (!(routePath in this.routes)) {
            console.warn(`Route ${routePath} not found`);
            window.location.hash = '#/';
            return;
        }

        // Check authentication for protected routes
        const isAuthenticated = Auth.isAuthenticated();
        const protectedRoutes = ['/', '/add', '/favorites'];

        if (protectedRoutes.includes(routePath) && !isAuthenticated && routePath !== '/') {
            // Redirect to login if not authenticated and trying to access protected route
            if (routePath !== '/') {
                window.location.hash = '#/login';
                return;
            }
        }

        try {
            Utils.showLoading();

            // Store previous view for transition
            this.previousView = this.container.innerHTML;

            // Call route handler
            const view = await this.routes[routePath](params);

            // Set current route
            this.currentRoute = routePath;

            // Clear container
            Utils.clearElement(this.container);

            // Create wrapper div for transition
            const viewWrapper = document.createElement('div');
            viewWrapper.className = 'view';
            viewWrapper.innerHTML = view;

            // Add to container
            this.container.appendChild(viewWrapper);

            // Trigger reflow to ensure animation works
            void viewWrapper.offsetHeight;

            // Update active nav link
            this.updateActiveNav(routePath);

            // Scroll to top
            window.scrollTo(0, 0);

            Utils.hideLoading();
        } catch (error) {
            console.error('Navigation error:', error);
            Utils.hideLoading();
            Utils.showErrorToast(error.message);
        }
    }

    // Update active navigation link
    updateActiveNav(routePath) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && href.includes(routePath)) {
                link.classList.add('active');
            }
        });
    }

    // Initialize router
    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash || '#/';
            this.navigate(hash);
        });

        // Initial route
        const initialHash = window.location.hash || '#/';
        this.navigate(initialHash);
    }
}

// Create global router instance
const router = new Router();
