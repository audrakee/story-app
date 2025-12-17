// Push Notification management
class PushNotification {
    static VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

    // Request notification permission
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // Subscribe to push notification
    static async subscribe(token) {
        try {
            // Check if service worker is available
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Service Worker or Push API not supported');
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Create new subscription
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY)
                });

                // Send subscription to server
                await storyAPI.subscribeToPushNotification(subscription, token);
            }

            // Store subscription info for later use
            sessionStorage.setItem('subscription_notification', JSON.stringify({
                endpoint: subscription.endpoint,
                isActive: true
            }));

            return subscription;
        } catch (error) {
            console.error('Push subscription error:', error);
            throw error;
        }
    }

    // Unsubscribe from push notification
    static async unsubscribe(token) {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                throw new Error('Service Worker or Push API not supported');
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Get endpoint
                const endpoint = subscription.endpoint;

                // Send unsubscribe to server
                await storyAPI.unsubscribeFromPushNotification(endpoint, token);

                // Unsubscribe locally
                await subscription.unsubscribe();

                // Clear subscription info
                sessionStorage.removeItem('subscription_notification');

                return true;
            }

            return false;
        } catch (error) {
            console.error('Push unsubscription error:', error);
            throw error;
        }
    }

    // Check if subscribed
    static async isSubscribed() {
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                return false;
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            return !!subscription;
        } catch (error) {
            console.error('Check subscription error:', error);
            return false;
        }
    }

    // Helper: Convert VAPID key
    static urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    // Show notification
    static async showNotification(title, options = {}) {
        try {
            if (Notification.permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    icon: 'src/assets/icon-192x192.png',
                    badge: 'src/assets/icon-192x192.png',
                    ...options
                });
            }
        } catch (error) {
            console.error('Show notification error:', error);
        }
    }
}
