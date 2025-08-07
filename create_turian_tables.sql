-- Create table for storing Turian chat history
CREATE TABLE turian_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for storing navatar design data
CREATE TABLE navatar_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on navatar_data
ALTER TABLE navatar_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for navatar_data
CREATE POLICY "Users can view own navatar data" ON navatar_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own navatar data" ON navatar_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own navatar data" ON navatar_data FOR UPDATE USING (auth.uid() = user_id);

-- Daily Quests Table
CREATE TABLE daily_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  region TEXT,
  quest_text TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily quests" ON daily_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily quests" ON daily_quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily quests" ON daily_quests FOR UPDATE USING (auth.uid() = user_id);

-- $NATUR Rewards Table
CREATE TABLE natur_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('quiz', 'quest', 'daily_quest', 'achievement')),
  amount INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE natur_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rewards" ON natur_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rewards" ON natur_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Navatar Suggestions Table
CREATE TABLE navatar_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_text TEXT,
  based_on TEXT, -- 'quiz' or 'quest'
  activity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE navatar_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own suggestions" ON navatar_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suggestions" ON navatar_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz Results Table
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_data JSONB,
  user_answers JSONB,
  score INTEGER,
  total_questions INTEGER,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quiz results" ON quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results" ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin queries view (for stats)
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM daily_quests WHERE completed = true) as completed_quests,
  (SELECT COUNT(*) FROM quiz_results) as total_quizzes,
  (SELECT SUM(amount) FROM natur_rewards) as total_natur_issued;