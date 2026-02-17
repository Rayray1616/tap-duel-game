-- Create player_progression table
CREATE TABLE IF NOT EXISTS player_progression (
  user_id TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_player_progression_user_id ON player_progression(user_id);

-- Create server function to award XP
CREATE OR REPLACE FUNCTION award_xp(user_id TEXT, amount INTEGER)
RETURNS TABLE (
  xp INTEGER,
  level INTEGER,
  leveled_up BOOLEAN,
  xp_to_next_level INTEGER,
  xp_progress INTEGER
) AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
  xp_threshold INTEGER;
  xp_to_next INTEGER;
  xp_progress_val INTEGER;
  did_level_up BOOLEAN := FALSE;
BEGIN
  -- Get current XP and level, or create new record
  SELECT xp, level INTO current_xp, current_level
  FROM player_progression
  WHERE player_progression.user_id = award_xp.user_id;
  
  -- If no record exists, create one
  IF current_xp IS NULL THEN
    INSERT INTO player_progression (user_id, xp, level)
    VALUES (award_xp.user_id, 0, 1);
    current_xp := 0;
    current_level := 1;
  END IF;
  
  -- Add XP
  new_xp := current_xp + amount;
  
  -- Calculate new level based on XP thresholds
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  new_level := floor(sqrt(new_xp::float / 100)) + 1;
  
  -- Check if leveled up
  IF new_level > current_level THEN
    did_level_up := TRUE;
  END IF;
  
  -- Calculate XP needed for next level
  xp_threshold := (new_level * new_level) * 100;
  xp_to_next := xp_threshold - new_xp;
  
  -- Calculate progress percentage
  xp_progress_val := ((new_xp - ((new_level - 1) * (new_level - 1) * 100)) * 100) / ((new_level * new_level * 100) - ((new_level - 1) * (new_level - 1) * 100));
  
  -- Update the record
  UPDATE player_progression
  SET xp = new_xp,
      level = new_level,
      updated_at = NOW()
  WHERE user_id = award_xp.user_id;
  
  -- Return results
  RETURN QUERY SELECT 
    new_xp,
    new_level,
    did_level_up,
    xp_to_next,
    xp_progress_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT ALL ON player_progression TO authenticated;
GRANT SELECT ON player_progression TO anon;
