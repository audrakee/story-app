// Favorites Page
async function favoritesPage(params) {
    // Check if authenticated
    if (!Auth.isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }

    const html = `
        <div>
            <h2>My Favorites</h2>
            <div class="favorites-container" id="favorites-container">
                <p>Loading favorites...</p>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Load favorites after DOM is ready
    setTimeout(async () => {
        await loadFavorites();
    }, 100);

    return tempDiv.innerHTML;
}

// Load favorites from IndexedDB
async function loadFavorites() {
    try {
        Utils.showLoading();
        const favorites = await storyDB.getAllFavorites();
        renderFavorites(favorites);
        Utils.hideLoading();
    } catch (error) {
        Utils.hideLoading();
        Utils.showErrorToast(error.message || 'Failed to load favorites');
        console.error('Load favorites error:', error);
    }
}

// Render favorites
async function renderFavorites(favorites) {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    Utils.clearElement(container);

    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">❤️</div>
                <p>No favorites yet. Add some stories to your favorites!</p>
            </div>
        `;
        return;
    }

    for (const story of favorites) {
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
                    <button class="favorite-btn active" data-story-id="${story.id}" aria-label="Remove from favorites">
                        ❤️ Favorited
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

        // Add favorite button handler to remove
        const favoriteBtn = storyCard.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await storyDB.removeFavorite(story.id);
                storyCard.remove();
                Utils.showSuccessToast('Removed from favorites');

                // Reload if empty
                const favorites = await storyDB.getAllFavorites();
                if (favorites.length === 0) {
                    await loadFavorites();
                }
            } catch (error) {
                Utils.showErrorToast('Failed to remove from favorites');
                console.error('Error:', error);
            }
        });

        container.appendChild(storyCard);
    }
}
