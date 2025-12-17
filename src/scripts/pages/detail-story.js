// Detail Story Page
let detailMap = null;

async function detailStoryPage(params) {
    // Check if authenticated
    if (!Auth.isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }

    const storyId = params.id;
    if (!storyId) {
        Utils.showErrorToast('Story ID not found');
        window.location.hash = '#/';
        return '';
    }

    try {
        Utils.showLoading();

        const token = Auth.getToken();
        let story = null;

        // Try to fetch from API
        try {
            const result = await storyAPI.getStoryDetail(storyId, token);
            story = result.story;
        } catch (apiError) {
            // If offline, try to get from cache
            if (!Utils.isOnline()) {
                story = await storyDB.getStory(storyId);
                if (!story) {
                    throw new Error('Story not found');
                }
            } else {
                throw apiError;
            }
        }

        const isFavorite = await storyDB.isFavorite(storyId);
        const storyDate = Utils.formatDate(story.createdAt);

        const html = `
            <div class="detail-container">
                <img 
                    src="${story.photoUrl}" 
                    alt="Story photo by ${story.name}"
                    class="detail-image"
                >
                <div class="detail-content">
                    <div class="detail-header">
                        <div class="detail-author-info">
                            <h2>${story.name}</h2>
                            <div class="detail-date">${storyDate}</div>
                        </div>
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" id="detail-favorite-btn" aria-label="Toggle favorite">
                            ${isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                        </button>
                    </div>

                    <div class="detail-description">
                        ${story.description}
                    </div>

                    ${story.lat && story.lon ? `
                        <div class="detail-location">
                            📍 Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
                        </div>
                        <div class="detail-map-container">
                            <div id="detail-map"></div>
                        </div>
                    ` : ''}

                    <div class="detail-actions">
                        <button class="back-btn" id="back-btn" aria-label="Go back to stories">← Back</button>
                    </div>
                </div>
            </div>
        `;

        Utils.hideLoading();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Setup event listeners
        setTimeout(() => {
            const favoriteBtn = document.getElementById('detail-favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', async () => {
                    await toggleDetailFavorite(story, isFavorite, favoriteBtn);
                });
            }

            const backBtn = document.getElementById('back-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    window.location.hash = '#/';
                });
            }

            // Initialize map if story has location
            if (story.lat && story.lon) {
                initializeDetailMap(story.lat, story.lon);
            }
        }, 100);

        return tempDiv.innerHTML;
    } catch (error) {
        Utils.hideLoading();
        Utils.showErrorToast(error.message || 'Failed to load story');
        console.error('Detail story error:', error);
        window.location.hash = '#/';
        return '';
    }
}

// Toggle favorite on detail page
async function toggleDetailFavorite(story, isFavorite, btn) {
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

// Initialize detail map
function initializeDetailMap(lat, lon) {
    if (!document.getElementById('detail-map')) return;

    // Destroy existing map
    if (detailMap) {
        detailMap.remove();
        detailMap = null;
    }

    // Initialize new map
    detailMap = L.map('detail-map').setView([lat, lon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(detailMap);

    // Add marker
    L.marker([lat, lon]).addTo(detailMap);
}
