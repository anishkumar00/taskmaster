// ═══════════════════════════════════════════════════════
//  Settings — Theme, Font, Accent, Notifications, Language
//  Saved in localStorage — works without internet
// ═══════════════════════════════════════════════════════

// ── Default settings ──────────────────────────────────
const DEFAULT_SETTINGS = {
  theme: "dark",        // "dark" | "light"
  fontSize: "medium",     // "small" | "medium" | "large" | "xlarge"
  accentColor: "#00ff88",    // hex color
  language: "en",         // "en" | "hi"
  notifTaskComplete: false,
  notifOverdue: false,
  notifPomodoro: false,
  notifStudyReminder: false,
};

// ── Accent color options ──────────────────────────────
const ACCENT_COLORS = [
  { color: "#00ff88", name: "Green (Default)" },
  { color: "#00eeff", name: "Cyan" },
  { color: "#bb88ff", name: "Purple" },
  { color: "#ff88aa", name: "Pink" },
  { color: "#ff8800", name: "Orange" },
  { color: "#ffdd00", name: "Yellow" },
  { color: "#44aaff", name: "Blue" },
  { color: "#ff4466", name: "Red" },
];

// ── Hindi translations ────────────────────────────────
const LANG = {
  en: {
    today: "Today",
    allTasks: "All Tasks",
    completed: "Completed",
    studyHistory: "Study History",
    stats: "Stats",
    categories: "CATEGORIES",
    study: "📚 Study",
    addTask: "+ Task",
    settings: "Settings",
    search: "Search tasks, tags...",
    allPriority: "All Priority",
    overallProgress: "Overall Progress",
    noTasks: "No tasks here!",
    addFirst: "Click \"+Task\" to add one",
    taskTitle: "Task Title *",
    category: "Category",
    priority: "Priority",
    dueDate: "Due Date",
    notes: "Notes",
    tags: "Tags (comma separated)",
    subtasks: "Subtasks",
    cancel: "Cancel",
    save: "Save Changes",
    addTaskBtn: "Add Task ✓",
    logout: "🚪 Logout",
    profile: "👤 Profile",
    complete: "✓ Complete",
    pending: "↩ Pending",
    edit: "✏️ Edit",
    delete: "🗑",
    tapMotivation: "💬 tap for motivation",
    focus: "FOCUS",
    breakTime: "BREAK",
    start: "▶ Start",
    pause: "⏸ Pause",
    resume: "▶ Resume",
  },
  hi: {
    today: "आज",
    allTasks: "सभी काम",
    completed: "पूरे हुए",
    studyHistory: "पढ़ाई इतिहास",
    stats: "आँकड़े",
    categories: "श्रेणियाँ",
    study: "📚 पढ़ाई",
    addTask: "+ काम",
    settings: "सेटिंग्स",
    search: "काम ढूंढो...",
    allPriority: "सभी प्राथमिकता",
    overallProgress: "कुल प्रगति",
    noTasks: "कोई काम नहीं!",
    addFirst: "\"+काम\" दबाकर जोड़ो",
    taskTitle: "काम का नाम *",
    category: "श्रेणी",
    priority: "प्राथमिकता",
    dueDate: "तारीख",
    notes: "नोट्स",
    tags: "टैग (कॉमा से अलग)",
    subtasks: "उप-काम",
    cancel: "रद्द",
    save: "बदलाव सेव करो",
    addTaskBtn: "काम जोड़ो ✓",
    logout: "🚪 लॉगआउट",
    profile: "👤 प्रोफ़ाइल",
    complete: "✓ पूरा करो",
    pending: "↩ अधूरा करो",
    edit: "✏️ बदलो",
    delete: "🗑",
    tapMotivation: "💬 प्रेरणा के लिए दबाओ",
    focus: "ध्यान",
    breakTime: "ब्रेक",
    start: "▶ शुरू",
    pause: "⏸ रोको",
    resume: "▶ जारी रखो",
  },
};

// ── Current settings (loaded from localStorage) ────────
let SETTINGS = { ...DEFAULT_SETTINGS };
let settingsActiveTab = "appearance";

