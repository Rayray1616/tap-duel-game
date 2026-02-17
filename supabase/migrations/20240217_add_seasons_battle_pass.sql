-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create battle_pass_tracks table
CREATE TABLE IF NOT EXISTS battle_pass_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL,
  track_type TEXT NOT NULL CHECK (track_type IN ('free', 'premium')),
  required_xp INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('gems', 'cosmetic', 'title', 'emoji')),
  reward_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (season_id, tier, track_type)
);

-- Create battle_pass_progress table
CREATE TABLE IF NOT EXISTS battle_pass_progress (
  user_id TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  season_xp INTEGER NOT NULL DEFAULT 0,
  current_tier INTEGER NOT NULL DEFAULT 0,
  premium_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, season_id)
);

-- Create battle_pass_claims table
CREATE TABLE IF NOT EXISTS battle_pass_claims (
  user_id TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL,
  track_type TEXT NOT NULL CHECK (track_type IN ('free', 'premium')),
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, season_id, tier, track_type),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seasons_season_key ON seasons(season_key);
CREATE INDEX IF NOT EXISTS idx_seasons_active ON seasons(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_battle_pass_tracks_season_id ON battle_pass_tracks(season_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_tracks_tier ON battle_pass_tracks(tier);
CREATE INDEX IF NOT EXISTS idx_battle_pass_progress_user_id ON battle_pass_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_progress_season_id ON battle_pass_progress(season_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_claims_user_id ON battle_pass_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_claims_season_id ON battle_pass_claims(season_id);

-- Insert sample season data
INSERT INTO seasons (season_key, name, starts_at, ends_at) VALUES
('S1', 'Season 1: Cyber Genesis', '2026-01-01 00:00:00 UTC', '2026-03-31 23:59:59 UTC'),
('S2', 'Season 2: Neon Rising', '2026-04-01 00:00:00 UTC', '2026-06-30 23:59:59 UTC')
ON CONFLICT (season_key) DO NOTHING;

-- Insert sample battle pass tracks for Season 1
INSERT INTO battle_pass_tracks (season_id, tier, track_type, required_xp, reward_type, reward_value)
SELECT 
  s.id,
  t.tier,
  t.track_type,
  t.required_xp,
  t.reward_type,
  t.reward_value
FROM seasons s, (
  -- Free track rewards
  VALUES 
    ('S1', 1, 'free', 0, 'gems', '10'),
    ('S1', 2, 'free', 100, 'gems', '15'),
    ('S1', 3, 'free', 250, 'gems', '20'),
    ('S1', 4, 'free', 500, 'gems', '25'),
    ('S1', 5, 'free', 1000, 'gems', '30'),
    ('S1', 6, 'free', 1500, 'gems', '35'),
    ('S1', 7, 'free', 2500, 'gems', '40'),
    ('S1', 8, 'free', 4000, 'gems', '45'),
    ('S1', 9, 'free', 6000, 'gems', '50'),
    ('S1', 10, 'free', 8500, 'gems', '60'),
    ('S1', 11, 'free', 11500, 'gems', '70'),
    ('S1', 12, 'free', 15000, 'gems', '80'),
    ('S1', 13, 'free', 19000, 'gems', '90'),
    ('S1', 14, 'free', 23500, 'gems', '100'),
    ('S1', 15, 'free', 28500, 'gems', '120'),
    ('S1', 16, 'free', 34000, 'gems', '140'),
    ('S1', 17, 'free', 40000, 'gems', '160'),
    ('S1', 18, 'free', 46500, 'gems', '180'),
    ('S1', 19, 'free', 53500, 'gems', '200'),
    ('S1', 20, 'free', 61000, 'gems', '250'),
    ('S1', 21, 'free', 69000, 'gems', '300'),
    ('S1', 22, 'free', 77500, 'gems', '350'),
    ('S1', 23, 'free', 86500, 'gems', '400'),
    ('S1', 24, 'free', 96000, 'gems', '450'),
    ('S1', 25, 'free', 106000, 'gems', '500'),
    ('S1', 26, 'free', 116500, 'gems', '550'),
    ('S1', 27, 'free', 127500, 'gems', '600'),
    ('S1', 28, 'free', 139000, 'gems', '650'),
    ('S1', 29, 'free', 151000, 'gems', '700'),
    ('S1', 30, 'free', 163500, 'gems', '800'),
    
    -- Premium track rewards
    ('S1', 1, 'premium', 0, 'cosmetic', 'NEON_AURA'),
    ('S1', 2, 'premium', 100, 'gems', '25'),
    ('S1', 3, 'premium', 250, 'title', 'ROOKIE_DUELIST'),
    ('S1', 4, 'premium', 500, 'gems', '40'),
    ('S1', 5, 'premium', 1000, 'cosmetic', 'CYBER_FRAME'),
    ('S1', 6, 'premium', 1500, 'gems', '55'),
    ('S1', 7, 'premium', 2500, 'emoji', '⚡'),
    ('S1', 8, 'premium', 4000, 'gems', '70'),
    ('S1', 9, 'premium', 6000, 'title', 'NEON_WARRIOR'),
    ('S1', 10, 'premium', 8500, 'cosmetic', 'PLASMA_EFFECT'),
    ('S1', 11, 'premium', 11500, 'gems', '100'),
    ('S1', 12, 'premium', 15000, 'title', 'ELITE_FIGHTER'),
    ('S1', 13, 'premium', 19000, 'emoji', '🔥'),
    ('S1', 14, 'premium', 23500, 'gems', '130'),
    ('S1', 15, 'premium', 28500, 'cosmetic', 'QUANTUM_AURA'),
    ('S1', 16, 'premium', 34000, 'title', 'MASTER_DUELIST'),
    ('S1', 17, 'premium', 40000, 'gems', '160'),
    ('S1', 18, 'premium', 46500, 'emoji', '💎'),
    ('S1', 19, 'premium', 53500, 'cosmetic', 'GALACTIC_FRAME'),
    ('S1', 20, 'premium', 61000, 'title', 'LEGENDARY_CHAMPION'),
    ('S1', 21, 'premium', 69000, 'gems', '200'),
    ('S1', 22, 'premium', 77500, 'emoji', '👑'),
    ('S1', 23, 'premium', 86500, 'cosmetic', 'OMEGA_AURA'),
    ('S1', 24, 'premium', 96000, 'title', 'IMMORTAL_DUELIST'),
    ('S1', 25, 'premium', 106000, 'gems', '250'),
    ('S1', 26, 'premium', 116500, 'emoji', '🌟'),
    ('S1', 27, 'premium', 127500, 'cosmetic', 'COSMIC_FRAME'),
    ('S1', 28, 'premium', 139000, 'title', 'TRANSCENDENT_MASTER'),
    ('S1', 29, 'premium', 151000, 'gems', '300'),
    ('S1', 30, 'premium', 163500, 'cosmetic', 'INFINITY_AURA')
) t
WHERE s.season_key = t.season_key
ON CONFLICT (season_id, tier, track_type) DO NOTHING;

-- Create server function to get current season
CREATE OR REPLACE FUNCTION get_current_season()
RETURNS TABLE (
  id UUID,
  season_key TEXT,
  name TEXT,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.season_key,
    s.name,
    s.starts_at,
    s.ends_at
  FROM seasons s
  WHERE s.starts_at <= NOW() 
    AND s.ends_at >= NOW()
  ORDER BY s.starts_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get or create battle pass progress
CREATE OR REPLACE FUNCTION get_or_create_battle_pass_progress(user_id TEXT, season_id UUID)
RETURNS TABLE (
  season_xp INTEGER,
  current_tier INTEGER,
  premium_unlocked BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  progress RECORD;
BEGIN
  -- Try to get existing progress
  SELECT * INTO progress
  FROM battle_pass_progress
  WHERE battle_pass_progress.user_id = get_or_create_battle_pass_progress.user_id
    AND battle_pass_progress.season_id = get_or_create_battle_pass_progress.season_id;
  
  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO battle_pass_progress (user_id, season_id, season_xp, current_tier, premium_unlocked)
    VALUES (
      get_or_create_battle_pass_progress.user_id,
      get_or_create_battle_pass_progress.season_id,
      0,
      0,
      false
    )
    RETURNING * INTO progress;
  END IF;
  
  RETURN QUERY SELECT 
    progress.season_xp,
    progress.current_tier,
    progress.premium_unlocked,
    progress.created_at,
    progress.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to add battle pass XP
CREATE OR REPLACE FUNCTION add_battle_pass_xp(user_id TEXT, season_id UUID, xp_amount INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_season_xp INTEGER,
  new_tier INTEGER,
  tier_up BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_progress RECORD;
  new_season_xp INTEGER;
  new_tier INTEGER;
  tier_up BOOLEAN;
  required_xp INTEGER;
BEGIN
  -- Get current progress
  SELECT * INTO current_progress
  FROM battle_pass_progress
  WHERE battle_pass_progress.user_id = add_battle_pass_xp.user_id
    AND battle_pass_progress.season_id = add_battle_pass_xp.season_id;
  
  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO battle_pass_progress (user_id, season_id, season_xp, current_tier, premium_unlocked)
    VALUES (add_battle_pass_xp.user_id, add_battle_pass_xp.season_id, xp_amount, 0, false)
    RETURNING * INTO current_progress;
    
    new_season_xp := xp_amount;
    new_tier := 0;
    tier_up := false;
  ELSE
    -- Update XP
    new_season_xp := current_progress.season_xp + xp_amount;
    UPDATE battle_pass_progress
    SET season_xp = new_season_xp, updated_at = NOW()
    WHERE user_id = add_battle_pass_xp.user_id
      AND season_id = add_battle_pass_xp.season_id;
    
    -- Calculate new tier
    SELECT COALESCE(MAX(tier), 0) INTO new_tier
    FROM battle_pass_tracks
    WHERE season_id = add_battle_pass_xp.season_id
      AND required_xp <= new_season_xp;
    
    tier_up := new_tier > current_progress.current_tier;
    
    -- Update tier if increased
    IF tier_up THEN
      UPDATE battle_pass_progress
      SET current_tier = new_tier, updated_at = NOW()
      WHERE user_id = add_battle_pass_xp.user_id
        AND season_id = add_battle_pass_xp.season_id;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    true,
    new_season_xp,
    new_tier,
    tier_up,
    'Battle Pass XP added successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to unlock premium battle pass
CREATE OR REPLACE FUNCTION unlock_premium_battle_pass(user_id TEXT, season_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  current_progress RECORD;
BEGIN
  -- Get current progress
  SELECT * INTO current_progress
  FROM battle_pass_progress
  WHERE battle_pass_progress.user_id = unlock_premium_battle_pass.user_id
    AND battle_pass_progress.season_id = unlock_premium_battle_pass.season_id;
  
  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO battle_pass_progress (user_id, season_id, season_xp, current_tier, premium_unlocked)
    VALUES (unlock_premium_battle_pass.user_id, unlock_premium_battle_pass.season_id, 0, 0, true)
    RETURNING * INTO current_progress;
  ELSIF current_progress.premium_unlocked THEN
    RETURN QUERY SELECT 
      false, 
      'Premium already unlocked'::TEXT;
    RETURN;
  ELSE
    -- Update premium status
    UPDATE battle_pass_progress
    SET premium_unlocked = true, updated_at = NOW()
    WHERE user_id = unlock_premium_battle_pass.user_id
      AND season_id = unlock_premium_battle_pass.season_id;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    'Premium Battle Pass unlocked successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to claim battle pass reward
CREATE OR REPLACE FUNCTION claim_battle_pass_reward(user_id TEXT, season_id UUID, tier INTEGER, track_type TEXT)
RETURNS TABLE (
  success BOOLEAN,
  reward_type TEXT,
  reward_value TEXT,
  message TEXT
) AS $$
DECLARE
  track RECORD;
  claim RECORD;
  current_progress RECORD;
BEGIN
  -- Check if track exists
  SELECT * INTO track
  FROM battle_pass_tracks
  WHERE battle_pass_tracks.season_id = claim_battle_pass_reward.season_id
    AND battle_pass_tracks.tier = claim_battle_pass_reward.tier
    AND battle_pass_tracks.track_type = claim_battle_pass_reward.track_type;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      '', 
      '', 
      'Battle Pass track not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if already claimed
  SELECT * INTO claim
  FROM battle_pass_claims
  WHERE battle_pass_claims.user_id = claim_battle_pass_reward.user_id
    AND battle_pass_claims.season_id = claim_battle_pass_reward.season_id
    AND battle_pass_claims.tier = claim_battle_pass_reward.tier
    AND battle_pass_claims.track_type = claim_battle_pass_reward.track_type;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      false, 
      '', 
      '', 
      'Reward already claimed'::TEXT;
    RETURN;
  END IF;
  
  -- Get user progress to check eligibility
  SELECT * INTO current_progress
  FROM battle_pass_progress
  WHERE battle_pass_progress.user_id = claim_battle_pass_reward.user_id
    AND battle_pass_progress.season_id = claim_battle_pass_reward.season_id;
  
  -- Check if user has reached required tier
  IF current_progress.current_tier < claim_battle_pass_reward.tier THEN
    RETURN QUERY SELECT 
      false, 
      '', 
      '', 
      'Tier not reached'::TEXT;
    RETURN;
  END IF;
  
  -- Check if premium track requires premium unlock
  IF track.track_type = 'premium' AND NOT current_progress.premium_unlocked THEN
    RETURN QUERY SELECT 
      false, 
      '', 
      '', 
      'Premium Battle Pass required'::TEXT;
    RETURN;
  END IF;
  
  -- Award reward based on type
  IF track.reward_type = 'gems' THEN
    PERFORM add_gems(claim_battle_pass_reward.user_id, CAST(track.reward_value AS INTEGER));
  END IF;
  
  -- Mark as claimed
  INSERT INTO battle_pass_claims (user_id, season_id, tier, track_type)
  VALUES (
    claim_battle_pass_reward.user_id,
    claim_battle_pass_reward.season_id,
    claim_battle_pass_reward.tier,
    claim_battle_pass_reward.track_type
  );
  
  RETURN QUERY SELECT 
    true, 
    track.reward_type, 
    track.reward_value, 
    'Reward claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get battle pass tracks with claim status
CREATE OR REPLACE FUNCTION get_battle_pass_tracks(user_id TEXT, season_id UUID)
RETURNS TABLE (
  tier INTEGER,
  track_type TEXT,
  required_xp INTEGER,
  reward_type TEXT,
  reward_value TEXT,
  claimed BOOLEAN,
  eligible BOOLEAN,
  locked BOOLEAN
) AS $$
DECLARE
  current_progress RECORD;
BEGIN
  -- Get user progress
  SELECT * INTO current_progress
  FROM battle_pass_progress
  WHERE battle_pass_progress.user_id = get_battle_pass_tracks.user_id
    AND battle_pass_progress.season_id = get_battle_pass_tracks.season_id;
  
  -- Return tracks with claim status
  RETURN QUERY
  SELECT 
    t.tier,
    t.track_type,
    t.required_xp,
    t.reward_type,
    t.reward_value,
    (c.user_id IS NOT NULL) AS claimed,
    (current_progress.current_tier >= t.tier) AS eligible,
    (t.track_type = 'premium' AND NOT current_progress.premium_unlocked) AS locked
  FROM battle_pass_tracks t
  LEFT JOIN battle_pass_claims c ON 
    c.user_id = get_battle_pass_tracks.user_id 
    AND c.season_id = get_battle_pass_tracks.season_id 
    AND c.tier = t.tier 
    AND c.track_type = t.track_type
  WHERE t.season_id = get_battle_pass_tracks.season_id
  ORDER BY t.tier, t.track_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_current_season TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_battle_pass_progress TO authenticated;
GRANT EXECUTE ON FUNCTION add_battle_pass_xp TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_premium_battle_pass TO authenticated;
GRANT EXECUTE ON FUNCTION claim_battle_pass_reward TO authenticated;
GRANT EXECUTE ON FUNCTION get_battle_pass_tracks TO authenticated;
GRANT ALL ON seasons TO authenticated;
GRANT SELECT ON seasons TO anon;
GRANT ALL ON battle_pass_tracks TO authenticated;
GRANT SELECT ON battle_pass_tracks TO anon;
GRANT ALL ON battle_pass_progress TO authenticated;
GRANT SELECT ON battle_pass_progress TO anon;
GRANT ALL ON battle_pass_claims TO authenticated;
GRANT SELECT ON battle_pass_claims TO anon;
