// API utilities for Dicoding Story API
class StoryAPI {
    constructor() {
        this.baseURL = 'https://story-api.dicoding.dev/v1';
    }

    // Register new user
    async register(name, email, password) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            throw new Error(`Registration error: ${error.message}`);
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            return data;
        } catch (error) {
            throw new Error(`Login error: ${error.message}`);
        }
    }

    // Get all stories
    async getStories(page = 1, size = 10, location = 0, token) {
        try {
            const url = new URL(`${this.baseURL}/stories`);
            url.searchParams.append('page', page);
            url.searchParams.append('size', size);
            url.searchParams.append('location', location);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch stories');
            }

            return data;
        } catch (error) {
            throw new Error(`Get stories error: ${error.message}`);
        }
    }

    // Get story detail
    async getStoryDetail(id, token) {
        try {
            const response = await fetch(`${this.baseURL}/stories/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch story');
            }

            return data;
        } catch (error) {
            throw new Error(`Get story detail error: ${error.message}`);
        }
    }

    // Add new story with authentication
    async addStory(description, photoFile, latitude = null, longitude = null, token) {
        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photoFile);

            if (latitude !== null && longitude !== null) {
                formData.append('lat', latitude);
                formData.append('lon', longitude);
            }

            const response = await fetch(`${this.baseURL}/stories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add story');
            }

            return data;
        } catch (error) {
            throw new Error(`Add story error: ${error.message}`);
        }
    }

    // Add new story as guest (without authentication)
    async addStoryGuest(description, photoFile, latitude = null, longitude = null) {
        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('photo', photoFile);

            if (latitude !== null && longitude !== null) {
                formData.append('lat', latitude);
                formData.append('lon', longitude);
            }

            const response = await fetch(`${this.baseURL}/stories/guest`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add story');
            }

            return data;
        } catch (error) {
            throw new Error(`Add story guest error: ${error.message}`);
        }
    }

    // Subscribe to push notification
    async subscribeToPushNotification(subscription, token) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
                        auth: this.arrayBufferToBase64(subscription.getKey('auth'))
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to subscribe');
            }

            return data;
        } catch (error) {
            throw new Error(`Subscribe error: ${error.message}`);
        }
    }

    // Unsubscribe from push notification
    async unsubscribeFromPushNotification(endpoint, token) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/subscribe`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    endpoint
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to unsubscribe');
            }

            return data;
        } catch (error) {
            throw new Error(`Unsubscribe error: ${error.message}`);
        }
    }

    // Helper: Convert ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Create global API instance
const storyAPI = new StoryAPI();
