-- Create seasonal_events table
CREATE TABLE IF NOT EXISTS seasonal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  multiplier_xp NUMERIC DEFAULT 1.0,
  multiplier_gems NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasonal_event_participation table
CREATE TABLE IF NOT EXISTS seasonal_event_participation (
  user_id TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES seasonal_events(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active ON seasonal_events(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_event_key ON seasonal_events(event_key);
CREATE INDEX IF NOT EXISTS idx_seasonal_event_participation_user_id ON seasonal_event_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_event_participation_event_id ON seasonal_event_participation(event_id);

-- Insert sample seasonal events
INSERT INTO seasonal_events (event_key, name, description, starts_at, ends_at, multiplier_xp, multiplier_gems) VALUES
('XP_WEEKEND', 'XP Weekend', 'Double XP all weekend long! Complete duels and missions for maximum rewards.', 
 '2026-01-17 00:00:00 UTC', '2026-01-19 23:59:59 UTC', 2.0, 1.0),
('DOUBLE_GEMS_DAY', 'Double Gems Day', 'Earn double gems from all activities today!', 
 '2026-01-15 00:00:00 UTC', '2026-01-15 23:59:59 UTC', 1.0, 2.0),
('MEGA_WEEKEND', 'Mega Weekend', 'Triple XP and Double Gems - The ultimate bonus weekend!', 
 '2026-01-24 00:00:00 UTC', '2026-01-26 23:59:59 UTC', 3.0, 2.0),
('NEW_PLAYER_BOOST', 'New Player Boost', 'Extra rewards for new players joining the game!', 
 '2026-01-01 00:00:00 UTC', '2026-01-31 23:59:59 UTC', 1.5, 1.5),
('ANNIVERSARY_EVENT', 'Anniversary Celebration', 'Celebrate with massive XP and gem bonuses!', 
 '2026-02-14 00:00:00 UTC', '2026-02-16 23:59:59 UTC', 2.5, 2.5)
ON CONFLICT (event_key) DO NOTHING;

-- Create server function to get active events
CREATE OR REPLACE FUNCTION get_active_events()
RETURNS TABLE (
  id UUID,
  event_key TEXT,
  name TEXT,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  multiplier_xp NUMERIC,
  multiplier_gems NUMERIC,
  time_remaining INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.event_key,
    e.name,
    e.description,
    e.starts_at,
    e.ends_at,
    e.multiplier_xp,
    e.multiplier_gems,
    (e.ends_at - NOW()) as time_remaining
  FROM seasonal_events e
  WHERE e.starts_at <= NOW() 
    AND e.ends_at >= NOW()
  ORDER BY e.ends_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to apply event multipliers
CREATE OR REPLACE FUNCTION apply_event_multipliers(user_id TEXT, base_xp INTEGER, base_gems INTEGER)
RETURNS TABLE (
  multiplied_xp INTEGER,
  multiplied_gems INTEGER,
  total_xp_multiplier NUMERIC,
  total_gems_multiplier NUMERIC
) AS $$
DECLARE
  total_xp_multiplier NUMERIC := 1.0;
  total_gems_multiplier NUMERIC := 1.0;
BEGIN
  -- Calculate total XP multiplier from active events
  SELECT COALESCE(SUM(e.multiplier_xp), 1.0) INTO total_xp_multiplier
  FROM seasonal_events e
  WHERE e.starts_at <= NOW() 
    AND e.ends_at >= NOW();
  
  -- Calculate total Gems multiplier from active events
  SELECT COALESCE(SUM(e.multiplier_gems), 1.0) INTO total_gems_multiplier
  FROM seasonal_events e
  WHERE e.starts_at <= NOW() 
    AND e.ends_at >= NOW();
  
  RETURN QUERY SELECT 
    ROUND(base_xp * total_xp_multiplier)::INTEGER,
    ROUND(base_gems * total_gems_multiplier)::INTEGER,
    total_xp_multiplier,
    total_gems_multiplier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to update event progress
CREATE OR REPLACE FUNCTION update_event_progress(user_id TEXT, event_key TEXT, increment INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_progress INTEGER,
  message TEXT
) AS $$
DECLARE
  event_record RECORD;
  participation RECORD;
  new_progress INTEGER;
BEGIN
  -- Get the event
  SELECT * INTO event_record
  FROM seasonal_events
  WHERE seasonal_events.event_key = update_event_progress.event_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Event not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if event is active
  IF event_record.starts_at > NOW() OR event_record.ends_at < NOW() THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      'Event is not active'::TEXT;
    RETURN;
  END IF;
  
  -- Get or create participation record
  SELECT * INTO participation
  FROM seasonal_event_participation
  WHERE seasonal_event_participation.user_id = update_event_progress.user_id
    AND seasonal_event_participation.event_id = event_record.id;
  
  IF NOT FOUND THEN
    -- Create new participation record
    INSERT INTO seasonal_event_participation (user_id, event_id, progress)
    VALUES (update_event_progress.user_id, event_record.id, increment)
    RETURNING * INTO participation;
    
    new_progress := increment;
  ELSE
    -- Update existing progress
    new_progress := participation.progress + increment;
    UPDATE seasonal_event_participation
    SET progress = new_progress, updated_at = NOW()
    WHERE user_id = update_event_progress.user_id
      AND event_id = event_record.id;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    new_progress, 
    'Event progress updated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to claim event reward
CREATE OR REPLACE FUNCTION claim_event_reward(user_id TEXT, event_key TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reward_xp INTEGER,
  reward_gems INTEGER,
  message TEXT
) AS $$
DECLARE
  event_record RECORD;
  participation RECORD;
  reward_xp INTEGER;
  reward_gems INTEGER;
BEGIN
  -- Get the event
  SELECT * INTO event_record
  FROM seasonal_events
  WHERE seasonal_events.event_key = claim_event_reward.event_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      0, 
      'Event not found'::TEXT;
    RETURN;
  END IF;
  
  -- Get participation record
  SELECT * INTO participation
  FROM seasonal_event_participation
  WHERE seasonal_event_participation.user_id = claim_event_reward.user_id
    AND seasonal_event_participation.event_id = event_record.id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      0, 
      'No participation found'::TEXT;
    RETURN;
  END IF;
  
  IF participation.claimed THEN
    RETURN QUERY SELECT 
      false, 
      0, 
      0, 
      'Reward already claimed'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate rewards based on event type and progress
  IF event_record.event_key = 'XP_WEEKEND' THEN
    reward_xp := participation.progress * 100; -- 100 XP per progress point
    reward_gems := 0;
  ELSIF event_record.event_key = 'DOUBLE_GEMS_DAY' THEN
    reward_xp := 0;
    reward_gems := participation.progress * 50; -- 50 gems per progress point
  ELSIF event_record.event_key = 'MEGA_WEEKEND' THEN
    reward_xp := participation.progress * 150; -- 150 XP per progress point
    reward_gems := participation.progress * 75; -- 75 gems per progress point
  ELSIF event_record.event_key = 'NEW_PLAYER_BOOST' THEN
    reward_xp := participation.progress * 80; -- 80 XP per progress point
    reward_gems := participation.progress * 40; -- 40 gems per progress point
  ELSIF event_record.event_key = 'ANNIVERSARY_EVENT' THEN
    reward_xp := participation.progress * 200; -- 200 XP per progress point
    reward_gems := participation.progress * 100; -- 100 gems per progress point
  ELSE
    -- Default rewards
    reward_xp := participation.progress * 50;
    reward_gems := participation.progress * 25;
  END IF;
  
  -- Award rewards
  IF reward_xp > 0 THEN
    PERFORM award_xp(claim_event_reward.user_id, reward_xp);
  END IF;
  
  IF reward_gems > 0 THEN
    PERFORM add_gems(claim_event_reward.user_id, reward_gems);
  END IF;
  
  -- Mark as claimed
  UPDATE seasonal_event_participation
  SET claimed = true, updated_at = NOW()
  WHERE user_id = claim_event_reward.user_id
    AND event_id = event_record.id;
  
  RETURN QUERY SELECT 
    true, 
    reward_xp, 
    reward_gems, 
    'Event reward claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get user event participation
CREATE OR REPLACE FUNCTION get_user_event_participation(user_id TEXT)
RETURNS TABLE (
  event_id UUID,
  event_key TEXT,
  name TEXT,
  description TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  multiplier_xp NUMERIC,
  multiplier_gems NUMERIC,
  progress INTEGER,
  claimed BOOLEAN,
  is_active BOOLEAN,
  time_remaining INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.event_key,
    e.name,
    e.description,
    e.starts_at,
    e.ends_at,
    e.multiplier_xp,
    e.multiplier_gems,
    COALESCE(p.progress, 0) as progress,
    COALESCE(p.claimed, false) as claimed,
    (e.starts_at <= NOW() AND e.ends_at >= NOW()) as is_active,
    CASE 
      WHEN e.ends_at >= NOW() THEN (e.ends_at - NOW())
      ELSE INTERVAL '0 seconds'
    END as time_remaining
  FROM seasonal_events e
  LEFT JOIN seasonal_event_participation p ON 
    p.event_id = e.id 
    AND p.user_id = get_user_event_participation.user_id
  ORDER BY 
    (e.starts_at <= NOW() AND e.ends_at >= NOW()) DESC,
    e.ends_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get active multipliers for user
CREATE OR REPLACE FUNCTION get_active_multipliers(user_id TEXT)
RETURNS TABLE (
  total_xp_multiplier NUMERIC,
  total_gems_multiplier NUMERIC,
  active_event_keys TEXT[]
) AS $$
DECLARE
  total_xp_multiplier NUMERIC := 1.0;
  total_gems_multiplier NUMERIC := 1.0;
  active_event_keys TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Calculate multipliers from active events
  SELECT 
    COALESCE(SUM(e.multiplier_xp), 1.0),
    COALESCE(SUM(e.multiplier_gems), 1.0),
    ARRAY_AGG(e.event_key)
  INTO total_xp_multiplier, total_gems_multiplier, active_event_keys
  FROM seasonal_events e
  WHERE e.starts_at <= NOW() 
    AND e.ends_at >= NOW();
  
  RETURN QUERY SELECT 
    total_xp_multiplier,
    total_gems_multiplier,
    COALESCE(active_event_keys, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_active_events TO authenticated;
GRANT EXECUTE ON FUNCTION apply_event_multipliers TO authenticated;
GRANT EXECUTE ON FUNCTION update_event_progress TO authenticated;
GRANT EXECUTE ON FUNCTION claim_event_reward TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_event_participation TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_multipliers TO authenticated;
GRANT ALL ON seasonal_events TO authenticated;
GRANT SELECT ON seasonal_events TO anon;
GRANT ALL ON seasonal_event_participation TO authenticated;
GRANT SELECT ON seasonal_event_participation TO anon;
