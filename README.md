# 📖 Story App - Dicoding Submission Project 2

A Progressive Web Application (PWA) to share your stories with photos and locations. Built with vanilla JavaScript, IndexedDB, and Leaflet Maps.

## 🎯 Features

### ✅ Core Features
- **Authentication**: Register and login with JWT tokens
- **SPA Navigation**: Hash-based routing with smooth transitions
- **Stories Management**: Create, read, and manage stories
- **Interactive Maps**: Leaflet.js integration with markers and popups
- **Favorites**: Save and organize favorite stories
- **Offline Support**: Full offline functionality with caching

### ✅ Advanced Features
- **Push Notifications**: Web push notifications via service worker
- **PWA Support**: Installable on mobile and desktop
- **IndexedDB**: Local data persistence
- **Camera Integration**: Take photos directly from the app
- **Responsive Design**: Works on mobile (375px), tablet (768px), and desktop (1024px)
- **Accessibility**: WCAG compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Modern web browser with PWA support
- Internet connection (for initial setup)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd story-app
```

2. Serve the files locally (required for Service Worker)
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

3. Open in browser
```
http://localhost:8000
```

## 📱 Usage

### Register & Login
1. Click "Register" to create a new account
2. Fill in your name, email, and password (min 8 characters)
3. Click "Create Account"
4. Login with your credentials

### Add Story
1. Click "Add Story" in the navigation
2. Choose to upload photo or take with camera
3. Write your story description
4. Click on the map to set location (optional)
5. Click "Share Story"

### Browse Stories
- View all stories with photo preview
- Click on a story card to see full details
- Click on map markers to see stories by location
- Add stories to favorites by clicking the ❤️ button

### Manage Favorites
- Click "Favorites" to view your saved stories
- Remove stories by clicking the favorited button

### Push Notifications
- Click 🔔 button to enable/disable notifications
- Receive notifications when new stories are posted

## 🏗️ Project Structure

```
story-app/
├── index.html                # Main HTML
├── service-worker.js         # PWA service worker
├── manifest.json            # Web app manifest
├── STUDENT.txt              # Submission documentation
├── README.md                # This file
└── src/
    ├── css/
    │   └── styles.css       # All styling (responsive)
    ├── scripts/
    │   ├── db.js            # IndexedDB operations
    │   ├── api.js           # API integration
    │   ├── utils.js         # Utility functions
    │   ├── router.js        # SPA router
    │   ├── auth.js          # Authentication
    │   ├── notification.js  # Push notifications
    │   ├── app.js           # Main app logic
    │   └── pages/           # Page components
    │       ├── login.js
    │       ├── register.js
    │       ├── home.js
    │       ├── add-story.js
    │       ├── detail-story.js
    │       └── favorites.js
    └── assets/              # Images and icons
```

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Maps**: Leaflet.js
- **Storage**: IndexedDB, LocalStorage
- **PWA**: Service Worker, Web App Manifest
- **Notifications**: Web Push API
- **API**: Fetch API

## 🌐 API Integration

### Dicoding Story API
- Base URL: `https://story-api.dicoding.dev/v1`
- Endpoints:
  - `POST /register` - Register user
  - `POST /login` - Login user
  - `GET /stories` - Get all stories
  - `GET /stories/:id` - Get story detail
  - `POST /stories` - Add new story
  - `POST /notifications/subscribe` - Subscribe push
  - `DELETE /notifications/subscribe` - Unsubscribe push

## 🔐 Security

- JWT token authentication
- Token stored securely in localStorage
- No sensitive data exposed in code
- HTTPS ready for production

## 📊 Accessibility

- ✅ Semantic HTML elements
- ✅ Alt text on all images
- ✅ Labels on all inputs
- ✅ Keyboard navigation support
- ✅ ARIA labels and attributes
- ✅ Skip to content link
- ✅ Focus visible indicators

## 📐 Responsive Design

| Device | Size | Status |
|--------|------|--------|
| Mobile | 375px | ✅ Optimized |
| Tablet | 768px | ✅ Optimized |
| Desktop | 1024px+ | ✅ Optimized |

## 🚀 Deployment

### Deploy to GitHub Pages

1. Create a GitHub repository
2. Push all files to `main` branch
3. Go to Settings → Pages
4. Select `main` branch as source
5. Deployment URL will be available

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

### Deploy to Netlify

1. Connect your GitHub repository
2. Select the project
3. Netlify will automatically deploy

## 📋 Requirements Met

### ✅ Submission 1 Criteria
- [x] SPA with hash routing and transitions
- [x] Data display with map markers
- [x] Add new story feature
- [x] Accessibility standards

### ✅ Submission 2 Criteria
- [x] Push notifications
- [x] PWA with offline support
- [x] IndexedDB implementation
- [x] Public deployment
- [x] Maintained all submission 1 criteria

## 🐛 Troubleshooting

### Service Worker not registering
- Make sure you're serving over HTTPS or localhost
- Check browser console for errors
- Clear cache and reload

### Maps not loading
- Check internet connection
- Verify Leaflet.js CDN is accessible
- Check browser console for CORS errors

### Push notifications not working
- Grant notification permission
- Check browser notification settings
- Verify service worker is registered

## 💡 Tips for Users

- Install the app to your homescreen for quick access
- Enable push notifications for updates
- Use offline mode to view cached stories
- Add favorites for quick access to saved stories

## 📝 Notes

- All API calls are handled asynchronously
- Offline mode shows cached stories and favorites
- Pending uploads sync automatically when online
- Images are limited to 1MB for optimal performance

## 🎓 Learning Resources

- [Dicoding Courses](https://www.dicoding.com)
- [Web APIs MDN](https://developer.mozilla.org/en-US/docs/Web/API)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)

## 📄 License

This project is created for Dicoding Academy submission.

## ✨ Version History

### v1.0 (December 2024)
- Initial release
- All core features implemented
- PWA and offline support
- Push notifications
- IndexedDB integration

---

**Built with ❤️ for Dicoding Academy**
