// ═══════════════════════════════════════════════════════
//  Study History View + Activity Graph
// ═══════════════════════════════════════════════════════

let selectedMonth = new Date().toISOString().slice(0, 7);

function renderHistory() {
    const container = document.getElementById("view-history");
    const sessions = STATE.sessions;

    // Build activity map: date → total seconds
    const actMap = {};
    sessions.forEach(s => { actMap[s.date] = (actMap[s.date] || 0) + s.duration; });

    // Stats
    const totalSecs = sessions.reduce((a, s) => a + s.duration, 0);
    const todaySecs = sessions.filter(s => s.date === todayStr()).reduce((a, s) => a + s.duration, 0);
    const monthSess = sessions.filter(s => s.date.startsWith(selectedMonth));
    const monthSecs = monthSess.reduce((a, s) => a + s.duration, 0);
    const activeDays = Object.keys(actMap).length;

    container.innerHTML = `
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:20px;margin-bottom:18px">📅 Study History</div>

    <!-- Summary cards -->
    <div class="history-summary">
      ${[
            { i: "☀️", l: "Today", v: fmtDur(todaySecs), c: "#00eeff" },
            { i: "📅", l: "This Month", v: fmtDur(monthSecs), c: "#00ff88" },
            { i: "⏱", l: "Total Time", v: fmtDur(totalSecs), c: "#ffdd00" },
            { i: "🔥", l: "Active Days", v: activeDays, c: "#ff8800" },
            { i: "📚", l: "Sessions", v: sessions.length, c: "#bb88ff" },
        ].map(s => `
        <div class="summary-card">
          <div class="summary-icon">${s.i}</div>
          <div class="summary-val" style="color:${s.c}">${s.v}</div>
          <div class="summary-lbl">${s.l}</div>
        </div>`).join("")}
    </div>

    <!-- Activity Graph -->
    <div class="activity-graph-wrap">
      <div style="font-size:14px;font-weight:600;margin-bottom:3px">📊 Study Activity — Last 365 Days</div>
      <div style="font-size:11px;color:#484f58;margin-bottom:14px">Each square = one day. Darker green = more study time.</div>
      <div class="graph-scroll">
        <div class="graph-inner" id="activity-graph"></div>
      </div>
      <div class="graph-months" id="graph-months"></div>
      <div class="graph-legend">
        <span>Less</span>
        ${["#161b22", "#003a20", "#006633", "#00aa55", "#00ff88"].map(c => `<div class="legend-cell" style="background:${c}"></div>`).join("")}
        <span>More</span>
      </div>
    </div>

    <!-- Monthly sessions -->
    <div class="month-sessions-wrap">
      <div class="month-sessions-header">
        <div style="font-size:14px;font-weight:600">🗓 Monthly Sessions</div>
        <select class="sel" onchange="changeHistoryMonth(this.value)" id="month-sel">
          ${getMonthOptions(sessions)}
        </select>
      </div>
      <div id="session-list">${renderSessionList(monthSess)}</div>
    </div>`;

    buildActivityGraph(actMap);

    // Set selected month in dropdown
    const sel = document.getElementById("month-sel");
    if (sel) sel.value = selectedMonth;
}

function getMonthOptions(sessions) {
    const months = [...new Set(sessions.map(s => s.date.slice(0, 7)))].sort().reverse();
    if (!months.length) months.push(new Date().toISOString().slice(0, 7));
    return months.map(m => `<option value="${m}">${m}</option>`).join("");
}

function changeHistoryMonth(m) {
    selectedMonth = m;
    const monthSess = STATE.sessions.filter(s => s.date.startsWith(m));
    document.getElementById("session-list").innerHTML = renderSessionList(monthSess);
}

function renderSessionList(sessions) {
    if (!sessions.length) return `<div style="text-align:center;padding:30px 0;color:#484f58">No sessions this month. Start studying! 📚</div>`;
    return [...sessions]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(s => {
            const c = catById(s.category);
            return `
        <div class="session-item">
          <div class="session-dot" style="background:${c.color};box-shadow:0 0 6px ${c.color}88"></div>
          <div class="session-body">
            <div class="session-title">${fmtDur(s.duration)} session</div>
            <div class="session-meta">
              <span>${fmtDate(s.date)}</span>
              <span>${fmtTime(s.created_at)}</span>
              <span style="color:${c.color}">${c.label}</span>
              ${s.note ? `<span style="font-style:italic">"${s.note}"</span>` : ""}
            </div>
          </div>
          <div class="session-dur" style="color:${c.color}">${fmtDur(s.duration)}</div>
          <button class="session-del" onclick="deleteSession('${s.id}')">🗑</button>
        </div>`;
        }).join("");
}

async function deleteSession(id) {
    if (!confirm("Delete this session?")) return;
    try {
        await dbDeleteSession(id);
        STATE.sessions = STATE.sessions.filter(s => s.id !== id);
        showToast("🗑️ Session deleted");
        renderHistory();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

function buildActivityGraph(actMap) {
    const container = document.getElementById("activity-graph");
    if (!container) return;

    // Build 365 days
    const days = [];
    const end = new Date(); end.setHours(0, 0, 0, 0);
    const start = new Date(end); start.setDate(start.getDate() - 364);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const str = d.toISOString().slice(0, 10);
        days.push({ date: str, secs: actMap[str] || 0, dow: d.getDay() });
    }

    // Group into weeks
    const weeks = [];
    let week = [];
    const firstDow = days[0].dow;
    for (let i = 0; i < firstDow; i++) week.push(null);
    days.forEach(d => {
        week.push(d);
        if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

    function getColor(secs) {
        if (!secs) return "#161b22";
        if (secs < 1800) return "#003a20";
        if (secs < 3600) return "#006633";
        if (secs < 7200) return "#00aa55";
        return "#00ff88";
    }

    // Day labels
    const dayLabels = document.createElement("div");
    dayLabels.className = "graph-day-labels";
    ["", "Mon", "", "Wed", "", "Fri", ""].forEach(l => {
        const el = document.createElement("div");
        el.className = "graph-day-label";
        el.textContent = l;
        dayLabels.appendChild(el);
    });
    container.appendChild(dayLabels);

    // Weeks
    weeks.forEach(w => {
        const weekEl = document.createElement("div");
        weekEl.className = "graph-week";
        w.forEach(d => {
            const cell = document.createElement("div");
            cell.className = "graph-cell" + (d && d.secs > 0 ? " has-data" : "");
            cell.style.background = d ? getColor(d.secs) : "transparent";
            if (d) cell.title = `${d.date}: ${d.secs ? fmtDur(d.secs) : "No study"}`;
            weekEl.appendChild(cell);
        });
        container.appendChild(weekEl);
    });

    // Month labels
    const monthsEl = document.getElementById("graph-months");
    if (!monthsEl) return;
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach(m => {
        const el = document.createElement("div");
        el.className = "graph-month";
        el.textContent = m;
        monthsEl.appendChild(el);
    });
}