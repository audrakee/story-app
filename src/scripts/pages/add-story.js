// Add Story Page
let addMap = null;
let selectedCoordinates = null;
let cameraStream = null;
let selectedPhotoFile = null;

async function addStoryPage(params) {
    // Check if authenticated
    if (!Auth.isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }

    const html = `
        <div class="add-story-container">
            <h2>Add New Story</h2>
            
            <form id="add-story-form" class="add-story-form">
                <!-- Image Upload Section -->
                <div class="form-group">
                    <label for="story-photo">Photo (max 1MB)</label>
                    <div id="photo-preview-container" style="display: none; margin-bottom: 1rem;">
                        <img id="photo-preview" class="image-preview" alt="Selected photo preview">
                    </div>
                    <div class="camera-options">
                        <button type="button" class="camera-btn" id="upload-btn" aria-label="Upload photo from device">
                            📤 Upload Photo
                        </button>
                        <button type="button" class="camera-btn" id="camera-btn" aria-label="Take photo with camera">
                            📷 Take Photo
                        </button>
                    </div>
                    <input 
                        type="file" 
                        id="story-photo" 
                        name="photo" 
                        accept="image/*"
                        style="display: none;"
                    >
                    <span class="error-message" id="photo-error"></span>
                </div>

                <!-- Camera View -->
                <div id="camera-view-container" style="display: none;">
                    <div class="video-container">
                        <video id="camera-video" autoplay playsinline muted></video>
                    </div>
                    <div class="camera-controls">
                        <button type="button" id="capture-btn" class="camera-btn" aria-label="Capture photo from camera">
                            📸 Capture
                        </button>
                        <button type="button" id="close-camera-btn" class="camera-btn" style="background: #ff6b6b;" aria-label="Close camera">
                            ✕ Close Camera
                        </button>
                    </div>
                </div>

                <!-- Description -->
                <div class="form-group">
                    <label for="story-description">Description</label>
                    <textarea 
                        id="story-description" 
                        name="description" 
                        rows="4" 
                        required
                        aria-label="Story description"
                        aria-required="true"
                        placeholder="Tell your story..."
                    ></textarea>
                    <span class="error-message" id="description-error"></span>
                </div>

                <!-- Coordinates Section -->
                <div class="form-group">
                    <label>Location Coordinates (optional)</label>
                    <div class="coord-display" id="coord-display">
                        Click on the map to select location
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label for="story-lat">Latitude</label>
                            <input 
                                type="number" 
                                id="story-lat" 
                                name="latitude" 
                                step="0.0001"
                                readonly
                                aria-label="Latitude coordinate"
                            >
                        </div>
                        <div class="form-group">
                            <label for="story-lon">Longitude</label>
                            <input 
                                type="number" 
                                id="story-lon" 
                                name="longitude" 
                                step="0.0001"
                                readonly
                                aria-label="Longitude coordinate"
                            >
                        </div>
                    </div>
                </div>

                <!-- Map for coordinates -->
                <div class="map-container" id="add-map-container">
                    <div id="add-map"></div>
                </div>

                <!-- Submit Button -->
                <button type="submit" aria-label="Submit story">Share Story</button>
            </form>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Setup event listeners
    setTimeout(() => {
        setupAddStoryForm();
        initializeAddMap();
    }, 100);

    return tempDiv.innerHTML;
}

// Setup add story form
function setupAddStoryForm() {
    const form = document.getElementById('add-story-form');
    if (!form) return;

    // Photo upload
    const uploadBtn = document.getElementById('upload-btn');
    const photoInput = document.getElementById('story-photo');
    const cameraBtn = document.getElementById('camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const closeCameraBtn = document.getElementById('close-camera-btn');
    const cameraVideo = document.getElementById('camera-video');
    const cameraViewContainer = document.getElementById('camera-view-container');

    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.click();
    });

    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 1MB)
            if (file.size > 1024 * 1024) {
                Utils.showErrorToast('File size must be less than 1MB');
                return;
            }

            selectedPhotoFile = file;
            displayPhotoPreview(file);
        }
    });

    cameraBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await startCamera();
    });

    closeCameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopCamera();
    });

    captureBtn.addEventListener('click', (e) => {
        e.preventDefault();
        capturePhoto(cameraVideo);
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitAddStory();
    });
}

// Display photo preview
function displayPhotoPreview(file) {
    const previewContainer = document.getElementById('photo-preview-container');
    const preview = document.getElementById('photo-preview');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Start camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });

        const video = document.getElementById('camera-video');
        video.srcObject = stream;
        cameraStream = stream;

        document.getElementById('camera-view-container').style.display = 'block';
    } catch (error) {
        Utils.showErrorToast('Failed to access camera: ' + error.message);
        console.error('Camera error:', error);
    }
}

// Stop camera
function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('camera-view-container').style.display = 'none';
}

// Capture photo from camera
function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        selectedPhotoFile = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        displayPhotoPreview(selectedPhotoFile);
        stopCamera();
    }, 'image/jpeg', 0.95);
}

// Initialize add map
function initializeAddMap() {
    if (!document.getElementById('add-map')) return;

    // Destroy existing map
    if (addMap) {
        addMap.remove();
        addMap = null;
    }

    // Initialize new map
    addMap = L.map('add-map').setView([-2.5, 118.5], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(addMap);

    // Add click handler for coordinates
    addMap.on('click', (e) => {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        selectedCoordinates = { lat, lon };

        // Update input values
        document.getElementById('story-lat').value = lat.toFixed(6);
        document.getElementById('story-lon').value = lon.toFixed(6);

        // Update display
        const coordDisplay = document.getElementById('coord-display');
        coordDisplay.classList.add('active');
        coordDisplay.innerHTML = `✓ Location selected: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

        // Remove previous marker
        if (window.locationMarker) {
            window.locationMarker.remove();
        }

        // Add marker
        window.locationMarker = L.marker([lat, lon]).addTo(addMap);
    });
}

