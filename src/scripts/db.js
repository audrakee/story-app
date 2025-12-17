// Database utilities using IndexedDB
class StoryDB {
    constructor() {
        this.dbName = 'StoryAppDB';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('stories')) {
                    const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
                    storyStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('pendingUploads')) {
                    db.createObjectStore('pendingUploads', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Add or update story
    async addStory(story) {
        const transaction = this.db.transaction(['stories'], 'readwrite');
        const store = transaction.objectStore('stories');
        return new Promise((resolve, reject) => {
            const request = store.put(story);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Get all stories
    async getAllStories() {
        const transaction = this.db.transaction(['stories'], 'readonly');
        const store = transaction.objectStore('stories');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Get story by ID
    async getStory(id) {
        const transaction = this.db.transaction(['stories'], 'readonly');
        const store = transaction.objectStore('stories');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Delete story
    async deleteStory(id) {
        const transaction = this.db.transaction(['stories'], 'readwrite');
        const store = transaction.objectStore('stories');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Clear all stories
    async clearStories() {
        const transaction = this.db.transaction(['stories'], 'readwrite');
        const store = transaction.objectStore('stories');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Add favorite
    async addFavorite(story) {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.put(story);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Remove favorite
    async removeFavorite(id) {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Get all favorites
    async getAllFavorites() {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Check if story is favorite
    async isFavorite(id) {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(!!request.result);
        });
    }

    // Add pending upload
    async addPendingUpload(uploadData) {
        const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
        const store = transaction.objectStore('pendingUploads');
        return new Promise((resolve, reject) => {
            const request = store.add(uploadData);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Get all pending uploads
    async getPendingUploads() {
        const transaction = this.db.transaction(['pendingUploads'], 'readonly');
        const store = transaction.objectStore('pendingUploads');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    // Delete pending upload
    async deletePendingUpload(id) {
        const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
        const store = transaction.objectStore('pendingUploads');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    // Clear all pending uploads
    async clearPendingUploads() {
        const transaction = this.db.transaction(['pendingUploads'], 'readwrite');
        const store = transaction.objectStore('pendingUploads');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

// Create global database instance
const storyDB = new StoryDB();
