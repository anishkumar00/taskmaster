# ⚡ TaskMaster Pro

Your personal productivity system — tasks, habits, study tracking, pomodoro timer, and more.

## ✨ Features

- **Task Management**: Organize tasks by categories.
- **Habit Tracking**: Build and monitor daily habits.
- **Pomodoro Timer**: Stay focused with study sessions.
- **Progress Tracking**: View productivity statistics.
- **PWA Ready**: Install on your desktop or mobile device for offline support.
- **Cloud Sync**: Securely store and sync data using Supabase.

## 📁 Project Structure

```
taskmaster/
├── index.html          # Login / Sign Up page
├── dashboard.html      # Main dashboard (protected)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── assets/             # PWA icons and images
├── css/
│   ├── style.css       # Global styles
│   ├── auth.css        # Login/Signup styles
│   ├── dashboard.css   # Main structural styles
│   ├── habits.css      # Habit tracker styles
│   └── settings.css    # Settings page styles
└── js/
    ├── app.js              # App initialization
    ├── auth.js             # Authentication logic
    ├── categories.js       # Category management
    ├── config.example.js   # Supabase config template
    ├── config.js           # Supabase credentials (git-ignored)
    ├── habits.js           # Habit tracking functionality
    ├── onboarding.js       # First-time user tutorial
    ├── profile.js          # User profile operations
    ├── settings.js         # User settings and preferences
    ├── state.js            # App state management
    ├── stats.js            # Productivity statistics
    ├── study.js            # Study mode interactions
    ├── supabase-client.js  # Database wrappers
    ├── tasks.js            # Task CRUD operations
    ├── timer.js            # Pomodoro timer logic
    ├── ui.js               # Shared DOM updates
    └── utils.js            # General helper functions
```

## 🚀 Setup & Installation

1. Create a [Supabase](https://supabase.com) project
2. Update `js/config.js` with your Supabase URL and anon key (use `js/config.example.js` as a template)
3. Run with any local server:
   ```bash
   python -m http.server 3000
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Supabase (Auth, Database)
- **PWA**: Service Worker + Web App Manifest
