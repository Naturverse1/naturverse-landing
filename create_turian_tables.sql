
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

-- Enable Row Level Security
ALTER TABLE turian_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE navatar_data ENABLE ROW LEVEL SECURITY;

-- Create policies for turian_chats
CREATE POLICY "Users can view their own chats" ON turian_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON turian_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for navatar_data
CREATE POLICY "Users can view their own navatar data" ON navatar_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own navatar data" ON navatar_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own navatar data" ON navatar_data
  FOR UPDATE USING (auth.uid() = user_id);
