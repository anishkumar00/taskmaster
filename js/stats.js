// ═══════════════════════════════════════════════════════
//  Stats View
// ═══════════════════════════════════════════════════════

function renderStats() {
    const container = document.getElementById("view-stats");
    const tasks = STATE.tasks;
    const sessions = STATE.sessions;
    const cats = STATE.cats;
    const xp = STATE.xp;
    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const streak = calcStreak();
    const overdue = tasks.filter(t => isOverdue(t.due_date) && !t.completed).length;
    const totalStudy = sessions.reduce((a, s) => a + s.duration, 0);
    const lvl = getLevel(xp);
    const nxt = getNextLevel(xp);
    const xpPct = getXpPct(xp);

    // Last 7 days bar data
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const str = d.toISOString().slice(0, 10);
        return {
            day: d.toLocaleDateString("en-IN", { weekday: "short" }),
            tasks: tasks.filter(t => t.completed_at && new Date(t.completed_at).toISOString().slice(0, 10) === str).length,
            study: sessions.filter(s => s.date === str).reduce((a, s) => a + s.duration, 0),
        };
    });
    const maxBar = Math.max(...last7.map(d => d.tasks), 1);

    container.innerHTML = `
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:20px;margin-bottom:16px">📊 Stats & Progress</div>

    <!-- Stat grid -->
    <div class="stats-grid">
      ${[
            { i: "📋", l: "Tasks", v: total, c: "#00eeff" },
            { i: "✅", l: "Completed", v: done, c: "#00ff88" },
            { i: "🎯", l: "Progress", v: pct + "%", c: "#ffdd00" },
            { i: "🔥", l: "Streak", v: streak + "d", c: "#ff8800" },
            { i: "⚠️", l: "Overdue", v: overdue, c: overdue > 0 ? "#ff4444" : "#00ff88" },
            { i: "📚", l: "Study Time", v: fmtDur(totalStudy), c: "#00eeff" },
        ].map(s => `
        <div class="stats-card">
          <div class="stats-icon">${s.i}</div>
          <div class="stats-val" style="color:${s.c}">${s.v}</div>
          <div class="stats-lbl">${s.l}</div>
        </div>`).join("")}
    </div>

    <!-- XP / Level -->
    <div class="stats-box" style="border-color:${lvl.color}44">
      <div class="level-bar-wrap">
        <div class="level-bar-labels">
          <span style="color:${lvl.color};font-weight:700">Lv.${lvl.level} — ${lvl.name}</span>
          <span style="font-size:12px;color:#8b949e">${xp} XP</span>
        </div>
        <div class="level-bar-track">
          <div class="level-bar-fill" style="width:${xpPct}%;background:${lvl.color}"></div>
        </div>
        <div class="level-bar-sub">${nxt ? `${nxt.min - xp} XP to ${nxt.name}` : "MAX LEVEL 🏆"}</div>
      </div>
    </div>

    <!-- Last 7 days -->
    <div class="stats-box">
      <div class="stats-box-title">📅 Last 7 Days (Completed Tasks)</div>
      <div class="bar-chart">
        ${last7.map(d => `
          <div class="bar-col">
            <div class="bar-count">${d.tasks || ""}</div>
            <div class="bar-fill" title="${d.day}: ${d.tasks} tasks, ${fmtDur(d.study)}"
              style="background:${d.tasks > 0 ? "#00ff88" : "#21262d"};height:${Math.max((d.tasks / maxBar) * 50, d.tasks > 0 ? 6 : 3)}px">
            </div>
            <div class="bar-label">${d.day}</div>
          </div>`).join("")}
      </div>
    </div>

    <!-- By category -->
    <div class="stats-box">
      <div class="stats-box-title">📂 Progress by Category</div>
      ${cats.map(c => {
            const tot = tasks.filter(t => t.category === c.id).length;
            const d = tasks.filter(t => t.category === c.id && t.completed).length;
            return `
          <div class="cat-progress-item">
            <div class="cat-progress-labels">
              <span style="color:${c.color}">${c.label}</span>
              <span style="color:#8b949e">${d}/${tot}</span>
            </div>
            <div class="cat-progress-track">
              <div class="cat-progress-fill" style="width:${tot ? (d / tot * 100) : 0}%;background:${c.color}"></div>
            </div>
          </div>`;
        }).join("")}
    </div>`;
}