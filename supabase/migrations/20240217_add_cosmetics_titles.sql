-- Create cosmetics table
CREATE TABLE IF NOT EXISTS cosmetics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cosmetic_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('aura', 'frame', 'emoji', 'title')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_cosmetics table
CREATE TABLE IF NOT EXISTS user_cosmetics (
  user_id TEXT NOT NULL,
  cosmetic_key TEXT NOT NULL REFERENCES cosmetics(cosmetic_key),
  owned BOOLEAN NOT NULL DEFAULT false,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, cosmetic_key),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create user_titles table
CREATE TABLE IF NOT EXISTS user_titles (
  user_id TEXT NOT NULL,
  title_key TEXT NOT NULL,
  owned BOOLEAN NOT NULL DEFAULT false,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, title_key),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cosmetics_type ON cosmetics(type);
CREATE INDEX IF NOT EXISTS idx_cosmetics_rarity ON cosmetics(rarity);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_user_id ON user_cosmetics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_owned ON user_cosmetics(user_id, owned);
CREATE INDEX IF NOT EXISTS idx_user_cosmetics_equipped ON user_cosmetics(user_id, equipped);
CREATE INDEX IF NOT EXISTS idx_user_titles_user_id ON user_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_titles_owned ON user_titles(user_id, owned);
CREATE INDEX IF NOT EXISTS idx_user_titles_equipped ON user_titles(user_id, equipped);

-- Insert default cosmetics
INSERT INTO cosmetics (cosmetic_key, name, type, rarity) VALUES
-- Auras
('NEON_AURA', 'Neon Aura', 'aura', 'common'),
('CYBER_AURA', 'Cyber Aura', 'aura', 'rare'),
('PLASMA_AURA', 'Plasma Aura', 'aura', 'epic'),
('QUANTUM_AURA', 'Quantum Aura', 'aura', 'legendary'),
('GALACTIC_AURA', 'Galactic Aura', 'aura', 'legendary'),
('OMEGA_AURA', 'Omega Aura', 'aura', 'legendary'),
('INFINITY_AURA', 'Infinity Aura', 'aura', 'legendary'),

-- Frames
('NEON_FRAME', 'Neon Frame', 'frame', 'common'),
('CYBER_FRAME', 'Cyber Frame', 'frame', 'rare'),
('PLASMA_FRAME', 'Plasma Frame', 'frame', 'epic'),
('QUANTUM_FRAME', 'Quantum Frame', 'frame', 'legendary'),
('GALACTIC_FRAME', 'Galactic Frame', 'frame', 'legendary'),
('OMEGA_FRAME', 'Omega Frame', 'frame', 'legendary'),
('INFINITY_FRAME', 'Infinity Frame', 'frame', 'legendary'),

-- Emojis
('LIGHTNING_EMOJI', '⚡ Lightning', 'emoji', 'common'),
('FIRE_EMOJI', '🔥 Fire', 'emoji', 'common'),
('GEM_EMOJI', '💎 Gem', 'emoji', 'rare'),
('CROWN_EMOJI', '👑 Crown', 'emoji', 'epic'),
('STAR_EMOJI', '🌟 Star', 'emoji', 'rare'),
('ROCKET_EMOJI', '🚀 Rocket', 'emoji', 'epic'),
('DRAGON_EMOJI', '🐉 Dragon', 'emoji', 'legendary'),

-- Titles
('ROOKIE_TITLE', 'Rookie', 'title', 'common'),
('WARRIOR_TITLE', 'Warrior', 'title', 'common'),
('CHAMPION_TITLE', 'Champion', 'title', 'rare'),
('LEGEND_TITLE', 'Legend', 'title', 'epic'),
('MASTER_TITLE', 'Master', 'title', 'epic'),
('GRANDMASTER_TITLE', 'Grandmaster', 'title', 'legendary'),
('IMMORTAL_TITLE', 'Immortal', 'title', 'legendary')
ON CONFLICT (cosmetic_key) DO NOTHING;

