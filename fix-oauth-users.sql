-- Fix OAuth user creation issues
-- This script addresses the "Database error saving new user" issue

-- First, let's check if the trigger exists and recreate it if needed
DROP TRIGGER IF EXISTS create_user_stats_trigger ON auth.users;

-- Recreate the function to handle OAuth users properly
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create stats if the user doesn't already have them
    INSERT INTO user_stats (user_id) 
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Also ensure the user_stats table allows NULL values for optional fields
ALTER TABLE user_stats ALTER COLUMN games_played SET DEFAULT 0;
ALTER TABLE user_stats ALTER COLUMN games_won SET DEFAULT 0;
ALTER TABLE user_stats ALTER COLUMN total_score SET DEFAULT 0;

-- Make sure the user_stats table exists and has proper structure
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_stats if not already enabled
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies exist for user_stats
DROP POLICY IF EXISTS "Users can view all stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;

CREATE POLICY "Users can view all stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
