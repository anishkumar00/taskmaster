// ═══════════════════════════════════════════════════════
//  Pomodoro Timer
// ═══════════════════════════════════════════════════════

const POM = {
    focusMins: 25,
    breakMins: 5,
    secs: 25 * 60,
    running: false,
    mode: "focus",  // "focus" | "break"
    interval: null,
    editMode: false,
};

function initPomodoro() {
    document.getElementById("pom-focus-inp").value = POM.focusMins;
    document.getElementById("pom-break-inp").value = POM.breakMins;
    renderPomodoro();
}

function togglePomEdit() {
    POM.editMode = !POM.editMode;
    document.getElementById("pom-edit-panel").classList.toggle("hidden", !POM.editMode);
    document.getElementById("pom-display").classList.toggle("hidden", POM.editMode);
    document.getElementById("pom-edit-btn").textContent = POM.editMode ? "✓ done" : "edit";
}

function updatePomSettings() {
    const f = parseInt(document.getElementById("pom-focus-inp").value) || 25;
    const b = parseInt(document.getElementById("pom-break-inp").value) || 5;
    POM.focusMins = Math.max(1, Math.min(120, f));
    POM.breakMins = Math.max(1, Math.min(60, b));
    if (!POM.running) {
        POM.secs = POM.mode === "focus" ? POM.focusMins * 60 : POM.breakMins * 60;
        renderPomodoro();
    }
}

function togglePomodoro() {
    if (POM.editMode) { togglePomEdit(); return; }
    POM.running = !POM.running;
    if (POM.running) {
        POM.interval = setInterval(tickPomodoro, 1000);
    } else {
        clearInterval(POM.interval);
    }
    renderPomodoro();
}

function resetPomodoro() {
    clearInterval(POM.interval);
    POM.running = false;
    POM.secs = POM.mode === "focus" ? POM.focusMins * 60 : POM.breakMins * 60;
    renderPomodoro();
}

function tickPomodoro() {
    POM.secs--;
    if (POM.secs <= 0) {
        clearInterval(POM.interval);
        POM.running = false;
        const wasFocus = POM.mode === "focus";
        POM.mode = wasFocus ? "break" : "focus";
        POM.secs = POM.mode === "focus" ? POM.focusMins * 60 : POM.breakMins * 60;
        showToast(wasFocus ? "🎉 Focus complete! Take a break." : "⚡ Break over. Time to focus!", "success");
        if (wasFocus) gainXp(50);
    }
    renderPomodoro();
}

function renderPomodoro() {
    const mins = String(Math.floor(POM.secs / 60)).padStart(2, "0");
    const secs = String(POM.secs % 60).padStart(2, "0");
    const total = POM.mode === "focus" ? POM.focusMins * 60 : POM.breakMins * 60;
    const pct = ((1 - POM.secs / total) * 100).toFixed(1);

    const timeEl = document.getElementById("pom-time");
    const modeEl = document.getElementById("pom-mode-label");
    const progEl = document.getElementById("pom-progress");
    const btnEl = document.getElementById("pom-start-btn");

    if (!timeEl) return;

    timeEl.textContent = `${mins}:${secs}`;
    timeEl.className = "pom-time" + (POM.running ? " running" : "");

    modeEl.textContent = POM.mode === "focus"
        ? `FOCUS ${POM.focusMins}min (+50 XP)`
        : `BREAK ${POM.breakMins}min`;
    modeEl.className = "pom-mode" + (POM.mode === "break" ? " break" : "");

    progEl.style.width = pct + "%";
    progEl.className = "pom-progress-fill" + (POM.mode === "break" ? " break" : "");

    btnEl.textContent = POM.running ? "⏸ Pause" : "▶ Start";
    btnEl.className = "btn-pom-start" + (POM.running ? " running" : "");
}