-- Create server function to grant cosmetic
CREATE OR REPLACE FUNCTION grant_cosmetic(user_id TEXT, cosmetic_key TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  cosmetic_record RECORD;
  user_cosmetic RECORD;
BEGIN
  -- Check if cosmetic exists
  SELECT * INTO cosmetic_record
  FROM cosmetics
  WHERE cosmetics.cosmetic_key = grant_cosmetic.cosmetic_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      'Cosmetic not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user already owns this cosmetic
  SELECT * INTO user_cosmetic
  FROM user_cosmetics
  WHERE user_cosmetics.user_id = grant_cosmetic.user_id
    AND user_cosmetics.cosmetic_key = grant_cosmetic.cosmetic_key;
  
  IF FOUND AND user_cosmetic.owned THEN
    RETURN QUERY SELECT 
      false, 
      'Cosmetic already owned'::TEXT;
    RETURN;
  END IF;
  
  -- Grant the cosmetic
  INSERT INTO user_cosmetics (user_id, cosmetic_key, owned, acquired_at)
  VALUES (grant_cosmetic.user_id, grant_cosmetic.cosmetic_key, true, NOW())
  ON CONFLICT (user_id, cosmetic_key) 
  DO UPDATE SET 
    owned = true,
    acquired_at = NOW();
  
  RETURN QUERY SELECT 
    true, 
    'Cosmetic granted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to equip cosmetic
CREATE OR REPLACE FUNCTION equip_cosmetic(user_id TEXT, cosmetic_key TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  cosmetic_record RECORD;
  user_cosmetic RECORD;
  old_equipped RECORD;
BEGIN
  -- Check if cosmetic exists
  SELECT * INTO cosmetic_record
  FROM cosmetics
  WHERE cosmetics.cosmetic_key = equip_cosmetic.cosmetic_key;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      'Cosmetic not found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user owns this cosmetic
  SELECT * INTO user_cosmetic
  FROM user_cosmetics
  WHERE user_cosmetics.user_id = equip_cosmetic.user_id
    AND user_cosmetics.cosmetic_key = equip_cosmetic.cosmetic_key;
  
  IF NOT FOUND OR NOT user_cosmetic.owned THEN
    RETURN QUERY SELECT 
      false, 
      'Cosmetic not owned'::TEXT;
    RETURN;
  END IF;
  
  -- Unequip other cosmetics of the same type
  UPDATE user_cosmetics
  SET equipped = false
  WHERE user_id = equip_cosmetic.user_id
    AND cosmetic_key IN (
      SELECT c.cosmetic_key 
      FROM cosmetics c 
      WHERE c.type = cosmetic_record.type
    );
  
  -- Equip the new cosmetic
  UPDATE user_cosmetics
  SET equipped = true
  WHERE user_id = equip_cosmetic.user_id
    AND cosmetic_key = equip_cosmetic.cosmetic_key;
  
  RETURN QUERY SELECT 
    true, 
    'Cosmetic equipped successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to grant title
CREATE OR REPLACE FUNCTION grant_title(user_id TEXT, title_key TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  user_title RECORD;
BEGIN
  -- Check if user already owns this title
  SELECT * INTO user_title
  FROM user_titles
  WHERE user_titles.user_id = grant_title.user_id
    AND user_titles.title_key = grant_title.title_key;
  
  IF FOUND AND user_title.owned THEN
    RETURN QUERY SELECT 
      false, 
      'Title already owned'::TEXT;
    RETURN;
  END IF;
  
  -- Grant the title
  INSERT INTO user_titles (user_id, title_key, owned, acquired_at)
  VALUES (grant_title.user_id, grant_title.title_key, true, NOW())
  ON CONFLICT (user_id, title_key) 
  DO UPDATE SET 
    owned = true,
    acquired_at = NOW();
  
  RETURN QUERY SELECT 
    true, 
    'Title granted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to equip title
CREATE OR REPLACE FUNCTION equip_title(user_id TEXT, title_key TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  user_title RECORD;
BEGIN
  -- Check if user owns this title
  SELECT * INTO user_title
  FROM user_titles
  WHERE user_titles.user_id = equip_title.user_id
    AND user_titles.title_key = equip_title.title_key;
  
  IF NOT FOUND OR NOT user_title.owned THEN
    RETURN QUERY SELECT 
      false, 
      'Title not owned'::TEXT;
    RETURN;
  END IF;
  
  -- Unequip current title
  UPDATE user_titles
  SET equipped = false
  WHERE user_id = equip_title.user_id;
  
  -- Equip the new title
  UPDATE user_titles
  SET equipped = true
  WHERE user_id = equip_title.user_id
    AND title_key = equip_title.title_key;
  
  RETURN QUERY SELECT 
    true, 
    'Title equipped successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id TEXT)
RETURNS TABLE (
  username TEXT,
  equipped_aura TEXT,
  equipped_frame TEXT,
  equipped_emoji TEXT,
  equipped_title TEXT,
  owned_cosmetics JSON,
  owned_titles JSON
) AS $$
DECLARE
  user_record RECORD;
  equipped_cosmetics JSON := '[]'::JSON;
  owned_cosmetics_list JSON := '[]'::JSON;
  owned_titles_list JSON := '[]'::JSON;
BEGIN
  -- Get user info
  SELECT u.username INTO user_record
  FROM users u
  WHERE u.telegram_id = get_user_profile.user_id;
  
  -- Get equipped cosmetics
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'type', c.type,
      'key', c.cosmetic_key,
      'name', c.name,
      'rarity', c.rarity
    )
  ) INTO equipped_cosmetics
  FROM user_cosmetics uc
  JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key
  WHERE uc.user_id = get_user_profile.user_id
    AND uc.equipped = true;
  
  -- Get owned cosmetics
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'key', c.cosmetic_key,
      'name', c.name,
      'type', c.type,
      'rarity', c.rarity,
      'owned', uc.owned,
      'equipped', uc.equipped
    )
  ) INTO owned_cosmetics_list
  FROM user_cosmetics uc
  JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key
  WHERE uc.user_id = get_user_profile.user_id
    AND uc.owned = true;
  
  -- Get owned titles
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'key', ut.title_key,
      'name', REPLACE(ut.title_key, '_TITLE', ''),
      'owned', ut.owned,
      'equipped', ut.equipped
    )
  ) INTO owned_titles_list
  FROM user_titles ut
  WHERE ut.user_id = get_user_profile.user_id
    AND ut.owned = true;
  
  RETURN QUERY SELECT 
    COALESCE(user_record.username, 'Player')::TEXT,
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'aura'), ''::TEXT),
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'frame'), ''::TEXT),
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'emoji'), ''::TEXT),
    COALESCE((SELECT title_key FROM user_titles ut WHERE ut.user_id = get_user_profile.user_id AND ut.equipped = true), ''::TEXT),
    owned_cosmetics_list,
    owned_titles_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get all cosmetics with ownership status
