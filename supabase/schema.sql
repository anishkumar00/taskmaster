-- ═══════════════════════════════════════════════════════
--  ⚡ TaskMaster Pro — Supabase Database Schema
--  Ye SQL code Supabase SQL Editor mein paste karke Run karo
-- ═══════════════════════════════════════════════════════

-- ══════════════════════════════════════
--  1. PROFILES TABLE (User profile data)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    avatar TEXT DEFAULT '🧑‍💻',
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_active DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
--  2. CATEGORIES TABLE (Task categories)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    color TEXT DEFAULT '#ffdd00',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
--  3. TASKS TABLE (Main tasks)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    category TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    subtasks JSONB DEFAULT '[]',
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
--  4. STUDY_SESSIONS TABLE (Study history)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════
--  5. ROW LEVEL SECURITY (RLS) — Data Protection
--     Har user sirf apna data dekh sake
-- ══════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES — user apna profile dekhe/update kare
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- CATEGORIES — user apni categories manage kare
CREATE POLICY "Users can view own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- TASKS — user apne tasks manage kare
CREATE POLICY "Users can view own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- STUDY_SESSIONS — user apni study sessions manage kare
CREATE POLICY "Users can view own sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON study_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ══════════════════════════════════════
--  6. INDEXES (Faster queries)
-- ══════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id);

-- ✅ DONE! Ab TaskMaster ke liye database ready hai!
