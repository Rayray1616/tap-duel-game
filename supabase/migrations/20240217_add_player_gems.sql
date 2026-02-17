-- Create player_gems table
CREATE TABLE IF NOT EXISTS player_gems (
  user_id TEXT PRIMARY KEY,
  gems INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_gems_user_id ON player_gems(user_id);
CREATE INDEX IF NOT EXISTS idx_player_gems_gems ON player_gems(gems DESC);

-- Create server function to add gems
CREATE OR REPLACE FUNCTION add_gems(user_id TEXT, amount INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_total INTEGER,
  message TEXT
) AS $$
DECLARE
  current_gems RECORD;
  new_total_gems INTEGER;
BEGIN
  -- Get current gems
  SELECT gems INTO current_gems
  FROM player_gems
  WHERE player_gems.user_id = add_gems.user_id;
  
  -- Initialize if no record exists
  IF current_gems IS NULL THEN
    new_total_gems := amount;
    
    -- Insert new record
    INSERT INTO player_gems (user_id, gems, updated_at)
    VALUES (
      add_gems.user_id,
      new_total_gems,
      NOW()
    );
  ELSE
    -- Add to existing gems
    new_total_gems := current_gems.gems + amount;
    
    -- Update existing record
    UPDATE player_gems
    SET gems = new_total_gems, updated_at = NOW()
    WHERE user_id = add_gems.user_id;
  END IF;
  
  RETURN QUERY SELECT 
    TRUE, 
    new_total_gems, 
    'Gems added successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to spend gems
CREATE OR REPLACE FUNCTION spend_gems(user_id TEXT, amount INTEGER)
RETURNS TABLE (
  success BOOLEAN,
  new_total INTEGER,
  message TEXT
) AS $$
DECLARE
  current_gems RECORD;
  new_total_gems INTEGER;
BEGIN
  -- Get current gems
  SELECT gems INTO current_gems
  FROM player_gems
  WHERE player_gems.user_id = spend_gems.user_id;
  
  -- Initialize if no record exists
  IF current_gems IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      0, 
      'No gems found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user has enough gems
  IF current_gems.gems < amount THEN
    RETURN QUERY SELECT 
      FALSE, 
      current_gems.gems, 
      'Insufficient gems'::TEXT;
    RETURN;
  END IF;
  
  -- Subtract gems
  new_total_gems := current_gems.gems - amount;
  
  -- Update record
  UPDATE player_gems
  SET gems = new_total_gems, updated_at = NOW()
  WHERE user_id = spend_gems.user_id;
  
  RETURN QUERY SELECT 
    TRUE, 
    new_total_gems, 
    'Gems spent successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get gems
CREATE OR REPLACE FUNCTION get_gems(user_id TEXT)
RETURNS TABLE (
  gems INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gems,
    updated_at
  FROM player_gems
  WHERE user_id = get_gems.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_gems TO authenticated;
GRANT EXECUTE ON FUNCTION spend_gems TO authenticated;
GRANT EXECUTE ON FUNCTION get_gems TO authenticated;
GRANT ALL ON player_gems TO authenticated;
GRANT SELECT ON player_gems TO anon;
