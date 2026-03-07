// ═══════════════════════════════════════════════════════
//  Habit Tracker Logic
// ═══════════════════════════════════════════════════════

// Current month being viewed in habits tracker
let habitsCurrentMonth = new Date();

// Load habits and logs from Supabase
async function loadHabitsData() {
    try {
        const yearMonth = habitsCurrentMonth.toISOString().slice(0, 7); // YYYY-MM
        const [habits, logs] = await Promise.all([
            dbGetHabits(STATE.user.id),
            dbGetHabitLogs(STATE.user.id, yearMonth)
        ]);
        STATE.habits = habits || [];
        STATE.habitLogs = logs || [];
        if (STATE.view === 'habits') renderHabitsView();
    } catch (e) {
        console.error("Error loading habits data", e);
        showToast("Error loading habits data", "error");
    }
}

// Create a new habit
async function addHabit() {
    const title = prompt(SETTINGS.language === "hi" ? "नई आदत का नाम:" : "New Habit Title:");
    if (!title || !title.trim()) return;

    try {
        const newHabit = await dbAddHabit(STATE.user.id, { title: title.trim(), goal_days: 30 });
        STATE.habits.push(newHabit);
        renderHabitsView();
        showToast("Habit added!", "success");
    } catch (e) {
        showToast("Error adding habit: " + e.message, "error");
    }
}

async function deleteHabit(id) {
    if (!confirm(SETTINGS.language === "hi" ? "सच में यह आदत मिटानी है?" : "Delete this habit completely?")) return;
    try {
        await dbDeleteHabit(id);
        STATE.habits = STATE.habits.filter(h => h.id !== id);
        // Clean up logs from memory for this habit
        STATE.habitLogs = STATE.habitLogs.filter(l => l.habit_id !== id);
        renderHabitsView();
        showToast("Habit deleted", "success");
    } catch (e) {
        showToast("Error deleting habit", "error");
    }
}

// Toggle a day in the 31-day grid
async function toggleHabitLog(habitId, day) {
    const yearMonth = habitsCurrentMonth.toISOString().slice(0, 7); // YYYY-MM
    // Pad day with zero if needed
    const dayStr = day.toString().padStart(2, '0');
    const fullDateStr = `${yearMonth}-${dayStr}`;

    const existingLogIndex = STATE.habitLogs.findIndex(l => l.habit_id === habitId && l.log_date === fullDateStr);
    let newStatus = true;

    if (existingLogIndex >= 0) {
        newStatus = !STATE.habitLogs[existingLogIndex].status;
        // Optimistic UI update
        STATE.habitLogs[existingLogIndex].status = newStatus;
    } else {
        // Optimistic UI update
        STATE.habitLogs.push({
            habit_id: habitId,
            user_id: STATE.user.id,
            log_date: fullDateStr,
            status: newStatus
        });
    }

    renderHabitsView(); // Re-render grid instantly for snappy UI

    try {
        const result = await dbToggleHabitLog(STATE.user.id, habitId, fullDateStr, newStatus);
        // Replace with definitive server state just to be safe
        const idx = STATE.habitLogs.findIndex(l => l.habit_id === habitId && l.log_date === fullDateStr);
        if (idx >= 0) STATE.habitLogs[idx] = result;
    } catch (e) {
        showToast("Error updating habit. Reverting...", "error");
        // Reload data to revert
        loadHabitsData();
    }
}

// Get the number of days in the currently viewed month
function getDaysInCurrentMonth() {
    return new Date(habitsCurrentMonth.getFullYear(), habitsCurrentMonth.getMonth() + 1, 0).getDate();
}

