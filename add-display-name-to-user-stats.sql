-- Add display_name field to user_stats table
-- Run this in the Supabase SQL Editor

-- Add display_name column to user_stats table
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update existing user_stats with display names from auth.users
UPDATE user_stats 
SET display_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_stats.user_id),
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = user_stats.user_id),
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = user_stats.user_id),
    (SELECT split_part(email, '@', 1) FROM auth.users WHERE id = user_stats.user_id),
    'Player_' || substring(user_id::text, 1, 8)
)
WHERE display_name IS NULL;

-- Update the create_user_stats function to include display_name
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user_stats record for the new user with display name
    INSERT INTO user_stats (user_id, games_played, games_won, total_score, display_name)
    VALUES (
        NEW.id, 
        0, 
        0, 
        0,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1),
            'Player_' || substring(NEW.id::text, 1, 8)
        )
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent errors if record already exists
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verify the changes
SELECT 
    user_id,
    display_name,
    games_played,
    games_won
FROM user_stats 
ORDER BY created_at DESC;
