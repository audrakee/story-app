// Home Page
let map = null;
let mapMarkers = [];

async function homePage(params) {
    // Check if authenticated
    if (!Auth.isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }

    const html = `
        <div class="home-container">
            <div class="stories-list" id="stories-list">
                <p>Loading stories...</p>
            </div>
            <div class="map-container">
                <div id="map"></div>
                <div class="map-info">
                    <p><strong>📍 Stories on Map</strong></p>
                    <p id="marker-count">Click on markers to see stories</p>
                </div>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Load stories after DOM is ready
    setTimeout(async () => {
        await loadStories();
        initializeMap();
    }, 100);

    return tempDiv.innerHTML;
}

// Load stories from API or cache
async function loadStories() {
    try {
        Utils.showLoading();
        const token = Auth.getToken();
        
        let stories = [];
        
        // Try to fetch from API
        try {
            const result = await storyAPI.getStories(1, 20, 0, token);
            stories = result.listStory || [];
            
            // Cache stories in IndexedDB
            await storyDB.clearStories();
            for (const story of stories) {
                await storyDB.addStory(story);
            }
        } catch (apiError) {
            // If offline, use cached stories
            if (!Utils.isOnline()) {
                stories = await storyDB.getAllStories();
                Utils.showSuccessToast('Showing cached stories (offline mode)');
            } else {
                throw apiError;
            }
        }

        // Render stories
        renderStories(stories);
        Utils.hideLoading();
    } catch (error) {
        Utils.hideLoading();
        Utils.showErrorToast(error.message || 'Failed to load stories');
        console.error('Load stories error:', error);
    }
}

// Render stories list
async function renderStories(stories) {
    const listContainer = document.getElementById('stories-list');
    if (!listContainer) return;

    Utils.clearElement(listContainer);

    if (stories.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No stories yet. Be the first to share one!</p>
            </div>
        `;
        return;
    }

    for (const story of stories) {
        const isFavorite = await storyDB.isFavorite(story.id);
        
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.role = 'article';
        
        const storyDate = Utils.formatDate(story.createdAt);
        const storyLocation = story.lat && story.lon ? `📍 ${story.lat.toFixed(2)}, ${story.lon.toFixed(2)}` : '📍 No location';

        storyCard.innerHTML = `
            <img 
                src="${story.photoUrl}" 
                alt="Story photo by ${story.name}"
                class="story-image"
                loading="lazy"
            >
            <div class="story-content">
                <div class="story-header">
                    <div>
                        <div class="story-author">${story.name}</div>
                        <div class="story-date">${storyDate}</div>
                    </div>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-story-id="${story.id}" aria-label="Toggle favorite">
                        ${isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                    </button>
                </div>
                <p class="story-description">${Utils.truncateText(story.description, 150)}</p>
                <div class="story-location">${storyLocation}</div>
            </div>
        `;

        // Add click handler to view detail
        storyCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn')) {
                window.location.hash = `#/story/${story.id}`;
            }
        });

        // Add favorite button handler
        const favoriteBtn = storyCard.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await toggleFavorite(story, isFavorite, favoriteBtn);
        });

        listContainer.appendChild(storyCard);
    }
}

// Toggle favorite
async function toggleFavorite(story, isFavorite, btn) {
    try {
        if (isFavorite) {
            await storyDB.removeFavorite(story.id);
            Utils.removeClass(btn, 'active');
            btn.textContent = '🤍 Favorite';
            Utils.showSuccessToast('Removed from favorites');
        } else {
            await storyDB.addFavorite(story);
            Utils.addClass(btn, 'active');
            btn.textContent = '❤️ Favorited';
            Utils.showSuccessToast('Added to favorites');
        }
    } catch (error) {
        Utils.showErrorToast('Failed to update favorite');
        console.error('Favorite error:', error);
    }
}

// Initialize map
function initializeMap() {
    if (!document.getElementById('map')) return;

    // Destroy existing map
    if (map) {
        map.remove();
        map = null;
    }

    // Initialize new map
    map = L.map('map').setView([-2.5, 118.5], 4);

    // Add tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 18
    });

    osmLayer.addTo(map);

    // Add layer control
    L.control.layers({
        'OpenStreetMap': osmLayer,
        'Satellite': satellite
    }).addTo(map);

    // Load and display stories on map
    loadStoriesOnMap();
}

// Load stories on map
async function loadStoriesOnMap() {
    try {
        const token = Auth.getToken();
        let stories = [];

        try {
            const result = await storyAPI.getStories(1, 20, 1, token);
            stories = result.listStory || [];
        } catch (apiError) {
            if (!Utils.isOnline()) {
                stories = await storyDB.getAllStories();
            } else {
                throw apiError;
            }
        }

        // Clear existing markers
        mapMarkers.forEach(marker => marker.remove());
        mapMarkers = [];

        // Add markers for stories with location
        let markerCount = 0;
        stories.forEach(story => {
            if (story.lat && story.lon) {
                const marker = L.marker([story.lat, story.lon], {
                    title: story.name
                }).addTo(map);

                const popupContent = `
                    <div>
                        <h4>${story.name}</h4>
                        <p>${Utils.truncateText(story.description, 100)}</p>
                        <img src="${story.photoUrl}" alt="Story photo" style="width: 100%; max-width: 200px; border-radius: 4px; margin-top: 5px;">
                        <a href="#/story/${story.id}" style="display: block; margin-top: 10px; padding: 5px; background: #ff6b6b; color: white; text-align: center; border-radius: 4px; text-decoration: none;">View Details</a>
                    </div>
                `;

                marker.bindPopup(popupContent);
                mapMarkers.push(marker);
                markerCount++;
            }
        });

        // Update marker count
        const markerCountEl = document.getElementById('marker-count');
        if (markerCountEl) {
            markerCountEl.textContent = `${markerCount} stories with location`;
        }
    } catch (error) {
        console.error('Load stories on map error:', error);
    }
}