// Main rendering function for the entire dashboard
function renderHabitsView() {
    console.log("renderHabitsView called!");
    const container = document.getElementById("view-habits");
    if (!container) {
        console.log("NO CONTAINER FOUND!");
        return;
    }

    try {
        const daysInMonth = getDaysInCurrentMonth();
        const monthName = habitsCurrentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Calculate global stats for today
        const totalGoals = STATE.habits.length * daysInMonth;
        const completedTotal = STATE.habitLogs.filter(l => l.status).length;
        const remainingTotal = Math.max(0, totalGoals - completedTotal);

        let progressPct = 0;
        if (totalGoals > 0) {
            progressPct = Math.round((completedTotal / totalGoals) * 100);
        }

        // Compute stats for progress rings 
        // Momentum (Mocked similar to image or derived intelligently)
        const momentum = Math.min(100, progressPct + 10);
        // Daily progress, week progress, etc. (Mocked for dashboard feel as we usually only track days)
        const dailyProgress = progressPct;
        const weeklyProgress = progressPct;
        const monthlyProgress = progressPct;

        // Outer Container
        let html = `
        <div class="habits-dashboard">
            <!-- ═══ TOP SUMMARY BAR ═══ -->
            <div class="habits-top-row">
                <!-- Left Panel (Summary Card) -->
                <div class="habits-panel habits-summary-card">
                    <div class="habits-month-title">${monthName}</div>
                    <div class="habits-subtitle">- HABIT TRACKER -</div>
                    
                    <div class="habits-stats-list">
                        <div class="habits-stat-row">
                            <span>Total Habits</span>
                            <span>${STATE.habits.length}</span>
                        </div>
                    </div>

                    <div class="habits-big-stat-box">
                        <div class="hbs-label">COMPLETED</div>
                        <div class="hbs-val green">${completedTotal}</div>
                    </div>
                    <div class="habits-big-stat-box">
                        <div class="hbs-label">REMAINING</div>
                        <div class="hbs-val red">${remainingTotal}</div>
                    </div>
                </div>

                <!-- Middle Panel (Progress Rings & Chart) -->
                <div class="habits-panel habits-middle-panel">
                    <div class="habits-rings-row">
                        ${renderProgressRing("MOMENTUM", momentum, "#00eeff")}
                        ${renderProgressRing("DAILY PROGRESS", dailyProgress, "#00ff88")}
                        ${renderProgressRing("WEEKLY PROGRESS", weeklyProgress, "#ffdd00")}
                        ${renderProgressRing("MONTHLY PROGRESS", monthlyProgress, "#ff88aa")}
                    </div>
                    
                    <div class="habits-chart-wrap">
                        <div class="habits-chart-title">MONTHLY PROGRESS CHART</div>
                        <div class="habits-chart-area">
                            <!-- We use a placeholder SVG chart for the waveform -->
                            ${renderChartSVG(daysInMonth)}
                        </div>
                    </div>
                </div>

                <!-- Right Panel (Top Habits & Streaks) -->
                <div class="habits-panel habits-right-panel">
                    <div class="hrp-section">
                        <div class="hrp-title">TOP HABITS</div>
                        <div class="hrp-bar-list">
                            ${renderTopHabitsBars()}
                        </div>
                    </div>
                    <div class="hrp-section">
                        <div class="hrp-title">ACTIVE STREAKS</div>
                        <div class="hrp-bar-list">
                            ${renderStreaksBars()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- ═══ BOTTOM GRID AREA ═══ -->
            <div class="habits-grid-panel">
                <div class="grid-header-row">
                    <div class="gh-title-col">DAILY HABITS</div>
                    <div class="gh-goal-col">GOALS</div>
                    <div class="gh-days-col">
                        <!-- Day numbers 1 to 31 -->
                        ${Array.from({ length: daysInMonth }, (_, i) => `<div class="gh-day-num">${i + 1}</div>`).join("")}
                    </div>
                    <div class="gh-prog-col">PROGRESS</div>
                    <div class="gh-streak-col">STREAK</div>
                </div>
                <div class="grid-body">
                    ${STATE.habits.map((habit, idx) => renderHabitRow(habit, idx, daysInMonth)).join("")}
                    ${STATE.habits.length === 0 ? `<div style="padding:20px;text-align:center;color:var(--dim)">No habits yet. <button style="background:transparent;border:none;color:var(--green);cursor:pointer;text-decoration:underline" onclick="addHabit()">Add one</button></div>` : ""}
                </div>
            </div>
            
            <div class="habits-footer-actions">
            <button class="btn-primary" style="width:auto;margin-top:16px" onclick="addHabit()">+ New Habit</button>
            <div style="display:flex;gap:10px;margin-top:16px">
                <button class="btn-cancel" onclick="changeHabitsMonth(-1)">⬅ Prev Month</button>
                <button class="btn-cancel" onclick="changeHabitsMonth(1)">Next Month ➡</button>
            </div>
            </div>
        </div>
        `;

        container.innerHTML = html;
        console.log("renderHabitsView injected successfully");
    } catch (err) {
        console.error("CRITICAL ERROR IN renderHabitsView:", err);
        container.innerHTML = `<div style="color:red;padding:20px;">Error rendering: ${err.message}</div>`;
    }
}

