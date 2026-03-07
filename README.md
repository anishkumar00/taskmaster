# ⚡ TaskMaster Pro

Your personal productivity system — tasks, study tracking, pomodoro timer, and more.

## 📁 Project Structure

```
taskmaster/
├── index.html          # Login / Sign Up page
├── dashboard.html      # Main dashboard (protected)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── assets/
│   ├── icon-192.png    # PWA icon (192x192)
│   └── icon-512.png    # PWA icon (512x512)
├── css/
│   ├── style.css       # Global styles
│   ├── auth.css        # Login/Signup styles
│   └── dashboard.css   # Dashboard styles
└── js/
    ├── config.js       # Supabase credentials
    ├── supabase-client.js  # Database helpers
    ├── auth.js         # Authentication logic
    ├── app.js          # App initialization
    ├── state.js        # App state management
    ├── ui.js           # UI utilities
    ├── utils.js        # Helper functions
    ├── tasks.js        # Task CRUD operations
    ├── categories.js   # Category management
    ├── timer.js        # Pomodoro timer
    ├── study.js        # Study mode
    ├── history.js      # Study history
    ├── stats.js        # Statistics view
    └── profile.js      # User profile
```

## 🚀 Setup

1. Create a [Supabase](https://supabase.com) project
2. Update `js/config.js` with your Supabase URL and anon key
3. Run with any local server:
   ```bash
   python -m http.server 3000
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Supabase (Auth, Database)
- **PWA**: Service Worker + Web App Manifest