CREATE OR REPLACE FUNCTION get_user_cosmetics(user_id TEXT)
RETURNS TABLE (
  cosmetic_key TEXT,
  name TEXT,
  type TEXT,
  rarity TEXT,
  owned BOOLEAN,
  equipped BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cosmetic_key,
    c.name,
    c.type,
    c.rarity,
    COALESCE(uc.owned, false) as owned,
    COALESCE(uc.equipped, false) as equipped
  FROM cosmetics c
  LEFT JOIN user_cosmetics uc ON 
    uc.cosmetic_key = c.cosmetic_key 
    AND uc.user_id = get_user_cosmetics.user_id
  ORDER BY 
    c.rarity DESC,
    c.type,
    c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get user titles
CREATE OR REPLACE FUNCTION get_user_titles(user_id TEXT)
RETURNS TABLE (
  title_key TEXT,
  name TEXT,
  owned BOOLEAN,
  equipped BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ut.title_key,
    REPLACE(ut.title_key, '_TITLE', '') as name,
    ut.owned,
    ut.equipped
  FROM user_titles ut
  WHERE ut.user_id = get_user_titles.user_id
    AND ut.owned = true
  ORDER BY 
    ut.equipped DESC,
    ut.acquired_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION grant_cosmetic TO authenticated;
GRANT EXECUTE ON FUNCTION equip_cosmetic TO authenticated;
GRANT EXECUTE ON FUNCTION grant_title TO authenticated;
GRANT EXECUTE ON FUNCTION equip_title TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cosmetics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_titles TO authenticated;
GRANT ALL ON cosmetics TO authenticated;
GRANT SELECT ON cosmetics TO anon;
GRANT ALL ON user_cosmetics TO authenticated;
GRANT SELECT ON user_cosmetics TO anon;
GRANT ALL ON user_titles TO authenticated;
GRANT SELECT ON user_titles TO anon;
