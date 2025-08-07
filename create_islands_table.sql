
-- Create user_islands table for storing island creations
CREATE TABLE IF NOT EXISTS user_islands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grid_data JSONB NOT NULL,
    grid_size INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_islands ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own islands" ON user_islands
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own islands" ON user_islands
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own islands" ON user_islands
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own islands" ON user_islands
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_islands_user_id ON user_islands(user_id);
CREATE INDEX IF NOT EXISTS idx_user_islands_created_at ON user_islands(created_at);
