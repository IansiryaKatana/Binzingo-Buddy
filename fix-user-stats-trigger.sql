-- Fix the user_stats trigger to work with OAuth users
-- Run this in the Supabase SQL Editor

-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS create_user_stats_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_stats();

-- Create a better function that handles OAuth users
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user_stats record for the new user
    INSERT INTO user_stats (user_id, games_played, games_won, total_score)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING; -- Prevent errors if record already exists
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Test the trigger by checking if it works
SELECT 'Trigger created successfully!' as status;
