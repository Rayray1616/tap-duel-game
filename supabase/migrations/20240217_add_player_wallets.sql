-- Create player_wallets table
CREATE TABLE IF NOT EXISTS player_wallets (
  user_id TEXT PRIMARY KEY,
  ton_address TEXT,
  connected BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_wallets_user_id ON player_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_player_wallets_connected ON player_wallets(connected);
CREATE INDEX IF NOT EXISTS idx_player_wallets_ton_address ON player_wallets(ton_address);

-- Create server function to connect wallet
CREATE OR REPLACE FUNCTION connect_wallet(user_id TEXT, ton_address TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  existing_wallet RECORD;
BEGIN
  -- Check if wallet already exists for this user
  SELECT ton_address, connected INTO existing_wallet
  FROM player_wallets
  WHERE player_wallets.user_id = connect_wallet.user_id;
  
  -- Upsert wallet record
  INSERT INTO player_wallets (user_id, ton_address, connected, updated_at)
  VALUES (
    connect_wallet.user_id,
    ton_address,
    TRUE,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    ton_address = EXCLUDED.ton_address,
    connected = EXCLUDED.connected,
    updated_at = EXCLUDED.updated_at;
  
  RETURN QUERY SELECT 
    TRUE, 
    'Wallet connected successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to disconnect wallet
CREATE OR REPLACE FUNCTION disconnect_wallet(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Update wallet record to disconnected
  UPDATE player_wallets
  SET connected = FALSE, updated_at = NOW()
  WHERE user_id = disconnect_wallet.user_id;
  
  RETURN QUERY SELECT 
    TRUE, 
    'Wallet disconnected successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get wallet info
CREATE OR REPLACE FUNCTION get_wallet_info(user_id TEXT)
RETURNS TABLE (
  connected BOOLEAN,
  ton_address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    connected,
    ton_address,
    updated_at
  FROM player_wallets
  WHERE user_id = get_wallet_info.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION connect_wallet TO authenticated;
GRANT EXECUTE ON FUNCTION disconnect_wallet TO authenticated;
GRANT EXECUTE ON FUNCTION get_wallet_info TO authenticated;
GRANT ALL ON player_wallets TO authenticated;
GRANT SELECT ON player_wallets TO anon;
