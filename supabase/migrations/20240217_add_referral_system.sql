-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  user_id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT UNIQUE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (referrer_user_id) REFERENCES users(telegram_id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- Create server function to get or create referral code
CREATE OR REPLACE FUNCTION get_or_create_referral_code(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  code TEXT,
  message TEXT
) AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Check if user already has a referral code
  SELECT code INTO existing_code
  FROM referral_codes
  WHERE referral_codes.user_id = get_or_create_referral_code.user_id;
  
  IF existing_code IS NOT NULL THEN
    RETURN QUERY SELECT 
      TRUE, 
      existing_code, 
      'Existing referral code returned'::TEXT;
    RETURN;
  END IF;
  
  -- Generate a unique 6-8 character code (A-Z, 0-9)
  LOOP
    new_code := upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 6));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM referral_codes 
      WHERE code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Insert new referral code
  INSERT INTO referral_codes (user_id, code, created_at)
  VALUES (
    get_or_create_referral_code.user_id,
    new_code,
    NOW()
  );
  
  RETURN QUERY SELECT 
    TRUE, 
    new_code, 
    'Referral code created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to register referral
CREATE OR REPLACE FUNCTION register_referral(referral_code TEXT, new_user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  referrer_user_id TEXT,
  message TEXT
) AS $$
DECLARE
  referrer_id TEXT;
  existing_referral BOOLEAN;
  self_referral BOOLEAN;
BEGIN
  -- Find referrer by referral code
  SELECT user_id INTO referrer_id
  FROM referral_codes
  WHERE referral_codes.code = register_referral.referral_code;
  
  IF referrer_id IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL, 
      'Invalid referral code'::TEXT;
    RETURN;
  END IF;
  
  -- Check for self-referral
  IF referrer_id = new_user_id THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL, 
      'Cannot refer yourself'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user already has a referral
  SELECT EXISTS(
    SELECT 1 FROM referrals 
    WHERE referred_user_id = new_user_id
  ) INTO existing_referral;
  
  IF existing_referral THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL, 
      'User already has a referral'::TEXT;
    RETURN;
  END IF;
  
  -- Insert referral record
  INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, created_at, updated_at)
  VALUES (
    referrer_id,
    new_user_id,
    referral_code,
    'pending',
    NOW(),
    NOW()
  );
  
  RETURN QUERY SELECT 
    TRUE, 
    referrer_id, 
    'Referral registered successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to confirm referral and award rewards
CREATE OR REPLACE FUNCTION confirm_referral(new_user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  referrer_gems INTEGER,
  referred_gems INTEGER,
  message TEXT
) AS $$
DECLARE
  referral_record RECORD;
  referrer_gems_before INTEGER;
  referred_gems_before INTEGER;
  referrer_gems_after INTEGER;
  referred_gems_after INTEGER;
BEGIN
  -- Get pending referral for this user
  SELECT id, referrer_user_id INTO referral_record
  FROM referrals
  WHERE referred_user_id = confirm_referral.new_user_id 
    AND status = 'pending'
  LIMIT 1;
  
  IF referral_record IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      0, 
      0, 
      'No pending referral found'::TEXT;
    RETURN;
  END IF;
  
  -- Get current gem balances
  SELECT gems INTO referrer_gems_before
  FROM player_gems
  WHERE user_id = referral_record.referrer_user_id;
  
  SELECT gems INTO referred_gems_before
  FROM player_gems
  WHERE user_id = confirm_referral.new_user_id;
  
  -- Award gems to referrer (50 gems)
  PERFORM add_gems(referral_record.referrer_user_id, 50);
  
  -- Award gems to referred user (25 gems)
  PERFORM add_gems(confirm_referral.new_user_id, 25);
  
  -- Get new gem balances
  SELECT gems INTO referrer_gems_after
  FROM player_gems
  WHERE user_id = referral_record.referrer_user_id;
  
  SELECT gems INTO referred_gems_after
  FROM player_gems
  WHERE user_id = confirm_referral.new_user_id;
  
  -- Update referral status to rewarded
  UPDATE referrals
  SET 
    status = 'rewarded',
    updated_at = NOW()
  WHERE id = referral_record.id;
  
  RETURN QUERY SELECT 
    TRUE, 
    COALESCE(referrer_gems_after, 0), 
    COALESCE(referred_gems_after, 0), 
    'Referral confirmed and rewards awarded'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get referral status
CREATE OR REPLACE FUNCTION get_referral_status(user_id TEXT)
RETURNS TABLE (
  my_code TEXT,
  has_used_code BOOLEAN,
  referrals TABLE (
    referred_username TEXT,
    referred_user_id TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
  )
) AS $$
BEGIN
  -- Get user's referral code
  RETURN QUERY
  SELECT 
    rc.code,
    EXISTS(SELECT 1 FROM referrals WHERE referred_user_id = get_referral_status.user_id),
    NULL -- referrals will be populated below
  FROM referral_codes rc
  WHERE rc.user_id = get_referral_status.user_id;
  
  -- Get user's referrals
  RETURN QUERY
  SELECT 
    COALESCE(u.username, 'Anonymous'),
    r.referred_user_id,
    r.status,
    r.created_at,
    r.updated_at
  FROM referrals r
  LEFT JOIN users u ON r.referred_user_id = u.telegram_id
  WHERE r.referrer_user_id = get_referral_status.user_id
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_or_create_referral_code TO authenticated;
GRANT EXECUTE ON FUNCTION register_referral TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_referral TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_status TO authenticated;
GRANT ALL ON referral_codes TO authenticated;
GRANT SELECT ON referral_codes TO anon;
GRANT ALL ON referrals TO authenticated;
GRANT SELECT ON referrals TO anon;
