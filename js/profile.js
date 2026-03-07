// ═══════════════════════════════════════════════════════
//  Profile Modal
// ═══════════════════════════════════════════════════════

let profileEditName = "";
let profileEditAvatar = "🧑‍💻";

function openProfileModal() {
    profileEditName = STATE.profile?.name || "";
    profileEditAvatar = STATE.profile?.avatar || "🧑‍💻";
    renderProfileModal();
    document.getElementById("profile-overlay").classList.remove("hidden");
}

function closeProfileModal() {
    document.getElementById("profile-overlay").classList.add("hidden");
}

function renderProfileModal() {
    const xp = STATE.xp;
    const lvl = getLevel(xp);
    const nxt = getNextLevel(xp);
    const xpPct = getXpPct(xp);
    const streak = calcStreak();
    const done = STATE.tasks.filter(t => t.completed).length;
    const totalStudy = STATE.sessions.reduce((a, s) => a + s.duration, 0);

    document.getElementById("profile-modal").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="modal-title" style="margin:0">👤 Profile</div>
      <button onclick="closeProfileModal()" style="background:#21262d;border:none;border-radius:8px;color:#8b949e;width:30px;height:30px;font-size:15px;cursor:pointer">×</button>
    </div>

    <!-- Avatar & info -->
    <div class="profile-avatar-block">
      <span class="profile-big-avatar">${profileEditAvatar}</span>
      <div class="profile-name">${STATE.profile?.name || "User"}</div>
      <div class="profile-email">${STATE.user?.email || ""}</div>
    </div>

    <!-- XP bar -->
    <div style="background:#0d1117;border-radius:10px;padding:12px;margin-bottom:12px;border:1px solid ${lvl.color}44">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="color:${lvl.color};font-weight:700">Lv.${lvl.level} — ${lvl.name}</span>
        <span style="font-size:12px;color:#8b949e">${xp} XP</span>
      </div>
      <div style="height:7px;background:#21262d;border-radius:3px;overflow:hidden;margin-bottom:4px">
        <div style="height:100%;width:${xpPct}%;background:${lvl.color};border-radius:3px;transition:width 0.5s"></div>
      </div>
      <div style="font-size:11px;color:#484f58">${nxt ? `${nxt.min - xp} XP to ${nxt.name}` : "MAX LEVEL 🏆"}</div>
    </div>

    <!-- Stats row -->
    <div class="profile-stat-row">
      <div class="profile-stat">
        <div class="profile-stat-val" style="color:#00ff88">${done}</div>
        <div class="profile-stat-lbl">Tasks Done</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-val" style="color:#ff8800">${streak}d</div>
        <div class="profile-stat-lbl">Streak</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-val" style="color:#00eeff">${fmtDur(totalStudy)}</div>
        <div class="profile-stat-lbl">Study Time</div>
      </div>
    </div>

    <!-- Edit name -->
    <label class="lbl">Name</label>
    <input id="profile-name-inp" class="inp" value="${profileEditName}" oninput="profileEditName=this.value"/>

    <!-- Avatar picker -->
    <label class="lbl">Avatar</label>
    <div class="avatar-grid-sm" id="profile-avatar-grid">
      ${AVATARS.map(a => `
        <button class="avatar-btn-sm ${profileEditAvatar === a ? "selected" : ""}"
          onclick="selectProfileAvatar('${a}')">${a}</button>
      `).join("")}
    </div>

    <!-- Save -->
    <button class="btn-primary" onclick="saveProfile()" style="margin-bottom:8px">✅ Save Changes</button>

    <!-- Logout -->
    <button class="btn-logout" onclick="logout()">🚪 Logout</button>`;
}

function selectProfileAvatar(a) {
    profileEditAvatar = a;
    // Update selected state
    document.querySelectorAll(".avatar-btn-sm").forEach(b => {
        b.classList.toggle("selected", b.textContent === a);
    });
    // Update big preview
    document.querySelector(".profile-big-avatar").textContent = a;
}

async function saveProfile() {
    const name = sanitize(document.getElementById("profile-name-inp")?.value || "");
    const avatar = profileEditAvatar;
    try {
        const updated = await dbUpdateProfile(STATE.user.id, { name, avatar });
        STATE.profile = updated;
        showToast("✅ Profile updated!");
        updateHeader();
        renderProfileModal();
    } catch (e) {
        showToast("Error: " + e.message, "error");
    }
}

async function logout() {
    if (!confirm("Log out of TaskMaster?")) return;
    try {
        await dbSignOut();
        window.location.href = "index.html";
    } catch (e) {
        showToast("Error logging out: " + e.message, "error");
    }
}