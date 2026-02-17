-- Create ton_payouts table
CREATE TABLE IF NOT EXISTS ton_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  ton_address TEXT NOT NULL,
  amount_ton NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ton_payouts_user_id ON ton_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_ton_payouts_status ON ton_payouts(status);
CREATE INDEX IF NOT EXISTS idx_ton_payouts_created_at ON ton_payouts(created_at DESC);

-- Create server function to request payout
CREATE OR REPLACE FUNCTION request_payout(user_id TEXT, ton_address TEXT, amount_ton NUMERIC)
RETURNS TABLE (
  success BOOLEAN,
  payout_id UUID,
  message TEXT
) AS $$
DECLARE
  gems_cost INTEGER;
  current_gems RECORD;
  new_payout_id UUID;
BEGIN
  -- Validate amount
  IF amount_ton <= 0 THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL, 
      'Amount must be greater than 0'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate gems cost (100 gems = 1 TON)
  gems_cost := CEIL(amount_ton * 100);
  
  -- Get current gems
  SELECT gems INTO current_gems
  FROM player_gems
  WHERE player_gems.user_id = request_payout.user_id;
  
  -- Check if user has enough gems
  IF current_gems IS NULL OR current_gems.gems < gems_cost THEN
    RETURN QUERY SELECT 
      FALSE, 
      NULL, 
      'Insufficient gems for payout'::TEXT;
    RETURN;
  END IF;
  
  -- Spend gems first
  PERFORM spend_gems(user_id, gems_cost);
  
  -- Create payout record
  INSERT INTO ton_payouts (user_id, ton_address, amount_ton, status, created_at, updated_at)
  VALUES (
    request_payout.user_id,
    ton_address,
    amount_ton,
    'pending',
    NOW(),
    NOW()
  )
  RETURNING id INTO new_payout_id;
  
  RETURN QUERY SELECT 
    TRUE, 
    new_payout_id, 
    'Payout request created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to mark payout as sent
CREATE OR REPLACE FUNCTION mark_payout_sent(payout_id UUID, tx_hash TEXT)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  payout_exists BOOLEAN;
BEGIN
  -- Check if payout exists and is pending
  SELECT EXISTS(
    SELECT 1 FROM ton_payouts 
    WHERE id = mark_payout_sent.payout_id 
      AND status = 'pending'
  ) INTO payout_exists;
  
  IF NOT payout_exists THEN
    RETURN QUERY SELECT 
      FALSE, 
      'Payout not found or not in pending status'::TEXT;
    RETURN;
  END IF;
  
  -- Update payout record
  UPDATE ton_payouts
  SET 
    status = 'sent',
    tx_hash = mark_payout_sent.tx_hash,
    updated_at = NOW()
  WHERE id = mark_payout_sent.payout_id;
  
  RETURN QUERY SELECT 
    TRUE, 
    'Payout marked as sent'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get payout history
CREATE OR REPLACE FUNCTION get_payout_history(user_id TEXT)
RETURNS TABLE (
  id UUID,
  ton_address TEXT,
  amount_ton NUMERIC,
  status TEXT,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    ton_address,
    amount_ton,
    status,
    tx_hash,
    created_at,
    updated_at
  FROM ton_payouts
  WHERE user_id = get_payout_history.user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION request_payout TO authenticated;
GRANT EXECUTE ON FUNCTION mark_payout_sent TO authenticated;
GRANT EXECUTE ON FUNCTION get_payout_history TO authenticated;
GRANT ALL ON ton_payouts TO authenticated;
GRANT SELECT ON ton_payouts TO anon;
