// ═══════════════════════════════════════════════════════
//  UI — Header, Sidebar, View Switching
// ═══════════════════════════════════════════════════════

// ── Header ────────────────────────────────────────────
function updateHeader() {
    const xp = STATE.xp;
    const lvl = getLevel(xp);
    const nxt = getNextLevel(xp);
    const xpPct = getXpPct(xp);
    const streak = calcStreak();
    const todayStudy = STATE.sessions
        .filter(s => s.date === todayStr())
        .reduce((a, s) => a + s.duration, 0);

    document.getElementById("hdr-level").textContent = `Lv.${lvl.level} ${lvl.name}`;
    document.getElementById("hdr-level").style.color = lvl.color;
    document.getElementById("hdr-xp").textContent = `${xp} XP`;
    document.getElementById("hdr-xp-fill").style.width = xpPct + "%";
    document.getElementById("hdr-xp-fill").style.background = `linear-gradient(90deg,${lvl.color},${lvl.color}88)`;
    document.getElementById("hdr-streak").textContent = `🔥${streak}d`;
    document.getElementById("hdr-avatar").textContent = STATE.profile?.avatar || "🧑‍💻";

    const studyEl = document.getElementById("hdr-study");
    if (todayStudy > 0) {
        studyEl.textContent = `📚${fmtDur(todayStudy)}`;
        studyEl.classList.remove("hidden");
    } else {
        studyEl.classList.add("hidden");
    }
}

// ── Sidebar ───────────────────────────────────────────
function updateSidebar() {
    const total = STATE.tasks.length;
    const done = STATE.tasks.filter(t => t.completed).length;
    const today = STATE.tasks.filter(t => isToday(t.due_date) && !t.completed).length;
    const pending = STATE.tasks.filter(t => !t.completed).length;

    document.getElementById("badge-today").textContent = today || "";
    document.getElementById("badge-pending").textContent = pending || "";
    document.getElementById("badge-completed").textContent = done || "";

    // Category filter list
    const catList = document.getElementById("cat-list");
    catList.innerHTML = [{ id: "all", label: "All", color: "#8b949e" }, ...STATE.cats].map(c => {
        const count = c.id === "all"
            ? STATE.tasks.length
            : STATE.tasks.filter(t => t.category === c.id).length;
        return `
      <button class="cat-btn ${STATE.filterCat === c.id ? "active" : ""}"
        onclick="filterByCat('${c.id}')"
        style="${STATE.filterCat === c.id ? `color:${c.color}` : ""}">
        <span class="cat-dot" style="background:${c.color}"></span>
        <span class="cat-label-text">${c.id === "all" ? "All" : c.label}</span>
        <span class="cat-count">${count}</span>
      </button>`;
    }).join("");
}

function filterByCat(id) {
    STATE.filterCat = id;
    updateSidebar();
    renderTasks();
}

// ── View switching ────────────────────────────────────
function setView(v) {
    STATE.view = v;

    // Update nav buttons
    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.view === v);
    });

    // Show / hide view panels
    const isTaskView = ["today", "pending", "completed"].includes(v);
    document.getElementById("view-tasks").classList.toggle("hidden", !isTaskView);
    document.getElementById("view-stats").classList.toggle("hidden", v !== "stats");
    document.getElementById("view-habits").classList.toggle("hidden", v !== "habits");

    if (isTaskView) renderTasks();
    else if (v === "stats") renderStats();
    else if (v === "habits") renderHabitsView();
}

// ── XP helper ─────────────────────────────────────────
async function gainXp(amount) {
    const oldLvl = getLevel(STATE.xp);
    STATE.xp = await dbGainXp(STATE.user.id, STATE.xp, amount);
    const newLvl = getLevel(STATE.xp);
    updateHeader();
    if (newLvl.level > oldLvl.level) {
        showToast(`🏆 Level Up! You are now ${newLvl.name}!`, "success");
    }
}

// ── Quote ─────────────────────────────────────────────
function nextQuote() {
    STATE.quoteIdx = (STATE.quoteIdx + 1) % QUOTES.length;
    document.getElementById("quote-text").textContent = `"${QUOTES[STATE.quoteIdx]}"`;
}

function initQuote() {
    STATE.quoteIdx = Math.floor(Math.random() * QUOTES.length);
    document.getElementById("quote-text").textContent = `"${QUOTES[STATE.quoteIdx]}"`;
}