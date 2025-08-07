
-- Add learning_track column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_track text;

-- Create learning progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  lesson_id text,
  progress_percentage integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create learning achievements table
CREATE TABLE IF NOT EXISTS learning_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  achievement_type text NOT NULL,
  achievement_data jsonb,
  earned_at timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_track ON learning_progress(track_id);
CREATE INDEX IF NOT EXISTS idx_learning_achievements_user_id ON learning_achievements(user_id);

-- Enable RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own learning progress" ON learning_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning progress" ON learning_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own learning progress" ON learning_progress
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own learning achievements" ON learning_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own learning achievements" ON learning_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());
