-- Create ton_deposits table
CREATE TABLE IF NOT EXISTS ton_deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  deposit_address TEXT NOT NULL,
  tx_hash TEXT UNIQUE,
  amount_ton NUMERIC NOT NULL,
  gems_credited INTEGER DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ton_deposits_user_id ON ton_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_ton_deposits_status ON ton_deposits(status);
CREATE INDEX IF NOT EXISTS idx_ton_deposits_deposit_address ON ton_deposits(deposit_address);
CREATE INDEX IF NOT EXISTS idx_ton_deposits_tx_hash ON ton_deposits(tx_hash);

-- Create server function to create deposit address
CREATE OR REPLACE FUNCTION create_deposit_address(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  deposit_address TEXT,
  message TEXT
) AS $$
DECLARE
  new_address TEXT;
  existing_deposit RECORD;
BEGIN
  -- Check if user already has a pending deposit
  SELECT deposit_address INTO existing_deposit
  FROM ton_deposits
  WHERE ton_deposits.user_id = create_deposit_address.user_id 
    AND ton_deposits.status = 'pending';
  
  IF existing_deposit IS NOT NULL THEN
    RETURN QUERY SELECT 
      TRUE, 
      existing_deposit.deposit_address, 
      'Existing deposit address returned'::TEXT;
    RETURN;
  END IF;
  
  -- Generate deterministic deposit address (simplified for demo)
  -- In production, this would integrate with TON blockchain
  new_address := 'EQD' || encode(sha256(user_id || NOW()::TEXT), 'hex') || 'ABCDEF';
  
  -- Insert new deposit record
  INSERT INTO ton_deposits (user_id, deposit_address, amount_ton, status, created_at, updated_at)
  VALUES (
    create_deposit_address.user_id,
    new_address,
    0,
    'pending',
    NOW(),
    NOW()
  );
  
  RETURN QUERY SELECT 
    TRUE, 
    new_address, 
    'Deposit address created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to verify deposit
CREATE OR REPLACE FUNCTION verify_deposit(user_id TEXT)
RETURNS TABLE (
  success BOOLEAN,
  status TEXT,
  amount_ton NUMERIC,
  gems_credited INTEGER,
  tx_hash TEXT,
  message TEXT
) AS $$
DECLARE
  pending_deposit RECORD;
  gems_to_credit INTEGER;
BEGIN
  -- Get pending deposit for user
  SELECT id, deposit_address INTO pending_deposit
  FROM ton_deposits
  WHERE ton_deposits.user_id = verify_deposit.user_id 
    AND ton_deposits.status = 'pending'
  LIMIT 1;
  
  IF pending_deposit IS NULL THEN
    RETURN QUERY SELECT 
      FALSE, 
      'no_pending', 
      0, 
      0, 
      NULL, 
      'No pending deposit found'::TEXT;
    RETURN;
  END IF;
  
  -- For demo purposes, simulate a deposit detection
  -- In production, this would query TON blockchain API
  -- Let's simulate a 0.5 TON deposit
  DECLARE
    simulated_amount NUMERIC := 0.5;
    simulated_tx_hash TEXT := 'tx_' || encode(sha256(pending_deposit.deposit_address || NOW()::TEXT), 'hex');
  BEGIN
    -- Calculate gems (1 TON = 100 gems)
    gems_to_credit := FLOOR(simulated_amount * 100);
    
    -- Update deposit record
    UPDATE ton_deposits
    SET 
      status = 'confirmed',
      amount_ton = simulated_amount,
      gems_credited = gems_to_credit,
      tx_hash = simulated_tx_hash,
      updated_at = NOW()
    WHERE id = pending_deposit.id;
    
    -- Add gems to user account
    PERFORM add_gems(user_id, gems_to_credit);
    
    RETURN QUERY SELECT 
      TRUE, 
      'confirmed', 
      simulated_amount, 
      gems_to_credit, 
      simulated_tx_hash, 
      'Deposit verified and gems credited'::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create server function to get deposit status
CREATE OR REPLACE FUNCTION get_deposit_status(user_id TEXT)
RETURNS TABLE (
  status TEXT,
  deposit_address TEXT,
  amount_ton NUMERIC,
  gems_credited INTEGER,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    status,
    deposit_address,
    amount_ton,
    gems_credited,
    tx_hash,
    created_at,
    updated_at
  FROM ton_deposits
  WHERE user_id = get_deposit_status.user_id
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_deposit_address TO authenticated;
GRANT EXECUTE ON FUNCTION verify_deposit TO authenticated;
GRANT EXECUTE ON FUNCTION get_deposit_status TO authenticated;
GRANT ALL ON ton_deposits TO authenticated;
GRANT SELECT ON ton_deposits TO anon;
