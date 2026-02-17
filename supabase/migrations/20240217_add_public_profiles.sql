-- Create public_profiles table
CREATE TABLE IF NOT EXISTS public_profiles (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  bio TEXT,
  country_code TEXT,
  avatar_emoji TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_profiles_username ON public_profiles(username);
CREATE INDEX IF NOT EXISTS idx_public_profiles_is_public ON public_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_public_profiles_country_code ON public_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_public_profiles_created_at ON public_profiles(created_at);

-- Update get_user_profile to include core stats
CREATE OR REPLACE FUNCTION get_user_profile(user_id TEXT)
RETURNS TABLE (
  username TEXT,
  equipped_aura TEXT,
  equipped_frame TEXT,
  equipped_emoji TEXT,
  equipped_title TEXT,
  owned_cosmetics JSON,
  owned_titles JSON,
  total_duels BIGINT,
  wins BIGINT,
  losses BIGINT,
  best_streak BIGINT,
  level BIGINT,
  total_xp BIGINT,
  current_season_tier BIGINT,
  current_season_xp BIGINT,
  total_achievements_unlocked BIGINT,
  total_cosmetics_owned BIGINT
) AS $$
DECLARE
  user_record RECORD;
  equipped_cosmetics JSON := '[]'::JSON;
  owned_cosmetics_list JSON := '[]'::JSON;
  owned_titles_list JSON := '[]'::JSON;
  stats_record RECORD;
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
  
  -- Get core stats
  SELECT 
    COUNT(*) as total_duels,
    COUNT(*) FILTER (WHERE dr.winner_id = get_user_profile.user_id) as wins,
    COUNT(*) FILTER (WHERE dr.winner_id != get_user_profile.user_id) as losses,
    COALESCE(u.best_streak, 0) as best_streak,
    COALESCE(pp.level, 1) as level,
    COALESCE(pp.total_xp, 0) as total_xp,
    COALESCE(bp.current_tier, 1) as current_season_tier,
    COALESCE(bp.season_xp, 0) as current_season_xp,
    COALESCE((SELECT COUNT(*) FROM achievements_progress ap WHERE ap.user_id = get_user_profile.user_id AND ap.completed = true), 0) as total_achievements_unlocked,
    COALESCE((SELECT COUNT(*) FROM user_cosmetics uc WHERE uc.user_id = get_user_profile.user_id AND uc.owned = true), 0) as total_cosmetics_owned
  INTO stats_record
  FROM duel_results dr
  LEFT JOIN users u ON u.telegram_id = get_user_profile.user_id
  LEFT JOIN player_progression pp ON pp.user_id = get_user_profile.user_id
  LEFT JOIN battle_pass_progress bp ON bp.user_id = get_user_profile.user_id AND bp.season_id = (SELECT id FROM seasons WHERE ends_at > NOW() ORDER BY created_at DESC LIMIT 1);
  
  RETURN QUERY SELECT 
    COALESCE(user_record.username, 'Player')::TEXT,
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'aura'), ''::TEXT),
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'frame'), ''::TEXT),
    COALESCE((SELECT cosmetic_key FROM user_cosmetics uc JOIN cosmetics c ON uc.cosmetic_key = c.cosmetic_key WHERE uc.user_id = get_user_profile.user_id AND uc.equipped = true AND c.type = 'emoji'), ''::TEXT),
    COALESCE((SELECT title_key FROM user_titles ut WHERE ut.user_id = get_user_profile.user_id AND ut.equipped = true), ''::TEXT),
    owned_cosmetics_list,
    owned_titles_list,
    COALESCE(stats_record.total_duels, 0),
    COALESCE(stats_record.wins, 0),
    COALESCE(stats_record.losses, 0),
    COALESCE(stats_record.best_streak, 0),
    COALESCE(stats_record.level, 1),
    COALESCE(stats_record.total_xp, 0),
    COALESCE(stats_record.current_season_tier, 1),
    COALESCE(stats_record.current_season_xp, 0),
    COALESCE(stats_record.total_achievements_unlocked, 0),
    COALESCE(stats_record.total_cosmetics_owned, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get public profile by user ID
CREATE OR REPLACE FUNCTION get_public_profile_by_id(p_user_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  bio TEXT,
  country_code TEXT,
  avatar_emoji TEXT,
  is_public BOOLEAN,
  equipped_aura TEXT,
  equipped_frame TEXT,
  equipped_emoji TEXT,
  equipped_title TEXT,
  total_duels BIGINT,
  wins BIGINT,
  losses BIGINT,
  best_streak BIGINT,
  level BIGINT,
  total_xp BIGINT,
  current_season_tier BIGINT,
  current_season_xp BIGINT,
  total_achievements_unlocked BIGINT,
  total_cosmetics_owned BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  profile_record RECORD;
  profile_data RECORD;
BEGIN
  -- Get public profile
  SELECT * INTO profile_record
  FROM public_profiles pp
  WHERE pp.user_id = get_public_profile_by_id.p_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TEXT, false::BOOLEAN,
      ''::TEXT, ''::TEXT, ''::TEXT, ''::TEXT, 0::BIGINT, 0::BIGINT, 0::BIGINT,
      0::BIGINT, 1::BIGINT, 0::BIGINT, 1::BIGINT, 0::BIGINT, 0::BIGINT,
      0::BIGINT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Get profile data using get_user_profile
  SELECT * INTO profile_data
  FROM get_user_profile(get_public_profile_by_id.p_user_id)
  LIMIT 1;
  
  RETURN QUERY SELECT 
    profile_record.user_id,
    profile_record.username,
    profile_record.bio,
    profile_record.country_code,
    profile_record.avatar_emoji,
    profile_record.is_public,
    COALESCE(profile_data.equipped_aura, ''),
    COALESCE(profile_data.equipped_frame, ''),
    COALESCE(profile_data.equipped_emoji, ''),
    COALESCE(profile_data.equipped_title, ''),
    COALESCE(profile_data.total_duels, 0),
    COALESCE(profile_data.wins, 0),
    COALESCE(profile_data.losses, 0),
    COALESCE(profile_data.best_streak, 0),
    COALESCE(profile_data.level, 1),
    COALESCE(profile_data.total_xp, 0),
    COALESCE(profile_data.current_season_tier, 1),
    COALESCE(profile_data.current_season_xp, 0),
    COALESCE(profile_data.total_achievements_unlocked, 0),
    COALESCE(profile_data.total_cosmetics_owned, 0),
    profile_record.created_at,
    profile_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get public profile by username
CREATE OR REPLACE FUNCTION get_public_profile_by_username(p_username TEXT)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  bio TEXT,
  country_code TEXT,
  avatar_emoji TEXT,
  is_public BOOLEAN,
  equipped_aura TEXT,
  equipped_frame TEXT,
  equipped_emoji TEXT,
  equipped_title TEXT,
  total_duels BIGINT,
  wins BIGINT,
  losses BIGINT,
  best_streak BIGINT,
  level BIGINT,
  total_xp BIGINT,
  current_season_tier BIGINT,
  current_season_xp BIGINT,
  total_achievements_unlocked BIGINT,
  total_cosmetics_owned BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM get_public_profile_by_id(pp.user_id)
  FROM public_profiles pp
  WHERE pp.username = get_public_profile_by_username.p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to search public profiles
CREATE OR REPLACE FUNCTION search_public_profiles(p_query TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  bio TEXT,
  country_code TEXT,
  avatar_emoji TEXT,
  is_public BOOLEAN,
  level BIGINT,
  total_duels BIGINT,
  wins BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id,
    pp.username,
    pp.bio,
    pp.country_code,
    pp.avatar_emoji,
    pp.is_public,
    COALESCE(pp_data.level, 1),
    COALESCE(pp_data.total_duels, 0),
    COALESCE(pp_data.wins, 0),
    pp.created_at
  FROM public_profiles pp
  LEFT JOIN get_user_profile(pp.user_id) pp_data ON true
  WHERE pp.is_public = true
    AND (
      LOWER(pp.username) ILIKE '%' || LOWER(p_query) || '%'
      OR LOWER(pp.bio) ILIKE '%' || LOWER(p_query) || '%'
    )
  ORDER BY 
    pp_data.total_duels DESC,
    pp_data.level DESC,
    pp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to update public profile
CREATE OR REPLACE FUNCTION update_public_profile(
  p_user_id TEXT,
  p_username TEXT,
  p_bio TEXT DEFAULT NULL,
  p_country_code TEXT DEFAULT NULL,
  p_avatar_emoji TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  existing_profile RECORD;
  username_taken BOOLEAN;
BEGIN
  -- Check if username is taken by another user
  SELECT EXISTS(
    SELECT 1 FROM public_profiles pp 
    WHERE pp.username = p_username 
    AND pp.user_id != p_user_id
  ) INTO username_taken;
  
  IF username_taken THEN
    RETURN QUERY SELECT 
      false, 
      'Username already taken'::TEXT;
    RETURN;
  END IF;
  
  -- Check if profile exists
  SELECT * INTO existing_profile
  FROM public_profiles pp
  WHERE pp.user_id = p_user_id;
  
  IF FOUND THEN
    -- Update existing profile
    UPDATE public_profiles
    SET 
      username = p_username,
      bio = p_bio,
      country_code = p_country_code,
      avatar_emoji = p_avatar_emoji,
      is_public = p_is_public,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Create new profile
    INSERT INTO public_profiles (
      user_id, username, bio, country_code, avatar_emoji, is_public
    ) VALUES (
      p_user_id, p_username, p_bio, p_country_code, p_avatar_emoji, p_is_public
    );
  END IF;
  
  -- Also update users table username
  UPDATE users
  SET username = p_username
  WHERE telegram_id = p_user_id;
  
  RETURN QUERY SELECT 
    true, 
    'Profile updated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get my public profile
CREATE OR REPLACE FUNCTION get_my_public_profile(p_user_id TEXT)
RETURNS TABLE (
  user_id TEXT,
  username TEXT,
  bio TEXT,
  country_code TEXT,
  avatar_emoji TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id,
    pp.username,
    pp.bio,
    pp.country_code,
    pp.avatar_emoji,
    pp.is_public,
    pp.created_at,
    pp.updated_at
  FROM public_profiles pp
  WHERE pp.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_public_profile_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_profile_by_username TO authenticated;
GRANT EXECUTE ON FUNCTION search_public_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION update_public_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_public_profile TO authenticated;
GRANT ALL ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;
