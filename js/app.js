// ═══════════════════════════════════════════════════════
//  App Entry Point — Initializes everything on load
// ═══════════════════════════════════════════════════════

window.addEventListener("DOMContentLoaded", async () => {
  // Check auth
  const session = await dbGetSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  STATE.user = session.user;

  // Show loading state
  document.getElementById("main-content").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:20px">
      <div style="width:40px;height:40px;border:3px solid #21262d;border-top-color:#00ff88;border-radius:50%;animation:spin 0.8s linear infinite"></div>
      <div style="color:#484f58;font-size:13px">Loading your workspace...</div>
    </div>`;

  try {
    // Load all data in parallel
    const [profile, tasks, cats, sessions] = await Promise.all([
      dbGetProfile(session.user.id),
      dbGetTasks(session.user.id),
      dbGetCategories(session.user.id),
      dbGetSessions(session.user.id),
    ]);

    STATE.profile = profile;
    STATE.tasks = tasks;
    STATE.cats = cats;
    STATE.sessions = sessions;
    STATE.xp = profile?.xp || 0;

  } catch (e) {
    console.error("DB Load Error:", e);
    document.getElementById("main-content").innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#ff4444">
        <div style="font-size:40px;margin-bottom:14px">❌</div>
        <div style="font-size:16px;margin-bottom:8px">Could not load data</div>
        <div style="font-size:12px;color:#8b949e;max-width:400px;margin:0 auto">${e.message || e}</div>
        <div style="font-size:12px;color:#484f58;margin-top:8px">Make sure you've run the schema.sql in Supabase SQL Editor</div>
        <button onclick="location.reload()" style="margin-top:16px;padding:8px 20px;background:#00ff88;color:#0d1117;border:none;border-radius:8px;cursor:pointer;font-weight:600">↻ Retry</button>
      </div>`;
    return;
  }

  // Restore main content structure
  document.getElementById("main-content").innerHTML = `
    <div id="view-tasks" class="view">
      <div class="filters-row">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-inp" class="search-inp" placeholder="Search tasks, tags..." oninput="renderTasks()"/>
        </div>
        <select class="sel" id="filter-pri" onchange="renderTasks()">
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <select class="sel" id="sort-by" onchange="renderTasks()">
          <option value="date">📅 Date</option>
          <option value="priority">🔴 Priority</option>
          <option value="name">🔤 Name</option>
        </select>
      </div>
      <div class="stat-cards">
        <div class="stat-card" onclick="openStatModal('today')">
          <div class="stat-card-top"><span class="stat-icon">☀️</span><span class="stat-view-badge">VIEW</span></div>
          <div class="stat-val green" id="sc-today">0/0</div>
          <div class="stat-lbl">Today</div>
          <div class="stat-sub" id="sc-today-sub">0 remaining</div>
        </div>
        <div class="stat-card" onclick="openStatModal('completed')">
          <div class="stat-card-top"><span class="stat-icon">✅</span><span class="stat-view-badge">VIEW</span></div>
          <div class="stat-val cyan" id="sc-pct">0%</div>
          <div class="stat-lbl">Complete</div>
          <div class="stat-sub" id="sc-pct-sub">0 of 0</div>
        </div>
        <div class="stat-card" onclick="openStatModal('overdue')">
          <div class="stat-card-top"><span class="stat-icon">⚠️</span><span class="stat-view-badge">VIEW</span></div>
          <div class="stat-val" id="sc-overdue" style="color:#ff4444">0</div>
          <div class="stat-lbl">Overdue</div>
          <div class="stat-sub" id="sc-overdue-sub">All clear ✓</div>
        </div>
        <div class="stat-card" onclick="openStatModal('streak')">
          <div class="stat-card-top"><span class="stat-icon">🔥</span><span class="stat-view-badge">VIEW</span></div>
          <div class="stat-val orange" id="sc-streak">0d</div>
          <div class="stat-lbl">Streak</div>
          <div class="stat-sub" id="sc-streak-sub">Start today</div>
        </div>
      </div>
      <div class="progress-section">
        <div class="progress-labels">
          <span>Overall Progress</span>
          <span class="green" id="prog-pct">0%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" id="prog-fill"></div></div>
      </div>
      <div id="task-list"></div>
    </div>
    <div id="view-history" class="view hidden"></div>
    <div id="view-stats"   class="view hidden"></div>`;

  // Populate task modal category dropdown
  populateTaskModalCats();

  // Boot UI
  updateHeader();
  updateSidebar();
  initPomodoro();
  initQuote();
  setView("today");

  // Auth state listener (auto logout if session ends)
  db.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") window.location.href = "index.html";
  });

  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => { });
  }
});

function populateTaskModalCats() {
  const sel = document.getElementById("tm-cat");
  if (!sel) return;
  sel.innerHTML = STATE.cats.map(c => `<option value="${c.id}">${c.label}</option>`).join("");
}