// Shift current month view backward or forward
function changeHabitsMonth(offset) {
    habitsCurrentMonth.setMonth(habitsCurrentMonth.getMonth() + offset);
    loadHabitsData(); // fetches logs for that month and triggers re-render
}

function renderHabitRow(habit, index, daysInMonth) {
    const yearMonth = habitsCurrentMonth.toISOString().slice(0, 7);

    // Build days array 1..daysInMonth
    // We color columns slightly differently to block out weeks like in the reference
    const daysHtml = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const fullDateStr = `${yearMonth}-${day.toString().padStart(2, '0')}`;
        const log = STATE.habitLogs.find(l => l.habit_id === habit.id && l.log_date === fullDateStr);
        const isChecked = log && log.status;

        // Let's use accent colors based on week grouping, visually appealing
        const weekNum = Math.floor(day / 7) % 5;
        const cssClasses = ["chk-w1", "chk-w2", "chk-w3", "chk-w4", "chk-w5"];
        const colorClass = cssClasses[weekNum];

        return `
            <div class="gh-day-cell" onclick="toggleHabitLog('${habit.id}', ${day})">
                <div class="habit-checkbox ${isChecked ? "checked " + colorClass : ""}">
                    ${isChecked ? "✓" : ""}
                </div>
            </div>
        `;
    }).join("");

    const data = computeHabitStats(habit, daysInMonth);

    return `
        <div class="habit-row">
            <div class="hr-title">
               <span class="hr-del-btn" onclick="deleteHabit('${habit.id}')">×</span>
               <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${habit.title}</span>
            </div>
            <div class="hr-goal">${habit.goal_days || daysInMonth}</div>
            <div class="hr-days-grid">${daysHtml}</div>
            <div class="hr-prog">
                <span class="hr-prog-text">${data.completed}/${daysInMonth}</span>
                <div class="hr-prog-bar-track">
                    <div class="hr-prog-bar-fill" style="width:${data.pct}%;background:${getHabitColor(index)}"></div>
                </div>
                <span class="hr-prog-pct">${data.pct}%</span>
            </div>
            <div class="hr-streak">${data.streak}</div>
        </div>
    `;
}

// Compute statistics for an individual habit
function computeHabitStats(habit, daysInMonth) {
    const yearMonth = habitsCurrentMonth.toISOString().slice(0, 7);
    const logs = STATE.habitLogs.filter(l => l.habit_id === habit.id && l.status && l.log_date.startsWith(yearMonth));
    const completed = logs.length;
    const pct = Math.round((completed / daysInMonth) * 100);

    // Simple streak calculation specifically for the CURRENT viewed month
    // In a real app we'd calculate historically, but this matches the dashboard context safely
    let streak = 0;
    let maxStreak = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = i.toString().padStart(2, '0');
        const dStr = `${yearMonth}-${dayStr}`;
        const done = logs.some(l => l.log_date === dStr);
        if (done) {
            streak++;
            if (streak > maxStreak) maxStreak = streak;
        } else {
            streak = 0;
        }
    }
    // We use the ongoing streak for the end of the month, or max streak if the month passed
    return { completed, pct, streak: maxStreak };
}

