
-- Create parent-child relationships table
CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email text NOT NULL,
  child_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'parent', -- parent, guardian, teacher
  approved boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  approved_at timestamp
);

-- Create parent notifications table
CREATE TABLE IF NOT EXISTS parent_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_email text NOT NULL,
  child_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- achievement, concern, progress
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Create activity logs for parent monitoring
CREATE TABLE IF NOT EXISTS child_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL, -- login, quiz_complete, lesson_complete, chat_interaction
  activity_data jsonb,
  duration_minutes integer,
  created_at timestamp DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parent_child_relationships_parent ON parent_child_relationships(parent_email);
CREATE INDEX IF NOT EXISTS idx_parent_child_relationships_child ON parent_child_relationships(child_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_parent ON parent_notifications(parent_email);
CREATE INDEX IF NOT EXISTS idx_child_activity_logs_user ON child_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_child_activity_logs_created ON child_activity_logs(created_at);

-- Enable RLS
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for parent dashboard
CREATE POLICY "Parents can view their relationships" ON parent_child_relationships
  FOR SELECT USING (parent_email = auth.jwt() ->> 'email');

CREATE POLICY "Parents can view their notifications" ON parent_notifications
  FOR SELECT USING (parent_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can view own activity logs" ON child_activity_logs
  FOR SELECT USING (user_id = auth.uid());

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb DEFAULT '{}',
  p_duration_minutes integer DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO child_activity_logs (user_id, activity_type, activity_data, duration_minutes)
  VALUES (p_user_id, p_activity_type, p_activity_data, p_duration_minutes);
END;
$$ LANGUAGE plpgsql;
