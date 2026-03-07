// ═══════════════════════════════════════════════════════
//  Utility Functions
// ═══════════════════════════════════════════════════════

const PRIORITIES = [
    { id: "high", label: "🔴 High", color: "#ff4444" },
    { id: "medium", label: "🟡 Medium", color: "#ffaa00" },
    { id: "low", label: "🟢 Low", color: "#00cc66" },
];

const XP_LEVELS = [
    { level: 1, name: "Newbie", min: 0, color: "#8b949e" },
    { level: 2, name: "Learner", min: 100, color: "#00cc66" },
    { level: 3, name: "Builder", min: 300, color: "#00eeff" },
    { level: 4, name: "Hacker", min: 600, color: "#ffdd00" },
    { level: 5, name: "Pro", min: 1000, color: "#ff8800" },
    { level: 6, name: "Elite", min: 1500, color: "#ff4466" },
    { level: 7, name: "Legend", min: 2500, color: "#bb88ff" },
];

const QUOTES = [
    "You don't need motivation to start — you need to START to get motivation.",
    "5 minutes of work beats 0 minutes of planning forever.",
    "Every expert was once a complete beginner.",
    "Consistency beats talent when talent doesn't work consistently.",
    "The best time to start was yesterday. The second best time is RIGHT NOW.",
    "Progress, not perfection. One step at a time.",
    "Discipline is choosing between what you want now vs what you want most.",
    "The people who succeed study when they don't feel like it.",
    "Small daily improvements lead to staggering long-term results.",
    "Don't wait to be motivated. Act, and motivation will follow.",
];

const EMOJI_LIST = ["📚", "🌱", "📌", "🎯", "💡", "🔧", "📝", "🌐", "⚡", "🚀", "💰", "🎮", "🔭", "🎨", "🏆", "🏋️", "🔬", "🧠", "📐", "🎵", "✈️", "💻", "🔐", "🌍", "🖥️", "📊"];
const COLORS = ["#00ff88", "#00eeff", "#ffdd00", "#ff88aa", "#bb88ff", "#ff8800", "#ff4466", "#44aaff", "#ff44ff", "#88ffcc", "#ff6644", "#44ffaa"];
const AVATARS = ["🧑‍💻", "👨‍🎓", "👩‍🎓", "🦸", "🧙", "🐱", "🦊", "🐼", "🤖", "👾", "🦅", "🌟", "🐉", "🦁", "🐯", "🧑‍🚀"];

// Date helpers
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d) { if (!d) return ""; return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }
function fmtTime(ts) { if (!ts) return ""; return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
function fmtDur(s) {
    if (!s || s <= 0) return "0m";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${sec}s`;
}
function isOverdue(d) { return d && d < todayStr(); }
function isToday(d) { return d === todayStr(); }

// XP helpers
function getLevel(xp) { return [...XP_LEVELS].reverse().find(l => xp >= l.min) || XP_LEVELS[0]; }
function getNextLevel(xp) { return XP_LEVELS.find(l => l.min > xp); }
function getXpPct(xp) {
    const lvl = getLevel(xp), nxt = getNextLevel(xp);
    return nxt ? Math.round(((xp - lvl.min) / (nxt.min - lvl.min)) * 100) : 100;
}

// Sanitize input
function sanitize(s) { return String(s || "").replace(/[<>"'&]/g, "").trim().slice(0, 300); }

// Category/priority helpers
function catById(id) { return (STATE.cats || []).find(c => c.id === id) || { label: "📌 Other", color: "#bb88ff" }; }
function priById(id) { return PRIORITIES.find(p => p.id === id) || PRIORITIES[1]; }

// Streak calculator
function calcStreak() {
    let s = 0, d = new Date();
    while (true) {
        const str = d.toISOString().slice(0, 10);
        const hasTask = (STATE.tasks || []).some(t => t.completed_at && new Date(t.completed_at).toISOString().slice(0, 10) === str);
        const hasSess = (STATE.sessions || []).some(x => x.date === str);
        if (hasTask || hasSess) { s++; d.setDate(d.getDate() - 1); }
        else break;
    }
    return s;
}

// Confetti
function spawnConfetti() {
    const container = document.getElementById("confetti-container");
    const colors = ["#00ff88", "#00eeff", "#ffdd00", "#ff88aa", "#bb88ff", "#ff8800", "#ff4466", "#44aaff"];
    for (let i = 0; i < 20; i++) {
        const el = document.createElement("div");
        el.className = "confetti-piece";
        const size = 6 + Math.random() * 8;
        el.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.4}s`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 2200);
    }
}

// Toast
let toastTimer;
function showToast(msg, type = "info") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}