// ── Load & Apply settings on page load ────────────────
function loadSettings() {
  try {
    const saved = localStorage.getItem("tm_settings");
    if (saved) {
      SETTINGS = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) { SETTINGS = { ...DEFAULT_SETTINGS }; }
  applySettings();
}

function saveSettings() {
  localStorage.setItem("tm_settings", JSON.stringify(SETTINGS));
}

// ── Apply all settings to the page ────────────────────
function applySettings() {
  applyTheme(SETTINGS.theme);
  applyFontSize(SETTINGS.fontSize);
  applyAccentColor(SETTINGS.accentColor);
  applyLanguage(SETTINGS.language);
}

function applyTheme(theme) {
  document.body.classList.remove("theme-dark", "theme-light");
  document.body.classList.add("theme-" + theme);
}

function applyFontSize(size) {
  document.body.classList.remove("fs-small", "fs-medium", "fs-large", "fs-xlarge");
  document.body.classList.add("fs-" + size);
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty("--green", color);
  // Derive a slightly darker shade for gradients
  document.documentElement.style.setProperty("--green-dark", color + "cc");
}

function applyLanguage(lang) {
  const T = LANG[lang] || LANG.en;
  // Update nav labels
  const navMap = {
    "today": T.today,
    "pending": T.allTasks,
    "completed": T.completed,
    "history": T.studyHistory,
    "stats": T.stats,
  };
  document.querySelectorAll(".nav-btn").forEach(btn => {
    const view = btn.dataset.view;
    if (view && navMap[view]) {
      const label = btn.querySelector(".nav-label");
      if (label) label.textContent = navMap[view];
    }
  });
  // Study & Add Task buttons in header
  const studyBtn = document.querySelector(".btn-study");
  const addBtn = document.querySelector(".btn-add");
  if (studyBtn) studyBtn.textContent = T.study;
  if (addBtn) addBtn.textContent = T.addTask;
  // Sidebar section title
  const catTitle = document.querySelector(".sidebar-section-title");
  if (catTitle) catTitle.textContent = T.categories;
  // Quote widget
  const quoteLabel = document.querySelector(".quote-label");
  if (quoteLabel) quoteLabel.textContent = T.tapMotivation;
  // Search placeholder
  const search = document.getElementById("search-inp");
  if (search) search.placeholder = T.search;
  // Progress label
  const progLabel = document.querySelector(".progress-labels span");
  if (progLabel) progLabel.textContent = T.overallProgress;
}

// ── Open / Close Settings Modal ───────────────────────
function openSettingsModal() {
  settingsActiveTab = "appearance";
  renderSettingsModal();
  document.getElementById("settings-overlay").classList.remove("hidden");
}

function closeSettingsModal() {
  document.getElementById("settings-overlay").classList.add("hidden");
}

// ── Render full modal ─────────────────────────────────
function renderSettingsModal() {
  const modal = document.getElementById("settings-modal");
  const notifPerm = "Notification" in window ? Notification.permission : "denied";

  modal.innerHTML = `
    <!-- Header -->
    <div class="settings-header">
      <div class="settings-header-title">⚙️ ${SETTINGS.language === "hi" ? "सेटिंग्स" : "Settings"}</div>
      <button class="settings-close" onclick="closeSettingsModal()">×</button>
    </div>

    <!-- Tabs -->
    <div class="settings-tabs">
      ${[
      { id: "appearance", icon: "🎨", en: "Appearance", hi: "दिखावट" },
      { id: "language", icon: "🌐", en: "Language", hi: "भाषा" },
      { id: "notifications", icon: "🔔", en: "Notifications", hi: "सूचनाएँ" },
      { id: "account", icon: "👤", en: "Account", hi: "खाता" },
      { id: "support", icon: "🎧", en: "Support", hi: "सहायता" },
    ].map(t => `
        <button class="settings-tab ${settingsActiveTab === t.id ? "active" : ""}"
          onclick="switchSettingsTab('${t.id}')">
          ${t.icon} ${SETTINGS.language === "hi" ? t.hi : t.en}
        </button>`).join("")}
    </div>

    <!-- Body -->
    <div class="settings-body">

      <!-- ── APPEARANCE ── -->
      <div class="settings-panel ${settingsActiveTab === "appearance" ? "active" : ""}" id="sp-appearance">

        <!-- Theme -->
        <div class="settings-section">
          <div class="settings-section-title">🌓 ${SETTINGS.language === "hi" ? "थीम" : "Theme"}</div>
          <div class="theme-cards">
            ${[
      {
        id: "dark", name: SETTINGS.language === "hi" ? "डार्क" : "Dark Mode",
        bg: "#0d1117", sidebar: "#161b22", accent: "#00ff88"
      },
      {
        id: "light", name: SETTINGS.language === "hi" ? "लाइट" : "Light Mode",
        bg: "#f4f6f9", sidebar: "#ffffff", accent: "#00cc66"
      },
    ].map(t => `
              <div class="theme-card ${SETTINGS.theme === t.id ? "selected" : ""}"
                onclick="selectTheme('${t.id}')">
                <div class="theme-preview" style="background:${t.bg}">
                  <div class="theme-preview-bar" style="background:${t.sidebar}"></div>
                  <div style="flex:1;display:flex;flex-direction:column;gap:3px">
                    <div style="height:6px;border-radius:2px;background:${t.accent};width:60%"></div>
                    <div style="height:4px;border-radius:2px;background:${t.accent}44;width:80%"></div>
                    <div style="height:4px;border-radius:2px;background:${t.accent}44;width:50%"></div>
                  </div>
                </div>
                <div class="theme-card-name">${t.name}</div>
                <div class="theme-card-check">✓</div>
              </div>`).join("")}
          </div>
        </div>

        <!-- Accent Color -->
        <div class="settings-section">
          <div class="settings-section-title">🎯 ${SETTINGS.language === "hi" ? "मुख्य रंग" : "Accent Color"}</div>
          <div class="setting-row">
            <div class="setting-row-left">
              <div class="setting-label">${SETTINGS.language === "hi" ? "ऐप का मुख्य रंग" : "App accent color"}</div>
              <div class="setting-desc">${SETTINGS.language === "hi" ? "बटन और highlights का रंग" : "Color used for buttons, highlights"}</div>
            </div>
          </div>
          <div class="accent-colors" style="padding:4px 0">
            ${ACCENT_COLORS.map(a => `
              <button class="accent-btn ${SETTINGS.accentColor === a.color ? "selected" : ""}"
                style="background:${a.color}"
                title="${a.name}"
                onclick="selectAccent('${a.color}')">
              </button>`).join("")}
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--dim)">
            ${SETTINGS.language === "hi" ? "अभी चुना:" : "Selected:"} 
            <span style="color:${SETTINGS.accentColor};font-weight:700">${SETTINGS.accentColor}</span>
          </div>
        </div>

        <!-- Font Size -->
        <div class="settings-section">
          <div class="settings-section-title">🔤 ${SETTINGS.language === "hi" ? "अक्षर का आकार" : "Font Size"}</div>
          <div class="font-size-options">
            ${[
      { id: "small", px: "12px", en: "Small", hi: "छोटा" },
      { id: "medium", px: "14px", en: "Medium", hi: "मध्यम" },
      { id: "large", px: "16px", en: "Large", hi: "बड़ा" },
      { id: "xlarge", px: "18px", en: "X-Large", hi: "बहुत बड़ा" },
    ].map(f => `
              <button class="font-size-btn ${SETTINGS.fontSize === f.id ? "selected" : ""}"
                onclick="selectFontSize('${f.id}')">
                <span class="fz-preview" style="font-size:${f.px}">Aa</span>
                <span class="fz-label">${SETTINGS.language === "hi" ? f.hi : f.en}</span>
                <span class="fz-label">${f.px}</span>
              </button>`).join("")}
          </div>
        </div>

      </div>

      <!-- ── LANGUAGE ── -->
      <div class="settings-panel ${settingsActiveTab === "language" ? "active" : ""}" id="sp-language">
        <div class="settings-section">
          <div class="settings-section-title">🌐 Language / भाषा</div>
          <div class="lang-options">
            <div class="lang-btn ${SETTINGS.language === "en" ? "selected" : ""}" onclick="selectLanguage('en')">
              <span class="lang-flag">🇺🇸</span>
              <div class="lang-name">English</div>
              <div class="lang-sub">English language</div>
            </div>
            <div class="lang-btn ${SETTINGS.language === "hi" ? "selected" : ""}" onclick="selectLanguage('hi')">
              <span class="lang-flag">🇮🇳</span>
              <div class="lang-name">हिंदी</div>
              <div class="lang-sub">Hindi language</div>
            </div>
          </div>
          <div style="margin-top:12px;padding:10px 12px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--dim);border:1px solid var(--border)">
            ℹ️ ${SETTINGS.language === "hi"
      ? "भाषा बदलने से बटन, नेविगेशन और लेबल बदल जाएंगे।"
      : "Changing language updates buttons, nav labels and UI text."}
          </div>
        </div>
      </div>

      <!-- ── NOTIFICATIONS ── -->
      <div class="settings-panel ${settingsActiveTab === "notifications" ? "active" : ""}" id="sp-notifications">
        <div class="settings-section">
          <div class="settings-section-title">🔔 ${SETTINGS.language === "hi" ? "सूचनाएँ" : "Notifications"}</div>

          <!-- Permission status -->
          <div class="notif-status ${notifPerm}">
            ${notifPerm === "granted"
      ? "✅ " + (SETTINGS.language === "hi" ? "सूचनाएँ चालू हैं" : "Notifications are enabled")
      : notifPerm === "denied"
        ? "❌ " + (SETTINGS.language === "hi" ? "सूचनाएँ बंद हैं — browser settings से चालू करो" : "Blocked — enable in browser settings")
        : "⏳ " + (SETTINGS.language === "hi" ? "अभी allow नहीं किया" : "Not yet allowed")
    }
          </div>

          ${notifPerm !== "granted"
      ? `<button class="btn-enable-notif" onclick="requestNotifPermission()">
                🔔 ${SETTINGS.language === "hi" ? "सूचनाएँ Allow करो" : "Enable Notifications"}
               </button>`
      : ""}

          <!-- Notification toggles -->
          ${[
      { key: "notifTaskComplete", en: "Task Complete", hi: "काम पूरा होने पर", desc_en: "When you complete a task", desc_hi: "+30 XP मिलने पर बताए" },
      { key: "notifOverdue", en: "Overdue Alert", hi: "देर हो गई अलर्ट", desc_en: "Daily reminder for overdue tasks", desc_hi: "बकाया कामों की रोज़ याद दिलाए" },
      { key: "notifPomodoro", en: "Pomodoro Complete", hi: "पोमोडोरो पूरा", desc_en: "When focus/break session ends", desc_hi: "Focus session खत्म होने पर" },
      { key: "notifStudyReminder", en: "Daily Study Reminder", hi: "रोज़ पढ़ाई याद दिलाए", desc_en: "Daily reminder to study at 8 PM", desc_hi: "शाम 8 बजे पढ़ाई की याद" },
    ].map(n => `
            <div class="setting-row">
              <div class="setting-row-left">
                <div class="setting-label">${SETTINGS.language === "hi" ? n.hi : n.en}</div>
                <div class="setting-desc">${SETTINGS.language === "hi" ? n.desc_hi : n.desc_en}</div>
              </div>
              <label class="toggle-wrap">
                <input type="checkbox" ${SETTINGS[n.key] ? "checked" : ""}
                  onchange="toggleNotifSetting('${n.key}', this.checked)"
                  ${notifPerm !== "granted" ? "disabled" : ""}/>
                <span class="toggle-slider"></span>
              </label>
            </div>`).join("")}

          <div style="margin-top:12px;padding:10px 12px;background:var(--bg);border-radius:8px;font-size:11px;color:var(--dim);border:1px solid var(--border)">
            ℹ️ ${SETTINGS.language === "hi"
      ? "सूचनाएँ तभी आएंगी जब app browser में खुली हो।"
      : "Notifications only work while the app is open in browser."}
          </div>
        </div>
      </div>

      <!-- ── ACCOUNT ── -->
      <div class="settings-panel ${settingsActiveTab === "account" ? "active" : ""}" id="sp-account">
        <div class="settings-section">
          <div class="settings-section-title">👤 ${SETTINGS.language === "hi" ? "खाता जानकारी" : "Account Info"}</div>

          <div class="account-info-card">
            <div class="account-avatar-big">${STATE.profile?.avatar || "🧑‍💻"}</div>
            <div>
              <div class="account-name">${STATE.profile?.name || "User"}</div>
              <div class="account-email">${STATE.user?.email || ""}</div>
              <div class="account-level" style="color:${getLevel(STATE.xp).color}">
                Lv.${getLevel(STATE.xp).level} ${getLevel(STATE.xp).name} • ${STATE.xp} XP
              </div>
            </div>
          </div>

          <!-- Quick stats -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">
            ${[
      { i: "✅", v: STATE.tasks.filter(t => t.completed).length, l: SETTINGS.language === "hi" ? "काम पूरे" : "Done" },
      { i: "🔥", v: calcStreak() + "d", l: SETTINGS.language === "hi" ? "लकीर" : "Streak" },
      { i: "📚", v: fmtDur(STATE.sessions.reduce((a, s) => a + s.duration, 0)), l: SETTINGS.language === "hi" ? "पढ़ाई" : "Study" },
    ].map(s => `
              <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
                <div style="font-size:15px;font-weight:700;color:var(--green)">${s.v}</div>
                <div style="font-size:10px;color:var(--dim);margin-top:2px">${s.l}</div>
              </div>`).join("")}
          </div>

          <!-- Edit profile button -->
          <button onclick="closeSettingsModal();openProfileModal()"
            style="width:100%;padding:10px;background:var(--border);border:1px solid var(--border2);border-radius:8px;color:var(--text);font-size:13px;cursor:pointer;font-family:var(--font-body);margin-bottom:8px">
            ✏️ ${SETTINGS.language === "hi" ? "प्रोफ़ाइल बदलो" : "Edit Profile & Avatar"}
          </button>

          <!-- Logout -->
          <button class="btn-logout-full" onclick="logout()">
            🚪 ${SETTINGS.language === "hi" ? "लॉगआउट" : "Logout"}
          </button>

          <!-- Danger zone -->
          <div class="danger-zone">
            <div class="danger-zone-title">⚠️ ${SETTINGS.language === "hi" ? "खतरनाक क्षेत्र" : "DANGER ZONE"}</div>
            <button onclick="clearAllData()"
              style="width:100%;padding:9px;background:transparent;border:1px solid rgba(255,68,68,0.3);border-radius:8px;color:var(--red);font-size:12px;cursor:pointer;font-family:var(--font-body)">
              🗑️ ${SETTINGS.language === "hi" ? "सभी डेटा मिटाओ" : "Clear All My Data"}
            </button>
          </div>
        </div>
      </div>

      <!-- ── SUPPORT ── -->
      <div class="settings-panel ${settingsActiveTab === "support" ? "active" : ""}" id="sp-support">
        <div class="settings-section">
          <div class="settings-section-title">🎧 ${SETTINGS.language === "hi" ? "हमसे संपर्क करें (Support)" : "Contact Support"}</div>

          <div style="font-size:13px; color:var(--muted); margin-bottom:16px;">
            ${SETTINGS.language === "hi" ? "क्या आपको कोई समस्या है या कोई सुझाव देना है? नीचे दिया गया फॉर्म भरें और हमारी टीम आपसे जल्द ही संपर्क करेगी।" : "Have an issue or a suggestion? Fill out the form below and our team will get back to you shortly."}
          </div>

          <form id="support-form" onsubmit="handleSupportSubmit(event)">
            <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600; color:var(--text);">
              ${SETTINGS.language === "hi" ? "नाम *" : "Name *"}
            </label>
            <input class="inp" type="text" id="supp-name" required placeholder="${SETTINGS.language === "hi" ? "आपका नाम" : "Your Name"}" style="margin-bottom:12px;" />

            <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600; color:var(--text);">
              ${SETTINGS.language === "hi" ? "ईमेल *" : "Email *"}
            </label>
            <input class="inp" type="email" id="supp-email" required placeholder="you@example.com" style="margin-bottom:12px;" />

            <label style="display:block; margin-bottom:6px; font-size:13px; font-weight:600; color:var(--text);">
              ${SETTINGS.language === "hi" ? "फ़ोन नंबर / मैसेज *" : "Phone Number / Message *"}
            </label>
            <textarea class="inp" id="supp-msg" rows="3" required placeholder="${SETTINGS.language === "hi" ? "अपनी समस्या या फ़ोन नंबर यहाँ लिखें..." : "Describe your issue or leave your phone number..."}" style="margin-bottom:16px;"></textarea>

            <button type="submit" style="width:100%; padding:12px; background:linear-gradient(135deg, var(--green), #00cc6a); border:none; border-radius:8px; color:#0d1117; font-weight:700; font-size:14px; cursor:pointer;">
              📤 ${SETTINGS.language === "hi" ? "मैसेज भेजें" : "Send Message"}
            </button>
          </form>

        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="settings-footer">
      <button class="btn-settings-reset" onclick="resetSettings()">
        ↺ ${SETTINGS.language === "hi" ? "रीसेट" : "Reset"}
      </button>
      <button class="btn-settings-save" onclick="applyAndSaveSettings()">
        ✅ ${SETTINGS.language === "hi" ? "सेव करो" : "Save Settings"}
      </button>
    </div>`;
}

// ── Tab switching ─────────────────────────────────────
function switchSettingsTab(tab) {
  settingsActiveTab = tab;
  renderSettingsModal();
}

// ── Individual setters ────────────────────────────────
function selectTheme(t) { SETTINGS.theme = t; renderSettingsModal(); applyTheme(t); }
function selectFontSize(s) { SETTINGS.fontSize = s; renderSettingsModal(); applyFontSize(s); }
function selectAccent(c) { SETTINGS.accentColor = c; renderSettingsModal(); applyAccentColor(c); }
function selectLanguage(l) { SETTINGS.language = l; renderSettingsModal(); applyLanguage(l); }
function toggleNotifSetting(key, val) { SETTINGS[key] = val; }

// ── Save / Reset ──────────────────────────────────────
function applyAndSaveSettings() {
  saveSettings();
  applySettings();
  closeSettingsModal();
  showToast(SETTINGS.language === "hi" ? "✅ सेटिंग्स सेव हो गईं!" : "✅ Settings saved!", "success");
}

function resetSettings() {
  if (!confirm(SETTINGS.language === "hi"
    ? "सभी सेटिंग्स reset होंगी। ठीक है?"
    : "Reset all settings to default?")) return;
  SETTINGS = { ...DEFAULT_SETTINGS };
  saveSettings();
  applySettings();
  renderSettingsModal();
  showToast(SETTINGS.language === "hi" ? "↺ Settings reset हो गईं" : "↺ Settings reset to default", "info");
}

// ── Notifications ─────────────────────────────────────
async function requestNotifPermission() {
  if (!("Notification" in window)) {
    showToast("Your browser doesn't support notifications", "error"); return;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    showToast(SETTINGS.language === "hi"
      ? "🔔 सूचनाएँ allow हो गईं!" : "🔔 Notifications enabled!", "success");
    new Notification("⚡ TaskMaster", {
      body: SETTINGS.language === "hi"
        ? "सूचनाएँ चालू हो गई हैं! 🎉"
        : "Notifications are now enabled! 🎉",
      icon: "assets/icon-192.png",
    });
  } else {
    showToast(SETTINGS.language === "hi"
      ? "❌ Allow नहीं किया" : "❌ Permission denied", "error");
  }
  renderSettingsModal();
}

// Call this from timer.js when pomodoro ends
function sendPomodoroNotif(mode) {
  if (!SETTINGS.notifPomodoro) return;
  if (Notification.permission !== "granted") return;
  new Notification("⏱ TaskMaster — Pomodoro", {
    body: mode === "focus"
      ? (SETTINGS.language === "hi" ? "Focus पूरा! अब ब्रेक लो 🎉" : "Focus done! Time for a break 🎉")
      : (SETTINGS.language === "hi" ? "ब्रेक खत्म! वापस काम पर 💪" : "Break over! Back to work 💪"),
    icon: "assets/icon-192.png",
  });
}

// Call this when a task is completed
function sendTaskCompleteNotif(title) {
  if (!SETTINGS.notifTaskComplete) return;
  if (Notification.permission !== "granted") return;
  new Notification("✅ TaskMaster", {
    body: SETTINGS.language === "hi"
      ? `"${title}" पूरा हुआ! +30 XP 🔥`
      : `"${title}" completed! +30 XP 🔥`,
    icon: "assets/icon-192.png",
  });
}

// ── Danger zone ───────────────────────────────────────
async function clearAllData() {
  const msg = SETTINGS.language === "hi"
    ? "⚠️ सभी tasks, categories और study sessions मिट जाएंगे। क्या confirm करते हो?"
    : "⚠️ All tasks, categories and study sessions will be deleted. Are you sure?";
  if (!confirm(msg)) return;
  try {
    await Promise.all([
      ...STATE.tasks.map(t => dbDeleteTask(t.id)),
      ...STATE.sessions.map(s => dbDeleteSession(s.id)),
    ]);
    STATE.tasks = [];
    STATE.sessions = [];
    showToast(SETTINGS.language === "hi" ? "🗑️ सभी डेटा मिट गया" : "🗑️ All data cleared", "success");
    closeSettingsModal();
    renderTasks();
    updateHeader();
    updateSidebar();
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

// ── Support actions ───────────────────────────────────
function handleSupportSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("supp-name").value.trim();
  const email = document.getElementById("supp-email").value.trim();
  const msg = document.getElementById("supp-msg").value.trim();

  if (!name || !email || !msg) return;

  // TODO: Send exact message using an API endpoint or email service
  console.log("Support Ticket Logged:", { name, email, msg });

  e.target.reset();
  showToast(SETTINGS.language === "hi" ? "✅ आपका मैसेज सफलतापुर्वक भेज दिया गया!" : "✅ Your message was sent successfully!", "success");
}


// ── Overlay click handler ─────────────────────────────
function handleSettingsOverlayClick(e) {
  if (e.target.id === "settings-overlay") closeSettingsModal();
}