// ═══════════════════════════════════════════════════════
//  Supabase Client & Database Helpers
// ═══════════════════════════════════════════════════════

const { createClient } = supabase;
const db = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
});

// ── Auth ────────────────────────────────────────────────
async function dbSignUp(email, password, name, avatar) {
    const { data, error } = await db.auth.signUp({
        email, password,
        options: { data: { name, avatar } },
    });
    if (error) throw error;
    // Insert profile row
    if (data.user) {
        await db.from("profiles").insert({ id: data.user.id, name, avatar, xp: 0 });
        // Seed default categories
        await db.from("categories").insert([
            { user_id: data.user.id, label: "📚 Study", color: "#ffdd00" },
            { user_id: data.user.id, label: "🌱 Personal", color: "#ff88aa" },
            { user_id: data.user.id, label: "📌 Other", color: "#bb88ff" },
        ]);
    }
    return data;
}

async function dbSignIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

async function dbSignOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
}

async function dbGetSession() {
    const { data } = await db.auth.getSession();
    return data.session;
}

// ── Profile ─────────────────────────────────────────────
async function dbGetProfile(userId) {
    const { data, error } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    // If profile doesn't exist yet, create a default one
    if (!data) {
        const session = await dbGetSession();
        const name = session?.user?.user_metadata?.name || "User";
        const avatar = session?.user?.user_metadata?.avatar || "🧑‍💻";
        const { data: newProfile, error: insertErr } = await db.from("profiles").insert({
            id: userId, name, avatar, xp: 0
        }).select().single();
        if (insertErr) throw insertErr;
        return newProfile;
    }
    return data;
}

async function dbUpdateProfile(userId, updates) {
    const { data, error } = await db.from("profiles").update(updates).eq("id", userId).select().single();
    if (error) throw error;
    return data;
}

// ── Tasks ────────────────────────────────────────────────
async function dbGetTasks(userId) {
    const { data, error } = await db.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

async function dbAddTask(userId, task) {
    const { data, error } = await db.from("tasks").insert({ ...task, user_id: userId }).select().single();
    if (error) throw error;
    return data;
}

async function dbUpdateTask(taskId, updates) {
    const { data, error } = await db.from("tasks").update(updates).eq("id", taskId).select().single();
    if (error) throw error;
    return data;
}

async function dbDeleteTask(taskId) {
    const { error } = await db.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
}

// ── Categories ───────────────────────────────────────────
async function dbGetCategories(userId) {
    const { data, error } = await db.from("categories").select("*").eq("user_id", userId).order("created_at");
    if (error) throw error;
    return data || [];
}

async function dbAddCategory(userId, cat) {
    const { data, error } = await db.from("categories").insert({ ...cat, user_id: userId }).select().single();
    if (error) throw error;
    return data;
}

async function dbDeleteCategory(catId) {
    const { error } = await db.from("categories").delete().eq("id", catId);
    if (error) throw error;
}

// ── Study Sessions ───────────────────────────────────────
async function dbGetSessions(userId) {
    const { data, error } = await db.from("study_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
}

async function dbAddSession(userId, session) {
    const { data, error } = await db.from("study_sessions").insert({ ...session, user_id: userId }).select().single();
    if (error) throw error;
    return data;
}

async function dbDeleteSession(sessionId) {
    const { error } = await db.from("study_sessions").delete().eq("id", sessionId);
    if (error) throw error;
}

// ── XP ───────────────────────────────────────────────────
async function dbGainXp(userId, current, amount) {
    const newXp = current + amount;
    await dbUpdateProfile(userId, { xp: newXp });
    return newXp;
}

// ── Habits ────────────────────────────────────────────────
async function dbGetHabits(userId) {
    const { data, error } = await db.from("habits").select("*").eq("user_id", userId).order("created_at");
    if (error) throw error;
    return data || [];
}

async function dbAddHabit(userId, habit) {
    const { data, error } = await db.from("habits").insert({ ...habit, user_id: userId }).select().single();
    if (error) throw error;
    return data;
}

async function dbDeleteHabit(habitId) {
    const { error } = await db.from("habits").delete().eq("id", habitId);
    if (error) throw error;
}

// ── Habit Logs ───────────────────────────────────────────
async function dbGetHabitLogs(userId, yearMonth) {
    // yearMonth should be "YYYY-MM" to fetch logs for a specific month
    const startObj = new Date(`${yearMonth}-01T00:00:00Z`);
    const endObj = new Date(startObj.getFullYear(), startObj.getMonth() + 1, 0, 23, 59, 59); // last day of month

    const startStr = startObj.toISOString().split('T')[0];
    const endStr = endObj.toISOString().split('T')[0];

    const { data, error } = await db.from("habit_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("log_date", startStr)
        .lte("log_date", endStr);

    if (error) throw error;
    return data || [];
}

async function dbToggleHabitLog(userId, habitId, logDate, status) {
    // Uses upsert so we either create a new log or update existing
    const { data, error } = await db.from("habit_logs").upsert(
        { habit_id: habitId, user_id: userId, log_date: logDate, status: status },
        { onConflict: 'habit_id, log_date' }
    ).select().single();

    if (error) throw error;
    return data;
}