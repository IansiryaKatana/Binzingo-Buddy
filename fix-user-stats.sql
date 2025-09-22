-- Fix missing user_stats records for OAuth users
-- Run this in the Supabase SQL Editor

-- First, let's see what users exist in auth.users but not in user_stats
SELECT 
    au.id,
    au.email,
    au.created_at,
    us.user_id as has_user_stats
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL
ORDER BY au.created_at DESC;

-- Create user_stats records for users who don't have them
INSERT INTO user_stats (user_id, games_played, games_won, total_score)
SELECT 
    au.id,
    0,
    0,
    0
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL;

-- Verify the results
SELECT 
    COUNT(*) as total_users,
    COUNT(us.user_id) as users_with_stats
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id;
