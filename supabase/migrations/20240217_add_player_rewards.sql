-- Create player_rewards table
CREATE TABLE IF NOT EXISTS player_rewards (
  user_id TEXT PRIMARY KEY,
  last_claimed TIMESTAMP WITH TIME ZONE,
  streak INTEGER DEFAULT 0 NOT NULL,
  total_claims INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_rewards_user_id ON player_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_last_claimed ON player_rewards(last_claimed DESC);

-- Create server function to claim daily reward
CREATE OR REPLACE FUNCTION claim_daily_reward(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reward_amount INTEGER,
  streak INTEGER,
  streak_reset BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_reward RECORD;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
  reward_base INTEGER := 20;
  calculated_reward INTEGER;
  new_streak INTEGER;
  streak_reset_flag BOOLEAN := FALSE;
  can_claim BOOLEAN := FALSE;
BEGIN
  -- Get current reward data
  SELECT last_claimed, streak, total_claims INTO current_reward
  FROM player_rewards
  WHERE player_rewards.user_id = claim_daily_reward.user_id;
  
  -- Check if user can claim reward
  IF current_reward.last_claimed IS NULL THEN
    -- First time claiming
    new_streak := 1;
    streak_reset_flag := FALSE;
    can_claim := TRUE;
  ELSIF current_reward.last_claimed < current_time - INTERVAL '48 hours' THEN
    -- Streak reset (more than 48 hours)
    new_streak := 1;
    streak_reset_flag := TRUE;
    can_claim := TRUE;
  ELSIF current_reward.last_claimed < current_time - INTERVAL '24 hours' THEN
    -- Can claim and continue streak
    new_streak := current_reward.streak + 1;
    streak_reset_flag := FALSE;
    can_claim := TRUE;
  ELSE
    -- Cannot claim yet (less than 24 hours since last claim)
    RETURN QUERY SELECT 
      FALSE, 
      0, 
      current_reward.streak, 
      FALSE, 
      'Reward already claimed today. Please wait ' || EXTRACT(EPOCH FROM (current_reward.last_claimed + INTERVAL '24 hours' - current_time)) / 3600 || ' hours.'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate reward amount
  calculated_reward := reward_base + (new_streak * 10);
  
  -- Upsert reward record
  INSERT INTO player_rewards (user_id, last_claimed, streak, total_claims, updated_at)
  VALUES (
    claim_daily_reward.user_id,
    current_time,
    new_streak,
    COALESCE(current_reward.total_claims, 0) + 1,
    current_time
  )
  ON CONFLICT (user_id) DO UPDATE SET
    last_claimed = EXCLUDED.last_claimed,
    streak = EXCLUDED.streak,
    total_claims = EXCLUDED.total_claims,
    updated_at = EXCLUDED.updated_at;
  
  RETURN QUERY SELECT 
    TRUE, 
    calculated_reward, 
    new_streak, 
    streak_reset_flag, 
    'Daily reward claimed successfully!'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get reward status
CREATE OR REPLACE FUNCTION get_reward_status(user_id TEXT)
RETURNS TABLE (
  can_claim BOOLEAN,
  reward_amount INTEGER,
  streak INTEGER,
  last_claimed TIMESTAMP WITH TIME ZONE,
  total_claims INTEGER,
  hours_until_next_claim INTEGER
) AS $$
DECLARE
  current_reward RECORD;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
  reward_base INTEGER := 20;
  next_streak INTEGER;
BEGIN
  -- Get current reward data
  SELECT last_claimed, streak, total_claims INTO current_reward
  FROM player_rewards
  WHERE player_rewards.user_id = get_reward_status.user_id;
  
  -- Initialize defaults if no record exists
  IF current_reward.last_claimed IS NULL THEN
    RETURN QUERY SELECT 
      TRUE, 
      reward_base, 
      1, 
      NULL::TIMESTAMP WITH TIME ZONE, 
      0, 
      0;
    RETURN;
  END IF;
  
  -- Calculate next streak and reward
  IF current_reward.last_claimed < current_time - INTERVAL '48 hours' THEN
    next_streak := 1;
  ELSIF current_reward.last_claimed < current_time - INTERVAL '24 hours' THEN
    next_streak := current_reward.streak + 1;
  ELSE
    next_streak := current_reward.streak;
  END IF;
  
  -- Calculate hours until next claim
  DECLARE hours_until INTEGER := 0;
  BEGIN
    hours_until := EXTRACT(EPOCH FROM (current_reward.last_claimed + INTERVAL '24 hours' - current_time)) / 3600;
    IF hours_until < 0 THEN
      hours_until := 0;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    hours_until := 0;
  END;
  
  RETURN QUERY SELECT 
    (current_reward.last_claimed < current_time - INTERVAL '24 hours') as can_claim,
    reward_base + (next_streak * 10) as reward_amount,
    current_reward.streak,
    current_reward.last_claimed,
    current_reward.total_claims,
    hours_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION claim_daily_reward TO authenticated;
GRANT EXECUTE ON FUNCTION get_reward_status TO authenticated;
GRANT ALL ON player_rewards TO authenticated;
GRANT SELECT ON player_rewards TO anon;