// Submit add story
async function submitAddStory() {
    try {
        const description = document.getElementById('story-description').value.trim();
        let lat = document.getElementById('story-lat').value;
        let lon = document.getElementById('story-lon').value;

        // Clear previous errors
        document.getElementById('photo-error').textContent = '';
        document.getElementById('description-error').textContent = '';

        // Validate
        const errors = {};
        if (!selectedPhotoFile) {
            errors.photo = 'Photo is required';
        }
        if (!description) {
            errors.description = 'Description is required';
        }

        if (Object.keys(errors).length > 0) {
            if (errors.photo) {
                document.getElementById('photo-error').textContent = errors.photo;
            }
            if (errors.description) {
                document.getElementById('description-error').textContent = errors.description;
            }
            return;
        }

        Utils.showLoading();

        const token = Auth.getToken();
        lat = lat ? parseFloat(lat) : null;
        lon = lon ? parseFloat(lon) : null;

        // Submit
        const result = await storyAPI.addStory(description, selectedPhotoFile, lat, lon, token);

        // Clear cache for next fetch
        await storyDB.clearStories();

        // Show pending upload if offline
        if (!Utils.isOnline()) {
            await storyDB.addPendingUpload({
                description,
                photo: await Utils.fileToBase64(selectedPhotoFile),
                lat,
                lon,
                timestamp: Date.now()
            });
            Utils.showSuccessToast('Story will be uploaded when online');
        } else {
            Utils.showSuccessToast('Story shared successfully!');
        }

        Utils.hideLoading();

        // Redirect to home after 1 second
        setTimeout(() => {
            window.location.hash = '#/';
        }, 1000);
    } catch (error) {
        Utils.hideLoading();
        Utils.showErrorToast(error.message || 'Failed to add story');
        console.error('Add story error:', error);
    }
}
