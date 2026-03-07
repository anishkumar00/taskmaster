// ═══════════════════════════════════════════════════════
//  Auth Page Logic
// ═══════════════════════════════════════════════════════

let currentMode = "login";
let currentStep = 0;
let selectedAvatar = "🧑‍💻";

// ── Init ──────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", async () => {
    // If already logged in → go to dashboard
    const session = await dbGetSession();
    if (session) { window.location.href = "dashboard.html"; return; }

    buildAvatarGrid();
    hidePwHint();
});

function buildAvatarGrid() {
    const grid = document.getElementById("avatar-grid");
    AVATARS.forEach(a => {
        const btn = document.createElement("button");
        btn.className = "avatar-btn" + (a === selectedAvatar ? " selected" : "");
        btn.textContent = a;
        btn.onclick = () => selectAvatar(a);
        grid.appendChild(btn);
    });
}

function selectAvatar(a) {
    selectedAvatar = a;
    document.getElementById("avatar-preview-icon").textContent = a;
    document.querySelectorAll(".avatar-btn").forEach(b => b.classList.toggle("selected", b.textContent === a));
}

function hidePwHint() {
    document.getElementById("pw-hint").style.display = currentMode === "login" ? "none" : "inline";
}

// ── Tab / Step switching ───────────────────────────────
function switchTab(mode) {
    currentMode = mode; currentStep = 0;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("tab-" + mode).classList.add("active");

    const isSignup = mode === "signup";
    document.getElementById("step-row").classList.toggle("hidden", !isSignup);
    document.getElementById("name-group").classList.toggle("hidden", !isSignup);
    document.getElementById("submit-btn").textContent = isSignup ? "🚀 Create Account" : "🔑 Login to TaskMaster";
    document.getElementById("switch-text").textContent = isSignup ? "Already registered?" : "No account?";
    document.querySelector(".switch-link").textContent = isSignup ? "Login" : "Sign up free";

    if (isSignup) {
        switchStep(0);
    } else {
        document.getElementById("panel-info").classList.remove("hidden");
        document.getElementById("panel-avatar").classList.add("hidden");
    }
    hidePwHint(); clearError();
}

function switchMode() {
    switchTab(currentMode === "login" ? "signup" : "login");
}

function switchStep(s) {
    currentStep = s;
    document.querySelectorAll(".step-btn").forEach(b => b.classList.remove("active"));
    document.getElementById("step-" + s).classList.add("active");
    document.getElementById("panel-info").classList.toggle("hidden", s !== 0);
    document.getElementById("panel-avatar").classList.toggle("hidden", s !== 1);
}

// ── Password toggle ───────────────────────────────────
function togglePw() {
    const inp = document.getElementById("inp-pass");
    const isText = inp.type === "text";
    inp.type = isText ? "password" : "text";
    document.getElementById("pw-eye").textContent = isText ? "👁" : "🙈";
}

// ── Validation ────────────────────────────────────────
function validate(email, pass, name) {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Invalid email address.";
    if (pass.length < 6) return "Password must be at least 6 characters.";
    if (currentMode === "signup" && !name.trim()) return "Please enter your name.";
    return null;
}

function showError(msg) {
    const el = document.getElementById("auth-error");
    el.textContent = "❌ " + msg;
    el.classList.remove("hidden");
}
function clearError() {
    document.getElementById("auth-error").classList.add("hidden");
}

// ── Submit ────────────────────────────────────────────
async function handleSubmit() {
    const email = document.getElementById("inp-email").value.trim().toLowerCase();
    const pass = document.getElementById("inp-pass").value;
    const name = currentMode === "signup" ? document.getElementById("inp-name").value.trim() : "";

    const err = validate(email, pass, name);
    if (err) { showError(err); return; }

    clearError();
    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    btn.innerHTML = `<div class="spinner"></div> Verifying...`;

    try {
        if (currentMode === "signup") {
            await dbSignUp(email, pass, sanitize(name), selectedAvatar);
        } else {
            await dbSignIn(email, pass);
        }
        window.location.href = "dashboard.html";
    } catch (e) {
        showError(e.message || "Something went wrong. Try again.");
        btn.disabled = false;
        btn.textContent = currentMode === "login" ? "🔑 Login to TaskMaster" : "🚀 Create Account";
    }
}

// Enter key submits
document.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSubmit();
});