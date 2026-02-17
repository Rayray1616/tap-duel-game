-- Create daily_missions_progress table
CREATE TABLE IF NOT EXISTS daily_missions_progress (
  user_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, mission_id),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create achievements_progress table
CREATE TABLE IF NOT EXISTS achievements_progress (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_progress_user_id ON daily_missions_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_missions_progress_completed ON daily_missions_progress(completed);
CREATE INDEX IF NOT EXISTS idx_daily_missions_progress_claimed ON daily_missions_progress(claimed);
CREATE INDEX IF NOT EXISTS idx_daily_missions_progress_updated_at ON daily_missions_progress(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_progress_user_id ON achievements_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_progress_completed ON achievements_progress(completed);
CREATE INDEX IF NOT EXISTS idx_achievements_progress_claimed ON achievements_progress(claimed);
CREATE INDEX IF NOT EXISTS idx_achievements_progress_updated_at ON achievements_progress(updated_at DESC);

-- Create server function to update daily mission progress
CREATE OR REPLACE FUNCTION update_daily_mission_progress(user_id TEXT, mission_id TEXT, increment INTEGER DEFAULT 1)
RETURNS TABLE (
  success BOOLEAN,
  new_progress INTEGER,
  completed BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_progress INTEGER;
  current_completed BOOLEAN;
  current_claimed BOOLEAN;
  mission_target INTEGER;
  new_completed BOOLEAN;
BEGIN
  -- Get current progress
  SELECT progress, completed, claimed INTO current_progress, current_completed, current_claimed
  FROM daily_missions_progress
  WHERE daily_missions_progress.user_id = update_daily_mission_progress.user_id
    AND daily_missions_progress.mission_id = update_daily_mission_progress.mission_id;
  
  -- If not found, create new record
  IF current_progress IS NULL THEN
    INSERT INTO daily_missions_progress (user_id, mission_id, progress, completed, claimed, updated_at)
    VALUES (
      update_daily_mission_progress.user_id,
      update_daily_mission_progress.mission_id,
      increment,
      false,
      false,
      NOW()
    );
    
    current_progress := increment;
    current_completed := false;
    current_claimed := false;
  ELSIF current_claimed THEN
    -- Don't update if already claimed
    RETURN QUERY SELECT 
      false, 
      current_progress, 
      current_completed, 
      'Mission already claimed'::TEXT;
    RETURN;
  ELSE
    -- Update existing record
    UPDATE daily_missions_progress
    SET 
      progress = progress + increment,
      updated_at = NOW()
    WHERE user_id = update_daily_mission_progress.user_id
      AND mission_id = update_daily_mission_progress.mission_id;
    
    current_progress := current_progress + increment;
  END IF;
  
  -- Check if mission is completed (assuming target is 100 for now, this should be configurable)
  mission_target := 100;
  new_completed := current_progress >= mission_target;
  
  -- Update completed status
  IF new_completed AND NOT current_completed THEN
    UPDATE daily_missions_progress
    SET completed = true, updated_at = NOW()
    WHERE user_id = update_daily_mission_progress.user_id
      AND mission_id = update_daily_mission_progress.mission_id;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    current_progress, 
    new_completed, 
    'Mission progress updated'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to claim daily mission reward
CREATE OR REPLACE FUNCTION claim_daily_mission(user_id TEXT, mission_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reward_gems INTEGER,
  message TEXT
) AS $$
DECLARE
  current_completed BOOLEAN;
  current_claimed BOOLEAN;
  reward_amount INTEGER;
BEGIN
  -- Get current status
  SELECT completed, claimed INTO current_completed, current_claimed
  FROM daily_missions_progress
  WHERE daily_missions_progress.user_id = claim_daily_mission.user_id
    AND daily_missions_progress.mission_id = claim_daily_mission.mission_id;
  
  IF current_completed IS NULL THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Mission not found'::TEXT;
    RETURN;
  END IF;
  
  IF NOT current_completed THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Mission not completed'::TEXT;
    RETURN;
  END IF;
  
  IF current_claimed THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Reward already claimed'::TEXT;
    RETURN;
  END IF;
  
  -- Award gems (assuming 10 gems reward, this should be configurable)
  reward_amount := 10;
  PERFORM add_gems(claim_daily_mission.user_id, reward_amount);
  
  -- Mark as claimed
  UPDATE daily_missions_progress
  SET claimed = true, updated_at = NOW()
  WHERE user_id = claim_daily_mission.user_id
    AND mission_id = claim_daily_mission.mission_id;
  
  RETURN QUERY SELECT 
    true, 
    reward_amount, 
    'Reward claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to update achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress(user_id TEXT, achievement_id TEXT, increment INTEGER DEFAULT 1)
RETURNS TABLE (
  success BOOLEAN,
  new_progress INTEGER,
  completed BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_progress INTEGER;
  current_completed BOOLEAN;
  current_claimed BOOLEAN;
  achievement_target INTEGER;
  new_completed BOOLEAN;
BEGIN
  -- Get current progress
  SELECT progress, completed, claimed INTO current_progress, current_completed, current_claimed
  FROM achievements_progress
  WHERE achievements_progress.user_id = update_achievement_progress.user_id
    AND achievements_progress.achievement_id = update_achievement_progress.achievement_id;
  
  -- If not found, create new record
  IF current_progress IS NULL THEN
    INSERT INTO achievements_progress (user_id, achievement_id, progress, completed, claimed, updated_at)
    VALUES (
      update_achievement_progress.user_id,
      update_achievement_progress.achievement_id,
      increment,
      false,
      false,
      NOW()
    );
    
    current_progress := increment;
    current_completed := false;
    current_claimed := false;
  ELSIF current_claimed THEN
    -- Don't update if already claimed
    RETURN QUERY SELECT 
      false, 
      current_progress, 
      current_completed, 
      'Achievement already claimed'::TEXT;
    RETURN;
  ELSE
    -- Update existing record
    UPDATE achievements_progress
    SET 
      progress = progress + increment,
      updated_at = NOW()
    WHERE user_id = update_achievement_progress.user_id
      AND achievement_id = update_achievement_progress.achievement_id;
    
    current_progress := current_progress + increment;
  END IF;
  
  -- Check if achievement is completed (assuming target is 100 for now, this should be configurable)
  achievement_target := 100;
  new_completed := current_progress >= achievement_target;
  
  -- Update completed status
  IF new_completed AND NOT current_completed THEN
    UPDATE achievements_progress
    SET completed = true, updated_at = NOW()
    WHERE user_id = update_achievement_progress.user_id
      AND achievement_id = update_achievement_progress.achievement_id;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    current_progress, 
    new_completed, 
    'Achievement progress updated'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to claim achievement reward
CREATE OR REPLACE FUNCTION claim_achievement(user_id TEXT, achievement_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reward_gems INTEGER,
  message TEXT
) AS $$
DECLARE
  current_completed BOOLEAN;
  current_claimed BOOLEAN;
  reward_amount INTEGER;
BEGIN
  -- Get current status
  SELECT completed, claimed INTO current_completed, current_claimed
  FROM achievements_progress
  WHERE achievements_progress.user_id = claim_achievement.user_id
    AND achievements_progress.achievement_id = claim_achievement.achievement_id;
  
  IF current_completed IS NULL THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Achievement not found'::TEXT;
    RETURN;
  END IF;
  
  IF NOT current_completed THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Achievement not completed'::TEXT;
    RETURN;
  END IF;
  
  IF current_claimed THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Reward already claimed'::TEXT;
    RETURN;
  END IF;
  
  -- Award gems (assuming 25 gems reward, this should be configurable)
  reward_amount := 25;
  PERFORM add_gems(claim_achievement.user_id, reward_amount);
  
  -- Mark as claimed
  UPDATE achievements_progress
  SET claimed = true, updated_at = NOW()
  WHERE user_id = claim_achievement.user_id
    AND achievement_id = claim_achievement.achievement_id;
  
  RETURN QUERY SELECT 
    true, 
    reward_amount, 
    'Reward claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to reset daily missions
CREATE OR REPLACE FUNCTION reset_daily_missions(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reset_count INTEGER,
  message TEXT
) AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  -- Reset all daily missions for user
  UPDATE daily_missions_progress
  SET 
    progress = 0,
    completed = false,
    claimed = false,
    updated_at = NOW()
  WHERE user_id = reset_daily_missions.user_id;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  
  RETURN QUERY SELECT 
    true, 
    reset_count, 
    'Daily missions reset'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_daily_mission_progress TO authenticated;
GRANT EXECUTE ON FUNCTION claim_daily_mission TO authenticated;
GRANT EXECUTE ON FUNCTION update_achievement_progress TO authenticated;
GRANT EXECUTE ON FUNCTION claim_achievement TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_missions TO authenticated;
GRANT ALL ON daily_missions_progress TO authenticated;
GRANT SELECT ON daily_missions_progress TO anon;
GRANT ALL ON achievements_progress TO authenticated;
GRANT SELECT ON achievements_progress TO anon;
