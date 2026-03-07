-- HABITS TABLE
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABIT LOGS TABLE
CREATE TABLE habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  UNIQUE (habit_id, log_date)
);

-- ROW LEVEL SECURITY (RLS) FOR HABITS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits" 
  ON habits FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits" 
  ON habits FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" 
  ON habits FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" 
  ON habits FOR DELETE 
  USING (auth.uid() = user_id);

-- ROW LEVEL SECURITY (RLS) FOR HABIT LOGS
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit logs" 
  ON habit_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit logs" 
  ON habit_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs" 
  ON habit_logs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs" 
  ON habit_logs FOR DELETE 
  USING (auth.uid() = user_id);
