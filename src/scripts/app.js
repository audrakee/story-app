// Main Application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize database
        await storyDB.init();

        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('service-worker.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }

        // Setup router
        router.register('/', homePage);
        router.register('/login', loginPage);
        router.register('/register', registerPage);
        router.register('/add', addStoryPage);
        router.register('/story/:id', async (params) => {
            const id = window.location.hash.split('/')[2];
            return detailStoryPage({ id });
        });
        router.register('/favorites', favoritesPage);

        // Initialize router
        router.init();

        // Setup UI
        setupUI();

        // Check for install prompt
        setupInstallPrompt();

    } catch (error) {
        console.error('App initialization error:', error);
        Utils.showErrorToast('Failed to initialize app');
    }
});

// Setup UI
function setupUI() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
            window.location.hash = '#/login';
        });
    }

    // Update navigation visibility based on auth status
    updateNavigation();

    // Listen for auth changes
    window.addEventListener('hashchange', updateNavigation);
}

// Update navigation visibility
function updateNavigation() {
    const isAuthenticated = Auth.isAuthenticated();
    const currentRoute = router.currentRoute;

    // Show/hide navigation items
    document.getElementById('nav-home').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-add').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-favorites').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('nav-logout').style.display = isAuthenticated ? 'block' : 'none';

    // Setup notification toggle
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) {
        if (isAuthenticated && (currentRoute === '/' || currentRoute === '/add' || currentRoute === '/favorites')) {
            notificationToggle.style.display = 'block';
            setupNotificationToggle(notificationToggle);
        } else {
            notificationToggle.style.display = 'none';
        }
    }
}

// Setup notification toggle
async function setupNotificationToggle(btn) {
    try {
        const isSubscribed = await PushNotification.isSubscribed();
        if (isSubscribed) {
            btn.classList.add('enabled');
        } else {
            btn.classList.remove('enabled');
        }

        btn.removeEventListener('click', toggleNotification);
        btn.addEventListener('click', toggleNotification);
    } catch (error) {
        console.error('Setup notification toggle error:', error);
    }
}

// Toggle notification
async function toggleNotification(e) {
    e.preventDefault();
    
    try {
        Utils.showLoading();
        const token = Auth.getToken();

        if (await PushNotification.isSubscribed()) {
            // Unsubscribe
            await PushNotification.unsubscribe(token);
            e.target.classList.remove('enabled');
            Utils.showSuccessToast('Notifications disabled');
        } else {
            // Request permission
            const granted = await PushNotification.requestPermission();
            if (!granted) {
                Utils.showErrorToast('Notification permission denied');
                Utils.hideLoading();
                return;
            }

            // Subscribe
            await PushNotification.subscribe(token);
            e.target.classList.add('enabled');
            Utils.showSuccessToast('Notifications enabled');
        }

        Utils.hideLoading();
    } catch (error) {
        Utils.hideLoading();
        Utils.showErrorToast('Failed to toggle notifications');
        console.error('Notification toggle error:', error);
    }
}

// Setup install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt && !sessionStorage.getItem('install_dismissed')) {
        prompt.style.display = 'flex';

        const installBtn = document.getElementById('install-btn');
        const dismissBtn = document.getElementById('dismiss-btn');

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                deferredPrompt = null;
                prompt.style.display = 'none';
            }
        });

        dismissBtn.addEventListener('click', () => {
            prompt.style.display = 'none';
            sessionStorage.setItem('install_dismissed', 'true');
        });
    }
}

// Handle online/offline events
window.addEventListener('online', () => {
    Utils.showSuccessToast('You are back online');
    // Sync pending uploads
    syncPendingUploads();
});

window.addEventListener('offline', () => {
    Utils.showSuccessToast('You are offline - some features are limited');
});

// Sync pending uploads
async function syncPendingUploads() {
    try {
        if (!Auth.isAuthenticated()) return;

        const pendingUploads = await storyDB.getPendingUploads();
        if (pendingUploads.length === 0) return;

        Utils.showLoading();
        const token = Auth.getToken();

        for (const upload of pendingUploads) {
            try {
                // Convert base64 back to file
                const byteCharacters = atob(upload.photo.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const photoFile = new File([byteArray], 'upload.jpg', { type: 'image/jpeg' });

                // Submit to API
                await storyAPI.addStory(upload.description, photoFile, upload.lat, upload.lon, token);

                // Remove from pending
                await storyDB.deletePendingUpload(upload.id);

                Utils.showSuccessToast('Synced offline upload');
            } catch (error) {
                console.error('Sync upload error:', error);
            }
        }

        Utils.hideLoading();
        // Refresh stories if on home page
        if (router.currentRoute === '/') {
            await loadStories();
        }
    } catch (error) {
        console.error('Sync pending uploads error:', error);
    }
}

// Check for app updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated');
        Utils.showSuccessToast('App updated, please refresh');
    });
}
