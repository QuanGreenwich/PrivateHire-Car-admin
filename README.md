# PrivateHire-Car-admin

Simple admin dashboard for managing users and drivers - Built with HTML, CSS, and JavaScript.

## 🚀 Quick Start

1. **Open the app:**

   ```bash
   cd public
   open index.html
   ```

   Or use any local server:

   ```bash
   python3 -m http.server 8080
   # Then visit: http://localhost:8080
   ```

2. **That's it!** No build tools, no npm install needed.

## 📁 Structure

```
public/
├── index.html    # Main HTML file
├── styles.css    # All styles
└── app.js        # JavaScript logic
```

## 🔥 Firebase Setup

The app uses Firebase CDN. Config is in `index.html`:

- Firestore for data storage
- Real-time listeners for live map

## ✨ Features

- 📊 User & Driver management
- 🗺️ Live map with driver locations
- 🔍 Search functionality
- 📱 Responsive design
- ⚡ No build process - just HTML/CSS/JS

## 🛠️ Tech Stack

- Pure HTML/CSS/JavaScript
- Firebase (via CDN)
- MapLibre GL (via CDN)
