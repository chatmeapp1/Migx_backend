-- MIG33 Clone Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255),
  email VARCHAR(100),
  avatar VARCHAR(255),
  credits BIGINT DEFAULT 0,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'mentor', 'merchant', 'admin')),
  status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id BIGINT REFERENCES users(id),
  max_users INT DEFAULT 50,
  is_private BOOLEAN DEFAULT FALSE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room admins table
CREATE TABLE IF NOT EXISTS room_admins (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'notice')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Private messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id BIGSERIAL PRIMARY KEY,
  from_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  from_username VARCHAR(50) NOT NULL,
  to_username VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit logs table
CREATE TABLE IF NOT EXISTS credit_logs (
  id BIGSERIAL PRIMARY KEY,
  from_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  to_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  from_username VARCHAR(50),
  to_username VARCHAR(50),
  amount INT NOT NULL,
  transaction_type VARCHAR(30) DEFAULT 'transfer' CHECK (transaction_type IN ('transfer', 'game_spend', 'reward', 'topup', 'commission')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  created_by BIGINT REFERENCES users(id),
  commission_rate INT DEFAULT 30,
  total_income BIGINT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchant spend logs table
CREATE TABLE IF NOT EXISTS merchant_spend_logs (
  id BIGSERIAL PRIMARY KEY,
  merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  game_type VARCHAR(50) NOT NULL,
  spend_amount INT NOT NULL,
  commission_amount INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User levels table
CREATE TABLE IF NOT EXISTS user_levels (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp BIGINT DEFAULT 0,
  level INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room bans table (persistent bans)
CREATE TABLE IF NOT EXISTS room_bans (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  banned_by BIGINT REFERENCES users(id),
  reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- Game history table
CREATE TABLE IF NOT EXISTS game_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  game_type VARCHAR(50) NOT NULL,
  bet_amount INT NOT NULL,
  result VARCHAR(20) CHECK (result IN ('win', 'lose', 'draw')),
  reward_amount INT DEFAULT 0,
  merchant_id BIGINT REFERENCES merchants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_private_messages_to_user ON private_messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_credit_logs_from_user ON credit_logs(from_user_id);
CREATE INDEX IF NOT EXISTS idx_credit_logs_to_user ON credit_logs(to_user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_spend_logs_merchant ON merchant_spend_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_game_history_user ON game_history(user_id);

-- Insert default rooms
INSERT INTO rooms (name, description, max_users) VALUES 
  ('Indonesia', 'Welcome to Indonesia room', 100),
  ('Dhaka cafe', 'Welcome to Dhaka cafe', 50),
  ('Mobile fun', 'Fun chat for mobile users', 50)
ON CONFLICT DO NOTHING;