// Utility for providing repeating accent colors for charts and bars
const HABIT_COLORS = ["#00eeff", "#00ff88", "#bb88ff", "#ffdd00", "#ff4466", "#44aaff"];
function getHabitColor(index) {
    return HABIT_COLORS[index % HABIT_COLORS.length];
}

// Render SVG Progress Ring
function renderProgressRing(label, percentage, color) {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
        <div class="progress-ring-box">
            <svg width="80" height="80">
                <circle class="pr-bg" stroke="var(--border)" cx="40" cy="40" r="${radius}" stroke-width="6" fill="transparent"/>
                <circle class="pr-fill" stroke="${color}" cx="40" cy="40" r="${radius}" stroke-width="6" fill="transparent" 
                    stroke-dasharray="${circumference} ${circumference}" stroke-dashoffset="${offset}"/>
            </svg>
            <div class="pr-label">${label}</div>
            <div class="pr-pct">${percentage}%</div>
        </div>
    `;
}

// Simple bar chart generators for right panel
function renderTopHabitsBars() {
    if (STATE.habits.length === 0) return "<div style='color:var(--dim);font-size:10px'>No data</div>";

    // Sort habits by completion in this month
    const daysInMonth = getDaysInCurrentMonth();
    let sorted = STATE.habits.map((h, i) => {
        return { ...computeHabitStats(h, daysInMonth), title: h.title, color: getHabitColor(i) };
    }).sort((a, b) => b.completed - a.completed).slice(0, 5); // top 5

    return sorted.map(h => `
        <div class="bar-row">
            <div class="bar-label">${h.title}</div>
            <div class="bar-track">
                <div class="bar-fill" style="width:${Math.max(5, h.pct)}%;background:${h.color}">
                    <span class="bar-val">${h.completed}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function renderStreaksBars() {
    if (STATE.habits.length === 0) return "<div style='color:var(--dim);font-size:10px'>No data</div>";

    const daysInMonth = getDaysInCurrentMonth();
    let sorted = STATE.habits.map((h, i) => {
        return { ...computeHabitStats(h, daysInMonth), title: h.title, color: getHabitColor(i) };
    }).sort((a, b) => b.streak - a.streak).slice(0, 5);

    // assume max streak is days in month for scaling
    return sorted.map(h => {
        let pct = Math.round((h.streak / daysInMonth) * 100);
        return `
        <div class="bar-row">
            <div class="bar-label">${h.title}</div>
            <div class="bar-track">
                <div class="bar-fill" style="width:${Math.max(5, pct)}%;background:${h.color}">
                    <span class="bar-val">${h.streak}</span>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

// Generate a stylistic decorative SVG graph to mimic the active green line in the screenshot
// Real values could be derived from mapping daily completions over daysInMonth
function renderChartSVG(daysInMonth) {
    const width = 600;
    const height = 120;
    const yearMonth = habitsCurrentMonth.toISOString().slice(0, 7);

    // Build array of completion counts per day
    let dataPoints = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${yearMonth}-${i.toString().padStart(2, '0')}`;
        const totalDone = STATE.habitLogs.filter(l => l.log_date === dStr && l.status).length;
        dataPoints.push(totalDone);
    }

    const maxVal = Math.max(1, ...dataPoints, 5); // avoid division by zero

    // Generate path
    const dx = width / Math.max(1, daysInMonth - 1);
    let pathD = "";

    // Generate small green circles on points
    let circlesHtml = "";

    dataPoints.forEach((val, i) => {
        const x = i * dx;
        // Invert Y mapping so max is at top
        const y = height - ((val / maxVal) * height);

        if (i === 0) {
            pathD += `M ${x} ${y} `;
        } else {
            pathD += `L ${x} ${y} `;
        }

        circlesHtml += `<circle cx="${x}" cy="${y}" r="2" fill="var(--green)" />`;
    });

    return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:100%;overflow:visible">
            <path d="${pathD}" fill="none" stroke="var(--green)" stroke-width="2" vector-effect="non-scaling-stroke" />
            ${circlesHtml}
        </svg>
    `;
}
