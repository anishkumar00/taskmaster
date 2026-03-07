// ═══════════════════════════════════════════════════════
//  Study Mode
// ═══════════════════════════════════════════════════════

function startStudyMode() {
    STATE.studySecs = 0;
    STATE.studyRunning = false;
    STATE.studyCat = STATE.cats[0]?.id || "";
    document.getElementById("study-note").value = "";
    renderStudyModal();
    document.getElementById("study-overlay").classList.remove("hidden");
}

function renderStudyModal() {
    // Build category buttons
    const catsEl = document.getElementById("study-cats");
    catsEl.innerHTML = STATE.cats.map(c => `
    <button class="study-cat-btn ${STATE.studyCat === c.id ? "active" : ""}"
      style="${STATE.studyCat === c.id ? `border-color:${c.color};color:${c.color};background:${c.color}22` : ""}"
      onclick="selectStudyCat('${c.id}','${c.color}')">
      ${c.label}
    </button>`).join("");
    updateStudyTimer();
}

function selectStudyCat(id, color) {
    STATE.studyCat = id;
    document.querySelectorAll(".study-cat-btn").forEach(b => {
        b.classList.remove("active");
        b.style.borderColor = "";
        b.style.color = "";
        b.style.background = "";
    });
    const btn = document.querySelector(`.study-cat-btn[onclick*="'${id}'"]`);
    if (btn) {
        btn.classList.add("active");
        btn.style.borderColor = color;
        btn.style.color = color;
        btn.style.background = color + "22";
    }
}

function toggleStudy() {
    STATE.studyRunning = !STATE.studyRunning;
    if (STATE.studyRunning) {
        STATE.studyTimerRef = setInterval(() => {
            STATE.studySecs++;
            updateStudyTimer();
        }, 1000);
    } else {
        clearInterval(STATE.studyTimerRef);
    }
    const btn = document.getElementById("study-pause-btn");
    const status = document.getElementById("study-status");
    const timer = document.getElementById("study-timer");
    btn.textContent = STATE.studyRunning ? "⏸ Pause" : "▶ Resume";
    btn.className = "btn-study-pause" + (STATE.studyRunning ? "" : " paused");
    status.textContent = STATE.studyRunning ? "● STUDYING..." : "⏸ PAUSED";
    status.className = "study-status" + (STATE.studyRunning ? " running" : "");
    timer.className = "study-timer" + (STATE.studyRunning ? " running" : "");
}

function updateStudyTimer() {
    const h = Math.floor(STATE.studySecs / 3600);
    const m = Math.floor((STATE.studySecs % 3600) / 60);
    const s = STATE.studySecs % 60;
    document.getElementById("study-timer").textContent =
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    const saveBtn = document.getElementById("study-save-btn") || document.querySelector(".btn-study-save");
    if (saveBtn) saveBtn.disabled = STATE.studySecs < 10;
}

async function saveStudySession() {
    if (STATE.studySecs < 10) { showToast("Study a bit longer first!", "error"); return; }
    clearInterval(STATE.studyTimerRef);
    const note = sanitize(document.getElementById("study-note").value);
    const xpEarned = Math.floor(STATE.studySecs / 60) * 2;
    try {
        const row = await dbAddSession(STATE.user.id, {
            duration: STATE.studySecs,
            category: STATE.studyCat || STATE.cats[0]?.id || "other",
            note,
            date: todayStr(),
        });
        STATE.sessions.unshift(row);
        await gainXp(xpEarned);
        showToast(`📚 Saved! ${fmtDur(STATE.studySecs)} studied. +${xpEarned} XP`, "success");
        spawnConfetti();
        discardStudy();
        updateHeader();
        if (STATE.view === "history") renderHistory();
    } catch (e) {
        showToast("Error saving session: " + e.message, "error");
    }
}

function discardStudy() {
    clearInterval(STATE.studyTimerRef);
    STATE.studyRunning = false;
    STATE.studySecs = 0;
    document.getElementById("study-overlay").classList.add("hidden");
}