-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  wins INTEGER DEFAULT 0 NOT NULL,
  losses INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard(level DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated_at ON leaderboard(updated_at DESC);

-- Create server function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard(user_id TEXT, duel_result TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_user RECORD;
  current_progression RECORD;
  new_wins INTEGER;
  new_losses INTEGER;
BEGIN
  -- Get current user data
  SELECT username INTO current_user.username
  FROM users
  WHERE telegram_id = update_leaderboard.user_id;
  
  IF current_user.username IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  -- Get current progression data
  SELECT xp, level INTO current_progression
  FROM player_progression
  WHERE user_id = update_leaderboard.user_id;
  
  -- Set defaults if no progression data exists
  IF current_progression IS NULL THEN
    current_progression.xp := 0;
    current_progression.level := 1;
  END IF;
  
  -- Get current leaderboard stats
  SELECT wins, losses INTO new_wins, new_losses
  FROM leaderboard
  WHERE user_id = update_leaderboard.user_id;
  
  -- Set defaults if no leaderboard entry exists
  IF new_wins IS NULL THEN
    new_wins := 0;
    new_losses := 0;
  END IF;
  
  -- Update wins/losses based on duel result
  IF duel_result = 'win' THEN
    new_wins := new_wins + 1;
  ELSIF duel_result = 'lose' THEN
    new_losses := new_losses + 1;
  ELSE
    RETURN QUERY SELECT FALSE, 'Invalid result. Use "win" or "lose"'::TEXT;
    RETURN;
  END IF;
  
  -- Upsert leaderboard entry
  INSERT INTO leaderboard (user_id, username, level, xp, wins, losses, updated_at)
  VALUES (
    update_leaderboard.user_id,
    current_user.username,
    current_progression.level,
    current_progression.xp,
    new_wins,
    new_losses,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    level = EXCLUDED.level,
    xp = EXCLUDED.xp,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses,
    updated_at = EXCLUDED.updated_at;
  
  RETURN QUERY SELECT TRUE, 'Leaderboard updated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(timeframe TEXT DEFAULT 'all_time')
RETURNS TABLE (
  rank INTEGER,
  user_id TEXT,
  username TEXT,
  level INTEGER,
  xp INTEGER,
  wins INTEGER,
  losses INTEGER,
  win_ratio DECIMAL,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  IF timeframe = 'daily' THEN
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY xp DESC, level DESC, wins DESC) as rank,
      user_id,
      username,
      level,
      xp,
      wins,
      losses,
      CASE 
        WHEN wins + losses > 0 THEN ROUND((wins::DECIMAL / (wins + losses)) * 100, 2)
        ELSE 0
      END as win_ratio,
      updated_at
    FROM leaderboard
    WHERE updated_at >= NOW() - INTERVAL '24 hours'
    ORDER BY xp DESC, level DESC, wins DESC;
  ELSIF timeframe = 'weekly' THEN
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY xp DESC, level DESC, wins DESC) as rank,
      user_id,
      username,
      level,
      xp,
      wins,
      losses,
      CASE 
        WHEN wins + losses > 0 THEN ROUND((wins::DECIMAL / (wins + losses)) * 100, 2)
        ELSE 0
      END as win_ratio,
      updated_at
    FROM leaderboard
    WHERE updated_at >= NOW() - INTERVAL '7 days'
    ORDER BY xp DESC, level DESC, wins DESC;
  ELSE
    RETURN QUERY
    SELECT 
      ROW_NUMBER() OVER (ORDER BY xp DESC, level DESC, wins DESC) as rank,
      user_id,
      username,
      level,
      xp,
      wins,
      losses,
      CASE 
        WHEN wins + losses > 0 THEN ROUND((wins::DECIMAL / (wins + losses)) * 100, 2)
        ELSE 0
      END as win_ratio,
      updated_at
    FROM leaderboard
    ORDER BY xp DESC, level DESC, wins DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
GRANT ALL ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;
