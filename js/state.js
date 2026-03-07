// ═══════════════════════════════════════════════════════
//  Global App State
// ═══════════════════════════════════════════════════════

const STATE = {
    user: null,
    profile: null,
    tasks: [],
    cats: [],
    sessions: [],
    xp: 0,
    // UI
    view: "today",
    filterCat: "all",
    quoteIdx: 0,
    habits: [],
    habitLogs: [],
    // Editing
    editingTaskId: null,
    // Study
    studySecs: 0,
    studyRunning: false,
    studyCat: "",
    studyTimerRef: null,
};