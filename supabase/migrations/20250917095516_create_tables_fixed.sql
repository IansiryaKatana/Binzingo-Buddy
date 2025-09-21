-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'finished', 'abandoned')) DEFAULT 'waiting',
  max_players INTEGER DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 4),
  current_players INTEGER DEFAULT 0 CHECK (current_players >= 0),
  score_limit INTEGER DEFAULT 100 CHECK (score_limit > 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id) -- Prevent duplicate players in same game
);

-- Create game_states table
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  state_data JSONB NOT NULL,
  current_player_index INTEGER DEFAULT 0,
  turn_timer INTEGER DEFAULT 45,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table for tracking player statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games table
CREATE POLICY "Users can view all games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Users can create games" ON games
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Game creators can update their games" ON games
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Game creators can delete their games" ON games
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for game_players table
CREATE POLICY "Users can view players in games" ON game_players
  FOR SELECT USING (true);

CREATE POLICY "Users can join games" ON game_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player status" ON game_players
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave games" ON game_players
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_states table
CREATE POLICY "Users can view game states" ON game_states
  FOR SELECT USING (true);

CREATE POLICY "Game players can update game states" ON game_states
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM game_players 
      WHERE game_players.game_id = game_states.game_id 
      AND game_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Game players can insert game states" ON game_states
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_players 
      WHERE game_players.game_id = game_states.game_id 
      AND game_players.user_id = auth.uid()
    )
  );

-- RLS Policies for user_stats table
CREATE POLICY "Users can view all stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);

CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user_id ON game_players(user_id);

CREATE INDEX IF NOT EXISTS idx_game_states_game_id ON game_states(game_id);
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON game_states(updated_at);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_states_updated_at BEFORE UPDATE ON game_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user stats when user signs up
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to create user stats on user creation
CREATE TRIGGER create_user_stats_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Create function to update current_players count
CREATE OR REPLACE FUNCTION update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE games 
        SET current_players = current_players + 1 
        WHERE id = NEW.game_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE games 
        SET current_players = current_players - 1 
        WHERE id = OLD.game_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to update player count
CREATE TRIGGER update_game_player_count_trigger
    AFTER INSERT OR DELETE ON game_players
    FOR EACH ROW EXECUTE FUNCTION update_game_player_count();
