-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  score INTEGER DEFAULT 0,
  energy INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  tap_multiplier DECIMAL(3,2) DEFAULT 1.0,
  energy_boost INTEGER DEFAULT 0,
  ton_address VARCHAR(255),
  last_energy_regen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_reward_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create duels table
CREATE TABLE IF NOT EXISTS duels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  player1_taps INTEGER DEFAULT 0,
  player2_taps INTEGER DEFAULT 0,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status);
CREATE INDEX IF NOT EXISTS idx_duels_players ON duels(player1_id, player2_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = telegram_id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = telegram_id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = telegram_id);

CREATE POLICY "Users can view duels they participate in" ON duels
  FOR SELECT USING (player1_id IN (SELECT id FROM users WHERE telegram_id = auth.uid()::text) 
                  OR player2_id IN (SELECT id FROM users WHERE telegram_id = auth.uid()::text));

CREATE POLICY "Users can update duels they participate in" ON duels
  FOR UPDATE USING (player1_id IN (SELECT id FROM users WHERE telegram_id = auth.uid()::text) 
                  OR player2_id IN (SELECT id FROM users WHERE telegram_id = auth.uid()::text));

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE duels;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
